import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  FormField,
  FormRecord,
  FormTemplate,
  PageOrientation,
  PaperSize,
  PrintSettings,
  TableItemRow,
} from '../types/form';
import {
  WizardStep,
  countWizardFilledItems,
  countWizardSignedSlots,
  createEmptyWizardRow,
  extractTemplateCategories,
  filterWizardTemplates,
  getWizardTemplateSummary,
  validateWizardStepTwo,
} from '../utils/wizardLogic';
import {
  calculateRowTotal,
  calculateTableSummary,
  formatCurrency,
  numberToPersianWords,
  toPersianDigits,
} from '../utils/formLogic';
import {
  TemplateTone,
  getFriendlyTemplateMeta,
  getSimpleStepInstruction,
  getVisibleWizardRows,
} from '../utils/simpleUx';
import { extractProductHistory } from '../utils/productSuggestions';
import { useViewportWidth } from '../utils/useViewportWidth';
import { calculateFitPreviewScale, getPreviewTargetMaxWidth } from '../utils/responsiveLayout';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { ProductAutocompleteCell } from './ProductAutocompleteCell';
import { SignaturePadModal } from './SignaturePadModal';
import { OfficialPrintDocument } from './OfficialPrintDocument';
import { CompanyLogoControls } from './CompanyLogoControls';
import { ExcelTableStylePanel } from './ExcelTableStylePanel';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileCheck2,
  FileDown,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  Layers,
  Maximize2,
  Minimize2,
  Package,
  Palette,
  PenTool,
  Plus,
  Printer,
  Save,
  Search,
  SlidersHorizontal,
  Trash2,
  Truck,
  Wrench,
} from 'lucide-react';

interface DocumentIssueWizardProps {
  templates: FormTemplate[];
  activeTemplate: FormTemplate;
  records: FormRecord[];
  step: WizardStep;
  onStepChange: (step: WizardStep) => void;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  currentRecordId: string | null;
  onSelectWizardTemplate: (template: FormTemplate) => void;
  onFormDataChange: (key: string, value: any) => void;
  onTableDataChange: (fieldId: string, rows: TableItemRow[]) => void;
  onSignatureDataChange: (fieldId: string, dataUrl: string) => void;
  onSaveRecordToArchive: () => FormRecord;
  onTriggerPrint: (settings: PrintSettings) => void;
  onExportPdf?: (settings: PrintSettings) => void;
  isExportingPdf?: boolean;
  onStartNewWizard: () => void;
  onSwitchToClassicCanvas: () => void;
  onOpenImageToForm?: () => void;
  onUpdateActiveTemplate?: (updated: FormTemplate) => void;
}

const TONE_ICON_BG: Record<TemplateTone, string> = {
  sky: 'bg-sky-500/15 text-sky-700 dark:bg-sky-400/20 dark:text-sky-300 border-sky-400/35',
  emerald: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300 border-emerald-400/35',
  amber: 'bg-amber-500/15 text-amber-700 dark:bg-amber-400/20 dark:text-amber-300 border-amber-400/35',
  indigo: 'bg-indigo-500/15 text-indigo-700 dark:bg-indigo-400/20 dark:text-indigo-300 border-indigo-400/35',
  rose: 'bg-rose-500/15 text-rose-700 dark:bg-rose-400/20 dark:text-rose-300 border-rose-400/35',
  teal: 'bg-teal-500/15 text-teal-700 dark:bg-teal-400/20 dark:text-teal-300 border-teal-400/35',
};

function renderTemplateIcon(tpl: FormTemplate) {
  const title = tpl.title || '';
  if (title.includes('خروج')) return <Truck className="w-5 h-5" />;
  if (title.includes('قطعات') || title.includes('رسید')) return <Package className="w-5 h-5" />;
  if (title.includes('تعمیر') || title.includes('استعلام')) return <Wrench className="w-5 h-5" />;
  if (title.includes('فاکتور')) return <FileSpreadsheet className="w-5 h-5" />;
  if (title.includes('مصرفی')) return <ClipboardList className="w-5 h-5" />;
  return <FileText className="w-5 h-5" />;
}

export const DocumentIssueWizard: React.FC<DocumentIssueWizardProps> = ({
  templates,
  activeTemplate,
  records,
  step,
  onStepChange,
  formData,
  tableData,
  signatureData,
  currentRecordId,
  onSelectWizardTemplate,
  onFormDataChange,
  onTableDataChange,
  onSignatureDataChange,
  onSaveRecordToArchive,
  onTriggerPrint,
  onExportPdf,
  isExportingPdf = false,
  onStartNewWizard,
  onSwitchToClassicCanvas,
  onOpenImageToForm,
  onUpdateActiveTemplate,
}) => {
  const [templateQuery, setTemplateQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showAllRows, setShowAllRows] = useState(false);
  const [minVisibleRows, setMinVisibleRows] = useState(2);
  const [showMorePrintOptions, setShowMorePrintOptions] = useState(false);
  const [showLogoEditor, setShowLogoEditor] = useState(false);
  const [showTableStyleEditor, setShowTableStyleEditor] = useState(false);
  const [showStep3DesignDrawer, setShowStep3DesignDrawer] = useState(false);

  const handleUpdateTemplateField = (updatedField: FormField) => {
    if (!onUpdateActiveTemplate) return;
    const updatedFields = activeTemplate.fields.map((f) =>
      f.id === updatedField.id ? updatedField : f
    );
    onUpdateActiveTemplate({
      ...activeTemplate,
      fields: updatedFields,
      updatedAt: new Date().toISOString(),
    });
  };
  const [activeSignatureModal, setActiveSignatureModal] = useState<{
    key: string;
    label: string;
  } | null>(null);
  const { viewportWidth, isMobile } = useViewportWidth();
  const [fitPreviewToScreen, setFitPreviewToScreen] = useState(true);
  const previewSheetRef = useRef<HTMLDivElement | null>(null);
  const [previewHeight, setPreviewHeight] = useState<number>(0);

  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: activeTemplate.paperSize,
    orientation: activeTemplate.orientation,
    showWatermark: activeTemplate.showWatermark ?? false,
    watermarkText: activeTemplate.watermarkText || 'محرمانه',
    highContrastMode: false,
    showPageNumbers: true,
    printMode: 'filled',
    scale: 1,
  });

  useEffect(() => {
    setPrintSettings((prev) => ({
      ...prev,
      paperSize: activeTemplate.paperSize,
      orientation: activeTemplate.orientation,
      showWatermark: activeTemplate.showWatermark ?? false,
      watermarkText: activeTemplate.watermarkText || 'محرمانه',
    }));
    setShowAllRows(false);
    setMinVisibleRows(2);
  }, [
    activeTemplate.id,
    activeTemplate.paperSize,
    activeTemplate.orientation,
    activeTemplate.showWatermark,
    activeTemplate.watermarkText,
  ]);

  const isCompactViewport = viewportWidth < 1024;
  const previewTargetWidth = getPreviewTargetMaxWidth(printSettings.orientation);
  const previewScale =
    isCompactViewport && fitPreviewToScreen
      ? calculateFitPreviewScale(
          viewportWidth,
          printSettings.paperSize,
          printSettings.orientation,
          isMobile ? 24 : 48
        )
      : 1;

  useEffect(() => {
    if (step !== 3) return;
    const el = previewSheetRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateH = () => setPreviewHeight(el.offsetHeight);
    updateH();
    const ro = new ResizeObserver(updateH);
    ro.observe(el);
    return () => ro.disconnect();
  }, [step, previewTemplateKey(activeTemplate.id, printSettings.paperSize, printSettings.orientation)]);

  const categories = useMemo(
    () => extractTemplateCategories(templates),
    [templates]
  );

  const filteredTemplates = useMemo(
    () => filterWizardTemplates(templates, templateQuery, selectedCategory),
    [templates, templateQuery, selectedCategory]
  );

  const productCatalog = useMemo(
    () => extractProductHistory(records, templates),
    [records, templates]
  );

  const headerField = useMemo(
    () => activeTemplate.fields.find((f) => f.type === 'header_banner'),
    [activeTemplate]
  );

  const tableFields = useMemo(
    () => activeTemplate.fields.filter((f) => f.type === 'table'),
    [activeTemplate]
  );

  const signatureFields = useMemo(
    () => activeTemplate.fields.filter((f) => f.type === 'signature'),
    [activeTemplate]
  );

  const customInputFields = useMemo(
    () =>
      activeTemplate.fields.filter(
        (f) =>
          !['header_banner', 'divider', 'table', 'signature', 'qrcode'].includes(f.type) &&
          f.id !== 'f_doc_no' &&
          f.id !== 'f_doc_date' &&
          f.id !== 'f_req_unit'
      ),
    [activeTemplate]
  );

  const hasCustomerFieldAlready = useMemo(
    () =>
      customInputFields.some((f) => {
        const lbl = f.label || '';
        return lbl.includes('مشتری') || lbl.includes('طرف حساب') || lbl.includes('خریدار');
      }),
    [customInputFields]
  );

  const hasRefFieldAlready = useMemo(
    () =>
      customInputFields.some(
        (f) => f.id === 'f_doc_ref' || (f.label || '').includes('عطف') || (f.label || '').includes('نامه')
      ),
    [customInputFields]
  );

  const filledItemsCount = useMemo(
    () => countWizardFilledItems(activeTemplate, tableData),
    [activeTemplate, tableData]
  );

  const signedSlotsCount = useMemo(
    () => countWizardSignedSlots(signatureData),
    [signatureData]
  );

  const savedArchiveRecord = useMemo(
    () => (currentRecordId ? records.find((r) => r.id === currentRecordId) || null : null),
    [currentRecordId, records]
  );

  const stepGuide = useMemo(() => getSimpleStepInstruction(step), [step]);

  const getRowsForField = (field: FormField): TableItemRow[] => {
    const existing = tableData[field.id];
    if (existing && existing.length > 0) return existing;
    const minCount = field.tableInitialRows || 5;
    return Array.from({ length: minCount }, (_, idx) =>
      createEmptyWizardRow(idx + 1, field.tableVariant || 'dispatch')
    );
  };

  const handleRowChange = (
    field: FormField,
    rowId: string,
    key: keyof TableItemRow,
    val: any
  ) => {
    const rows = getRowsForField(field);
    const updated = rows.map((r) => {
      if (r.id !== rowId) return r;
      const next = { ...r, [key]: val };
      if (key === 'quantity' || key === 'unitPrice') {
        next.totalPrice = calculateRowTotal(
          Number(next.quantity) || 0,
          Number(next.unitPrice) || 0
        );
      }
      return next;
    });
    onTableDataChange(field.id, updated);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleRowReplace = (field: FormField, rowId: string, newRow: TableItemRow) => {
    const rows = getRowsForField(field);
    const updated = rows.map((r) => (r.id === rowId ? newRow : r));
    onTableDataChange(field.id, updated);
    if (validationErrors.length > 0) setValidationErrors([]);
  };

  const handleAddRow = (field: FormField, currentlyVisibleCount: number, totalCount: number) => {
    if (!showAllRows && currentlyVisibleCount < totalCount) {
      setMinVisibleRows(currentlyVisibleCount + 1);
      return;
    }
    const rows = getRowsForField(field);
    const nextRow = createEmptyWizardRow(rows.length + 1, field.tableVariant || 'dispatch');
    onTableDataChange(field.id, [...rows, nextRow]);
    setMinVisibleRows((prev) => Math.max(prev + 1, rows.length + 1));
  };

  const handleRemoveRow = (field: FormField, rowId: string) => {
    const rows = getRowsForField(field);
    if (rows.length <= 1) return;
    const filtered = rows
      .filter((r) => r.id !== rowId)
      .map((r, idx) => ({ ...r, rowNumber: idx + 1 }));
    onTableDataChange(field.id, filtered);
  };

  const handleProceedFromStep1 = (tpl?: FormTemplate) => {
    const chosen = tpl || activeTemplate;
    onSelectWizardTemplate(chosen);
    setValidationErrors([]);
    onStepChange(2);
  };

  const handleProceedFromStep2 = () => {
    const res = validateWizardStepTwo(activeTemplate, formData, tableData);
    if (!res.valid) {
      setValidationErrors(res.errors);
      return;
    }
    setValidationErrors([]);
    onStepChange(3);
  };

  const handlePrintNow = () => {
    onTriggerPrint(printSettings);
  };

  const previewTemplate: FormTemplate = {
    ...activeTemplate,
    paperSize: printSettings.paperSize,
    orientation: printSettings.orientation,
    showWatermark: printSettings.showWatermark,
    watermarkText: printSettings.watermarkText,
  };

  const stepsMeta: Array<{ num: WizardStep; title: string; shortTitle: string }> = [
    { num: 1, title: '۱. انتخاب برگه', shortTitle: 'انتخاب' },
    { num: 2, title: '۲. پر کردن جاهای خالی', shortTitle: 'نوشتن' },
    { num: 3, title: '۳. چاپ و ذخیره', shortTitle: 'آماده!' },
  ];

  return (
    <div
      data-testid="document-issue-wizard"
      data-wizard-step={step}
      className="flex-1 flex flex-col overflow-hidden bg-transparent transition-colors"
      dir="rtl"
    >
      {/* Top Wizard Liquid Glass Header & Calm 3-Step Indicator */}
      <div className="liquid-glass-elevated border-b border-white/60 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3.5 shrink-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2.5 sm:gap-3">
          {/* Plain Friendly Prompt */}
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl liquid-cta flex items-center justify-center shrink-0">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {stepGuide.title}
                </h2>
                <p className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 truncate">
                  {stepGuide.helper}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onSwitchToClassicCanvas}
              className="lg:hidden px-3 py-1.5 rounded-xl liquid-glass-well text-xs font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap shrink-0 cursor-pointer"
            >
              نمای آزاد
            </button>
          </div>

          {/* 3-Step Liquid Glass Pill Stepper */}
          <nav
            aria-label="مراحل ساخت برگه"
            className="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2 p-1 rounded-2xl liquid-glass-well"
          >
            {stepsMeta.map((s) => {
              const isActive = step === s.num;
              const isCompleted = step > s.num;
              const canJump = s.num < step;

              return (
                <button
                  key={s.num}
                  type="button"
                  disabled={!canJump && !isActive}
                  onClick={() => {
                    if (canJump) {
                      setValidationErrors([]);
                      onStepChange(s.num);
                    }
                  }}
                  data-testid={`wizard-step-tab-${s.num}`}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-right transition-all min-w-0 whitespace-nowrap ${
                    isActive
                      ? 'liquid-cta font-bold text-white'
                      : isCompleted
                      ? 'bg-emerald-500/15 dark:bg-emerald-400/15 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/25 font-semibold cursor-pointer'
                      : 'text-slate-500 dark:text-slate-400 cursor-default'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-sans tabular-nums font-bold shrink-0 ${
                      isActive
                        ? 'bg-white/25 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-400/20 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : toPersianDigits(s.num)}
                  </span>
                  <span className="text-[11px] sm:text-xs truncate">
                    <span className="sm:hidden">{s.shortTitle}</span>
                    <span className="hidden sm:inline">{s.title}</span>
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Desktop Classic Canvas toggle */}
          <button
            type="button"
            onClick={onSwitchToClassicCanvas}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl liquid-glass-well text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="ویرایش پیشرفته روی برگه کامل"
          >
            <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>نمای پیشرفته</span>
          </button>
        </div>
      </div>

      {/* STEP 1: SELECT TEMPLATE */}
      {step === 1 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
              {/* Calm Search & Category Bar */}
              <div className="liquid-glass rounded-3xl p-3.5 sm:p-4 space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={templateQuery}
                      onChange={(e) => setTemplateQuery(e.target.value)}
                      placeholder="نام برگه را بنویسید (مثلاً: حواله، رسید، فاکتور)..."
                      aria-label="جستجوی برگه"
                      className="w-full h-11 pr-10 pl-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  {onOpenImageToForm && (
                    <button
                      type="button"
                      onClick={onOpenImageToForm}
                      className="h-11 inline-flex items-center justify-center gap-2 px-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 dark:bg-indigo-400/15 dark:hover:bg-indigo-400/25 border border-indigo-400/40 text-indigo-800 dark:text-indigo-200 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>ساخت برگه از عکس</span>
                    </button>
                  )}
                </div>

                {/* Soft Segmented Category Switcher */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('all')}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'liquid-cta text-white'
                        : 'liquid-glass-well text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/70'
                    }`}
                  >
                    همه برگه‌ها ({toPersianDigits(templates.length)})
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategory === cat
                          ? 'liquid-cta text-white'
                          : 'liquid-glass-well text-slate-700 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Templates Grid */}
              {filteredTemplates.length === 0 ? (
                <div className="liquid-glass rounded-3xl p-10 sm:p-12 text-center space-y-3">
                  <FileText className="w-11 h-11 text-slate-400 dark:text-slate-500 mx-auto" />
                  <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                    هیچ برگه‌ای با این اسم پیدا نشد
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                    جستجو را پاک کنید تا همه برگه‌های آماده دوباره نشان داده شوند.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTemplateQuery('');
                      setSelectedCategory('all');
                    }}
                    className="px-5 py-2.5 rounded-2xl liquid-cta text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    نشان دادن همه برگه‌ها
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredTemplates.map((tpl) => {
                    const isSelected = tpl.id === activeTemplate.id;
                    const summary = getWizardTemplateSummary(tpl);
                    const friendly = getFriendlyTemplateMeta(tpl);

                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        data-testid="wizard-template-card"
                        data-template-id={tpl.id}
                        aria-pressed={isSelected}
                        onClick={() => onSelectWizardTemplate(tpl)}
                        onDoubleClick={() => handleProceedFromStep1(tpl)}
                        className={`text-right p-4 sm:p-5 rounded-3xl transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? 'liquid-glass-elevated ring-2 ring-sky-500/60 dark:ring-sky-400/60 border-sky-400/80'
                            : 'liquid-glass hover:-translate-y-0.5 hover:border-white/95 dark:hover:border-white/25'
                        }`}
                      >
                        <div className="space-y-3 w-full">
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 ${
                                TONE_ICON_BG[friendly.tone]
                              }`}
                            >
                              {renderTemplateIcon(tpl)}
                            </div>

                            {isSelected ? (
                              <span className="inline-flex items-center gap-1.5 text-sky-700 dark:text-sky-300 text-xs font-bold shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>انتخاب شده</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-sans tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                                {summary.category}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-sm sm:text-[15px] font-bold text-slate-900 dark:text-white leading-snug">
                              {tpl.title}
                            </h3>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                              {friendly.shortHint}
                            </p>
                          </div>
                        </div>

                        {/* Quiet Unboxed Footer Metadata + Action Prompt */}
                        <div className="w-full pt-3 border-t border-slate-300/40 dark:border-white/10 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 font-sans tabular-nums">
                          <div className="flex items-center gap-1.5 truncate">
                            <span>
                              کاغذ <span className="font-mono">{summary.paperSize}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span>{summary.orientationLabel}</span>
                          </div>

                          <span
                            className={`text-xs font-bold flex items-center gap-1 shrink-0 ${
                              isSelected
                                ? 'text-sky-700 dark:text-sky-300'
                                : 'text-slate-700 dark:text-slate-200'
                            }`}
                          >
                            <span>{isSelected ? 'آماده پر کردن' : 'انتخاب'}</span>
                            <ArrowLeft className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 1 Sticky Liquid Glass Footer */}
          <div className="liquid-glass-elevated border-t border-white/60 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 truncate">
                برگه انتخاب‌شده:{' '}
                <strong className="text-slate-950 dark:text-white">{activeTemplate.title}</strong>
              </div>

              <button
                type="button"
                data-testid="wizard-next-step-1"
                onClick={() => handleProceedFromStep1(activeTemplate)}
                className="w-full sm:w-auto h-11 px-6 rounded-2xl liquid-cta text-xs sm:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>بریم مرحله بعد</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: ENTER DOCUMENT DATA */}
      {step === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-6">
            <div className="max-w-6xl mx-auto space-y-4 sm:space-y-5">
              {/* Friendly Active Template Bar */}
              <div className="liquid-glass rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileText className="w-4 h-4 text-sky-700 dark:text-sky-300 shrink-0" />
                  <div className="min-w-0 text-xs sm:text-sm">
                    <span className="text-slate-600 dark:text-slate-300">برگه انتخاب‌شده: </span>
                    <strong className="font-bold text-slate-900 dark:text-white">
                      {activeTemplate.title}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setValidationErrors([]);
                    onStepChange(1);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl liquid-glass-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>عوض کردن برگه</span>
                </button>
              </div>

              {/* Friendly Inline Validation Errors */}
              {validationErrors.length > 0 && (
                <div
                  role="alert"
                  data-testid="wizard-validation-errors"
                  className="liquid-glass-elevated border-rose-400/70 dark:border-rose-500/50 bg-rose-50/75 dark:bg-rose-950/45 rounded-2xl p-4 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>فقط این چند مورد را پر کنید تا برگه‌تان ساخته شود:</span>
                  </div>
                  <ul className="list-disc list-inside text-xs text-rose-700 dark:text-rose-200 space-y-0.5 pr-1">
                    {validationErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section 1: Basic Info */}
              <section className="liquid-glass rounded-3xl p-4 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-300/40 dark:border-white/10 pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      ۱. مشخصات برگه و مشتری
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      موارد ستاره‌دار را حتماً بنویسید
                    </span>
                  </div>

                  {headerField && onUpdateActiveTemplate && (
                    <button
                      type="button"
                      data-testid="wizard-toggle-logo-btn"
                      onClick={() => setShowLogoEditor((v) => !v)}
                      className={`h-9 px-3 rounded-2xl text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                        showLogoEditor
                          ? 'liquid-cta text-white'
                          : 'liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70'
                      }`}
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>لوگوی شرکت در سربرگ</span>
                    </button>
                  )}
                </div>

                {showLogoEditor && headerField && onUpdateActiveTemplate && (
                  <div className="p-3 rounded-2xl liquid-glass-elevated">
                    <CompanyLogoControls
                      compact
                      wide
                      headerField={headerField}
                      onUpdateHeaderField={handleUpdateTemplateField}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Document Number */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="wizard-doc-no"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      شماره برگه <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="wizard-doc-no"
                      type="text"
                      value={formData['f_doc_no'] ?? ''}
                      onChange={(e) => {
                        onFormDataChange('f_doc_no', e.target.value);
                        if (validationErrors.length > 0) setValidationErrors([]);
                      }}
                      placeholder="مثلاً ۱۰۴۲"
                      className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm font-sans tabular-nums text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                    />
                  </div>

                  {/* Shamsi Document Date */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="wizard-doc-date"
                      className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                    >
                      تاریخ (شمسی) <span className="text-rose-500">*</span>
                    </label>
                    <ShamsiDatePicker
                      value={formData['f_doc_date'] ?? ''}
                      onChange={(val) => {
                        onFormDataChange('f_doc_date', val);
                        if (validationErrors.length > 0) setValidationErrors([]);
                      }}
                      placeholder="تاریخ را انتخاب کنید..."
                      className="w-full"
                    />
                  </div>

                  {/* Requesting Unit */}
                  {(headerField?.hasRequestingUnit ||
                    headerField?.requestingUnit ||
                    headerField?.headerType === 'dispatch_voucher') && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="wizard-req-unit"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        بخش یا واحد درخواست‌کننده
                      </label>
                      <input
                        id="wizard-req-unit"
                        type="text"
                        value={
                          formData['f_req_unit'] ??
                          (headerField ? formData[`${headerField.id}_req_unit`] : '') ??
                          ''
                        }
                        onChange={(e) => {
                          onFormDataChange('f_req_unit', e.target.value);
                          if (headerField) {
                            onFormDataChange(`${headerField.id}_req_unit`, e.target.value);
                          }
                        }}
                        placeholder="مثلاً واحد تولید یا انبار"
                        className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                    </div>
                  )}

                  {/* Customer / Counterparty */}
                  {!hasCustomerFieldAlready && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="wizard-customer-name"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        نام مشتری یا تحویل‌گیرنده
                      </label>
                      <input
                        id="wizard-customer-name"
                        type="text"
                        value={formData['customerName'] ?? ''}
                        onChange={(e) => onFormDataChange('customerName', e.target.value)}
                        placeholder="مثلاً شرکت پارس الکتریک"
                        className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                    </div>
                  )}

                  {/* Reference / Letter Number */}
                  {!hasRefFieldAlready && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor="wizard-letter-no"
                        className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                      >
                        شماره نامه یا یادداشت (اختیاری)
                      </label>
                      <input
                        id="wizard-letter-no"
                        type="text"
                        value={formData['letterNumber'] ?? ''}
                        onChange={(e) => onFormDataChange('letterNumber', e.target.value)}
                        placeholder="مثلاً ۹۸۵/الف"
                        className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                      />
                    </div>
                  )}

                  {/* Template Custom Input Fields */}
                  {customInputFields.map((field) => {
                    const fieldVal = formData[field.id] ?? '';
                    const isTextarea = field.type === 'textarea';

                    return (
                      <div
                        key={field.id}
                        className={`space-y-1.5 ${
                          isTextarea || field.width === '100%' ? 'md:col-span-2 lg:col-span-3' : ''
                        }`}
                      >
                        {field.type !== 'checkbox' && (
                          <label
                            htmlFor={`wizard-field-${field.id}`}
                            className="block text-xs font-semibold text-slate-700 dark:text-slate-200"
                          >
                            {field.label}
                            {field.required && <span className="text-rose-500 mr-1">*</span>}
                          </label>
                        )}

                        {field.type === 'shamsi_date' ? (
                          <ShamsiDatePicker
                            value={String(fieldVal || '')}
                            onChange={(val) => onFormDataChange(field.id, val)}
                            placeholder={field.placeholder || 'تاریخ را انتخاب کنید...'}
                            className="w-full"
                          />
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={`wizard-field-${field.id}`}
                            rows={field.rowsCount || 3}
                            value={String(fieldVal)}
                            onChange={(e) => onFormDataChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'توضیحات خود را اینجا بنویسید...'}
                            className="w-full p-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                          />
                        ) : field.type === 'select' ? (
                          <select
                            id={`wizard-field-${field.id}`}
                            value={String(fieldVal || field.options?.[0] || '')}
                            onChange={(e) => onFormDataChange(field.id, e.target.value)}
                            className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                          >
                            {(field.options || ['گزینه ۱', 'گزینه ۲']).map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'checkbox' ? (
                          <label className="flex items-center gap-2.5 h-11 px-3.5 liquid-glass-well rounded-2xl cursor-pointer">
                            <input
                              id={`wizard-field-${field.id}`}
                              type="checkbox"
                              checked={Boolean(fieldVal)}
                              onChange={(e) => onFormDataChange(field.id, e.target.checked)}
                              className="w-4 h-4 rounded text-sky-600 focus:ring-0"
                            />
                            <span className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100">
                              {field.label}
                            </span>
                          </label>
                        ) : field.type === 'number' || field.type === 'currency' ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                id={`wizard-field-${field.id}`}
                                type="number"
                                value={fieldVal}
                                onChange={(e) => onFormDataChange(field.id, e.target.value)}
                                placeholder={field.placeholder || '۰'}
                                className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm font-sans tabular-nums text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                              />
                              {field.unitLabel && (
                                <span className="text-xs text-slate-600 dark:text-slate-300 shrink-0">
                                  {field.unitLabel}
                                </span>
                              )}
                            </div>
                            {field.type === 'currency' && Number(fieldVal) > 0 && (
                              <div className="text-[11px] text-slate-600 dark:text-slate-300">
                                {formatCurrency(fieldVal)} {field.unitLabel || 'ریال'} (
                                {numberToPersianWords(Number(fieldVal))})
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            id={`wizard-field-${field.id}`}
                            type="text"
                            value={String(fieldVal)}
                            onChange={(e) => {
                              onFormDataChange(field.id, e.target.value);
                              if (validationErrors.length > 0) setValidationErrors([]);
                            }}
                            placeholder={field.placeholder || `${field.label}...`}
                            className="w-full h-11 px-3.5 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Section 2: Progressive Table Items Entry */}
              {tableFields.map((tableField) => {
                const columns = tableField.tableColumns || [
                  { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' as const },
                  { id: 'productCode', title: 'کد کالا', width: 'w-28', type: 'text' as const },
                  { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' as const },
                  { id: 'quantity', title: 'تعداد', width: 'w-20', type: 'number' as const },
                  { id: 'unit', title: 'واحد', width: 'w-20', type: 'text' as const },
                  { id: 'serialNumber', title: 'شماره سریال', width: 'w-32', type: 'text' as const },
                  { id: 'notes', title: 'توضیحات', width: 'w-40', type: 'text' as const },
                ];
                const rows = getRowsForField(tableField);
                const { visibleRows, hiddenEmptyCount } = getVisibleWizardRows(
                  rows,
                  showAllRows,
                  minVisibleRows
                );
                const summary = tableField.hasTableSummary
                  ? calculateTableSummary(
                      rows,
                      tableField.discountAmount || 0,
                      tableField.taxRatePercent ?? 10
                    )
                  : null;

                return (
                  <section
                    key={tableField.id}
                    className="liquid-glass rounded-3xl p-4 sm:p-6 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-300/40 dark:border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          ۲. کالاها و وسایل داخل برگه
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          اسم کالا را بنویسید؛ کالاهای قبلی خودشان پیشنهاد می‌شوند.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-sans tabular-nums text-slate-600 dark:text-slate-300">
                          {toPersianDigits(filledItemsCount)} کالا وارد شده
                        </span>
                        {onUpdateActiveTemplate && (
                          <button
                            type="button"
                            data-testid="wizard-toggle-table-style-btn"
                            onClick={() => setShowTableStyleEditor((v) => !v)}
                            className={`h-10 inline-flex items-center gap-1.5 px-3.5 rounded-2xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                              showTableStyleEditor
                                ? 'liquid-cta text-white'
                                : 'liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <Palette className="w-4 h-4" />
                            <span>ظاهر و رنگ جدول</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleAddRow(tableField, visibleRows.length, rows.length)}
                          className="h-10 inline-flex items-center gap-1.5 px-3.5 rounded-2xl bg-sky-500/15 hover:bg-sky-500/25 dark:bg-sky-400/20 dark:hover:bg-sky-400/30 text-sky-800 dark:text-sky-200 border border-sky-400/40 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span>افزودن کالای دیگر</span>
                        </button>
                      </div>
                    </div>

                    {showTableStyleEditor && onUpdateActiveTemplate && (
                      <div className="p-3.5 rounded-2xl liquid-glass-elevated">
                        <ExcelTableStylePanel
                          compact
                          wide
                          field={tableField}
                          columns={columns}
                          onUpdateField={handleUpdateTemplateField}
                        />
                      </div>
                    )}

                    {/* Mobile Card-Based Items Editor (< md) */}
                    <div className="md:hidden space-y-3">
                      {visibleRows.map((row, rIdx) => (
                        <div
                          key={row.id}
                          data-testid="wizard-mobile-row-card"
                          className="rounded-2xl liquid-glass-well p-3.5 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-slate-300/30 dark:border-white/10 pb-2">
                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-sans tabular-nums">
                              کالای {toPersianDigits(rIdx + 1)}
                            </span>
                            <div className="flex items-center gap-2">
                              {columns.some((c) => c.id === 'totalPrice' || c.isFormula) && (
                                <span className="text-xs font-sans tabular-nums font-bold text-sky-700 dark:text-sky-300">
                                  {formatCurrency(row.totalPrice || 0)} ریال
                                </span>
                              )}
                              <button
                                type="button"
                                disabled={rows.length <= 1}
                                onClick={() => handleRemoveRow(tableField, row.id)}
                                aria-label={`حذف ردیف ${rIdx + 1}`}
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2.5">
                            {columns.map((col) => {
                              if (col.id === 'rowNumber' || col.id === 'totalPrice' || col.isFormula) {
                                return null;
                              }

                              if (col.id === 'description') {
                                return (
                                  <div key={col.id} className="col-span-2 space-y-1">
                                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                      {col.title}
                                    </label>
                                    <div className="w-full h-11 px-3 bg-white/80 dark:bg-slate-900/70 border border-slate-300/60 dark:border-white/15 rounded-xl flex items-center focus-within:ring-2 focus-within:ring-sky-500/40">
                                      <ProductAutocompleteCell
                                        value={String(row.description || '')}
                                        row={row}
                                        catalog={productCatalog}
                                        onChange={(val) =>
                                          handleRowChange(tableField, row.id, 'description', val)
                                        }
                                        onSelectSuggestion={(updatedRow) =>
                                          handleRowReplace(tableField, row.id, updatedRow)
                                        }
                                        placeholder="اسم کالا را بنویسید..."
                                        isFillMode={true}
                                      />
                                    </div>
                                  </div>
                                );
                              }

                              const isNum = col.type === 'number' || col.type === 'currency';
                              const val = row[col.id] ?? '';
                              const isWide = col.id === 'notes' || col.id === 'serialNumber';

                              return (
                                <div key={col.id} className={isWide ? 'col-span-2 space-y-1' : 'space-y-1'}>
                                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                                    {col.title}
                                  </label>
                                  <input
                                    type={isNum ? 'number' : 'text'}
                                    aria-label={`${col.title} ردیف ${rIdx + 1}`}
                                    value={val === 0 && isNum ? '' : val}
                                    onChange={(e) =>
                                      handleRowChange(
                                        tableField,
                                        row.id,
                                        col.id as keyof TableItemRow,
                                        isNum ? (e.target.value ? Number(e.target.value) : 0) : e.target.value
                                      )
                                    }
                                    placeholder={col.title}
                                    className={`w-full h-11 px-3 bg-white/80 dark:bg-slate-900/70 border border-slate-300/60 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40 ${
                                      isNum ? 'font-sans tabular-nums text-center' : 'text-right'
                                    }`}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table Items Editor (md+) */}
                    <div className="hidden md:block overflow-x-auto liquid-glass-well rounded-2xl">
                      <table className="w-full text-right border-collapse text-xs">
                        <thead className="bg-white/50 dark:bg-slate-900/50 border-b border-slate-300/40 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                          <tr>
                            {columns.map((col) => (
                              <th key={col.id} className="p-3 text-center whitespace-nowrap">
                                {col.title}
                              </th>
                            ))}
                            <th className="p-3 w-12 text-center">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-300/30 dark:divide-white/10">
                          {visibleRows.map((row, rIdx) => (
                            <tr
                              key={row.id}
                              data-testid="wizard-table-row"
                              className="hover:bg-white/45 dark:hover:bg-slate-800/35 transition-colors"
                            >
                              {columns.map((col) => {
                                if (col.id === 'rowNumber') {
                                  return (
                                    <td
                                      key={col.id}
                                      className="p-2 text-center font-sans tabular-nums text-slate-600 dark:text-slate-300 w-10"
                                    >
                                      {toPersianDigits(rIdx + 1)}
                                    </td>
                                  );
                                }

                                if (col.id === 'totalPrice' || col.isFormula) {
                                  return (
                                    <td
                                      key={col.id}
                                      className="p-2 text-center font-sans tabular-nums font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap"
                                    >
                                      {formatCurrency(row.totalPrice || 0)}
                                    </td>
                                  );
                                }

                                if (col.id === 'description') {
                                  return (
                                    <td key={col.id} className="p-1.5 min-w-[210px]">
                                      <div className="w-full h-10 px-2.5 bg-white/75 dark:bg-slate-900/65 border border-slate-300/50 dark:border-white/15 rounded-xl flex items-center focus-within:ring-2 focus-within:ring-sky-500/40">
                                        <ProductAutocompleteCell
                                          value={String(row.description || '')}
                                          row={row}
                                          catalog={productCatalog}
                                          onChange={(val) =>
                                            handleRowChange(tableField, row.id, 'description', val)
                                          }
                                          onSelectSuggestion={(updatedRow) =>
                                            handleRowReplace(tableField, row.id, updatedRow)
                                          }
                                          placeholder="اسم کالا را بنویسید..."
                                          isFillMode={true}
                                        />
                                      </div>
                                    </td>
                                  );
                                }

                                const isNum = col.type === 'number' || col.type === 'currency';
                                const val = row[col.id] ?? '';

                                return (
                                  <td key={col.id} className="p-1.5 min-w-[84px]">
                                    <input
                                      type={isNum ? 'number' : 'text'}
                                      aria-label={`${col.title} ردیف ${rIdx + 1}`}
                                      value={val === 0 && isNum ? '' : val}
                                      onChange={(e) =>
                                        handleRowChange(
                                          tableField,
                                          row.id,
                                          col.id as keyof TableItemRow,
                                          isNum ? (e.target.value ? Number(e.target.value) : 0) : e.target.value
                                        )
                                      }
                                      placeholder={col.title}
                                      className={`w-full h-10 px-2.5 bg-white/75 dark:bg-slate-900/65 border border-slate-300/50 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40 ${
                                        isNum ? 'font-sans tabular-nums text-center' : 'text-right'
                                      }`}
                                    />
                                  </td>
                                );
                              })}

                              <td className="p-1.5 text-center">
                                <button
                                  type="button"
                                  disabled={rows.length <= 1}
                                  onClick={() => handleRemoveRow(tableField, row.id)}
                                  aria-label={`حذف ردیف ${rIdx + 1}`}
                                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 disabled:opacity-30 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Progressive Disclosure Toggle when empty trailing rows are hidden */}
                    {hiddenEmptyCount > 0 && (
                      <div className="flex justify-center pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAllRows(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl liquid-glass-well text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>
                            نمایش {toPersianDigits(hiddenEmptyCount)} ردیف خالی دیگر (جمعاً{' '}
                            {toPersianDigits(rows.length)} ردیف)
                          </span>
                        </button>
                      </div>
                    )}

                    {summary && (
                      <div className="liquid-glass-well rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                        <div className="flex flex-wrap items-center gap-4 font-sans tabular-nums text-slate-700 dark:text-slate-200">
                          <span>
                            جمع کالاها: <strong>{formatCurrency(summary.subtotal)} ریال</strong>
                          </span>
                          {(tableField.taxRatePercent ?? 10) > 0 && (
                            <span>
                              مالیات ({toPersianDigits(tableField.taxRatePercent ?? 10)}٪):{' '}
                              <strong>{formatCurrency(summary.taxAmount)} ریال</strong>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-sky-700 dark:text-sky-300 font-sans tabular-nums">
                          مبلغ نهایی: {formatCurrency(summary.grandTotal)} ریال
                        </div>
                      </div>
                    )}
                  </section>
                );
              })}

              {/* Section 3: Signatures */}
              {signatureFields.length > 0 && (
                <section className="liquid-glass rounded-3xl p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-300/40 dark:border-white/10 pb-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      ۳. امضا (اگر لازم دارید)
                    </h3>
                    <span className="text-xs font-sans tabular-nums text-slate-500 dark:text-slate-400">
                      {toPersianDigits(signedSlotsCount)} امضا ثبت شده
                    </span>
                  </div>

                  {signatureFields.map((sigField) => {
                    const slots =
                      sigField.signatureLabels && sigField.signatureLabels.length > 0
                        ? sigField.signatureLabels.map((lbl, idx) => ({
                            key: `${sigField.id}_sig_${idx}`,
                            label: lbl,
                          }))
                        : [{ key: sigField.id, label: sigField.label || 'امضا' }];

                    return (
                      <div
                        key={sigField.id}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3"
                      >
                        {slots.map((slot) => {
                          const sigVal = signatureData[slot.key];
                          return (
                            <div
                              key={slot.key}
                              className="liquid-glass-well rounded-2xl p-3 flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                                  {slot.label}
                                </span>
                                {sigVal && (
                                  <button
                                    type="button"
                                    onClick={() => onSignatureDataChange(slot.key, '')}
                                    className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline shrink-0 cursor-pointer"
                                  >
                                    پاک کردن
                                  </button>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setActiveSignatureModal({ key: slot.key, label: slot.label })
                                }
                                className="h-20 w-full rounded-xl border border-dashed border-slate-400/50 dark:border-white/20 bg-white/75 dark:bg-slate-900/60 flex items-center justify-center hover:border-sky-500 dark:hover:border-sky-400 transition-colors cursor-pointer"
                              >
                                {sigVal ? (
                                  <img
                                    src={sigVal}
                                    alt={slot.label}
                                    className="max-h-16 max-w-full object-contain"
                                  />
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <PenTool className="w-4 h-4" />
                                    <span>امضا بکشید</span>
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </section>
              )}
            </div>
          </div>

          {/* Step 2 Sticky Liquid Glass Footer */}
          <div className="liquid-glass-elevated border-t border-white/60 dark:border-white/10 px-3 sm:px-6 py-2.5 sm:py-3 shrink-0">
            <div className="max-w-6xl mx-auto flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setValidationErrors([]);
                  onStepChange(1);
                }}
                className="w-full sm:w-auto h-11 px-4 rounded-2xl liquid-glass-well text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-semibold hover:bg-white/80 dark:hover:bg-slate-800/70 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
                <span>برگشت</span>
              </button>

              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 font-sans tabular-nums">
                <span>شماره برگه: {toPersianDigits(formData['f_doc_no'] || '—')}</span>
                {tableFields.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{toPersianDigits(filledItemsCount)} کالا</span>
                  </>
                )}
                {signatureFields.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{toPersianDigits(signedSlotsCount)} امضا</span>
                  </>
                )}
              </div>

              <button
                type="button"
                data-testid="wizard-next-step-2"
                onClick={handleProceedFromStep2}
                className="w-full sm:w-auto h-11 px-6 rounded-2xl liquid-cta text-xs sm:text-sm font-bold flex items-center justify-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>ساخت برگه آماده چاپ</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: PRINT-READY DOCUMENT */}
      {step === 3 && (
        <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
          {/* Calm Glass Action Panel */}
          <aside className="w-full lg:w-80 liquid-glass-elevated border-b lg:border-b-0 lg:border-l border-white/60 dark:border-white/10 p-4 sm:p-5 lg:overflow-y-auto shrink-0 space-y-4">
            {/* Friendly Readiness Summary */}
            <div className="space-y-2 pb-4 border-b border-slate-300/40 dark:border-white/10">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-bold">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>برگه‌تان آماده چاپ است!</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                {activeTemplate.title}
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1 font-sans tabular-nums">
                <span>شماره {toPersianDigits(formData['f_doc_no'] || '۱')}</span>
                <span aria-hidden="true">·</span>
                <span>{toPersianDigits(formData['f_doc_date'] || '—')}</span>
                {tableFields.length > 0 && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>{toPersianDigits(filledItemsCount)} کالا</span>
                  </>
                )}
              </div>

              {savedArchiveRecord && (
                <div
                  data-testid="wizard-saved-tracking"
                  className="mt-2 p-3 rounded-2xl bg-emerald-500/15 dark:bg-emerald-400/15 border border-emerald-500/35 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between"
                >
                  <span>در «برگه‌های من» ذخیره شد</span>
                  <strong className="font-mono font-bold">{savedArchiveRecord.recordNumber}</strong>
                </div>
              )}
            </div>

            {/* Primary Celebratory CTAs */}
            <div className="space-y-2.5">
              <button
                type="button"
                data-testid="wizard-print-btn"
                onClick={handlePrintNow}
                className="w-full h-12 px-4 rounded-2xl liquid-cta text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>چاپ برگه</span>
              </button>

              {onExportPdf && (
                <button
                  type="button"
                  data-testid="wizard-export-pdf-btn"
                  disabled={isExportingPdf}
                  onClick={() => onExportPdf(printSettings)}
                  className="w-full h-11 px-4 rounded-2xl liquid-glass-well border border-rose-400/40 bg-rose-500/12 hover:bg-rose-500/20 text-rose-700 dark:text-rose-200 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <FileDown className="w-4 h-4" />
                  <span>{isExportingPdf ? 'در حال ساخت PDF...' : 'دانلود فایل PDF'}</span>
                </button>
              )}

              <button
                type="button"
                data-testid="wizard-archive-save-btn"
                onClick={() => onSaveRecordToArchive()}
                className="w-full h-11 px-4 rounded-2xl liquid-cta-success text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>
                  {savedArchiveRecord ? 'ذخیره دوباره تغییرات' : 'ذخیره در برگه‌های من'}
                </span>
              </button>
            </div>

            {/* Print Content Mode */}
            <div className="space-y-2 text-xs pt-2 border-t border-slate-300/40 dark:border-white/10">
              <span className="block font-semibold text-slate-700 dark:text-slate-200">
                چطور چاپ شود؟
              </span>
              <div className="grid grid-cols-2 gap-1 p-1 liquid-glass-well rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'filled' }))}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    printSettings.printMode === 'filled'
                      ? 'liquid-cta text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  با نوشته‌های من
                </button>
                <button
                  type="button"
                  onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'blank' }))}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    printSettings.printMode === 'blank'
                      ? 'liquid-cta text-white'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  برگه خام و خالی
                </button>
              </div>
            </div>

            {/* Collapsible Logo & Excel Table Customizer in Step 3 Live Preview */}
            {onUpdateActiveTemplate && (headerField || tableFields.length > 0) && (
              <div className="pt-1">
                <button
                  type="button"
                  data-testid="wizard-step3-design-toggle"
                  onClick={() => setShowStep3DesignDrawer((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl liquid-glass-well text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-sky-600 dark:text-sky-300" />
                    <span>لوگو، خطوط و رنگ جدول</span>
                  </span>
                  {showStep3DesignDrawer ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showStep3DesignDrawer && (
                  <div className="mt-2.5 p-3 rounded-2xl liquid-glass-well space-y-3.5">
                    {headerField && (
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 block">
                          لوگوی سربرگ:
                        </span>
                        <CompanyLogoControls
                          compact
                          headerField={headerField}
                          onUpdateHeaderField={handleUpdateTemplateField}
                        />
                      </div>
                    )}

                    {tableFields[0] && (
                      <div className="space-y-1.5 pt-2 border-t border-slate-300/40 dark:border-white/10">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100 block">
                          خطوط و رنگ‌بندی جدول:
                        </span>
                        <ExcelTableStylePanel
                          compact
                          field={tableFields[0]}
                          columns={tableFields[0].tableColumns || []}
                          onUpdateField={handleUpdateTemplateField}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible More Paper Options */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowMorePrintOptions((v) => !v)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl liquid-glass-well text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>تنظیمات کاغذ و برگه</span>
                </span>
                {showMorePrintOptions ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showMorePrintOptions && (
                <div className="mt-2.5 p-3 rounded-2xl liquid-glass-well space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="wizard-print-paper"
                        className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                      >
                        اندازه کاغذ
                      </label>
                      <select
                        id="wizard-print-paper"
                        value={printSettings.paperSize}
                        onChange={(e) =>
                          setPrintSettings((s) => ({ ...s, paperSize: e.target.value as PaperSize }))
                        }
                        className="w-full h-9 px-2 bg-white/80 dark:bg-slate-900/70 border border-slate-300/50 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                      >
                        <option value="A4">A4</option>
                        <option value="A5">A5</option>
                        <option value="Letter">Letter</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="wizard-print-orientation"
                        className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                      >
                        حالت صفحه
                      </label>
                      <select
                        id="wizard-print-orientation"
                        value={printSettings.orientation}
                        onChange={(e) =>
                          setPrintSettings((s) => ({
                            ...s,
                            orientation: e.target.value as PageOrientation,
                          }))
                        }
                        className="w-full h-9 px-2 bg-white/80 dark:bg-slate-900/70 border border-slate-300/50 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                      >
                        <option value="landscape">افقی</option>
                        <option value="portrait">عمودی</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={printSettings.showWatermark}
                        onChange={(e) =>
                          setPrintSettings((s) => ({ ...s, showWatermark: e.target.checked }))
                        }
                        className="w-4 h-4 rounded text-sky-600 focus:ring-0"
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-200">
                        نوشته کم‌رنگ روی برگه (واترمارک)
                      </span>
                    </label>

                    {printSettings.showWatermark && (
                      <input
                        type="text"
                        value={printSettings.watermarkText}
                        onChange={(e) =>
                          setPrintSettings((s) => ({ ...s, watermarkText: e.target.value }))
                        }
                        placeholder="مثلاً نسخه اصلی"
                        className="w-full h-9 px-2.5 bg-white/80 dark:bg-slate-900/70 border border-slate-300/50 dark:border-white/15 rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Secondary Nav */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-300/40 dark:border-white/10">
              <button
                type="button"
                onClick={() => onStepChange(2)}
                className="h-10 px-3 rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-white/80 dark:hover:bg-slate-800/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>ویرایش متن</span>
              </button>

              <button
                type="button"
                data-testid="wizard-restart-btn"
                onClick={onStartNewWizard}
                className="h-10 px-3 rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-white/80 dark:hover:bg-slate-800/70 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <FilePlus2 className="w-3.5 h-3.5" />
                <span>برگه جدید</span>
              </button>
            </div>
          </aside>

          {/* Live Print-Ready Paper Preview Surface */}
          <div className="flex-1 lg:overflow-auto p-3 sm:p-5 md:p-8 bg-slate-200/40 dark:bg-slate-950/40 flex flex-col items-center justify-start gap-3">
            {isCompactViewport && (
              <div className="w-full flex items-center justify-between gap-2 px-1 text-xs text-slate-700 dark:text-slate-200 font-sans tabular-nums">
                <span>
                  پیش‌نمایش برگه ({toPersianDigits(Math.round(previewScale * 100))}٪)
                </span>
                <button
                  type="button"
                  onClick={() => setFitPreviewToScreen((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  {fitPreviewToScreen ? (
                    <>
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>بزرگ‌نمایی ۱۰۰٪</span>
                    </>
                  ) : (
                    <>
                      <Minimize2 className="w-3.5 h-3.5" />
                      <span>جا کردن در صفحه</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="w-full overflow-x-auto flex justify-center">
              <div
                dir="ltr"
                style={
                  isCompactViewport && fitPreviewToScreen
                    ? {
                        width: `${Math.round(previewTargetWidth * previewScale)}px`,
                        height: previewHeight > 0 ? `${Math.round(previewHeight * previewScale)}px` : undefined,
                        position: 'relative',
                        flexShrink: 0,
                      }
                    : { width: '100%', maxWidth: `${previewTargetWidth}px` }
                }
              >
                <div
                  ref={previewSheetRef}
                  dir="rtl"
                  style={
                    isCompactViewport && fitPreviewToScreen
                      ? {
                          width: `${previewTargetWidth}px`,
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          transform: `scale(${previewScale})`,
                          transformOrigin: 'top left',
                        }
                      : undefined
                  }
                  className="bg-white shadow-2xl border border-slate-300/80 rounded-sm overflow-hidden w-full"
                >
                  <OfficialPrintDocument
                    embeddedPreview={true}
                    template={previewTemplate}
                    formData={formData}
                    tableData={tableData}
                    signatureData={signatureData}
                    printSettings={printSettings}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Digital Signature Pad Modal */}
      {activeSignatureModal && (
        <SignaturePadModal
          isOpen={true}
          onClose={() => setActiveSignatureModal(null)}
          onSave={(dataUrl) => {
            onSignatureDataChange(activeSignatureModal.key, dataUrl);
            setActiveSignatureModal(null);
          }}
          title={`امضای دیجیتال: ${activeSignatureModal.label}`}
          initialDataUrl={signatureData[activeSignatureModal.key]}
        />
      )}
    </div>
  );
};

function previewTemplateKey(id: string, paperSize: PaperSize, orientation: PageOrientation): string {
  return `${id}-${paperSize}-${orientation}`;
}

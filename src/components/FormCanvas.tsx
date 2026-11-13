import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  FormTemplate, 
  FormField, 
  TableItemRow,
  FieldWidth,
  FormRecord 
} from '../types/form';
import { 
  formatCurrency, 
  toPersianDigits, 
  calculateTableSummary, 
  calculateRowTotal, 
  numberToPersianWords 
} from '../utils/formLogic';
import { 
  Building2, 
  PenTool, 
  Plus, 
  Trash2, 
  QrCode, 
  Calendar, 
  Coins, 
  Hash, 
  CheckSquare, 
  ArrowUp, 
  ArrowDown, 
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { SignaturePadModal } from './SignaturePadModal';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { ProductAutocompleteCell } from './ProductAutocompleteCell';
import { extractProductHistory } from '../utils/productSuggestions';
import { useViewportWidth } from '../utils/useViewportWidth';
import { calculateCanvasAutoScale, getPaperPixelWidth } from '../utils/responsiveLayout';
import { resolveHeaderLogo } from '../utils/companyBrand';
import {
  resolveTableStyle,
  getTableWrapperStyle,
  getHeaderCellCssStyle,
  getBodyCellCssStyle,
} from '../utils/tableStyling';

interface FormCanvasProps {
  template: FormTemplate;
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onUpdateField: (field: FormField) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (field: FormField) => void;
  onMoveField: (id: string, direction: 'up' | 'down') => void;
  isFillMode: boolean;
  zoomScale: number;
  onZoomChange?: (scale: number) => void;
  
  // Fill mode state
  formData: Record<string, any>;
  onFormDataChange: (key: string, value: any) => void;
  tableData: Record<string, TableItemRow[]>;
  onTableDataChange: (fieldId: string, rows: TableItemRow[]) => void;
  signatureData: Record<string, string>;
  onSignatureDataChange: (fieldId: string, dataUrl: string) => void;
  records?: FormRecord[];
}

export const FormCanvas: React.FC<FormCanvasProps> = ({
  template,
  selectedFieldId,
  onSelectField,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  isFillMode,
  zoomScale,
  onZoomChange,
  formData,
  onFormDataChange,
  tableData,
  onTableDataChange,
  signatureData,
  onSignatureDataChange,
  records = [],
}) => {
  const [activeSigningFieldId, setActiveSigningFieldId] = useState<string | null>(null);
  const { viewportWidth, isMobile } = useViewportWidth();
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const [sheetSize, setSheetSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Extract catalog of products from historical records and template initial rows
  const productCatalog = useMemo(() => {
    return extractProductHistory(records, [template]);
  }, [records, template]);

  // Dimension mapping for paper sheets
  const paperDimensions: Record<string, { width: string; minHeight: string }> = {
    'A4-portrait': { width: '210mm', minHeight: '297mm' },
    'A4-landscape': { width: '297mm', minHeight: '210mm' },
    'A5-portrait': { width: '148mm', minHeight: '210mm' },
    'A5-landscape': { width: '210mm', minHeight: '148mm' },
    'Letter-portrait': { width: '216mm', minHeight: '279mm' },
    'Letter-landscape': { width: '279mm', minHeight: '216mm' },
  };

  const currentDimKey = `${template.paperSize}-${template.orientation}`;
  const dimensions = paperDimensions[currentDimKey] || paperDimensions['A4-portrait'];

  const isCompactViewport = viewportWidth < 1024;
  const autoFitScale = isCompactViewport
    ? calculateCanvasAutoScale(viewportWidth, template.paperSize, template.orientation, isMobile ? 24 : 48)
    : 1;
  const effectiveScale = Math.round(autoFitScale * zoomScale * 100) / 100;
  const fallbackPaperPx = getPaperPixelWidth(template.paperSize, template.orientation);
  const rawWidthPx = sheetSize.width > 0 ? sheetSize.width : fallbackPaperPx;

  useEffect(() => {
    const el = sheetRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const updateSize = () => {
      setSheetSize({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    };
    updateSize();
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [template.id, template.paperSize, template.orientation, template.fields.length]);

  // Width class mapper for CSS grid
  const getWidthClass = (width: FieldWidth) => {
    switch (width) {
      case '100%': return 'w-full';
      case '75%': return 'w-full md:w-3/4';
      case '66%': return 'w-full md:w-2/3';
      case '50%': return 'w-full md:w-1/2';
      case '33%': return 'w-full md:w-1/3';
      case '25%': return 'w-full md:w-1/4';
      default: return 'w-full';
    }
  };

  // Helper for Table rows
  const getTableRows = (fieldId: string, initialCount = 3): TableItemRow[] => {
    if (tableData[fieldId] && tableData[fieldId].length > 0) {
      return tableData[fieldId];
    }
    const targetField = template.fields.find((f) => f.id === fieldId);
    if (targetField?.tableInitialData && targetField.tableInitialData.length > 0) {
      const initData = targetField.tableInitialData;
      const count = targetField.tableInitialRows || initialCount;
      const isDispatch = targetField.tableVariant === 'dispatch';
      if (initData.length < count) {
        const remaining = Array.from({ length: count - initData.length }, (_, idx) => {
          const rNum = initData.length + idx + 1;
          return {
            id: `row-${rNum}`,
            rowNumber: rNum,
            productCode: '',
            description: '',
            model: '',
            quantity: isDispatch ? 0 : 0,
            unit: '',
            unitPrice: 0,
            totalPrice: 0,
            usageLocation: '',
            serialNumber: '',
            notes: '',
          };
        });
        return [...initData, ...remaining];
      }
      return initData;
    }

    const count = targetField?.tableInitialRows || initialCount;
    const isDispatch = targetField?.tableVariant === 'dispatch';

    if (isDispatch) {
      const rows: TableItemRow[] = Array.from({ length: count }, (_, idx) => ({
        id: `row-${idx + 1}`,
        rowNumber: idx + 1,
        productCode: '',
        description: '',
        model: '',
        quantity: 0,
        unit: '',
        unitPrice: 0,
        totalPrice: 0,
        usageLocation: '',
        serialNumber: '',
        notes: '',
      }));
      return rows;
    }

    const defaultRows: TableItemRow[] = Array.from({ length: count }, (_, idx) => ({
      id: `row-${idx + 1}`,
      rowNumber: idx + 1,
      productCode: '',
      description: isDispatch ? '' : idx === 0 ? 'خدمات مشاوره و پشتیبانی سیستم' : '',
      model: '',
      quantity: isDispatch ? 0 : idx === 0 ? 1 : 0,
      unit: '',
      unitPrice: isDispatch ? 0 : idx === 0 ? 5000000 : 0,
      totalPrice: isDispatch ? 0 : idx === 0 ? 5000000 : 0,
      usageLocation: '',
      serialNumber: '',
      notes: '',
    }));
    return defaultRows;
  };

  const handleAddTableRow = (fieldId: string) => {
    const current = getTableRows(fieldId);
    const newRow: TableItemRow = {
      id: `row-${Date.now()}`,
      rowNumber: current.length + 1,
      productCode: '',
      description: '',
      quantity: 1,
      unit: '',
      unitPrice: 0,
      totalPrice: 0,
      serialNumber: '',
      notes: '',
    };
    onTableDataChange(fieldId, [...current, newRow]);
  };

  const handleRemoveTableRow = (fieldId: string, rowId: string) => {
    const current = getTableRows(fieldId);
    if (current.length <= 1) return;
    const filtered = current
      .filter((r) => r.id !== rowId)
      .map((r, i) => ({ ...r, rowNumber: i + 1 }));
    onTableDataChange(fieldId, filtered);
  };

  const handleTableRowChange = (
    fieldId: string,
    rowId: string,
    key: keyof TableItemRow,
    value: any
  ) => {
    const current = getTableRows(fieldId);
    const updated = current.map((r) => {
      if (r.id !== rowId) return r;
      const modified = { ...r, [key]: value };
      if (key === 'quantity' || key === 'unitPrice') {
        modified.totalPrice = calculateRowTotal(Number(modified.quantity), Number(modified.unitPrice));
      }
      return modified;
    });
    onTableDataChange(fieldId, updated);
  };

  const handleTableRowReplace = (
    fieldId: string,
    rowId: string,
    updatedRow: TableItemRow
  ) => {
    const current = getTableRows(fieldId);
    const updated = current.map((r) => (r.id === rowId ? updatedRow : r));
    onTableDataChange(fieldId, updated);
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-200/35 dark:bg-slate-950/40 transition-colors">
      <div className="flex-1 overflow-auto p-3 sm:p-4 md:p-8 flex justify-center items-start designer-grid-pattern relative">
      {/* Layout footprint wrapper preventing horizontal overflow when paper is scaled */}
      <div
        dir="ltr"
        style={
          isCompactViewport || effectiveScale !== 1
            ? {
                width: `${Math.round(rawWidthPx * effectiveScale)}px`,
                height: sheetSize.height > 0 ? `${Math.round(sheetSize.height * effectiveScale)}px` : undefined,
                position: 'relative',
                flexShrink: 0,
              }
            : undefined
        }
      >
        {/* Scaled Paper Container */}
        <div
          ref={sheetRef}
          dir="rtl"
          style={{
            transform: `scale(${effectiveScale})`,
            transformOrigin: isCompactViewport || effectiveScale !== 1 ? 'top left' : 'top center',
            transition: 'transform 0.15s ease-out',
            position: isCompactViewport || effectiveScale !== 1 ? 'absolute' : 'relative',
            top: 0,
            left: 0,
          }}
          className="printable-sheet bg-white dark:bg-[#1c2128] text-slate-900 dark:text-slate-100 shadow-xl transition-shadow"
        >
          {/* Physical Paper Sheet Representation */}
          <div
            style={{
              width: dimensions.width,
              minHeight: dimensions.minHeight,
            }}
            className={`p-8 md:p-10 flex flex-col justify-between relative bg-white dark:bg-[#1c2128] transition-colors ${
              template.showPageBorders ? 'border-2 border-slate-700 dark:border-slate-500' : 'border border-slate-200 dark:border-slate-700'
            }`}
          >
          {/* Watermark overlay */}
          {template.showWatermark && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-10">
              <span className="text-slate-200/50 dark:text-slate-700/30 font-bold text-7xl md:text-8xl rotate-[-30deg] tracking-wider uppercase border-4 border-dashed border-slate-200/50 dark:border-slate-700/30 px-8 py-3 rounded-xl">
                {template.watermarkText || 'محرمانه'}
              </span>
            </div>
          )}

          {/* Form Content Body */}
          <div className="relative z-20 space-y-4">
            {/* Form Top Title and Meta */}
            {template.headerTitle ? (
              <div className="text-center pb-2 border-b-2 border-slate-800 dark:border-slate-600">
                <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {template.headerTitle}
                </h1>
                {template.headerSubtitle && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    {template.headerSubtitle}
                  </p>
                )}
              </div>
            ) : null}

            {/* Dynamic Fields Grid */}
            <div className="flex flex-wrap -mx-1.5 gap-y-3">
              {template.fields.map((field) => {
                const isSelected = selectedFieldId === field.id && !isFillMode;
                const widthCls = getWidthClass(field.width);

                return (
                  <div
                    key={field.id}
                    onClick={() => !isFillMode && onSelectField(field.id)}
                    className={`px-1.5 ${widthCls} ${field.hideOnPrint ? 'no-print' : ''}`}
                  >
                    <div
                      className={`relative p-2.5 rounded transition-all ${
                        field.boxed ? 'border border-slate-300 dark:border-[#333c4d] bg-white dark:bg-[#222731]' : 'bg-transparent'
                      } ${
                        isSelected
                          ? 'ring-2 ring-[#0067C0] dark:ring-[#4cc2ff] border-transparent shadow-xs'
                          : !isFillMode
                          ? 'hover:border-slate-400 dark:hover:border-slate-500 cursor-pointer'
                          : ''
                      }`}
                    >
                      {/* Floating toolbar for selected field in Design Mode */}
                      {isSelected && !isFillMode && (
                        <div className="absolute -top-3.5 left-2 bg-[#0067C0] dark:bg-[#0078D4] text-white rounded px-2 py-0.5 text-[10px] font-medium flex items-center gap-1.5 shadow-xs z-30">
                          <span>{field.label || 'فیلد'}</span>
                          <div className="flex items-center gap-1 border-r border-blue-400 dark:border-blue-300 pr-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveField(field.id, 'up');
                              }}
                              className="hover:text-blue-200"
                              title="انتقال به بالا"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onMoveField(field.id, 'down');
                              }}
                              className="hover:text-blue-200"
                              title="انتقال به پایین"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDuplicateField(field);
                              }}
                              className="hover:text-blue-200"
                              title="تکثیر"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteField(field.id);
                              }}
                              className="hover:text-red-200"
                              title="حذف"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* FIELD TYPE: HEADER BANNER */}
                      {field.type === 'header_banner' && (() => {
                        const logoInfo = resolveHeaderLogo(field);
                        const renderCanvasLogo = () => {
                          if (logoInfo.mode === 'custom' && logoInfo.logoUrl) {
                            return (
                              <div className="flex flex-col items-center justify-center gap-1">
                                <img
                                  src={logoInfo.logoUrl}
                                  alt={field.companyName || 'لوگوی شرکت'}
                                  style={{ maxHeight: `${logoInfo.sizePx}px` }}
                                  className="max-w-full object-contain"
                                />
                                {field.companySubName && (
                                  <div className="text-[8px] text-slate-800 dark:text-slate-300 font-medium w-full text-center">
                                    {field.companySubName}
                                  </div>
                                )}
                              </div>
                            );
                          }
                          if (logoInfo.mode === 'none') {
                            return (
                              <div className="text-[10px] text-slate-700 dark:text-slate-300 font-semibold text-center">
                                {field.companySubName || field.companyName || ''}
                              </div>
                            );
                          }
                          return (
                            <>
                              <div className="flex items-center gap-1.5">
                                <span className="font-black text-base tracking-widest text-slate-900 dark:text-slate-100 font-sans">AWOX</span>
                                <span className="text-orange-600 dark:text-orange-400 text-sm">◆</span>
                              </div>
                              <div className="text-[8px] text-slate-700 dark:text-slate-300 font-sans font-bold tracking-tight uppercase">
                                AYRIA VANDAD KASRA Int&apos;l Co.
                              </div>
                              <div className="text-[8px] text-slate-800 dark:text-slate-300 font-medium mt-0.5 border-t border-slate-300 dark:border-slate-600 pt-0.5 w-full">
                                {field.companySubName || 'شرکت بین‌المللی آیریا ونداد کسری'}
                              </div>
                            </>
                          );
                        };

                        return field.headerType === 'dispatch_voucher' ? (
                          <div className="w-full text-xs select-none">
                            {/* Main 3-Cell Box Header */}
                            <div className="w-full border-2 border-slate-900 dark:border-slate-400 bg-white dark:bg-[#222731] flex text-xs">
                              {/* Right Box (RTL rightmost): Date, Document Number, Form Code with borders */}
                              <div className="w-[30%] flex flex-col justify-between text-xs font-semibold text-slate-900 dark:text-slate-100">
                                {logoInfo.position === 'right' && logoInfo.mode !== 'none' && (
                                  <div className="p-1.5 border-b-2 border-slate-900 dark:border-slate-400 flex flex-col items-center">
                                    {renderCanvasLogo()}
                                  </div>
                                )}
                                <div className="flex items-center justify-between p-1.5 border-b-2 border-slate-900 dark:border-slate-400">
                                  <span className="font-bold">تاریخ :</span>
                                  <div className="font-sans tabular-nums">
                                    {isFillMode ? (
                                      <ShamsiDatePicker
                                        compact
                                        value={formData[`${field.id}_header_date`] ?? field.headerDate ?? '1405/06/25'}
                                        onChange={(d) => onFormDataChange(`${field.id}_header_date`, d)}
                                        className="w-32"
                                      />
                                    ) : (
                                      toPersianDigits(formData[`${field.id}_header_date`] || field.headerDate || '1405/06/25')
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center justify-between p-1.5 border-b-2 border-slate-900 dark:border-slate-400">
                                  <span className="font-bold">شماره سند :</span>
                                  <span className="font-sans tabular-nums font-bold">
                                    {isFillMode ? (
                                      <input
                                        type="text"
                                        value={formData[`${field.id}_doc_no`] ?? field.documentNumber ?? '1'}
                                        onChange={(e) => onFormDataChange(`${field.id}_doc_no`, e.target.value)}
                                        className="w-16 px-1.5 py-0.5 border border-slate-300 dark:border-slate-600 dark:bg-[#181c24] dark:text-slate-100 rounded font-sans tabular-nums text-center text-xs"
                                      />
                                    ) : (
                                      toPersianDigits(formData[`${field.id}_doc_no`] || field.documentNumber || '1')
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between p-1.5">
                                  <span className="font-bold">کد فرم :</span>
                                  <span className="font-mono tracking-wider text-[11px] font-bold text-slate-800 dark:text-slate-200">
                                    {field.formCode || 'AW-ST-FO-008'}
                                  </span>
                                </div>
                              </div>

                              {/* Center Box: Company Name, Title, and optional grey banner */}
                              <div className="flex-1 border-r-2 border-l-2 border-slate-900 dark:border-slate-400 flex flex-col justify-between text-center min-h-[76px]">
                                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 py-2 px-3 flex flex-col items-center justify-center gap-1">
                                  {logoInfo.position === 'center' && logoInfo.mode === 'custom' && logoInfo.logoUrl && (
                                    <img
                                      src={logoInfo.logoUrl}
                                      alt={field.companyName || 'لوگوی شرکت'}
                                      style={{ maxHeight: `${logoInfo.sizePx}px` }}
                                      className="max-w-full object-contain"
                                    />
                                  )}
                                  <span>{field.companyName || 'شرکت آیریا ونداد کسری'}</span>
                                </div>
                                <div
                                  className={`font-black text-sm md:text-base text-slate-900 dark:text-slate-100 tracking-tight py-1.5 border-t-2 border-slate-900 dark:border-slate-400 ${
                                    field.hasGreyTitleBanner ? 'bg-[#b3b3b3] dark:bg-[#343b47]' : 'bg-white dark:bg-[#222731]'
                                  }`}
                                >
                                  {field.headerTitle || field.label || 'حواله خروج محصول'}
                                </div>
                              </div>

                              {/* Left Box (RTL leftmost): Logo */}
                              <div className="w-[30%] p-2 flex flex-col items-center justify-center text-center">
                                {logoInfo.position === 'left'
                                  ? renderCanvasLogo()
                                  : (
                                    <div className="text-[9px] text-slate-700 dark:text-slate-300 font-medium text-center">
                                      {field.companySubName || 'سند رسمی سازمانی'}
                                    </div>
                                  )}
                              </div>
                            </div>

                            {/* Optional Requesting Unit subheader bar */}
                            {field.requestingUnit && (
                              <div className="w-full border-r-2 border-l-2 border-b-2 border-slate-900 dark:border-slate-400 bg-white dark:bg-[#222731] py-1 px-4 text-center font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-center gap-2">
                                <span>واحد درخواست کننده :</span>
                                {isFillMode ? (
                                  <input
                                    type="text"
                                    value={formData[`${field.id}_req_unit`] ?? field.requestingUnit}
                                    onChange={(e) => onFormDataChange(`${field.id}_req_unit`, e.target.value)}
                                    className="border border-slate-300 dark:border-slate-600 dark:bg-[#181c24] dark:text-slate-100 rounded px-2 py-0.5 text-xs font-semibold text-center"
                                  />
                                ) : (
                                  <span className="font-bold">{formData[`${field.id}_req_unit`] || field.requestingUnit}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-600 text-xs">
                            <div className="flex items-center gap-2.5">
                              {logoInfo.mode === 'custom' && logoInfo.logoUrl ? (
                                <div className="rounded-md bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0">
                                  <img
                                    src={logoInfo.logoUrl}
                                    alt={field.companyName || 'لوگوی شرکت'}
                                    style={{ maxHeight: `${logoInfo.sizePx}px` }}
                                    className="max-w-[96px] object-contain"
                                  />
                                </div>
                              ) : logoInfo.mode !== 'none' ? (
                                <div className="w-9 h-9 rounded-md bg-slate-100 dark:bg-[#2c3342] border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[#0067C0] dark:text-[#4cc2ff] font-bold text-sm">
                                  <Building2 className="w-5 h-5" />
                                </div>
                              ) : null}
                              <div>
                                <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                  {field.companyName || 'نام سازمان یا شرکت'}
                                </div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  شناسه ملی: {toPersianDigits(field.nationalId || '۱۰۳۲۰۵۱۴۲۳۰')} · ثبت: {toPersianDigits(field.registrationNumber || '۴۸۲۹۰۱')}
                                </div>
                              </div>
                            </div>
                            <div className="text-left text-[11px] text-slate-600 dark:text-slate-300 font-sans tabular-nums space-y-0.5">
                              <div>تاریخ: {toPersianDigits(formData['f_doc_date'] || formData['f_inv_date'] || '۱۴۰۳/۰۸/۲۰')}</div>
                              <div>شماره: {toPersianDigits(formData['f_doc_no'] || formData['f_inv_serial'] || '۱۰۱/۱۴۰۳')}</div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* FIELD TYPE: DIVIDER */}
                      {field.type === 'divider' && (
                        <div className={field.dividerSpacing === 'small' ? 'py-1' : field.dividerSpacing === 'large' ? 'py-4' : 'py-2'}>
                          <hr
                            className={`border-slate-300 dark:border-slate-600 ${
                              field.dividerStyle === 'dashed'
                                ? 'border-dashed'
                                : field.dividerStyle === 'dotted'
                                ? 'border-dotted'
                                : 'border-solid'
                            }`}
                            style={{ borderWidth: `${field.dividerThickness || 1}px 0 0 0` }}
                          />
                        </div>
                      )}

                      {/* FIELD TYPE: TEXT & NUMBER */}
                      {['text', 'number'].includes(field.type) && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>
                              {field.label}
                              {field.required && <span className="text-red-500 mr-1">*</span>}
                            </span>
                            {field.unitLabel && (
                              <span className="text-[10px] text-slate-400 font-normal">{field.unitLabel}</span>
                            )}
                          </label>
                          {isFillMode ? (
                            <div>
                              <input
                                type={field.type === 'number' ? 'number' : 'text'}
                                min={field.min}
                                max={field.max}
                                step={field.step}
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => onFormDataChange(field.id, e.target.value)}
                                placeholder={field.placeholder || ''}
                                className={`w-full bg-slate-50/60 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#1c212b] focus:border-[#0067C0] dark:focus:border-[#4cc2ff] ${
                                  field.textAlign === 'center' ? 'text-center' : field.textAlign === 'left' ? 'text-left' : 'text-right'
                                }`}
                              />
                              {field.type === 'number' && field.showNumberInWords && formData[field.id] && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                                  به حروف: {numberToPersianWords(Number(formData[field.id]))} {field.unitLabel || ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div
                              className={`h-7 px-2 flex items-center bg-slate-50/70 dark:bg-[#181c24] border border-dashed border-slate-300 dark:border-[#384252] rounded text-xs text-slate-500 dark:text-slate-400 ${
                                field.textAlign === 'center'
                                  ? 'justify-center'
                                  : field.textAlign === 'left'
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              {field.defaultValue || field.placeholder || 'متن ورودی...'}
                              {field.unitLabel && ` (${field.unitLabel})`}
                            </div>
                          )}
                          {field.helperText && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                              {field.helperText}
                            </span>
                          )}
                        </div>
                      )}

                      {/* FIELD TYPE: CURRENCY */}
                      {field.type === 'currency' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>
                              {field.label}
                              {field.required && <span className="text-red-500 mr-1">*</span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-normal">{field.unitLabel || 'ریال'}</span>
                          </label>
                          {isFillMode ? (
                            <div className="relative">
                              <input
                                type="text"
                                value={formData[field.id] ?? field.defaultValue ?? ''}
                                onChange={(e) => {
                                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                                  onFormDataChange(field.id, rawVal);
                                }}
                                placeholder="مبلغ"
                                className={`w-full bg-slate-50/60 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-100 font-mono outline-none focus:bg-white dark:focus:bg-[#1c212b] focus:border-[#0067C0] dark:focus:border-[#4cc2ff] ${
                                  field.textAlign === 'center' ? 'text-center' : field.textAlign === 'left' ? 'text-left' : 'text-right'
                                }`}
                              />
                              {(field.showNumberInWords ?? true) && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                                  معادل: {formatCurrency(formData[field.id] ?? field.defaultValue ?? 0)} {field.unitLabel || 'ریال'}
                                  {formData[field.id] ? ` (${numberToPersianWords(Number(formData[field.id]))} ${field.unitLabel || 'ریال'})` : ''}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="h-7 px-2 flex items-center justify-between bg-slate-50/70 dark:bg-[#181c24] border border-dashed border-slate-300 dark:border-[#384252] rounded text-xs text-slate-500 dark:text-slate-400 font-mono">
                              <span>
                                {formatCurrency(
                                  typeof field.defaultValue === 'number' || typeof field.defaultValue === 'string'
                                    ? field.defaultValue
                                    : 15000000
                                )}{' '}
                                {field.unitLabel || 'ریال'}
                              </span>
                              <Coins className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                          {field.helperText && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                              {field.helperText}
                            </span>
                          )}
                        </div>
                      )}

                      {/* FIELD TYPE: SHAMSI DATE */}
                      {field.type === 'shamsi_date' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {isFillMode ? (
                            <ShamsiDatePicker
                              value={formData[field.id] ?? field.defaultValue ?? ''}
                              onChange={(d) => onFormDataChange(field.id, d)}
                              placeholder="۱۴۰۵/۰۶/۲۵"
                            />
                          ) : (
                            <div className="h-7 px-2 flex items-center justify-between bg-slate-50/70 dark:bg-[#181c24] border border-dashed border-slate-300 dark:border-[#384252] rounded text-xs text-slate-500 dark:text-slate-400 font-mono">
                              <span>
                                {toPersianDigits(
                                  typeof field.defaultValue === 'string' || typeof field.defaultValue === 'number'
                                    ? field.defaultValue
                                    : '۱۴۰۳/۰۸/۲۰'
                                )}
                              </span>
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* FIELD TYPE: TEXTAREA */}
                      {field.type === 'textarea' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {isFillMode ? (
                            <textarea
                              rows={field.rowsCount || 3}
                              value={formData[field.id] ?? field.defaultValue ?? ''}
                              onChange={(e) => onFormDataChange(field.id, e.target.value)}
                              placeholder={field.placeholder || 'توضیحات تکمیلی را بنویسید...'}
                              className={`w-full bg-slate-50/60 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded p-2 text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#1c212b] focus:border-[#0067C0] dark:focus:border-[#4cc2ff] resize-none ${
                                field.textAlign === 'center' ? 'text-center' : field.textAlign === 'left' ? 'text-left' : 'text-right'
                              }`}
                            />
                          ) : (
                            <div
                              style={{ minHeight: `${(field.rowsCount || 3) * 22}px` }}
                              className={`p-2 bg-slate-50/70 dark:bg-[#181c24] border border-dashed border-slate-300 dark:border-[#384252] rounded text-xs text-slate-500 dark:text-slate-400 leading-relaxed ${
                                field.textAlign === 'center' ? 'text-center' : field.textAlign === 'left' ? 'text-left' : 'text-right'
                              }`}
                            >
                              {field.defaultValue || field.placeholder || 'متن چندخطی و توضیحات...'}
                            </div>
                          )}
                          {field.helperText && (
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">
                              {field.helperText}
                            </span>
                          )}
                        </div>
                      )}

                      {/* FIELD TYPE: SELECT */}
                      {field.type === 'select' && (
                        <div className="space-y-1">
                          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            {field.label}
                            {field.required && <span className="text-red-500 mr-1">*</span>}
                          </label>
                          {isFillMode ? (
                            <select
                              value={formData[field.id] ?? field.defaultValue ?? (field.options?.[0] || '')}
                              onChange={(e) => onFormDataChange(field.id, e.target.value)}
                              className="w-full bg-slate-50/60 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded px-2 py-1 text-xs text-slate-900 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#1c212b] focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                            >
                              {(field.options || ['گزینه ۱', 'گزینه ۲']).map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <div className="h-7 px-2 flex items-center justify-between bg-slate-50/70 dark:bg-[#181c24] border border-dashed border-slate-300 dark:border-[#384252] rounded text-xs text-slate-500 dark:text-slate-400">
                              <span>{field.defaultValue || field.options?.[0] || 'انتخاب گزینه...'}</span>
                              <span className="text-[10px] text-slate-400">▼</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* FIELD TYPE: CHECKBOX */}
                      {field.type === 'checkbox' && (
                        <div className="pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              disabled={!isFillMode}
                              checked={!!(formData[field.id] ?? field.defaultValue ?? false)}
                              onChange={(e) => onFormDataChange(field.id, e.target.checked)}
                              className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0 w-4 h-4"
                            />
                            <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                              {field.label}
                            </span>
                          </label>
                        </div>
                      )}

                      {/* FIELD TYPE: TABLE (INVOICE / DISPATCH GRID WITH EXCEL STYLES) */}
                      {field.type === 'table' && (
                        field.tableVariant === 'dispatch' ? (
                          (() => {
                            const columns = field.tableColumns || [
                              { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
                              { id: 'productCode', title: 'کد کالا', width: 'w-28', type: 'text' },
                              { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
                              { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number' },
                              { id: 'unit', title: 'واحد', width: 'w-16', type: 'text' },
                              { id: 'serialNumber', title: 'شماره سریال', width: 'w-36', type: 'text' },
                              { id: 'notes', title: 'توضیحات', width: 'w-44', type: 'text' },
                            ];
                            const resolvedStyle = resolveTableStyle(field);
                            const rowsList = getTableRows(field.id, field.tableInitialRows || 10);

                            return (
                              <>
                                <div
                                  style={getTableWrapperStyle(resolvedStyle)}
                                  className="w-full overflow-hidden text-xs my-0 bg-white"
                                >
                                <table className="w-full text-center border-collapse">
                                  <thead>
                                    <tr>
                                      {columns.map((col, colIdx) => (
                                        <th
                                          key={col.id}
                                          style={getHeaderCellCssStyle(resolvedStyle, col, colIdx, columns.length)}
                                          className={col.widthPercent ? '' : col.width || 'flex-1'}
                                        >
                                          {col.title}
                                        </th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rowsList.map((row, rIdx) => (
                                      <tr key={row.id} className="h-8">
                                        {columns.map((col, colIdx) => {
                                          const cellStyle = getBodyCellCssStyle(
                                            resolvedStyle,
                                            col,
                                            rIdx,
                                            rowsList.length,
                                            colIdx,
                                            columns.length
                                          );

                                          if (col.id === 'rowNumber') {
                                            return (
                                              <td
                                                key={col.id}
                                                style={cellStyle}
                                                className="font-sans tabular-nums"
                                              >
                                                {toPersianDigits(rIdx + 1)}
                                              </td>
                                            );
                                          }
                                          const rawVal = row[col.id] ?? '';
                                          const isNumberCol = col.type === 'number';
                                          const isTextLeftAligned = col.id === 'description' || col.id === 'notes';

                                          return (
                                            <td
                                              key={col.id}
                                              style={cellStyle}
                                            >
                                              {col.id === 'description' ? (
                                                <ProductAutocompleteCell
                                                  value={String(rawVal || '')}
                                                  row={row}
                                                  catalog={productCatalog}
                                                  onChange={(val) =>
                                                    handleTableRowChange(field.id, row.id, 'description', val)
                                                  }
                                                  onSelectSuggestion={(updatedRow) =>
                                                    handleTableRowReplace(field.id, row.id, updatedRow)
                                                  }
                                                  placeholder={col.title}
                                                  isFillMode={isFillMode}
                                                />
                                              ) : isFillMode ? (
                                                <input
                                                  type={isNumberCol ? 'number' : 'text'}
                                                  value={rawVal === 0 && isNumberCol ? '' : rawVal}
                                                  onChange={(e) =>
                                                    handleTableRowChange(
                                                      field.id,
                                                      row.id,
                                                      col.id as keyof TableItemRow,
                                                      isNumberCol ? (e.target.value ? Number(e.target.value) : 0) : e.target.value
                                                    )
                                                  }
                                                  placeholder={col.title}
                                                  style={{ color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                                                  className={`w-full px-1 py-0.5 bg-transparent border-0 outline-none ${
                                                    isTextLeftAligned ? 'text-right' : 'text-center'
                                                  } ${isNumberCol ? 'font-sans tabular-nums' : ''}`}
                                                />
                                              ) : (
                                                <span
                                                  className={isNumberCol ? 'font-sans tabular-nums' : ''}
                                                >
                                                  {isNumberCol && rawVal
                                                    ? toPersianDigits(rawVal)
                                                    : rawVal !== 0 && rawVal !== null && rawVal !== undefined
                                                    ? String(rawVal)
                                                    : ''}
                                                </span>
                                              )}
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Quick Inline Row Adder for fast voucher creation */}
                              {isFillMode && (
                                <div className="flex items-center justify-between pt-1.5 pb-0.5 no-print text-[11px]">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleAddTableRow(field.id)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-[#4cc2ff] font-semibold border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                                    >
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>افزودن ردیف جدید به جدول</span>
                                    </button>
                                    {rowsList.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          handleRemoveTableRow(field.id, rowsList[rowsList.length - 1].id);
                                        }}
                                        className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                                      >
                                        <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                        <span>حذف ردیف آخر</span>
                                      </button>
                                    )}
                                  </div>
                                  <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans tabular-nums">
                                    تعداد ردیف‌ها: {toPersianDigits(rowsList.length)} ردیف
                                  </span>
                                </div>
                              )}
                            </>
                          );
                          })()
                        ) : (
                          <div className="space-y-2 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {field.label}
                              </span>
                              {isFillMode && (
                                <button
                                  onClick={() => handleAddTableRow(field.id)}
                                  className="text-[11px] text-[#0067C0] dark:text-[#4cc2ff] hover:underline flex items-center gap-0.5 no-print"
                                >
                                  <Plus className="w-3 h-3" />
                                  افزودن ردیف
                                </button>
                              )}
                            </div>

                            {/* Table Render with Excel Styles */}
                            {(() => {
                              const columns = field.tableColumns || [
                                { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number', align: 'center' },
                                { id: 'description', title: 'شرح کالا یا خدمات', width: 'flex-1', type: 'text', align: 'right' },
                                { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number', align: 'center' },
                                { id: 'unitPrice', title: 'مبلغ واحد (ریال)', width: 'w-28', type: 'currency', align: 'left' },
                                { id: 'totalPrice', title: 'مبلغ کل (ریال)', width: 'w-32', type: 'currency', align: 'left', isFormula: true },
                              ];
                              const resolvedStyle = resolveTableStyle(field);
                              const rowsList = getTableRows(field.id, field.tableInitialRows || 3);

                              return (
                                <div
                                  style={getTableWrapperStyle(resolvedStyle)}
                                  className="overflow-hidden text-xs rounded bg-white"
                                >
                                  <table className="w-full border-collapse">
                                    <thead>
                                      <tr>
                                        {columns.map((col, colIdx) => (
                                          <th
                                            key={col.id}
                                            style={getHeaderCellCssStyle(resolvedStyle, col, colIdx, columns.length, isFillMode)}
                                            className={col.widthPercent ? '' : col.width || ''}
                                          >
                                            {col.title}
                                          </th>
                                        ))}
                                        {isFillMode && (
                                          <th
                                            style={{
                                              backgroundColor: resolvedStyle.headerBgColor,
                                              borderBottom: getHeaderCellCssStyle(resolvedStyle, columns[0], 0, columns.length, true).borderBottom,
                                            }}
                                            className="p-1 w-8 text-center no-print"
                                          />
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {rowsList.map((row, rIdx) => (
                                        <tr key={row.id}>
                                          {columns.map((col, colIdx) => {
                                            const cellStyle = getBodyCellCssStyle(
                                              resolvedStyle,
                                              col,
                                              rIdx,
                                              rowsList.length,
                                              colIdx,
                                              columns.length,
                                              isFillMode
                                            );

                                            if (col.id === 'rowNumber') {
                                              return (
                                                <td
                                                  key={col.id}
                                                  style={cellStyle}
                                                  className="font-sans tabular-nums"
                                                >
                                                  {toPersianDigits(rIdx + 1)}
                                                </td>
                                              );
                                            }

                                            if (col.id === 'totalPrice' || col.isFormula) {
                                              return (
                                                <td
                                                  key={col.id}
                                                  style={cellStyle}
                                                  className="font-sans tabular-nums font-medium"
                                                >
                                                  {formatCurrency(row.totalPrice || calculateRowTotal(Number(row.quantity || 0), Number(row.unitPrice || 0)))}
                                                </td>
                                              );
                                            }

                                            const rawVal = row[col.id] ?? '';
                                            const isCurrencyCol = col.type === 'currency';
                                            const isNumberCol = col.type === 'number';

                                            return (
                                              <td key={col.id} style={cellStyle}>
                                                {col.id === 'description' ? (
                                                  <ProductAutocompleteCell
                                                    value={String(rawVal || '')}
                                                    row={row}
                                                    catalog={productCatalog}
                                                    onChange={(val) =>
                                                      handleTableRowChange(field.id, row.id, 'description', val)
                                                    }
                                                    onSelectSuggestion={(updatedRow) =>
                                                      handleTableRowReplace(field.id, row.id, updatedRow)
                                                    }
                                                    placeholder={col.title}
                                                    isFillMode={isFillMode}
                                                  />
                                                ) : isFillMode ? (
                                                  <input
                                                    type={isNumberCol ? 'number' : 'text'}
                                                    value={
                                                      isCurrencyCol
                                                        ? rawVal || ''
                                                        : rawVal === 0 && isNumberCol
                                                        ? ''
                                                        : rawVal
                                                    }
                                                    onChange={(e) => {
                                                      const val = isCurrencyCol
                                                        ? e.target.value.replace(/[^0-9]/g, '')
                                                        : isNumberCol
                                                        ? (e.target.value ? Number(e.target.value) : 0)
                                                        : e.target.value;
                                                      handleTableRowChange(field.id, row.id, col.id as keyof TableItemRow, val);
                                                    }}
                                                    placeholder={col.title}
                                                    style={{ color: 'inherit', fontWeight: 'inherit', fontSize: 'inherit' }}
                                                    className={`w-full px-1.5 py-0.5 bg-transparent border-0 outline-none ${
                                                      isCurrencyCol || isNumberCol ? 'font-sans tabular-nums' : ''
                                                    } ${col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right'}`}
                                                  />
                                                ) : (
                                                  <span
                                                    className={`block px-1 ${
                                                      isCurrencyCol || isNumberCol ? 'font-sans tabular-nums' : ''
                                                    } ${col.align === 'center' ? 'text-center' : col.align === 'left' ? 'text-left' : 'text-right'}`}
                                                  >
                                                    {isCurrencyCol
                                                      ? formatCurrency(rawVal || 0)
                                                      : isNumberCol && rawVal
                                                      ? toPersianDigits(rawVal)
                                                      : rawVal !== null && rawVal !== undefined
                                                      ? String(rawVal)
                                                      : ''}
                                                  </span>
                                                )}
                                              </td>
                                            );
                                          })}

                                          {isFillMode && (
                                            <td
                                              style={{
                                                backgroundColor: getBodyCellCssStyle(
                                                  resolvedStyle,
                                                  columns[0],
                                                  rIdx,
                                                  rowsList.length,
                                                  0,
                                                  columns.length,
                                                  true
                                                ).backgroundColor,
                                                borderBottom: getBodyCellCssStyle(
                                                  resolvedStyle,
                                                  columns[0],
                                                  rIdx,
                                                  rowsList.length,
                                                  0,
                                                  columns.length,
                                                  true
                                                ).borderBottom,
                                              }}
                                              className="p-1 text-center no-print"
                                            >
                                              <button
                                                onClick={() => handleRemoveTableRow(field.id, row.id)}
                                                className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
                                                title="حذف ردیف"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            })()}

                              {/* Summary & Totals Calculation Box */}
                              {field.hasTableSummary && (
                                <div
                                  style={{
                                    backgroundColor: resolveTableStyle(field).summaryBgColor,
                                    color: resolveTableStyle(field).summaryTextColor,
                                  }}
                                  className="p-2.5 border-t border-slate-300 dark:border-slate-700"
                                >
                                  {(() => {
                                    const rows = getTableRows(field.id);
                                    const summary = calculateTableSummary(
                                      rows,
                                      field.discountAmount || 0,
                                      field.taxRatePercent ?? 10
                                    );

                                    return (
                                      <div className="space-y-1 text-xs">
                                        <div className="flex justify-between opacity-85">
                                          <span>جمع کل اقلام:</span>
                                          <span className="font-sans tabular-nums font-medium">{formatCurrency(summary.subtotal)} ریال</span>
                                        </div>
                                        {(field.discountAmount || 0) > 0 && (
                                          <div className="flex justify-between text-emerald-700">
                                            <span>تخفیف اعطایی:</span>
                                            <span className="font-sans tabular-nums">({formatCurrency(summary.discountAmount)}) ریال</span>
                                          </div>
                                        )}
                                        {(field.taxRatePercent ?? 10) > 0 && (
                                          <div className="flex justify-between opacity-85">
                                            <span>مالیات بر ارزش افزوده ({toPersianDigits(field.taxRatePercent ?? 10)}٪):</span>
                                            <span className="font-sans tabular-nums font-medium">{formatCurrency(summary.taxAmount)} ریال</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between font-bold pt-1.5 border-t border-slate-300 text-sm">
                                          <span>مبلغ قابل پرداخت نهایی:</span>
                                          <span className="font-sans tabular-nums text-[#0067C0]">{formatCurrency(summary.grandTotal)} ریال</span>
                                        </div>
                                        <div className="text-[11px] opacity-80 pt-0.5">
                                          به حروف: <span className="font-semibold">{numberToPersianWords(summary.grandTotal)}</span>
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              )}
                            </div>
                        )
                      )}

                      {/* FIELD TYPE: SIGNATURE PAD */}
                      {field.type === 'signature' && (
                        field.signatureLabels ? (
                          (() => {
                            const sigCount = field.signatureLabels.length;
                            const gridColClass =
                              sigCount === 2
                                ? 'grid-cols-2'
                                : sigCount === 3
                                ? 'grid-cols-3'
                                : sigCount === 4
                                ? 'grid-cols-4'
                                : 'grid-cols-5';

                            return (
                              <div className="w-full border-2 border-slate-900 dark:border-slate-400 text-xs my-0">
                                <div className={`grid ${gridColClass} divide-x-2 divide-x-reverse divide-slate-900 dark:divide-slate-400 border-b-2 border-slate-900 dark:border-slate-400 bg-white dark:bg-[#222731] text-slate-900 dark:text-slate-100 font-bold text-center text-xs`}>
                                  {field.signatureLabels.map((lbl, sIdx) => (
                                    <div key={sIdx} className="py-2 px-2 text-center font-bold">
                                      {lbl}
                                    </div>
                                  ))}
                                </div>
                                <div className={`grid ${gridColClass} divide-x-2 divide-x-reverse divide-slate-900 dark:divide-slate-400 h-28 bg-white dark:bg-[#1a1e26]`}>
                                  {field.signatureLabels.map((lbl, sIdx) => {
                                    const sigKey = `${field.id}_sig_${sIdx}`;
                                    const sigData = signatureData[sigKey];

                                    return (
                                      <div
                                        key={sIdx}
                                        className="relative flex flex-col items-center justify-center p-2 text-center group hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                      >
                                        {sigData ? (
                                          <div className="w-full h-full flex items-center justify-center relative">
                                            <img
                                              src={sigData}
                                              alt={lbl}
                                              className="max-h-full max-w-full object-contain"
                                            />
                                            {isFillMode && (
                                              <button
                                                onClick={() => setActiveSigningFieldId(sigKey)}
                                                className="absolute bottom-1 text-[9px] bg-white/90 dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-200 no-print shadow-xs"
                                              >
                                                تغییر
                                              </button>
                                            )}
                                          </div>
                                        ) : isFillMode ? (
                                          <button
                                            onClick={() => setActiveSigningFieldId(sigKey)}
                                            className="text-slate-400 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] text-[10px] flex flex-col items-center gap-1 no-print"
                                          >
                                            <PenTool className="w-4 h-4 opacity-70" />
                                            <span>محل امضا</span>
                                          </button>
                                        ) : (
                                          <div className="text-[10px] text-slate-300 dark:text-slate-500 pointer-events-none">
                                            محل مهر و امضا
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="space-y-1">
                            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                              {field.label}
                            </label>
                            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded h-24 bg-slate-50/50 dark:bg-[#181c24] flex flex-col items-center justify-center relative overflow-hidden group">
                              {signatureData[field.id] ? (
                                <div className="w-full h-full p-2 flex items-center justify-center relative">
                                  <img
                                    src={signatureData[field.id]}
                                    alt="امضای ثبت‌شده"
                                    className="max-h-full max-w-full object-contain"
                                  />
                                  {isFillMode && (
                                    <button
                                      onClick={() => setActiveSigningFieldId(field.id)}
                                      className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-white/90 dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 text-[10px] text-slate-700 dark:text-slate-200 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] shadow-xs no-print"
                                    >
                                      تغییر امضا
                                    </button>
                                  )}
                                </div>
                              ) : isFillMode ? (
                                <button
                                  onClick={() => setActiveSigningFieldId(field.id)}
                                  className="flex flex-col items-center gap-1 text-slate-500 dark:text-slate-400 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] transition-colors p-2"
                                >
                                  <PenTool className="w-5 h-5 text-slate-400" />
                                  <span className="text-[11px] font-medium">کلیک برای رسم امضا با قلم یا ماوس</span>
                                </button>
                              ) : (
                                <div className="text-center text-slate-400 dark:text-slate-500 text-xs">
                                  <PenTool className="w-4 h-4 mx-auto mb-0.5 opacity-60" />
                                  <span>محل درج مهر و امضا</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      )}

                      {/* FIELD TYPE: QR CODE */}
                      {field.type === 'qrcode' && (
                        <div className="flex items-center gap-3 p-1">
                          <div
                            className={`border border-slate-300 dark:border-slate-600 rounded bg-white p-1 flex items-center justify-center shrink-0 ${
                              field.qrSize === 'small' ? 'w-16 h-16' : field.qrSize === 'large' ? 'w-28 h-28' : 'w-20 h-20'
                            }`}
                          >
                            {/* SVG Simulated QR Pattern */}
                            <svg viewBox="0 0 100 100" className="w-full h-full text-slate-900 fill-current">
                              {/* Position Detection Markers */}
                              <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                              <rect x="13" y="13" width="12" height="12" />
                              <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                              <rect x="75" y="13" width="12" height="12" />
                              <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" />
                              <rect x="13" y="75" width="12" height="12" />
                              {/* Data Matrix Dots */}
                              <rect x="40" y="10" width="6" height="6" />
                              <rect x="50" y="10" width="6" height="6" />
                              <rect x="40" y="24" width="6" height="6" />
                              <rect x="52" y="24" width="6" height="6" />
                              <rect x="10" y="42" width="6" height="6" />
                              <rect x="24" y="42" width="6" height="6" />
                              <rect x="40" y="42" width="20" height="6" />
                              <rect x="68" y="42" width="6" height="6" />
                              <rect x="80" y="42" width="10" height="6" />
                              <rect x="40" y="55" width="8" height="8" />
                              <rect x="56" y="55" width="8" height="8" />
                              <rect x="70" y="55" width="12" height="6" />
                              <rect x="42" y="70" width="12" height="6" />
                              <rect x="65" y="70" width="6" height="15" />
                              <rect x="78" y="70" width="15" height="6" />
                              <rect x="42" y="82" width="16" height="6" />
                              <rect x="80" y="82" width="8" height="8" />
                            </svg>
                          </div>
                          <div className="space-y-0.5 text-xs min-w-0 flex-1">
                            <span className="font-bold text-slate-800 dark:text-slate-100 block truncate">{field.label}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate max-w-[150px]">
                              {field.qrContent || 'https://verify.winform.local'}
                            </span>
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block truncate">
                              {field.qrCaption || '✓ قابل استعلام با بارکدخوان'}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Bottom Official Footer */}
          {!template.fields.some((f) => f.headerType === 'dispatch_voucher') && (
            <div className="pt-6 border-t border-slate-300 dark:border-slate-700 mt-6 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <div>
                صفحه ۱ از ۱ · سند معتبر سازمانی · ثبت شده در سیستم محلی فرم‌نگار ویندوز
              </div>
              <div className="font-mono">
                نسخه دیجیتال · {toPersianDigits(getTodayDateString())}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>

        {/* Signature Pad Modal */}
        {activeSigningFieldId && (
          <SignaturePadModal
            isOpen={true}
            onClose={() => setActiveSigningFieldId(null)}
            onSave={(dataUrl) => {
              onSignatureDataChange(activeSigningFieldId, dataUrl);
              setActiveSigningFieldId(null);
            }}
            initialDataUrl={signatureData[activeSigningFieldId]}
          />
        )}
      </div>

      {/* Floating Liquid Glass Zoom Controls */}
      {onZoomChange && (
        <div
          dir="rtl"
          className="no-print absolute bottom-3 left-3 z-20 liquid-glass-elevated rounded-2xl p-1 flex items-center gap-1 text-xs shadow-lg"
        >
          <button
            type="button"
            onClick={() => onZoomChange(Math.min(1.5, Number((zoomScale + 0.1).toFixed(2))))}
            aria-label="بزرگ‌نمایی"
            title="بزرگ‌نمایی"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(1)}
            title="بازگشت به اندازه ۱۰۰٪"
            className="px-2 h-8 rounded-xl font-sans tabular-nums font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            {toPersianDigits(Math.round(zoomScale * 100))}٪
          </button>
          <button
            type="button"
            onClick={() => onZoomChange(Math.max(0.5, Number((zoomScale - 0.1).toFixed(2))))}
            aria-label="کوچک‌نمایی"
            title="کوچک‌نمایی"
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {zoomScale !== 1 && (
            <button
              type="button"
              onClick={() => onZoomChange(1)}
              aria-label="بازنشانی بزرگ‌نمایی"
              title="بازنشانی"
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sky-700 dark:text-sky-300 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

function getTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian').format(new Date());
  } catch {
    return '۱۴۰۳/۰۸/۲۰';
  }
}

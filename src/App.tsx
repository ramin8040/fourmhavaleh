import React, { useState, useEffect, useCallback } from 'react';
import { 
  FormTemplate, 
  FormField, 
  FieldType, 
  FormRecord, 
  PaperSize, 
  PageOrientation, 
  PrintSettings,
  TableItemRow 
} from './types/form';
import { 
  loadAllTemplates, 
  saveAllTemplates, 
  saveTemplate, 
  deleteTemplate,
  resetAllTemplatesToDefaults,
  loadAllRecords, 
  saveRecord, 
  deleteRecord, 
  exportFullBackup, 
  importFullBackup,
  saveFormSessionDraft,
  loadFormSessionDraft,
  clearFormSessionDraft,
  BLANK_FORM_TEMPLATE,
  PRESET_TEMPLATES 
} from './utils/storage';
import { 
  generateRecordNumber, 
  generateCsvExport, 
  getTodayShamsiString,
  toPersianDigits
} from './utils/formLogic';
import { 
  ThemeMode, 
  getSavedThemeMode, 
  saveThemeMode, 
  resolveIsDark, 
  applyThemeToDocument 
} from './utils/theme';
import { TitleBar } from './components/TitleBar';
import { RibbonTab } from './components/RibbonBar';
import { AppVerticalSidebar } from './components/AppVerticalSidebar';
import { CanvasTopBar } from './components/CanvasTopBar';
import { ElementToolbox } from './components/ElementToolbox';
import { PropertyInspector } from './components/PropertyInspector';
import { FormCanvas } from './components/FormCanvas';
import { RecordsManager } from './components/RecordsManager';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { TemplatesModal } from './components/TemplatesModal';
import { ImageToFormModal } from './components/ImageToFormModal';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { OfficialPrintDocument } from './components/OfficialPrintDocument';
import { DocumentIssueWizard } from './components/DocumentIssueWizard';
import { WizardStep, initializeWizardDataForTemplate } from './utils/wizardLogic';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  // Theme Mode (Windows 11 Fluent Dark / Light / System)
  const [themeMode, setThemeMode] = useState<ThemeMode>(getSavedThemeMode);
  const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(getSavedThemeMode()));

  // Primary application state
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<FormTemplate>(BLANK_FORM_TEMPLATE);
  const [records, setRecords] = useState<FormRecord[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<RibbonTab>('wizard');
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [isFillMode, setIsFillMode] = useState<boolean>(true);
  const [zoomScale, setZoomScale] = useState<number>(1.0);

  // Form filling values state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [tableData, setTableData] = useState<Record<string, TableItemRow[]>>({});
  const [signatureData, setSignatureData] = useState<Record<string, string>>({});
  const [currentRecordId, setCurrentRecordId] = useState<string | null>(null);

  // Auto-Save state (10s session storage)
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);

  // Modals & Feedback
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileDesignPanel, setMobileDesignPanel] = useState<'none' | 'toolbox' | 'inspector'>('none');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isImageToFormModalOpen, setIsImageToFormModalOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [activePrintSettings, setActivePrintSettings] = useState<PrintSettings | undefined>(undefined);
  const [lastSavedText, setLastSavedText] = useState('ذخیره‌شده');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync and listen to theme mode changes (System / Light / Dark)
  useEffect(() => {
    saveThemeMode(themeMode);
    const dark = resolveIsDark(themeMode);
    setIsDark(dark);
    applyThemeToDocument(dark);

    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        setIsDark(e.matches);
        applyThemeToDocument(e.matches);
      };
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [themeMode]);

  const handleThemeChange = (newMode: ThemeMode) => {
    setThemeMode(newMode);
    const dark = resolveIsDark(newMode);
    setIsDark(dark);
    applyThemeToDocument(dark);
    showToast(
      newMode === 'system'
        ? 'نمای صفحه هماهنگ با دستگاه شد'
        : newMode === 'dark'
        ? 'نمای شب فعال شد'
        : 'نمای روشن فعال شد'
    );
  };

  // Load initial templates, records, and restore draft from sessionStorage
  useEffect(() => {
    const loadedTemplates = loadAllTemplates();
    setTemplates(loadedTemplates);
    const loadedRecords = loadAllRecords();
    setRecords(loadedRecords);

    const isAutostart =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('autostart') === '1';

    // Check for existing auto-saved draft from sessionStorage
    const draft = loadFormSessionDraft();
    if (!isAutostart && draft && draft.templateId) {
      const draftTpl = loadedTemplates.find((t) => t.id === draft.templateId);
      if (draftTpl) {
        setActiveTemplate(draftTpl);
        setFormData(draft.formData || {});
        setTableData(draft.tableData || {});
        setSignatureData(draft.signatureData || {});
        setCurrentRecordId(draft.currentRecordId || null);
        setIsFillMode(true);
        setActiveTab('wizard');
        setWizardStep(2);
        if (draft.savedAt) {
          const time = new Date(draft.savedAt).toLocaleTimeString('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastAutoSavedTime(time);
        }
        showToast('پیش‌نویس ذخیره‌شده فرم از نشست قبلی بازیابی شد.');
        return;
      }
    }

    // Default to the official dispatch voucher template in Wizard mode
    const dispatchVoucher =
      loadedTemplates.find((t) => t.id === 'preset_dispatch_voucher') ||
      loadedTemplates.find((t) => t.id === 'blank-form-default') ||
      loadedTemplates[0];
    if (dispatchVoucher) {
      const init = initializeWizardDataForTemplate(dispatchVoucher);
      setActiveTemplate(dispatchVoucher);
      setFormData(init.formData);
      setTableData(init.tableData);
      setSignatureData(init.signatureData);
      setIsFillMode(true);
      setActiveTab('wizard');
      setWizardStep(isAutostart ? 2 : 1);
    }
  }, []);

  // Save template whenever it changes
  const handleSaveActiveTemplate = useCallback(() => {
    saveTemplate(activeTemplate);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    setLastSavedText('همین الان ذخیره شد');
    showToast('فرم با موفقیت در دیتابیس محلی ذخیره شد.');
  }, [activeTemplate]);

  // Auto-Save Effect: saves active form inputs to sessionStorage every 10 seconds
  useEffect(() => {
    const performAutoSave = () => {
      // Check if there is active data entered in the form
      const hasFormData = Object.values(formData).some((v) => v !== '' && v !== null && v !== undefined);
      const hasTableData = Object.values(tableData).some(
        (rows) => Array.isArray(rows) && rows.some((r) => r.description || r.productCode || (r.quantity && r.quantity > 0))
      );
      const hasSignatures = Object.values(signatureData).some((sig) => !!sig);

      if (hasFormData || hasTableData || hasSignatures) {
        setIsAutoSaving(true);
        const now = new Date();
        const timeStr = now.toLocaleTimeString('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

        saveFormSessionDraft({
          templateId: activeTemplate.id,
          formData,
          tableData,
          signatureData,
          currentRecordId,
          savedAt: now.toISOString(),
        });

        setLastAutoSavedTime(timeStr);
        setTimeout(() => setIsAutoSaving(false), 700);
      }
    };

    const timer = setInterval(performAutoSave, 10000); // 10 seconds

    const handleBeforeUnload = () => {
      performAutoSave();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeTemplate.id, formData, tableData, signatureData, currentRecordId]);

  // Template Management Handlers
  const handleSelectTemplate = (tpl: FormTemplate, mode: 'fill' | 'design' = 'fill') => {
    setActiveTemplate(tpl);
    setSelectedFieldId(null);
    setFormData({});
    setTableData({});
    setSignatureData({});
    setCurrentRecordId(null);
    clearFormSessionDraft();
    setLastAutoSavedTime(null);
    if (mode === 'fill') {
      setIsFillMode(true);
      setActiveTab('fill');
    } else {
      setIsFillMode(false);
      setActiveTab('design');
    }
    showToast(`قالب «${tpl.title}» بارگذاری شد.`);
  };

  const handleUpdateTemplate = (updated: FormTemplate) => {
    saveTemplate(updated);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    if (updated.id === activeTemplate.id) {
      setActiveTemplate(updated);
    }
    showToast(`مشخصات قالب «${updated.title}» با موفقیت بروزرسانی شد.`);
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteTemplate(templateId);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    if (activeTemplate.id === templateId) {
      const fallback = refreshed[0] || BLANK_FORM_TEMPLATE;
      setActiveTemplate(fallback);
      setSelectedFieldId(null);
    }
    showToast('قالب با موفقیت حذف گردید.');
  };

  const handleDuplicateTemplate = (tpl: FormTemplate) => {
    const cloned: FormTemplate = {
      ...tpl,
      id: `custom_tpl_${Date.now()}`,
      title: `کپی از ${tpl.title}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(cloned);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    setActiveTemplate(cloned);
    showToast(`نسخه کپی از قالب با عنوان «${cloned.title}» ایجاد شد.`);
  };

  const handleCreateNewTemplate = () => {
    const newTpl: FormTemplate = {
      ...BLANK_FORM_TEMPLATE,
      id: `custom_blank_${Date.now()}`,
      title: `فرم سفارشی جدید ${toPersianDigits(templates.length + 1)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveTemplate(newTpl);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    setActiveTemplate(newTpl);
    setIsFillMode(false);
    setActiveTab('design');
    setSelectedFieldId(null);
    showToast('بوم سفید جدید برای طراحی ایجاد شد.');
  };

  const handleTemplateExtractedFromImage = (newTemplate: FormTemplate, openInFill: boolean) => {
    saveTemplate(newTemplate);
    const refreshed = loadAllTemplates();
    setTemplates(refreshed);
    setActiveTemplate(newTemplate);
    setSelectedFieldId(null);

    // Initialize table data if present
    const tableField = newTemplate.fields.find((f) => f.type === 'table');
    if (tableField && tableField.tableInitialData && tableField.tableInitialData.length > 0) {
      setTableData({ [tableField.id]: tableField.tableInitialData });
    } else {
      setTableData({});
    }

    // Initialize header fields if any
    const headerField = newTemplate.fields.find((f) => f.type === 'header_banner');
    const initialFormData: Record<string, any> = {};
    if (headerField) {
      if (headerField.documentNumber) initialFormData['f_doc_no'] = headerField.documentNumber;
      if (headerField.headerDate) initialFormData['f_doc_date'] = headerField.headerDate;
      if (headerField.requestingUnit) initialFormData['f_req_unit'] = headerField.requestingUnit;
    }
    setFormData(initialFormData);
    setSignatureData({});
    setCurrentRecordId(null);
    clearFormSessionDraft();
    setLastAutoSavedTime(null);

    if (openInFill) {
      setIsFillMode(true);
      setActiveTab('fill');
    } else {
      setIsFillMode(false);
      setActiveTab('design');
    }

    showToast(`قالب «${newTemplate.title}» از تصویر استخراج و فعال شد.`);
  };

  const handleResetDefaults = () => {
    const defaults = resetAllTemplatesToDefaults();
    setTemplates(defaults);
    setActiveTemplate(defaults[0] || BLANK_FORM_TEMPLATE);
    showToast('تمام قالب‌های رسمی به حالت اولیه کارخانه بازنشانی شدند.');
  };

  const handleDeleteActiveTemplate = () => {
    if (templates.length <= 1) {
      showToast('حداقل یک قالب باید در سیستم باقی بماند.');
      return;
    }
    if (confirm(`آیا از حذف قالب جاری «${activeTemplate.title}» اطمینان دارید؟`)) {
      handleDeleteTemplate(activeTemplate.id);
    }
  };

  const handleDuplicateActiveTemplate = () => {
    handleDuplicateTemplate(activeTemplate);
  };


  // Keyboard shortcuts (Ctrl+S, Ctrl+P, Ctrl+N, Ctrl+B, Ctrl+T, Ctrl+I, Ctrl+M, F1, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 or Shift + ? -> Open Keyboard Shortcuts Guide
      if (e.key === 'F1' || (e.shiftKey && (e.key === '?' || e.key === '؟'))) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        if (key === 's') {
          e.preventDefault();
          handleSaveActiveTemplate();
        } else if (key === 'p') {
          e.preventDefault();
          setIsPrintModalOpen(true);
        } else if (key === 'n') {
          e.preventDefault();
          handleResetToBlank();
        } else if (key === 'b') {
          e.preventDefault();
          setActiveTab((prev) => (prev === 'database' ? 'fill' : 'database'));
        } else if (key === 't') {
          e.preventDefault();
          setIsTemplatesModalOpen(true);
        } else if (key === 'i') {
          e.preventDefault();
          setIsImageToFormModalOpen(true);
        } else if (key === 'm') {
          e.preventDefault();
          setIsFillMode((prev) => !prev);
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          setZoomScale((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10));
        } else if (e.key === '-') {
          e.preventDefault();
          setZoomScale((z) => Math.max(0.6, Math.round((z - 0.1) * 10) / 10));
        } else if (e.key === '0') {
          e.preventDefault();
          setZoomScale(1.0);
        }
      } else if (e.key === 'Escape') {
        setSelectedFieldId(null);
        setIsMobileMenuOpen(false);
        setMobileDesignPanel('none');
        setIsPrintModalOpen(false);
        setIsTemplatesModalOpen(false);
        setIsImageToFormModalOpen(false);
        setIsShortcutsModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveActiveTemplate]);

  // FIELD MANAGEMENT ACTIONS
  const handleAddField = (type: FieldType) => {
    const newId = `field_${Date.now()}`;
    let newField: FormField = {
      id: newId,
      type,
      label: 'عنوان فیلد جدید',
      width: '100%',
      boxed: true,
    };

    switch (type) {
      case 'text':
        newField.label = 'متن ورودی';
        newField.placeholder = 'لطفاً وارد نمایید...';
        newField.width = '50%';
        break;
      case 'textarea':
        newField.label = 'شرح و توضیحات تکمیلی';
        newField.placeholder = 'توضیحات...';
        newField.width = '100%';
        break;
      case 'currency':
        newField.label = 'مبلغ (ریال)';
        newField.width = '50%';
        newField.defaultValue = 1000000;
        break;
      case 'number':
        newField.label = 'تعداد / شماره';
        newField.width = '33%';
        newField.defaultValue = 1;
        break;
      case 'shamsi_date':
        newField.label = 'تاریخ سند';
        newField.width = '33%';
        newField.defaultValue = getTodayShamsiString();
        break;
      case 'select':
        newField.label = 'انتخاب دسته‌بندی';
        newField.width = '50%';
        newField.options = ['گزینه اول', 'گزینه دوم', 'گزینه سوم'];
        newField.defaultValue = 'گزینه اول';
        break;
      case 'checkbox':
        newField.label = 'شرایط و مقررات مندرج در این سند مورد تأیید است.';
        newField.width = '100%';
        newField.defaultValue = false;
        break;
      case 'table':
        newField.label = 'جدول مشخصات و اقلام';
        newField.width = '100%';
        newField.hasTableSummary = true;
        newField.taxRatePercent = 10;
        newField.tableInitialRows = 3;
        newField.tableColumns = [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number', align: 'center' },
          { id: 'description', title: 'شرح کالا یا خدمات', width: 'flex-1', type: 'text', align: 'right' },
          { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number', align: 'center' },
          { id: 'unitPrice', title: 'مبلغ واحد (ریال)', width: 'w-28', type: 'currency', align: 'left' },
          { id: 'totalPrice', title: 'مبلغ کل (ریال)', width: 'w-32', type: 'currency', align: 'left', isFormula: true },
        ];
        break;
      case 'signature':
        newField.label = 'مهر و امضای متقاضی';
        newField.width = '50%';
        break;
      case 'qrcode':
        newField.label = 'کد اصالت و پیگیری QR';
        newField.qrContent = 'https://winform.local/verify';
        newField.width = '33%';
        break;
      case 'header_banner':
        newField.label = 'سربرگ اداری';
        newField.companyName = 'شرکت تولیدی و صنعتی البرز';
        newField.registrationNumber = '۵۹۰۴۱۲';
        newField.nationalId = '۱۰۴۲۰۰۹۸۱۵۰';
        newField.width = '100%';
        break;
      case 'divider':
        newField.label = 'خط تفکیک‌کننده';
        newField.width = '100%';
        break;
    }

    const updatedFields = [...activeTemplate.fields, newField];
    const updatedTemplate = { ...activeTemplate, fields: updatedFields };
    setActiveTemplate(updatedTemplate);
    setSelectedFieldId(newId);
    saveTemplate(updatedTemplate);
  };

  const handleUpdateField = (updatedField: FormField) => {
    const updatedFields = activeTemplate.fields.map((f) =>
      f.id === updatedField.id ? updatedField : f
    );
    const updatedTemplate = { ...activeTemplate, fields: updatedFields };
    setActiveTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  const handleDeleteField = (fieldId: string) => {
    const updatedFields = activeTemplate.fields.filter((f) => f.id !== fieldId);
    const updatedTemplate = { ...activeTemplate, fields: updatedFields };
    setActiveTemplate(updatedTemplate);
    if (selectedFieldId === fieldId) {
      setSelectedFieldId(null);
    }
    saveTemplate(updatedTemplate);
  };

  const handleDuplicateField = (field: FormField) => {
    const newField: FormField = {
      ...field,
      id: `field_${Date.now()}`,
      label: `${field.label} (کپی)`,
    };
    const idx = activeTemplate.fields.findIndex((f) => f.id === field.id);
    const updatedFields = [...activeTemplate.fields];
    updatedFields.splice(idx + 1, 0, newField);
    const updatedTemplate = { ...activeTemplate, fields: updatedFields };
    setActiveTemplate(updatedTemplate);
    setSelectedFieldId(newField.id);
    saveTemplate(updatedTemplate);
  };

  const handleMoveField = (fieldId: string, direction: 'up' | 'down') => {
    const idx = activeTemplate.fields.findIndex((f) => f.id === fieldId);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= activeTemplate.fields.length) return;

    const updatedFields = [...activeTemplate.fields];
    const [moved] = updatedFields.splice(idx, 1);
    updatedFields.splice(targetIdx, 0, moved);
    const updatedTemplate = { ...activeTemplate, fields: updatedFields };
    setActiveTemplate(updatedTemplate);
    saveTemplate(updatedTemplate);
  };

  // Reset Canvas to blank
  const handleResetToBlank = () => {
    if (confirm('آیا از بازنشانی بوم به صفحه سفید اطمینان دارید؟ تمام فیلدهای فعلی پاک خواهند شد.')) {
      const blank: FormTemplate = {
        ...BLANK_FORM_TEMPLATE,
        id: `form_${Date.now()}`,
        title: 'فرم جدید (بوم سفید)',
        fields: [],
      };
      setActiveTemplate(blank);
      setSelectedFieldId(null);
      setFormData({});
      setTableData({});
      setSignatureData({});
      setCurrentRecordId(null);
      clearFormSessionDraft();
      setLastAutoSavedTime(null);
      saveTemplate(blank);
      showToast('بوم سفید آماده طراحی شد.');
    }
  };

  // RECORD MANAGEMENT (SUBMISSIONS)
  const handleSaveRecord = (): FormRecord => {
    const recordIndex = records.length + 1;
    const prefix = activeTemplate.title.includes('فاکتور') ? 'INV' : 'DOC';
    const recNumber = currentRecordId
      ? records.find((r) => r.id === currentRecordId)?.recordNumber || generateRecordNumber(recordIndex, prefix)
      : generateRecordNumber(recordIndex, prefix);

    const existingRec = currentRecordId ? records.find((r) => r.id === currentRecordId) : null;
    const newRecord: FormRecord = {
      id: currentRecordId || `rec_${Date.now()}`,
      formId: activeTemplate.id,
      recordNumber: recNumber,
      createdAt: existingRec?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      data: { ...formData },
      tableData: { ...tableData },
      signatureData: { ...signatureData },
      status: 'finalized',
    };

    saveRecord(newRecord);
    clearFormSessionDraft();
    setLastAutoSavedTime(null);
    setRecords(loadAllRecords());
    setCurrentRecordId(newRecord.id);
    showToast(`رکورد ${recNumber} با موفقیت در دیتابیس ثبت شد.`);
    return newRecord;
  };

  const handleSelectWizardTemplate = (tpl: FormTemplate) => {
    const hasExistingData =
      Object.keys(formData).length > 0 ||
      Object.keys(tableData).length > 0 ||
      Object.keys(signatureData).length > 0;
    if (tpl.id !== activeTemplate.id || !hasExistingData) {
      const init = initializeWizardDataForTemplate(tpl);
      setActiveTemplate(tpl);
      setFormData(init.formData);
      setTableData(init.tableData);
      setSignatureData(init.signatureData);
      setCurrentRecordId(null);
      clearFormSessionDraft();
      setLastAutoSavedTime(null);
    } else {
      setActiveTemplate(tpl);
    }
    setSelectedFieldId(null);
    setIsFillMode(true);
  };

  const handleStartNewWizard = () => {
    const init = initializeWizardDataForTemplate(activeTemplate);
    setFormData(init.formData);
    setTableData(init.tableData);
    setSignatureData(init.signatureData);
    setCurrentRecordId(null);
    clearFormSessionDraft();
    setLastAutoSavedTime(null);
    setIsFillMode(true);
    setActiveTab('wizard');
    setWizardStep(1);
    showToast('ویزارد صدور سند جدید آماده شد.');
  };

  const handleLoadRecord = (record: FormRecord) => {
    // Find matching template
    const matchedTemplate = templates.find((t) => t.id === record.formId) || activeTemplate;
    setActiveTemplate(matchedTemplate);
    setFormData(record.data || {});
    setTableData(record.tableData || {});
    setSignatureData(record.signatureData || {});
    setCurrentRecordId(record.id);
    clearFormSessionDraft();
    setLastAutoSavedTime(null);
    setIsFillMode(true);
    setActiveTab('fill');
    showToast(`رکورد ${record.recordNumber} بارگذاری شد.`);
  };

  const handleDeleteRecord = (recordId: string) => {
    deleteRecord(recordId);
    setRecords(loadAllRecords());
    if (currentRecordId === recordId) {
      setCurrentRecordId(null);
    }
    showToast('رکورد با موفقیت حذف شد.');
  };

  const handleDirectPrint = (record?: FormRecord) => {
    if (record) {
      handleLoadRecord(record);
    }
    setActivePrintSettings({
      paperSize: activeTemplate.paperSize,
      orientation: activeTemplate.orientation,
      showWatermark: activeTemplate.showWatermark ?? false,
      watermarkText: activeTemplate.watermarkText || 'محرمانه',
      highContrastMode: false,
      showPageNumbers: true,
      printMode: 'filled',
      scale: 1,
    });
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintRecord = (record: FormRecord) => {
    handleLoadRecord(record);
    setActivePrintSettings({
      paperSize: activeTemplate.paperSize,
      orientation: activeTemplate.orientation,
      showWatermark: activeTemplate.showWatermark ?? false,
      watermarkText: activeTemplate.watermarkText || 'محرمانه',
      highContrastMode: false,
      showPageNumbers: true,
      printMode: 'filled',
      scale: 1,
    });
    setIsPrintModalOpen(true);
  };

  const handleNewRecord = () => {
    handleStartNewWizard();
  };

  // EXPORT / BACKUP HANDLERS
  const handleExportCsv = () => {
    if (records.length === 0) {
      alert('هیچ رکوردی برای خروجی اکسل یافت نشد.');
      return;
    }
    // Collect all field headers
    const fieldHeaders = activeTemplate.fields
      .filter((f) => f.type !== 'divider' && f.type !== 'header_banner')
      .map((f) => ({ id: f.id, label: f.label }));

    const csvContent = generateCsvExport(fieldHeaders, records);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WinForm_Export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('فایل اکسل با موفقیت دانلود شد.');
  };

  const handleExportBackup = () => {
    const backupJson = exportFullBackup();
    const blob = new Blob([backupJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WinForm_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('نسخه کامل پشتیبان دانلود شد.');
  };

  const handleImportBackupFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = importFullBackup(content);
      if (res.success) {
        setTemplates(loadAllTemplates());
        setRecords(loadAllRecords());
        showToast(`دیتابیس با موفقیت بازیابی شد (${res.recordsCount} رکورد).`);
      } else {
        alert(res.error || 'خطا در بازیابی نسخه پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  const selectedField = activeTemplate.fields.find((f) => f.id === selectedFieldId) || null;

  return (
    <>
      <div id="app-root-container" className="h-dvh w-full flex flex-col liquid-bg-mesh overflow-hidden text-slate-900 dark:text-slate-100 select-none transition-colors" dir="rtl">
        {/* Top Liquid Glass Navigation Bar */}
      <TitleBar
        documentTitle={activeTemplate.title}
        onTitleChange={(newTitle) => {
          const updated = { ...activeTemplate, title: newTitle };
          setActiveTemplate(updated);
          saveTemplate(updated);
        }}
        onSave={handleSaveActiveTemplate}
        onPrint={() => setIsPrintModalOpen(true)}
        recordsCount={records.length}
        lastSavedText={lastSavedText}
        themeMode={themeMode}
        onThemeChange={handleThemeChange}
        isDark={isDark}
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'wizard') setIsFillMode(true);
          setMobileDesignPanel('none');
        }}
        onOpenImageToForm={() => setIsImageToFormModalOpen(true)}
      />

      {/* Main Layout Container: Vertical Sidebar (Right in RTL) + Main Workspace (Left) */}
      <div className="flex-1 flex overflow-hidden relative min-w-0">
        {/* Vertical Sidebar Navigation (منوی عمودی از بغل با استایل مدرن و رنگ‌های زنده) */}
        <AppVerticalSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setMobileDesignPanel('none');
          }}
          isFillMode={isFillMode}
          onToggleFillMode={(fillMode) => {
            setIsFillMode(fillMode);
            if (fillMode) {
              setSelectedFieldId(null);
              setMobileDesignPanel('none');
            }
          }}
          templates={templates}
          activeTemplateId={activeTemplate.id}
          onSelectTemplate={(tpl) => {
            handleSelectWizardTemplate(tpl);
            if (activeTab === 'wizard') {
              setWizardStep(2);
            } else {
              setActiveTab('fill');
            }
            showToast(`سند «${tpl.title}» بارگذاری شد.`);
          }}
          onSaveRecord={handleSaveRecord}
          onQuickPrint={() => handleDirectPrint()}
          onPreviewPrint={() => setIsPrintModalOpen(true)}
          onNewVoucher={handleNewRecord}
          onResetCanvas={handleResetToBlank}
          onExportCsv={handleExportCsv}
          onExportBackup={handleExportBackup}
          onImportBackup={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = (e: any) => {
              const f = e.target.files?.[0];
              if (f) handleImportBackupFile(f);
            };
            input.click();
          }}
          onOpenTemplates={() => setIsTemplatesModalOpen(true)}
          onOpenImageToForm={() => setIsImageToFormModalOpen(true)}
          onSaveActiveTemplate={handleSaveActiveTemplate}
          onDuplicateActiveTemplate={handleDuplicateActiveTemplate}
          onDeleteActiveTemplate={handleDeleteActiveTemplate}
          recordsCount={records.length}
          themeMode={themeMode}
          onThemeChange={handleThemeChange}
          documentNumber={
            activeTemplate.fields.find((f) => f.documentNumber)?.documentNumber ||
            formData['f_doc_no'] ||
            '۱'
          }
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Central Workspace & Context Column */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0 lg:m-3 lg:rounded-3xl liquid-glass">
          {/* Top Context & Specs Bar (shown only in classic canvas & design views) */}
          {(activeTab === 'fill' || activeTab === 'design') && (
            <CanvasTopBar
              activeTemplate={activeTemplate}
              isFillMode={isFillMode}
              onToggleFillMode={(fillMode) => {
                setIsFillMode(fillMode);
                if (fillMode) setSelectedFieldId(null);
              }}
              paperSize={activeTemplate.paperSize}
              onPaperSizeChange={(paperSize: PaperSize) => {
                const updated = { ...activeTemplate, paperSize };
                setActiveTemplate(updated);
                saveTemplate(updated);
              }}
              orientation={activeTemplate.orientation}
              onOrientationChange={(orientation: PageOrientation) => {
                const updated = { ...activeTemplate, orientation };
                setActiveTemplate(updated);
                saveTemplate(updated);
              }}
              showPageBorders={activeTemplate.showPageBorders ?? true}
              onTogglePageBorders={() => {
                const updated = { ...activeTemplate, showPageBorders: !activeTemplate.showPageBorders };
                setActiveTemplate(updated);
                saveTemplate(updated);
              }}
              showWatermark={activeTemplate.showWatermark ?? false}
              onToggleWatermark={() => {
                const updated = { ...activeTemplate, showWatermark: !activeTemplate.showWatermark };
                setActiveTemplate(updated);
                saveTemplate(updated);
              }}
              zoomScale={zoomScale}
              onZoomChange={setZoomScale}
              documentNumber={
                activeTemplate.fields.find((f) => f.documentNumber)?.documentNumber ||
                formData['f_doc_no'] ||
                '۱'
              }
              lastAutoSavedTime={lastAutoSavedTime}
              isAutoSaving={isAutoSaving}
              onQuickPrint={() => handleDirectPrint()}
              onOpenShortcuts={() => setIsShortcutsModalOpen(true)}
              mobileDesignPanel={mobileDesignPanel}
              onToggleMobileDesignPanel={(panel) =>
                setMobileDesignPanel((prev) => (prev === panel ? 'none' : panel))
              }
            />
          )}

          {/* Main Visual Views Container */}
          <div className="flex-1 flex overflow-hidden relative">
        {/* VIEW 1: Database & Records Manager */}
        {activeTab === 'database' ? (
          <RecordsManager
            records={records}
            templates={templates}
            activeTemplate={activeTemplate}
            onLoadRecord={handleLoadRecord}
            onDeleteRecord={handleDeleteRecord}
            onPrintRecord={handlePrintRecord}
            onExportCsv={handleExportCsv}
            onExportBackup={handleExportBackup}
            onImportBackupFile={handleImportBackupFile}
            onNewRecord={handleNewRecord}
          />
        ) : activeTab === 'wizard' ? (
          <DocumentIssueWizard
            templates={templates}
            activeTemplate={activeTemplate}
            records={records}
            step={wizardStep}
            onStepChange={setWizardStep}
            formData={formData}
            tableData={tableData}
            signatureData={signatureData}
            currentRecordId={currentRecordId}
            onSelectWizardTemplate={handleSelectWizardTemplate}
            onFormDataChange={(key, val) =>
              setFormData((prev) => ({ ...prev, [key]: val }))
            }
            onTableDataChange={(fId, rows) =>
              setTableData((prev) => ({ ...prev, [fId]: rows }))
            }
            onSignatureDataChange={(fId, url) =>
              setSignatureData((prev) => ({ ...prev, [fId]: url }))
            }
            onSaveRecordToArchive={handleSaveRecord}
            onTriggerPrint={(settings) => {
              setActivePrintSettings(settings);
              setTimeout(() => {
                window.print();
              }, 150);
            }}
            onStartNewWizard={handleStartNewWizard}
            onSwitchToClassicCanvas={() => {
              setIsFillMode(true);
              setActiveTab('fill');
            }}
            onOpenImageToForm={() => setIsImageToFormModalOpen(true)}
            onUpdateActiveTemplate={handleUpdateTemplate}
          />
        ) : (
          /* VIEW 2: Visual Designer / Form Canvas */
          <>
            {/* Mobile / Tablet backdrop for Design mode drawers */}
            {!isFillMode && mobileDesignPanel !== 'none' && (
              <div
                aria-hidden="true"
                onClick={() => setMobileDesignPanel('none')}
                className="fixed inset-0 z-30 bg-black/45 backdrop-blur-2xs lg:hidden"
              />
            )}

            {/* Right Toolbox Palette (Only visible in Design mode) */}
            {!isFillMode && (
              <ElementToolbox
                onAddField={(type) => {
                  handleAddField(type);
                  setMobileDesignPanel('none');
                }}
                isMobileOpen={mobileDesignPanel === 'toolbox'}
                onCloseMobile={() => setMobileDesignPanel('none')}
              />
            )}

            {/* Central Visual Sheet Canvas */}
            <FormCanvas
              template={activeTemplate}
              selectedFieldId={selectedFieldId}
              onSelectField={(id) => {
                setSelectedFieldId(id);
              }}
              onUpdateField={handleUpdateField}
              onDeleteField={handleDeleteField}
              onDuplicateField={handleDuplicateField}
              onMoveField={handleMoveField}
              isFillMode={isFillMode}
              zoomScale={zoomScale}
              onZoomChange={setZoomScale}
              formData={formData}
              onFormDataChange={(key, val) =>
                setFormData((prev) => ({ ...prev, [key]: val }))
              }
              tableData={tableData}
              onTableDataChange={(fId, rows) =>
                setTableData((prev) => ({ ...prev, [fId]: rows }))
              }
              signatureData={signatureData}
              onSignatureDataChange={(fId, url) =>
                setSignatureData((prev) => ({ ...prev, [fId]: url }))
              }
              records={records}
            />

            {/* Left Properties Inspector (Only visible in Design mode) */}
            {!isFillMode && (
              <PropertyInspector
                field={selectedField}
                onUpdateField={handleUpdateField}
                onDeleteField={handleDeleteField}
                onDuplicateField={handleDuplicateField}
                onMoveField={handleMoveField}
                onClose={() => {
                  setSelectedFieldId(null);
                  setMobileDesignPanel('none');
                }}
                isMobileOpen={mobileDesignPanel === 'inspector'}
                onCloseMobile={() => setMobileDesignPanel('none')}
              />
            )}
          </>
        )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        template={activeTemplate}
        formData={formData}
        tableData={tableData}
        signatureData={signatureData}
        onTriggerPrint={(settings) => {
          setActivePrintSettings(settings);
        }}
      />

      <TemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
        templates={templates}
        activeTemplateId={activeTemplate.id}
        onSelectTemplate={handleSelectTemplate}
        onUpdateTemplate={handleUpdateTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onDuplicateTemplate={handleDuplicateTemplate}
        onCreateNewTemplate={handleCreateNewTemplate}
        onResetDefaults={handleResetDefaults}
        onOpenImageToForm={() => setIsImageToFormModalOpen(true)}
      />

      <ImageToFormModal
        isOpen={isImageToFormModalOpen}
        onClose={() => setIsImageToFormModalOpen(false)}
        onTemplateCreated={handleTemplateExtractedFromImage}
        showToast={showToast}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Liquid Glass Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 left-4 right-4 sm:right-auto sm:left-6 z-50 liquid-glass-elevated px-4 py-3 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}
    </div>

    {/* Dedicated Official Print Document rendered exclusively during print */}
    <OfficialPrintDocument
      template={activeTemplate}
      formData={formData}
      tableData={tableData}
      signatureData={signatureData}
      printSettings={activePrintSettings}
    />
  </>
  );
}

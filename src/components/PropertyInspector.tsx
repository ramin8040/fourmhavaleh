import React, { useState } from 'react';
import { 
  FormField, 
  FieldWidth,
  TableColumn
} from '../types/form';
import { 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Sliders, 
  CheckSquare, 
  X,
  Plus,
  AlignRight,
  AlignCenter,
  AlignLeft,
  Columns,
  Table as TableIcon,
  Layers,
  Calculator,
  Type,
  Hash,
  Calendar,
  Coins,
  QrCode,
  PenTool,
  Building2,
  Minus
} from 'lucide-react';
import { toPersianDigits } from '../utils/formLogic';
import { ExcelTableStylePanel } from './ExcelTableStylePanel';
import { CompanyLogoControls } from './CompanyLogoControls';

interface PropertyInspectorProps {
  field: FormField | null;
  onUpdateField: (updated: FormField) => void;
  onDeleteField: (id: string) => void;
  onDuplicateField: (field: FormField) => void;
  onMoveField: (id: string, direction: 'up' | 'down') => void;
  onClose: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const PropertyInspector: React.FC<PropertyInspectorProps> = ({
  field,
  onUpdateField,
  onDeleteField,
  onDuplicateField,
  onMoveField,
  onClose,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'style' | 'columns'>('settings');

  const drawerClass = `fixed inset-y-0 left-0 z-40 w-80 max-w-[88vw] lg:static lg:relative lg:z-auto liquid-glass-elevated border-r border-white/60 dark:border-white/10 flex flex-col shrink-0 select-none shadow-2xl lg:shadow-none transition-transform duration-200 lg:translate-x-0 lg:pointer-events-auto ${
    isMobileOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
  }`;

  if (!field) {
    return (
      <aside className={`${drawerClass} p-5 text-center justify-center text-slate-500 dark:text-slate-400`}>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="بستن پنل تنظیمات"
            className="lg:hidden absolute top-3 left-3 p-1.5 rounded-xl text-slate-500 hover:bg-white/75 dark:hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <Sliders className="w-8 h-8 mx-auto mb-2.5 text-slate-400 dark:text-slate-500" />
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">هیچ بخشی انتخاب نشده است</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
          روی هر بخش از برگه بزنید تا بتوانید اسم، اندازه یا ستون‌هایش را عوض کنید.
        </span>
      </aside>
    );
  }

  const widths: { label: string; value: FieldWidth }[] = [
    { label: 'تمام صفحه (۱۰۰٪)', value: '100%' },
    { label: 'سه چهارم (۷۵٪)', value: '75%' },
    { label: 'دو سوم (۶۶٪)', value: '66%' },
    { label: 'نصف (۵۰٪)', value: '50%' },
    { label: 'یک سوم (۳۳٪)', value: '33%' },
    { label: 'یک چهارم (۲۵٪)', value: '25%' },
  ];

  // Helper for Table Columns
  const getColumns = (): TableColumn[] => {
    if (field.tableColumns && field.tableColumns.length > 0) {
      return field.tableColumns;
    }
    if (field.tableVariant === 'dispatch') {
      return [
        { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number', align: 'center' },
        { id: 'productCode', title: 'کد کالا', width: 'w-24', type: 'text', align: 'center' },
        { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text', align: 'right' },
        { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number', align: 'center' },
        { id: 'unit', title: 'واحد', width: 'w-16', type: 'text', align: 'center' },
        { id: 'serialNumber', title: 'شماره سریال', width: 'w-28', type: 'text', align: 'center' },
        { id: 'notes', title: 'توضیحات', width: 'w-36', type: 'text', align: 'right' },
      ];
    }
    return [
      { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number', align: 'center' },
      { id: 'description', title: 'شرح کالا یا خدمات', width: 'flex-1', type: 'text', align: 'right' },
      { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number', align: 'center' },
      { id: 'unitPrice', title: 'مبلغ واحد (ریال)', width: 'w-28', type: 'currency', align: 'left' },
      { id: 'totalPrice', title: 'مبلغ کل (ریال)', width: 'w-32', type: 'currency', align: 'left', isFormula: true },
    ];
  };

  const handleUpdateColumns = (columns: TableColumn[]) => {
    onUpdateField({ ...field, tableColumns: columns });
  };

  const handleAddColumn = (title = 'ستون جدید', type: 'text' | 'number' | 'currency' = 'text', align: 'right' | 'center' | 'left' = 'right') => {
    const current = getColumns();
    const newColId = `col_${Date.now()}`;
    const newCol: TableColumn = {
      id: newColId,
      title,
      type,
      align,
      width: 'w-24',
    };
    handleUpdateColumns([...current, newCol]);
  };

  const handleEditColumn = (idx: number, patch: Partial<TableColumn>) => {
    const cols = [...getColumns()];
    cols[idx] = { ...cols[idx], ...patch };
    handleUpdateColumns(cols);
  };

  const handleDeleteColumn = (idx: number) => {
    const cols = getColumns();
    if (cols.length <= 1) return;
    const updated = cols.filter((_, i) => i !== idx);
    handleUpdateColumns(updated);
  };

  const handleMoveColumn = (idx: number, dir: 'up' | 'down') => {
    const cols = [...getColumns()];
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= cols.length) return;
    const temp = cols[idx];
    cols[idx] = cols[targetIdx];
    cols[targetIdx] = temp;
    handleUpdateColumns(cols);
  };

  // Helper for options in select
  const handleOptionAdd = () => {
    const currentOptions = field.options || [];
    const newOption = `گزینه ${currentOptions.length + 1}`;
    onUpdateField({ ...field, options: [...currentOptions, newOption] });
  };

  const handleOptionChange = (idx: number, newVal: string) => {
    const opts = [...(field.options || [])];
    opts[idx] = newVal;
    onUpdateField({ ...field, options: opts });
  };

  const handleOptionDelete = (idx: number) => {
    const opts = (field.options || []).filter((_, i) => i !== idx);
    onUpdateField({ ...field, options: opts });
  };

  // Helper for signatures
  const handleSignatureAdd = () => {
    const current = field.signatureLabels || ['محل امضا:'];
    onUpdateField({ ...field, signatureLabels: [...current, `تأییدکننده ${current.length + 1}:`] });
  };

  const handleSignatureChange = (idx: number, newVal: string) => {
    const sigs = [...(field.signatureLabels || [])];
    sigs[idx] = newVal;
    onUpdateField({ ...field, signatureLabels: sigs });
  };

  const handleSignatureDelete = (idx: number) => {
    const sigs = (field.signatureLabels || []).filter((_, i) => i !== idx);
    onUpdateField({ ...field, signatureLabels: sigs });
  };

  const getFieldTypeTitle = (type: string) => {
    switch (type) {
      case 'table': return 'جدول اقلام و کالاها';
      case 'header_banner': return 'سربرگ سازمانی';
      case 'signature': return 'بخش امضا و تاییدات';
      case 'qrcode': return 'بارکد و کد QR';
      case 'shamsi_date': return 'تاریخ شمسی';
      case 'currency': return 'فیلد مبلغ و ارز';
      case 'number': return 'فیلد عددی';
      case 'textarea': return 'متن چندخطی (توضیحات)';
      case 'text': return 'فیلد متنی کوتاه';
      case 'select': return 'لیست کشویی (انتخابی)';
      case 'checkbox': return 'چک‌باکس تایید';
      case 'divider': return 'خط جداکننده';
      default: return 'فیلد فرم';
    }
  };

  return (
    <aside className={`${drawerClass} overflow-y-auto`}>
      {/* Inspector Header */}
      <div className="p-3 border-b border-[#e5e7eb] dark:border-[#2d2d2d] bg-[#f3f4f6] dark:bg-[#1a1a1a] flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0">
          <Sliders className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff] shrink-0" />
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
              {getFieldTypeTitle(field.type)}
            </h2>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              شناسه: {field.id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          title="بستن پنل"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Action Toolbar (Move, Duplicate, Delete) */}
      <div className="px-3 pt-3">
        <div className="flex items-center justify-between bg-white dark:bg-[#282828] p-1 rounded-md border border-slate-200 dark:border-[#383838] shadow-2xs">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onMoveField(field.id, 'up')}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#333333] text-slate-600 dark:text-slate-300 transition-colors text-[11px] flex items-center gap-1"
              title="انتقال به بالا"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span>بالا</span>
            </button>
            <button
              onClick={() => onMoveField(field.id, 'down')}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#333333] text-slate-600 dark:text-slate-300 transition-colors text-[11px] flex items-center gap-1"
              title="انتقال به پایین"
            >
              <ArrowDown className="w-3.5 h-3.5" />
              <span>پایین</span>
            </button>
            <button
              onClick={() => onDuplicateField(field)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-[#333333] text-slate-600 dark:text-slate-300 transition-colors text-[11px] flex items-center gap-1"
              title="تکثیر فیلد"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>تکثیر</span>
            </button>
          </div>
          <button
            onClick={() => onDeleteField(field.id)}
            className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
            title="حذف این فیلد"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tabs if Table */}
      {field.type === 'table' && (
        <div className="px-3 pt-3">
          <div className="grid grid-cols-3 border-b border-slate-200 dark:border-[#383838] text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`pb-1.5 font-medium transition-colors text-center cursor-pointer ${
                activeTab === 'settings'
                  ? 'border-b-2 border-[#0067C0] dark:border-[#4cc2ff] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              عمومی و ردیف‌ها
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`pb-1.5 font-medium transition-colors text-center cursor-pointer ${
                activeTab === 'style'
                  ? 'border-b-2 border-[#0067C0] dark:border-[#4cc2ff] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              خطوط و رنگ (اکسل)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('columns')}
              className={`pb-1.5 font-medium transition-colors text-center cursor-pointer ${
                activeTab === 'columns'
                  ? 'border-b-2 border-[#0067C0] dark:border-[#4cc2ff] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              ستون‌ها ({toPersianDigits(getColumns().length)})
            </button>
          </div>
        </div>
      )}

      {/* Content Form */}
      <div className="p-3 space-y-4 text-xs">
        {/* ========================================================
            TAB: EXCEL TABLE BORDERS, COLORS & STYLE
            ======================================================== */}
        {field.type === 'table' && activeTab === 'style' && (
          <ExcelTableStylePanel
            field={field}
            columns={getColumns()}
            onUpdateField={onUpdateField}
          />
        )}

        {/* ========================================================
            TAB: TABLE COLUMNS MANAGER
            ======================================================== */}
        {field.type === 'table' && activeTab === 'columns' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Columns className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                ستون‌های فعال جدول:
              </span>
              <button
                onClick={() => handleAddColumn('ستون جدید')}
                className="px-2 py-0.5 rounded bg-[#0067C0] text-white hover:bg-[#005a9e] dark:bg-[#0078d4] flex items-center gap-1 text-[11px] shadow-xs"
              >
                <Plus className="w-3 h-3" />
                افزودن ستون
              </button>
            </div>

            {/* Column Quick Presets */}
            <div className="p-2 rounded bg-slate-100 dark:bg-[#282828] border border-slate-200 dark:border-[#383838] space-y-1.5">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                افزودن سریع ستون‌های آماده استاندارد:
              </span>
              <div className="flex flex-wrap gap-1">
                {[
                  { label: '+ کد کالا', title: 'کد کالا', type: 'text', align: 'center' },
                  { label: '+ شرح کالا', title: 'شرح کالا', type: 'text', align: 'right' },
                  { label: '+ مدل', title: 'مدل', type: 'text', align: 'center' },
                  { label: '+ تعداد', title: 'تعداد', type: 'number', align: 'center' },
                  { label: '+ واحد', title: 'واحد', type: 'text', align: 'center' },
                  { label: '+ فی (قیمت واحد)', title: 'قیمت واحد (ریال)', type: 'currency', align: 'left' },
                  { label: '+ مبلغ کل', title: 'قیمت کل (ریال)', type: 'currency', align: 'left' },
                  { label: '+ سریال', title: 'شماره سریال', type: 'text', align: 'center' },
                  { label: '+ محل مصرف', title: 'محل مصرف', type: 'text', align: 'center' },
                  { label: '+ توضیحات', title: 'توضیحات', type: 'text', align: 'right' },
                ].map((preset, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => handleAddColumn(preset.title, preset.type as any, preset.align as any)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#404040] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#444] transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Columns List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
              {getColumns().map((col, idx) => (
                <div
                  key={col.id || idx}
                  className="p-2 rounded bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">
                      #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveColumn(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-[#333333] disabled:opacity-30"
                        title="انتقال به راست"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleMoveColumn(idx, 'down')}
                        disabled={idx === getColumns().length - 1}
                        className="p-1 rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-[#333333] disabled:opacity-30"
                        title="انتقال به چپ"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteColumn(idx)}
                        disabled={getColumns().length <= 1}
                        className="p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-30"
                        title="حذف ستون"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Title input */}
                  <div className="space-y-0.5">
                    <label className="text-[10px] text-slate-500 dark:text-slate-400">عنوان ستون:</label>
                    <input
                      type="text"
                      value={col.title}
                      onChange={(e) => handleEditColumn(idx, { title: e.target.value })}
                      className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                    />
                  </div>

                  {/* Type and Alignment row */}
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <div className="space-y-0.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">نوع داده:</label>
                      <select
                        value={col.type}
                        onChange={(e) => handleEditColumn(idx, { type: e.target.value as any })}
                        className="w-full bg-white dark:bg-[#202020] border border-slate-300 dark:border-[#404040] rounded px-1.5 py-0.5 text-[11px] text-slate-800 dark:text-slate-100 outline-none"
                      >
                        <option value="text">متنی</option>
                        <option value="number">عددی</option>
                        <option value="currency">مبلغ / ارز</option>
                      </select>
                    </div>

                    <div className="space-y-0.5">
                      <label className="text-[10px] text-slate-500 dark:text-slate-400">تراز متن:</label>
                      <div className="flex border border-slate-300 dark:border-[#404040] rounded overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleEditColumn(idx, { align: 'right' })}
                          className={`flex-1 py-1 flex items-center justify-center transition-colors ${
                            (col.align || 'right') === 'right'
                              ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff]'
                              : 'bg-white dark:bg-[#202020] text-slate-500'
                          }`}
                          title="راست‌چین"
                        >
                          <AlignRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditColumn(idx, { align: 'center' })}
                          className={`flex-1 py-1 flex items-center justify-center border-r border-l border-slate-300 dark:border-[#404040] transition-colors ${
                            col.align === 'center'
                              ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff]'
                              : 'bg-white dark:bg-[#202020] text-slate-500'
                          }`}
                          title="وسط‌چین"
                        >
                          <AlignCenter className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEditColumn(idx, { align: 'left' })}
                          className={`flex-1 py-1 flex items-center justify-center transition-colors ${
                            col.align === 'left'
                              ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff]'
                              : 'bg-white dark:bg-[#202020] text-slate-500'
                          }`}
                          title="چپ‌چین"
                        >
                          <AlignLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB / PANEL: GENERAL & ELEMENT SPECIFIC SETTINGS
            ======================================================== */}
        {(field.type !== 'table' || activeTab === 'settings') && (
          <>
            {/* Field Label (except divider) */}
            {field.type !== 'divider' && (
              <div className="space-y-1">
                <label className="font-medium text-slate-700 dark:text-slate-300">عنوان برچسب (Label):</label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onUpdateField({ ...field, label: e.target.value })}
                  className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                />
              </div>
            )}

            {/* Field Width on Sheet */}
            <div className="space-y-1">
              <label className="font-medium text-slate-700 dark:text-slate-300">عرض فیلد در صفحه:</label>
              <select
                value={field.width}
                onChange={(e) => onUpdateField({ ...field, width: e.target.value as FieldWidth })}
                className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
              >
                {widths.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: TABLE (جدول)
                ---------------------------------------------------- */}
            {field.type === 'table' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <TableIcon className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                  تنظیمات ساختار و ردیف‌های جدول:
                </span>

                {/* Table Variant */}
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">سبک و قالب جدول:</label>
                  <select
                    value={field.tableVariant || 'invoice'}
                    onChange={(e) => onUpdateField({ ...field, tableVariant: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="invoice">جدول فاکتور رسمی (دارای قیمت و محاسبات مالیاتی)</option>
                    <option value="dispatch">جدول انبار و حواله رسمی (کد کالا، شماره سریال و...)</option>
                    <option value="standard">جدول عمومی و سفارشی</option>
                  </select>
                </div>

                {/* Initial Rows Configuration */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-600 dark:text-slate-400">تعداد ردیف‌های پیش‌فرض:</label>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {toPersianDigits(field.tableInitialRows || (field.tableVariant === 'dispatch' ? 10 : 3))} ردیف
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {[3, 5, 8, 10, 12, 15].map((count) => (
                      <button
                        key={count}
                        type="button"
                        onClick={() => onUpdateField({ ...field, tableInitialRows: count })}
                        className={`flex-1 py-1 rounded text-[11px] font-mono transition-colors border ${
                          (field.tableInitialRows || (field.tableVariant === 'dispatch' ? 10 : 3)) === count
                            ? 'bg-[#0067C0] text-white border-[#0067C0] dark:bg-[#0078d4]'
                            : 'bg-white dark:bg-[#282828] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#404040] hover:bg-slate-100 dark:hover:bg-[#333333]'
                        }`}
                      >
                        {toPersianDigits(count)}
                      </button>
                    ))}
                  </div>

                  {/* Increment / Decrement Row Controls */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const cur = field.tableInitialRows || (field.tableVariant === 'dispatch' ? 10 : 3);
                        onUpdateField({ ...field, tableInitialRows: Math.max(1, cur - 1) });
                      }}
                      className="flex-1 py-1 px-2 rounded bg-slate-100 dark:bg-[#2b2b2b] hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#404040] flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Minus className="w-3 h-3" />
                      کاهش ردیف
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const cur = field.tableInitialRows || (field.tableVariant === 'dispatch' ? 10 : 3);
                        onUpdateField({ ...field, tableInitialRows: cur + 1 });
                      }}
                      className="flex-1 py-1 px-2 rounded bg-slate-100 dark:bg-[#2b2b2b] hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#404040] flex items-center justify-center gap-1 text-[11px]"
                    >
                      <Plus className="w-3 h-3" />
                      افزایش ردیف
                    </button>
                  </div>
                </div>

                {/* Table Border Thickness */}
                <div className="space-y-1 pt-1">
                  <label className="text-slate-600 dark:text-slate-400">ضخامت کادرهای جدول:</label>
                  <select
                    value={field.tableBorderThickness || 'normal'}
                    onChange={(e) => onUpdateField({ ...field, tableBorderThickness: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="normal">کادر استاندارد (نازک - ۱ پیکسل)</option>
                    <option value="thick">کادر رسمی ضخیم (۲ پیکسل - سبک اسناد شرکتی AW-ST-FO-008)</option>
                  </select>
                </div>

                {/* Summary & Calculations Section */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-emerald-600" />
                    محاسبات مالیاتی و سرجمع:
                  </span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.hasTableSummary ?? true}
                      onChange={(e) => onUpdateField({ ...field, hasTableSummary: e.target.checked })}
                      className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                    />
                    <span className="text-slate-700 dark:text-slate-300">نمایش کادر جمع کل، تخفیف و مالیات</span>
                  </label>

                  {field.hasTableSummary && (
                    <div className="space-y-2 pr-4 border-r-2 border-slate-200 dark:border-slate-700">
                      <div className="space-y-1">
                        <label className="text-slate-600 dark:text-slate-400">نرخ مالیات بر ارزش افزوده (درصد):</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={field.taxRatePercent ?? 10}
                          onChange={(e) => onUpdateField({ ...field, taxRatePercent: Number(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-600 dark:text-slate-400">تخفیف پیش‌فرض (ریال):</label>
                        <input
                          type="number"
                          min="0"
                          value={field.discountAmount ?? 0}
                          onChange={(e) => onUpdateField({ ...field, discountAmount: Number(e.target.value) || 0 })}
                          className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                        />
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={field.showTableWords ?? true}
                          onChange={(e) => onUpdateField({ ...field, showTableWords: e.target.checked })}
                          className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                        />
                        <span className="text-slate-700 dark:text-slate-300">نمایش مبلغ نهایی به حروف فارسی</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: TEXT & TEXTAREA
                ---------------------------------------------------- */}
            {['text', 'textarea'].includes(field.type) && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Type className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                  تنظیمات ورودی متن:
                </span>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">متن راهنما (Placeholder):</label>
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => onUpdateField({ ...field, placeholder: e.target.value })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">مقدار اولیه پیش‌فرض:</label>
                  <input
                    type="text"
                    value={String(field.defaultValue || '')}
                    onChange={(e) => onUpdateField({ ...field, defaultValue: e.target.value })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                  />
                </div>

                {field.type === 'textarea' && (
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">تعداد سطرهای پیش‌فرض:</label>
                    <div className="flex gap-1">
                      {[2, 3, 4, 6, 8].map((lines) => (
                        <button
                          key={lines}
                          type="button"
                          onClick={() => onUpdateField({ ...field, rowsCount: lines })}
                          className={`flex-1 py-1 rounded text-xs font-mono border ${
                            (field.rowsCount || 3) === lines
                              ? 'bg-[#0067C0] text-white border-[#0067C0] dark:bg-[#0078d4]'
                              : 'bg-white dark:bg-[#282828] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#404040]'
                          }`}
                        >
                          {toPersianDigits(lines)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">تراز متن فیلد:</label>
                  <div className="flex border border-slate-300 dark:border-[#404040] rounded overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onUpdateField({ ...field, textAlign: 'right' })}
                      className={`flex-1 py-1.5 flex items-center justify-center gap-1 text-[11px] ${
                        (field.textAlign || 'right') === 'right'
                          ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                          : 'bg-white dark:bg-[#202020] text-slate-500'
                      }`}
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                      راست
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateField({ ...field, textAlign: 'center' })}
                      className={`flex-1 py-1.5 flex items-center justify-center gap-1 border-r border-l border-slate-300 dark:border-[#404040] text-[11px] ${
                        field.textAlign === 'center'
                          ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                          : 'bg-white dark:bg-[#202020] text-slate-500'
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      وسط
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdateField({ ...field, textAlign: 'left' })}
                      className={`flex-1 py-1.5 flex items-center justify-center gap-1 text-[11px] ${
                        field.textAlign === 'left'
                          ? 'bg-slate-200 dark:bg-[#404040] text-[#0067C0] dark:text-[#4cc2ff] font-bold'
                          : 'bg-white dark:bg-[#202020] text-slate-500'
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      چپ
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">متن راهنمای زیر فیلد (Helper Text):</label>
                  <input
                    type="text"
                    value={field.helperText || ''}
                    onChange={(e) => onUpdateField({ ...field, helperText: e.target.value })}
                    placeholder="مثلاً: حداکثر در ۱۰۰ کاراکتر درج شود"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: NUMBER & CURRENCY
                ---------------------------------------------------- */}
            {['number', 'currency'].includes(field.type) && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  {field.type === 'currency' ? (
                    <Coins className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <Hash className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  تنظیمات عددی و واحد سنجش:
                </span>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">پسوند / واحد سنجش:</label>
                  <input
                    type="text"
                    value={field.unitLabel || (field.type === 'currency' ? 'ریال' : '')}
                    onChange={(e) => onUpdateField({ ...field, unitLabel: e.target.value })}
                    placeholder={field.type === 'currency' ? 'ریال یا تومان' : 'عدد، دستگاه، کیلوگرم، ...'}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                  <div className="flex flex-wrap gap-1 pt-1">
                    {field.type === 'currency' ? (
                      ['ریال', 'تومان', 'هزار ریال'].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => onUpdateField({ ...field, unitLabel: u })}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#282828] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#404040]"
                        >
                          {u}
                        </button>
                      ))
                    ) : (
                      ['عدد', 'دستگاه', 'کیلوگرم', 'بسته', 'متر', 'شاخه'].map((u) => (
                        <button
                          key={u}
                          type="button"
                          onClick={() => onUpdateField({ ...field, unitLabel: u })}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-[#282828] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#404040]"
                        >
                          {u}
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">حداقل مقدار (Min):</label>
                    <input
                      type="number"
                      value={field.min ?? ''}
                      onChange={(e) => onUpdateField({ ...field, min: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">حداکثر مقدار (Max):</label>
                    <input
                      type="number"
                      value={field.max ?? ''}
                      onChange={(e) => onUpdateField({ ...field, max: e.target.value === '' ? undefined : Number(e.target.value) })}
                      className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={field.showNumberInWords ?? true}
                    onChange={(e) => onUpdateField({ ...field, showNumberInWords: e.target.checked })}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300">نمایش معادل به حروف فارسی زیر کادر</span>
                </label>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: SHAMSI DATE
                ---------------------------------------------------- */}
            {field.type === 'shamsi_date' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  تنظیمات تاریخ شمسی:
                </span>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">مقدار پیش‌فرض تاریخ:</label>
                  <input
                    type="text"
                    value={String(field.defaultValue || '')}
                    onChange={(e) => onUpdateField({ ...field, defaultValue: e.target.value })}
                    placeholder="۱۴۰۳/۰۸/۲۰"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => onUpdateField({ ...field, defaultValue: '۱۴۰۳/۰۸/۲۰' })}
                  className="w-full py-1 text-[11px] rounded bg-slate-100 dark:bg-[#282828] hover:bg-slate-200 dark:hover:bg-[#333333] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#404040]"
                >
                  تنظیم روی تاریخ روز جاری (امروز)
                </button>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: SELECT DROPDOWN
                ---------------------------------------------------- */}
            {field.type === 'select' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">گزینه‌های لیست انتخابی:</span>
                  <button
                    onClick={handleOptionAdd}
                    className="text-[11px] text-[#0067C0] dark:text-[#4cc2ff] hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    افزودن گزینه
                  </button>
                </div>

                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                  {(field.options || []).map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-400 font-mono w-4">{idx + 1}</span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        className="flex-1 bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                      />
                      <button
                        onClick={() => handleOptionDelete(idx)}
                        disabled={(field.options || []).length <= 1}
                        className="text-slate-400 hover:text-red-500 p-1 disabled:opacity-30"
                        title="حذف گزینه"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: CHECKBOX
                ---------------------------------------------------- */}
            {field.type === 'checkbox' && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">تنظیمات چک‌باکس:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(field.defaultValue)}
                    onChange={(e) => onUpdateField({ ...field, defaultValue: e.target.checked })}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300">فعال (تیک خورده) به صورت پیش‌فرض</span>
                </label>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: SIGNATURE PAD
                ---------------------------------------------------- */}
            {field.type === 'signature' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <PenTool className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                  مراحل تأیید و امضا:
                </span>

                {/* Style of signature box */}
                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">نوع کادر امضا:</label>
                  <select
                    value={field.signatureLabels ? 'multi' : 'single'}
                    onChange={(e) => {
                      if (e.target.value === 'multi') {
                        onUpdateField({
                          ...field,
                          signatureLabels: ['انبار:', 'مالی:', 'مدیریت کارخانه:', 'نگهبانی:', 'تحویل گیرنده:'],
                        });
                      } else {
                        onUpdateField({ ...field, signatureLabels: undefined });
                      }
                    }}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="single">امضای تک نفره استاندارد</option>
                    <option value="multi">کادر رسمی تأییدات چند مرحله‌ای شرکت</option>
                  </select>
                </div>

                {field.signatureLabels && (
                  <div className="space-y-2">
                    {/* Presets */}
                    <div className="p-2 rounded bg-slate-100 dark:bg-[#282828] border border-slate-200 dark:border-[#383838] space-y-1.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">
                        الگوهای آماده تاییدات:
                      </span>
                      <div className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateField({
                              ...field,
                              signatureLabels: ['تحویل دهنده:', 'تحویل گیرنده:'],
                            })
                          }
                          className="text-[10px] text-right p-1 rounded bg-white dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#404040] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#444]"
                        >
                          ۲ امضا: تحویل دهنده · تحویل گیرنده
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateField({
                              ...field,
                              signatureLabels: ['واحددرخواست:', 'انبار:', 'تدارکات:', 'مدیریت:', 'مالی:'],
                            })
                          }
                          className="text-[10px] text-right p-1 rounded bg-white dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#404040] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#444]"
                        >
                          ۵ امضا: درخواست · انبار · تدارکات · مدیریت · مالی
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateField({
                              ...field,
                              signatureLabels: ['انبار:', 'مالی:', 'مدیریت کارخانه:', 'نگهبانی:', 'تحویل گیرنده:'],
                            })
                          }
                          className="text-[10px] text-right p-1 rounded bg-white dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#404040] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-[#444]"
                        >
                          ۵ امضا: انبار · مالی · مدیریت · نگهبانی · تحویل گیرنده
                        </button>
                      </div>
                    </div>

                    {/* Edit stage labels */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-slate-600 dark:text-slate-400">عناوین مراحل:</label>
                      <button
                        onClick={handleSignatureAdd}
                        className="text-[11px] text-[#0067C0] dark:text-[#4cc2ff] hover:underline flex items-center gap-0.5"
                      >
                        <Plus className="w-3 h-3" />
                        افزودن مرحله
                      </button>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
                      {field.signatureLabels.map((lbl, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <input
                            type="text"
                            value={lbl}
                            onChange={(e) => handleSignatureChange(idx, e.target.value)}
                            className="flex-1 bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                          />
                          <button
                            onClick={() => handleSignatureDelete(idx)}
                            disabled={field.signatureLabels!.length <= 1}
                            className="text-slate-400 hover:text-red-500 p-1 disabled:opacity-30"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: HEADER BANNER
                ---------------------------------------------------- */}
            {field.type === 'header_banner' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                  اطلاعات سربرگ و لوگوی شرکت:
                </span>

                <CompanyLogoControls
                  headerField={field}
                  onUpdateHeaderField={onUpdateField}
                />

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">نوع سربرگ:</label>
                  <select
                    value={field.headerType || 'dispatch_voucher'}
                    onChange={(e) => onUpdateField({ ...field, headerType: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="dispatch_voucher">سربرگ رسمی سه بخشی (لوگو + عنوان سند + کد فرم)</option>
                    <option value="standard">سربرگ شرکتی استاندارد (لوگو ساده و شناسه ملی)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">نام شرکت / سازمان:</label>
                  <input
                    type="text"
                    value={field.companyName || ''}
                    onChange={(e) => onUpdateField({ ...field, companyName: e.target.value })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">عنوان فرعی / نام دوم:</label>
                  <input
                    type="text"
                    value={field.companySubName || ''}
                    onChange={(e) => onUpdateField({ ...field, companySubName: e.target.value })}
                    placeholder="شرکت بین‌المللی آیریا ونداد کسری"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">عنوان سند / فرم:</label>
                  <input
                    type="text"
                    value={field.headerTitle || ''}
                    onChange={(e) => onUpdateField({ ...field, headerTitle: e.target.value })}
                    placeholder="حواله خروج محصول / رسید تعمیرات"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">کد فرم:</label>
                    <input
                      type="text"
                      value={field.formCode || ''}
                      onChange={(e) => onUpdateField({ ...field, formCode: e.target.value })}
                      placeholder="AW-ST-FO-008"
                      className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-600 dark:text-slate-400">شماره سند:</label>
                    <input
                      type="text"
                      value={field.documentNumber || ''}
                      onChange={(e) => onUpdateField({ ...field, documentNumber: e.target.value })}
                      placeholder="۱"
                      className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">تاریخ سربرگ:</label>
                  <input
                    type="text"
                    value={field.headerDate || ''}
                    onChange={(e) => onUpdateField({ ...field, headerDate: e.target.value })}
                    placeholder="۱۴۰۵/۰۶/۲۵"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={field.hasGreyTitleBanner ?? false}
                    onChange={(e) => onUpdateField({ ...field, hasGreyTitleBanner: e.target.checked })}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300">پس‌زمینه طوسی برای عنوان فرم (سبک تصویر ۳ و ۴)</span>
                </label>

                {/* Requesting Unit */}
                <div className="space-y-1 pt-1">
                  <label className="text-slate-600 dark:text-slate-400">واحد درخواست‌کننده:</label>
                  <input
                    type="text"
                    value={field.requestingUnit || ''}
                    onChange={(e) => onUpdateField({ ...field, requestingUnit: e.target.value })}
                    placeholder="مثال: واحد اداری / واحد تاسیسات"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-0.5 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: QR CODE
                ---------------------------------------------------- */}
            {field.type === 'qrcode' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-[11px]">
                  <QrCode className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                  تنظیمات بارکد QR:
                </span>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">لینک یا داده متنی QR:</label>
                  <input
                    type="text"
                    value={field.qrContent || ''}
                    onChange={(e) => onUpdateField({ ...field, qrContent: e.target.value })}
                    placeholder="https://..."
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">اندازه نمایش بارکد:</label>
                  <div className="flex border border-slate-300 dark:border-[#404040] rounded overflow-hidden">
                    {(['small', 'medium', 'large'] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => onUpdateField({ ...field, qrSize: sz })}
                        className={`flex-1 py-1 text-center text-[11px] ${
                          (field.qrSize || 'medium') === sz
                            ? 'bg-[#0067C0] text-white font-bold'
                            : 'bg-white dark:bg-[#202020] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sz === 'small' ? 'کوچک' : sz === 'medium' ? 'متوسط' : 'بزرگ'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">زیرنویس زیر بارکد:</label>
                  <input
                    type="text"
                    value={field.qrCaption || ''}
                    onChange={(e) => onUpdateField({ ...field, qrCaption: e.target.value })}
                    placeholder="قابل استعلام با اسکنر بارکد"
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2.5 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                SPECIFIC SETTINGS FOR: DIVIDER
                ---------------------------------------------------- */}
            {field.type === 'divider' && (
              <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  تنظیمات خط جداکننده:
                </span>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">نوع خط:</label>
                  <select
                    value={field.dividerStyle || 'solid'}
                    onChange={(e) => onUpdateField({ ...field, dividerStyle: e.target.value as any })}
                    className="w-full bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none"
                  >
                    <option value="solid">خط ممتد (Solid)</option>
                    <option value="dashed">خط‌چین (Dashed)</option>
                    <option value="dotted">نقطه‌چین (Dotted)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">ضخامت خط:</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((th) => (
                      <button
                        key={th}
                        type="button"
                        onClick={() => onUpdateField({ ...field, dividerThickness: th })}
                        className={`flex-1 py-1 rounded text-xs font-mono border ${
                          (field.dividerThickness || 1) === th
                            ? 'bg-[#0067C0] text-white border-[#0067C0]'
                            : 'bg-white dark:bg-[#282828] text-slate-700 dark:text-slate-300 border-slate-300 dark:border-[#404040]'
                        }`}
                      >
                        {toPersianDigits(th)}px
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 dark:text-slate-400">فاصله‌گذاری عمودی:</label>
                  <div className="flex border border-slate-300 dark:border-[#404040] rounded overflow-hidden">
                    {(['small', 'medium', 'large'] as const).map((sp) => (
                      <button
                        key={sp}
                        type="button"
                        onClick={() => onUpdateField({ ...field, dividerSpacing: sp })}
                        className={`flex-1 py-1 text-center text-[11px] ${
                          (field.dividerSpacing || 'medium') === sp
                            ? 'bg-[#0067C0] text-white font-bold'
                            : 'bg-white dark:bg-[#202020] text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sp === 'small' ? 'کم' : sp === 'medium' ? 'متوسط' : 'زیاد'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ----------------------------------------------------
                GENERAL DISPLAY & PRINT VISIBILITY OPTIONS
                ---------------------------------------------------- */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px] block">تنظیمات ظاهری و چاپ:</span>

              {field.type !== 'divider' && field.type !== 'header_banner' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.boxed ?? true}
                    onChange={(e) => onUpdateField({ ...field, boxed: e.target.checked })}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300">کادر حاشیه‌ای مشخص دور فیلد</span>
                </label>
              )}

              {field.type !== 'divider' && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) => onUpdateField({ ...field, required: e.target.checked })}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-slate-700 dark:text-slate-300">فیلد اجباری (ستاره‌دار سرخ)</span>
                </label>
              )}

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.hideOnPrint ?? false}
                  onChange={(e) => onUpdateField({ ...field, hideOnPrint: e.target.checked })}
                  className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                />
                <span className="text-slate-700 dark:text-slate-300">مخفی‌سازی هنگام چاپ کاغذ</span>
              </label>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

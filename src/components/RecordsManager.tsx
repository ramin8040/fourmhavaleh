import React, { useState, useRef } from 'react';
import { 
  FormRecord, 
  FormTemplate 
} from '../types/form';
import { 
  toPersianDigits, 
  generateCsvExport,
  filterFormRecords
} from '../utils/formLogic';
import {
  Database,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Trash2,
  Eye,
  FileText,
  Plus,
  RefreshCw,
  Calendar,
  CheckCircle2,
  FolderOpen,
  Filter,
  X,
  RotateCcw,
  CalendarRange,
  LayoutGrid,
  List,
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  Package,
  Tag,
  Building2,
  Layers
} from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import { 
  formatShamsiDate, 
  dateToShamsi, 
  getDaysInJalaliMonth, 
  isJalaliLeapYear 
} from '../utils/shamsiCalendar';
import { DocumentThumbnail } from './DocumentThumbnail';

interface RecordsManagerProps {
  records: FormRecord[];
  templates: FormTemplate[];
  activeTemplate: FormTemplate;
  onLoadRecord: (record: FormRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: FormRecord) => void;
  onExportCsv: () => void;
  onExportBackup: () => void;
  onImportBackupFile: (file: File) => void;
  onNewRecord: () => void;
}

export const RecordsManager: React.FC<RecordsManagerProps> = ({
  records,
  templates,
  activeTemplate,
  onLoadRecord,
  onDeleteRecord,
  onPrintRecord,
  onExportCsv,
  onExportBackup,
  onImportBackupFile,
  onNewRecord,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [itemQuery, setItemQuery] = useState('');
  const [filterFormId, setFilterFormId] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [activePreset, setActivePreset] = useState<'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'thisYear' | 'custom'>('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [previewRecord, setPreviewRecord] = useState<FormRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Quick Date Range Filter presets
  const handleQuickPreset = (preset: 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'thisYear') => {
    setActivePreset(preset);
    const now = new Date();
    const formatShamsiYMD = (d: Date) => formatShamsiDate(dateToShamsi(d));
    const nowSh = dateToShamsi(now);

    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
    } else if (preset === 'today') {
      const todayStr = formatShamsiYMD(now);
      setDateFrom(todayStr);
      setDateTo(todayStr);
    } else if (preset === '7days') {
      const past = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setDateFrom(formatShamsiYMD(past));
      setDateTo(formatShamsiYMD(now));
    } else if (preset === '30days') {
      const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      setDateFrom(formatShamsiYMD(past));
      setDateTo(formatShamsiYMD(now));
    } else if (preset === 'thisMonth') {
      const daysInMonth = getDaysInJalaliMonth(nowSh.year, nowSh.month);
      setDateFrom(formatShamsiDate({ year: nowSh.year, month: nowSh.month, day: 1 }));
      setDateTo(formatShamsiDate({ year: nowSh.year, month: nowSh.month, day: daysInMonth }));
    } else if (preset === 'thisYear') {
      const isLeap = isJalaliLeapYear(nowSh.year);
      setDateFrom(formatShamsiDate({ year: nowSh.year, month: 1, day: 1 }));
      setDateTo(formatShamsiDate({ year: nowSh.year, month: 12, day: isLeap ? 30 : 29 }));
    }
  };

  const handleManualDateChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setActivePreset('custom');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setDocumentNumber('');
    setCustomerName('');
    setItemQuery('');
    setFilterFormId('all');
    setDateFrom('');
    setDateTo('');
    setActivePreset('all');
  };

  const activeAdvancedCount = [
    Boolean(documentNumber.trim()),
    Boolean(customerName.trim()),
    Boolean(itemQuery.trim()),
    Boolean(dateFrom || dateTo),
  ].filter(Boolean).length;

  const isFiltered = Boolean(
    searchQuery.trim() ||
    documentNumber.trim() ||
    customerName.trim() ||
    itemQuery.trim() ||
    filterFormId !== 'all' ||
    dateFrom ||
    dateTo
  );

  // Filter records using the centralized logic
  const filteredRecords = filterFormRecords(records, {
    searchQuery,
    documentNumber,
    customerName,
    itemQuery,
    formId: filterFormId,
    dateFrom,
    dateTo,
  });

  const getTemplateTitle = (formId: string) => {
    const found = templates.find((t) => t.id === formId);
    return found ? found.title : 'فرم سفارشی';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackupFile(file);
    }
  };

  return (
    <div className="flex-1 bg-[#f3f4f6] dark:bg-[#18181a] overflow-y-auto p-4 md:p-6 flex flex-col gap-4 transition-colors">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#222731] p-4 rounded-lg border border-slate-300 dark:border-[#384252] shadow-2xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-[#0067C0] dark:text-[#4cc2ff]">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>بایگانی اسناد و کاردکس حواله‌ها و رسیدهای انبار</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#1a1e26] px-2 py-0.5 rounded">
                {toPersianDigits(records.length)} سند ثبت‌شده
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              مدیریت، پیگیری سوابق، جستجوی سریال اقلام و خروجی اکسل حواله‌های خروج و رسیدهای انبارداری.
            </p>
          </div>
        </div>

        {/* Global Record Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onNewRecord}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white text-xs font-medium rounded shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>صدور حواله جدید</span>
          </button>

          <button
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded shadow-xs transition-colors"
            title="دانلود جدول داده‌ها در قالب فایل اکسل"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>خروجی اکسل</span>
          </button>

          <button
            onClick={onExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2b313d] border border-slate-300 dark:border-[#3e4859] hover:bg-slate-50 dark:hover:bg-[#343c4a] text-slate-700 dark:text-slate-200 text-xs font-medium rounded shadow-xs transition-colors"
            title="دانلود نسخه پشتیبان کامل JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>پشتیبان‌گیری (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2b313d] border border-slate-300 dark:border-[#3e4859] hover:bg-slate-50 dark:hover:bg-[#343c4a] text-slate-700 dark:text-slate-200 text-xs font-medium rounded shadow-xs transition-colors"
            title="بازیابی داده‌ها از فایل پشتیبان JSON"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
            <span>بازیابی دیتابیس</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
        </div>
      </div>

      {/* Advanced Filter and Search Bar */}
      <div className="bg-white dark:bg-[#222731] rounded-xl border border-slate-300 dark:border-[#384252] shadow-xs flex flex-col overflow-hidden text-xs transition-all">
        {/* Row 1: Primary Search Header */}
        <div className="p-3 flex flex-wrap items-center gap-2.5">
          {/* Main Quick Keyword Search */}
          <div className="relative flex-1 min-w-[260px]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سریع در تمام مشخصات سند (شماره، تاریخ، طرف حساب، اقلام و سریال‌ها...)"
              className="w-full pl-8 pr-9 py-2 bg-slate-50 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:bg-white dark:focus:bg-[#1c212b] focus:border-[#0067C0] dark:focus:border-[#4cc2ff] focus:ring-2 focus:ring-[#0067C0]/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-normal"
            />
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute right-3 top-2.5" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition-colors"
                title="پاک کردن متن جستجو"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Form Template Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-[#181c24] border border-slate-300 dark:border-[#384252] rounded-lg px-2.5 py-1.5">
            <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px] font-medium">نوع فرم:</span>
            <select
              value={filterFormId}
              onChange={(e) => setFilterFormId(e.target.value)}
              className="bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">تمام فرم‌ها و اسناد</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          {/* Advanced Search Accordion Toggle Button */}
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
              isAdvancedOpen || activeAdvancedCount > 0
                ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0067C0] dark:text-[#4cc2ff] border-blue-300 dark:border-blue-800 shadow-2xs'
                : 'bg-slate-100 dark:bg-[#202632] hover:bg-slate-200 dark:hover:bg-[#2a3240] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="نمایش یا پنهان‌سازی فیلدهای جستجوی پیشرفته (شماره سند، مشتری، تاریخ و اقلام)"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
            <span>فیلترهای پیشرفته</span>
            {activeAdvancedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#0067C0] dark:bg-[#0078D4] text-white text-[10px] flex items-center justify-center font-mono font-bold">
                {toPersianDigits(activeAdvancedCount)}
              </span>
            )}
            {isAdvancedOpen ? (
              <ChevronUp className="w-3.5 h-3.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            )}
          </button>

          {/* View Switcher Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#181c24] rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 select-none">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#2a313d] text-[#0067C0] dark:text-[#4cc2ff] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="نمای کارتی با تصاویر بندانگشتی فرم‌ها"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>بندانگشتی</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-[#2a313d] text-[#0067C0] dark:text-[#4cc2ff] shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
              title="نمای جدولی استاندارد"
            >
              <List className="w-3.5 h-3.5" />
              <span>جدولی</span>
            </button>
          </div>

          {/* Quick Clear All Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs rounded-lg transition-colors cursor-pointer font-medium"
              title="پاک‌سازی تمام فیلترهای اعمال‌شده"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌سازی فیلترها</span>
            </button>
          )}
        </div>

        {/* Collapsible Advanced Criteria Panel */}
        {isAdvancedOpen && (
          <div className="bg-slate-50/90 dark:bg-[#1a202a] p-4 border-t border-slate-200 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
            {/* Field 1: Document Number */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-xs">
                <Hash className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                <span>شماره سند یا کد رهگیری:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={documentNumber}
                  onChange={(e) => setDocumentNumber(e.target.value)}
                  placeholder="مثال: DOC-1403-0001 یا 0002"
                  className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#222731] border border-slate-300 dark:border-[#384252] rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff] focus:ring-1 focus:ring-[#0067C0]/20 font-mono"
                />
                {documentNumber && (
                  <button
                    type="button"
                    onClick={() => setDocumentNumber('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                فیلتر در شماره سند، کد فرم، سریال رهگیری و فاکتور
              </p>
            </div>

            {/* Field 2: Customer / Counterparty */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-xs">
                <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>نام مشتری / طرف حساب / تحویل‌گیرنده:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="مثال: شرکت آریا، پتروشیمی، علی رضایی..."
                  className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#222731] border border-slate-300 dark:border-[#384252] rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff] focus:ring-1 focus:ring-[#0067C0]/20"
                />
                {customerName && (
                  <button
                    type="button"
                    onClick={() => setCustomerName('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                فیلتر در خریدار، فروشنده، تحویل‌گیرنده و واحد درخواست‌کننده
              </p>
            </div>

            {/* Field 3: Product / Item / Serial */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-xs">
                <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>کد، شرح کالا یا شماره سریال اقلام:</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={itemQuery}
                  onChange={(e) => setItemQuery(e.target.value)}
                  placeholder="مثال: K-1001، کابل شبکه، MTR-2026..."
                  className="w-full pl-7 pr-3 py-1.5 bg-white dark:bg-[#222731] border border-slate-300 dark:border-[#384252] rounded-lg text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff] focus:ring-1 focus:ring-[#0067C0]/20"
                />
                {itemQuery && (
                  <button
                    type="button"
                    onClick={() => setItemQuery('')}
                    className="absolute left-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="پاک کردن"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">
                جستجو در سطرهای جدول کالاها و شماره سریال‌های اقلام
              </p>
            </div>

            {/* Field 4: Date Range Filter with Presets */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200 text-xs">
                <CalendarRange className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>بازه تاریخی ثبت و صدور (شمسی):</span>
              </label>
              <div className="flex items-center gap-1.5">
                <div className="flex-1 flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">از:</span>
                  <ShamsiDatePicker
                    compact
                    value={dateFrom}
                    onChange={(val) => handleManualDateChange(val, dateTo)}
                    placeholder="۱۴۰۳/۰۱/۰۱"
                    className="w-full"
                  />
                </div>
                <div className="flex-1 flex items-center gap-1">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 whitespace-nowrap">تا:</span>
                  <ShamsiDatePicker
                    compact
                    value={dateTo}
                    onChange={(val) => handleManualDateChange(dateFrom, val)}
                    placeholder="۱۴۰۵/۱۲/۲۹"
                    className="w-full"
                  />
                </div>
              </div>
              {/* Presets Chips */}
              <div className="flex flex-wrap items-center gap-1 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleQuickPreset('all')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === 'all'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  همه
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('today')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === 'today'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  امروز
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('7days')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === '7days'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  ۷ روز
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('30days')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === '30days'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  ۳۰ روز
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('thisMonth')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === 'thisMonth'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  این ماه
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPreset('thisYear')}
                  className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                    activePreset === 'thisYear'
                      ? 'bg-[#0067C0] text-white font-medium'
                      : 'bg-white dark:bg-[#252b36] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-[#2e3644]'
                  }`}
                >
                  امسال
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Row 3: Active Filter Badges & Live Status */}
        <div className="px-3.5 py-2 bg-slate-50/60 dark:bg-[#1a1e27] border-t border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
          {/* Active Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-[#0067C0] dark:text-[#4cc2ff]" />
              <span>فیلترهای فعال:</span>
            </span>

            {!isFiltered && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                بدون فیلتر (نمایش تمامی اسناد بایگانی)
              </span>
            )}

            {documentNumber.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-[#0067C0] dark:text-[#4cc2ff] text-[11px] font-medium border border-blue-200 dark:border-blue-800 shadow-2xs">
                <span>شماره سند:</span>
                <strong className="font-mono">{documentNumber}</strong>
                <button
                  type="button"
                  onClick={() => setDocumentNumber('')}
                  className="hover:text-blue-900 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف این فیلتر"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {customerName.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800 shadow-2xs">
                <span>مشتری:</span>
                <strong>{customerName}</strong>
                <button
                  type="button"
                  onClick={() => setCustomerName('')}
                  className="hover:text-emerald-950 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف این فیلتر"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {itemQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-medium border border-amber-200 dark:border-amber-800 shadow-2xs">
                <span>کالا/سریال:</span>
                <strong>{itemQuery}</strong>
                <button
                  type="button"
                  onClick={() => setItemQuery('')}
                  className="hover:text-amber-950 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف این فیلتر"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(dateFrom || dateTo) && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200 dark:border-indigo-800 shadow-2xs">
                <span>بازه زمانی:</span>
                <span className="font-mono text-[10px]">
                  {dateFrom ? toPersianDigits(dateFrom) : 'شروع'} تا {dateTo ? toPersianDigits(dateTo) : 'امروز'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom('');
                    setDateTo('');
                    setActivePreset('all');
                  }}
                  className="hover:text-indigo-950 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف فیلتر تاریخ"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {filterFormId !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[11px] font-medium border border-purple-200 dark:border-purple-800 shadow-2xs">
                <span>نوع فرم:</span>
                <strong className="truncate max-w-[140px]">{getTemplateTitle(filterFormId)}</strong>
                <button
                  type="button"
                  onClick={() => setFilterFormId('all')}
                  className="hover:text-purple-950 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف فیلتر نوع سند"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {searchQuery.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-medium shadow-2xs">
                <span>عبارت:</span>
                <strong>{searchQuery}</strong>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-slate-900 dark:hover:text-white p-0.5 cursor-pointer"
                  title="حذف عبارت جستجو"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          {/* Results Summary Counter */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-600 dark:text-slate-300 bg-white dark:bg-[#202530] px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700/80 shadow-2xs">
              نمایش <strong className="text-[#0067C0] dark:text-[#4cc2ff] font-bold">{toPersianDigits(filteredRecords.length)}</strong> از {toPersianDigits(records.length)} سند
            </span>
          </div>
        </div>
      </div>

      {/* Records Content Area (Grid with Thumbnails OR Table View) */}
      <div className="bg-white dark:bg-[#222731] rounded-lg border border-slate-300 dark:border-[#384252] shadow-2xs overflow-hidden flex-1 flex flex-col transition-colors">
        {filteredRecords.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 dark:text-slate-500">
            <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
            <h3 className="text-xs font-semibold text-slate-700 dark:text-slate-300">هیچ رکوردی یافت نشد</h3>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-sm mt-1">
              {isFiltered
                ? 'با فیلترهای تاریخ یا عبارت جستجوی فعلی رکوردی پیدا نشد. می‌توانید با دکمه پاک‌سازی فیلترها تمام اسناد را مشاهده کنید.'
                : 'هنوز فرمی ثبت نشده است.'}
            </p>
            {isFiltered ? (
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 bg-[#0067C0] dark:bg-[#0078D4] text-white text-xs rounded hover:bg-[#005a9e] dark:hover:bg-[#006cbd] transition-colors"
              >
                نمایش همه اسناد
              </button>
            ) : (
              <button
                onClick={onNewRecord}
                className="mt-3 px-3 py-1.5 bg-[#0067C0] dark:bg-[#0078D4] text-white text-xs rounded hover:bg-[#005a9e] dark:hover:bg-[#006cbd] transition-colors"
              >
                پر کردن و ثبت اولین فرم
              </button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          /* VIEW MODE 1: VISUAL THUMBNAIL CARDS GRID */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredRecords.map((rec) => {
                const currentTpl = templates.find((t) => t.id === rec.formId) || activeTemplate;
                const itemsCount = rec.tableData
                  ? Object.values(rec.tableData).flat().filter((r) => r.description?.trim()).length
                  : 0;

                return (
                  <div
                    key={rec.id}
                    className="bg-slate-50 dark:bg-[#1b2029] rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                  >
                    {/* Card Top: Number, Date, Status */}
                    <div className="p-3 bg-white dark:bg-[#222731] border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span className="font-mono font-bold text-xs text-[#0067C0] dark:text-[#4cc2ff]">
                          {rec.recordNumber}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('fa-IR') : '—'}
                      </span>
                    </div>

                    {/* Miniature Visual Document Thumbnail */}
                    <div
                      className="p-3 flex items-center justify-center bg-slate-100/60 dark:bg-[#13171e]/70 border-b border-slate-200 dark:border-slate-700/60"
                      onClick={() => setPreviewRecord(rec)}
                    >
                      <DocumentThumbnail
                        record={rec}
                        template={currentTpl}
                        size="md"
                        onClick={() => setPreviewRecord(rec)}
                        onPrint={() => onPrintRecord(rec)}
                      />
                    </div>

                    {/* Card Info & Meta */}
                    <div className="p-3 space-y-1.5 text-xs flex-1">
                      <div className="font-bold text-slate-800 dark:text-slate-200 truncate" title={currentTpl.title}>
                        {currentTpl.title}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>تعداد اقلام:</span>
                        <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                          {toPersianDigits(itemsCount)} ردیف
                        </span>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-3 py-2 bg-white dark:bg-[#222731] border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-1">
                      <button
                        onClick={() => onLoadRecord(rec)}
                        className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0067C0] dark:bg-blue-950/60 dark:hover:bg-blue-900/80 dark:text-[#4cc2ff] text-[11px] font-semibold transition-colors"
                        title="ویرایش و باز کردن سند در بوم"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>ویرایش</span>
                      </button>

                      <button
                        onClick={() => onPrintRecord(rec)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
                        title="چاپ فوری این سند"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`آیا از حذف رکورد ${rec.recordNumber} مطمئن هستید؟`)) {
                            onDeleteRecord(rec.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950/60 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                        title="حذف رکورد"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* VIEW MODE 2: TABLE VIEW WITH THUMBNAIL COLUMN */
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-right border-collapse text-xs">
              <thead className="bg-[#f8fafc] dark:bg-[#1c212a] text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-[#2f3745] text-[11px]">
                <tr>
                  <th className="p-3 w-10 text-center">ردیف</th>
                  <th className="p-2 w-28 text-center">تصویر سند</th>
                  <th className="p-3 w-36">شماره رهگیری / سند</th>
                  <th className="p-3">نوع فرم</th>
                  <th className="p-3">خلاصه اطلاعات (مشتری، نامه، کالا)</th>
                  <th className="p-3 w-32">تاریخ ایجاد</th>
                  <th className="p-3 w-40 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#2f3745]">
                {filteredRecords.map((rec, idx) => {
                  const currentTpl = templates.find((t) => t.id === rec.formId) || activeTemplate;
                  // Extract preview summary text from recorded data or default values
                  const summaryValues: string[] = [];
                  for (const field of currentTpl.fields) {
                    if (['divider', 'header_banner'].includes(field.type)) continue;
                    const val = rec.data[field.id] ?? field.defaultValue;
                    if (val !== undefined && val !== null && String(val).trim() !== '' && typeof val !== 'boolean') {
                      summaryValues.push(`${field.label}: ${toPersianDigits(String(val))}`);
                    }
                    if (summaryValues.length >= 2) break;
                  }

                  // If table has product rows, also display a sample row snippet (e.g. product code / description / serial)
                  if (rec.tableData) {
                    const tableRows = Object.values(rec.tableData).flat();
                    if (tableRows.length > 0 && tableRows[0]) {
                      const firstRow = tableRows[0];
                      const parts: string[] = [];
                      if (firstRow.productCode) parts.push(`کد: ${firstRow.productCode}`);
                      if (firstRow.description) parts.push(`شرح: ${firstRow.description}`);
                      if (firstRow.serialNumber) parts.push(`سریال: ${firstRow.serialNumber}`);
                      if (parts.length > 0 && summaryValues.length < 3) {
                        summaryValues.push(parts.join(' | '));
                      }
                    }
                  }

                  return (
                    <tr key={rec.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-center text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                        {toPersianDigits(idx + 1)}
                      </td>
                      <td className="p-2 text-center">
                        <div className="flex justify-center">
                          <DocumentThumbnail
                            record={rec}
                            template={currentTpl}
                            size="sm"
                            onClick={() => setPreviewRecord(rec)}
                            onPrint={() => onPrintRecord(rec)}
                          />
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium text-[#0067C0] dark:text-[#4cc2ff]">
                        {rec.recordNumber}
                      </td>
                      <td className="p-3 text-slate-800 dark:text-slate-200 font-medium">
                        {getTemplateTitle(rec.formId)}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400 truncate max-w-md">
                        {summaryValues.length > 0 ? summaryValues.join(' · ') : 'بدون خلاصه'}
                      </td>
                      <td className="p-3 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('fa-IR') : '—'}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onLoadRecord(rec)}
                            className="p-1.5 rounded hover:bg-blue-100 dark:hover:bg-blue-950/60 text-[#0067C0] dark:text-[#4cc2ff] transition-colors"
                            title="باز کردن و ویرایش فرم در بوم"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onPrintRecord(rec)}
                            className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-[#2e3745] text-slate-700 dark:text-slate-200 transition-colors"
                            title="چاپ فوری این سند"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`آیا از حذف رکورد ${rec.recordNumber} مطمئن هستید؟`)) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950/60 text-red-600 dark:text-red-400 transition-colors"
                            title="حذف رکورد از دیتابیس"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Enlarged Thumbnail Preview Modal */}
      {previewRecord && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100"
          onClick={() => setPreviewRecord(null)}
        >
          <div
            className="bg-white dark:bg-[#1f2430] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 max-w-xl w-full overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  پیش‌نمایش سند {previewRecord.recordNumber}
                </span>
              </div>
              <button
                onClick={() => setPreviewRecord(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Large Miniature */}
            <div className="p-6 bg-slate-100/60 dark:bg-[#13161c] flex items-center justify-center">
              <DocumentThumbnail
                record={previewRecord}
                template={templates.find((t) => t.id === previewRecord.formId) || activeTemplate}
                size="lg"
              />
            </div>

            {/* Modal Footer: Action Buttons */}
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-[#1f2430]">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                تاریخ ثبت: {new Date(previewRecord.createdAt).toLocaleDateString('fa-IR')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onPrintRecord(previewRecord);
                    setPreviewRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>چاپ رسمی این سند</span>
                </button>
                <button
                  onClick={() => {
                    onLoadRecord(previewRecord);
                    setPreviewRecord(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#0067C0] hover:bg-[#005a9e] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Eye className="w-4 h-4" />
                  <span>بارگذاری و ویرایش در بوم</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

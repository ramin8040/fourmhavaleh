import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FormRecord, FormTemplate } from '../types/form';
import { toPersianDigits, filterFormRecords } from '../utils/formLogic';
import {
  Database,
  Search,
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  Trash2,
  Eye,
  Plus,
  FolderOpen,
  X,
  RotateCcw,
  CalendarRange,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  User,
  Hash,
  Package,
  FileDown,
} from 'lucide-react';
import { ShamsiDatePicker } from './ShamsiDatePicker';
import {
  formatShamsiDate,
  dateToShamsi,
  getDaysInJalaliMonth,
  isJalaliLeapYear,
} from '../utils/shamsiCalendar';
import { DocumentThumbnail } from './DocumentThumbnail';
import { RecordHoverPreview } from './RecordHoverPreview';
import { useViewportWidth } from '../utils/useViewportWidth';
import { shouldShowHoverPreview } from '../utils/responsiveLayout';

interface RecordsManagerProps {
  records: FormRecord[];
  templates: FormTemplate[];
  activeTemplate: FormTemplate;
  onLoadRecord: (record: FormRecord) => void;
  onDeleteRecord: (id: string) => void;
  onPrintRecord: (record: FormRecord) => void;
  onExportRecordPdf?: (record: FormRecord) => void;
  isExportingPdf?: boolean;
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
  onExportRecordPdf,
  isExportingPdf = false,
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
  const [activePreset, setActivePreset] = useState<
    'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'thisYear' | 'custom'
  >('all');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [previewRecord, setPreviewRecord] = useState<FormRecord | null>(null);
  const [pendingDeleteRecord, setPendingDeleteRecord] = useState<FormRecord | null>(null);
  const [hoveredPreview, setHoveredPreview] = useState<{
    record: FormRecord;
    template: FormTemplate;
    rect: DOMRect;
  } | null>(null);
  const hoverTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { viewportWidth } = useViewportWidth();
  const [hasFinePointer, setHasFinePointer] = useState<boolean>(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
      : true
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setHasFinePointer(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current !== null) {
        window.clearTimeout(hoverTimerRef.current);
      }
    };
  }, []);

  const handleRecordMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    record: FormRecord,
    template: FormTemplate
  ) => {
    if (previewRecord) return;
    if (!shouldShowHoverPreview(viewportWidth, hasFinePointer)) return;
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    hoverTimerRef.current = window.setTimeout(() => {
      setHoveredPreview({ record, template, rect });
    }, 140);
  };

  const handleRecordMouseLeave = () => {
    if (hoverTimerRef.current !== null) {
      window.clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    setHoveredPreview(null);
  };

  const handleQuickPreset = (
    preset: 'all' | 'today' | '7days' | '30days' | 'thisMonth' | 'thisYear'
  ) => {
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
    return found ? found.title : 'برگه سفارشی';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportBackupFile(file);
    }
  };

  return (
    <div className="relative z-0 flex-1 overflow-y-auto p-3 sm:p-5 md:p-6 flex flex-col gap-4 transition-colors">
      <div className="max-w-7xl w-full mx-auto flex flex-col gap-4 flex-1">
        {/* Friendly Liquid Glass Header */}
        <div className="relative z-10 liquid-glass rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/15 dark:bg-sky-400/20 border border-sky-400/35 flex items-center justify-center text-sky-700 dark:text-sky-300 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  برگه‌های من
                </h1>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="text-xs font-sans tabular-nums text-slate-600 dark:text-slate-300">
                  {toPersianDigits(records.length)} برگه ذخیره شده
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                همه برگه‌هایی که ساخته‌اید اینجاست؛ روی هر برگه بزنید تا دوباره باز یا چاپ شود.
              </p>
            </div>
          </div>

          {/* Global Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onNewRecord}
              className="h-11 px-4 rounded-2xl liquid-cta text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ساخت برگه جدید</span>
            </button>

            <button
              type="button"
              onClick={onExportCsv}
              className="h-11 px-3.5 rounded-2xl liquid-cta-success text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
              title="خروجی اکسل از جدول برگه‌ها"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>فایل اکسل</span>
            </button>

            <button
              type="button"
              onClick={onExportBackup}
              className="h-11 px-3.5 rounded-2xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              title="ذخیره نسخه پشتیبان"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">پشتیبان</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 px-3.5 rounded-2xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 text-xs font-semibold flex items-center justify-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer"
              title="بازیابی از فایل پشتیبان"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">بازیابی</span>
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

        {/* Calm Search & Filter Bar (layered above Records Content Area) */}
        <div className="relative z-30 liquid-glass rounded-3xl overflow-visible text-xs">
          <div className="p-3.5 flex flex-wrap items-center gap-2.5">
            {/* Quick Search */}
            <div className="relative z-10 focus-within:z-20 w-full sm:flex-1 sm:min-w-[220px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="دنبال چه برگه‌ای هستید؟ (نام مشتری، شماره، اسم کالا...)"
                aria-label="جستجو در برگه‌های ذخیره شده"
                className="relative z-10 w-full h-11 pl-9 pr-10 liquid-glass-well rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40 placeholder:text-slate-500 dark:placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute right-3.5 top-3.5 z-20 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-3 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white p-0.5 rounded transition-colors cursor-pointer"
                  title="پاک کردن جستجو"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Form Template Filter */}
            <div className="relative z-10 focus-within:z-20 h-11 flex items-center gap-2 liquid-glass-well rounded-2xl px-3">
              <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs font-medium">
                نوع برگه:
              </span>
              <select
                value={filterFormId}
                onChange={(e) => setFilterFormId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 outline-none cursor-pointer max-w-[150px] truncate"
              >
                <option value="all">همه برگه‌ها</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Advanced Search Toggle */}
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`h-11 flex items-center gap-1.5 px-3.5 rounded-2xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                isAdvancedOpen || activeAdvancedCount > 0
                  ? 'bg-sky-500/15 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200 border border-sky-400/40'
                  : 'liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>جستجوی دقیق‌تر</span>
              {activeAdvancedCount > 0 && (
                <span className="font-sans tabular-nums font-bold">
                  ({toPersianDigits(activeAdvancedCount)})
                </span>
              )}
              {isAdvancedOpen ? (
                <ChevronUp className="w-3.5 h-3.5 opacity-70" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="h-11 flex items-center liquid-glass-well rounded-2xl p-1 select-none">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'liquid-cta text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>کارت</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`h-9 flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'liquid-cta text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>جدول</span>
              </button>
            </div>

            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="h-11 flex items-center gap-1.5 px-3.5 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-rose-700 dark:text-rose-200 text-xs rounded-2xl transition-colors cursor-pointer font-semibold whitespace-nowrap"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک کردن فیلترها</span>
              </button>
            )}
          </div>

          {/* Collapsible Advanced Criteria Panel */}
          {isAdvancedOpen && (
            <div className="relative z-20 bg-white/55 dark:bg-slate-900/55 p-4 border-t border-slate-300/40 dark:border-white/10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5 relative z-10 focus-within:z-20">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs">
                  <Hash className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300" />
                  <span>شماره برگه:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    placeholder="مثلاً DOC-1403-0001"
                    className="relative z-10 w-full h-10 pl-7 pr-3 liquid-glass-well rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40 font-mono"
                  />
                  {documentNumber && (
                    <button
                      type="button"
                      onClick={() => setDocumentNumber('')}
                      className="absolute left-2 top-2.5 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 relative z-10 focus-within:z-20">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs">
                  <User className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>نام مشتری / تحویل‌گیرنده:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثلاً شرکت آریا"
                    className="relative z-10 w-full h-10 pl-7 pr-3 liquid-glass-well rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                  {customerName && (
                    <button
                      type="button"
                      onClick={() => setCustomerName('')}
                      className="absolute left-2 top-2.5 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 relative z-10 focus-within:z-20">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs">
                  <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>نام کالا یا سریال:</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={itemQuery}
                    onChange={(e) => setItemQuery(e.target.value)}
                    placeholder="مثلاً کابل شبکه"
                    className="relative z-10 w-full h-10 pl-7 pr-3 liquid-glass-well rounded-xl text-xs text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-sky-500/40"
                  />
                  {itemQuery && (
                    <button
                      type="button"
                      onClick={() => setItemQuery('')}
                      className="absolute left-2 top-2.5 z-20 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-1.5 relative z-20">
                <label className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100 text-xs">
                  <CalendarRange className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>تاریخ برگه:</span>
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5">
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">از:</span>
                    <ShamsiDatePicker
                      compact
                      value={dateFrom}
                      onChange={(val) => handleManualDateChange(val, dateTo)}
                      placeholder="۱۴۰۳/۰۱/۰۱"
                      className="w-full"
                    />
                  </div>
                  <div className="flex-1 flex items-center gap-1">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">تا:</span>
                    <ShamsiDatePicker
                      compact
                      value={dateTo}
                      onChange={(val) => handleManualDateChange(dateFrom, val)}
                      placeholder="۱۴۰۵/۱۲/۲۹"
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {(
                    [
                      ['all', 'همه'],
                      ['today', 'امروز'],
                      ['7days', '۷ روز'],
                      ['30days', '۳۰ روز'],
                      ['thisMonth', 'این ماه'],
                      ['thisYear', 'امسال'],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleQuickPreset(key)}
                      className={`px-2 py-0.5 text-[11px] rounded-lg transition-colors cursor-pointer ${
                        activePreset === key
                          ? 'liquid-cta text-white font-semibold'
                          : 'liquid-glass-well text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quiet Filter Summary Footer */}
          <div className="relative z-10 px-4 py-2.5 bg-white/35 dark:bg-slate-900/35 border-t border-slate-300/40 dark:border-white/10 rounded-b-3xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-2 text-slate-600 dark:text-slate-300">
              {!isFiltered ? (
                <span>نمایش همه برگه‌ها</span>
              ) : (
                <>
                  {documentNumber.trim() && (
                    <button
                      type="button"
                      onClick={() => setDocumentNumber('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl liquid-glass-well text-sky-800 dark:text-sky-200 font-medium cursor-pointer"
                    >
                      <span>شماره: {documentNumber}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {customerName.trim() && (
                    <button
                      type="button"
                      onClick={() => setCustomerName('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl liquid-glass-well text-emerald-800 dark:text-emerald-200 font-medium cursor-pointer"
                    >
                      <span>مشتری: {customerName}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {itemQuery.trim() && (
                    <button
                      type="button"
                      onClick={() => setItemQuery('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl liquid-glass-well text-amber-800 dark:text-amber-200 font-medium cursor-pointer"
                    >
                      <span>کالا: {itemQuery}</span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {(dateFrom || dateTo) && (
                    <button
                      type="button"
                      onClick={() => {
                        setDateFrom('');
                        setDateTo('');
                        setActivePreset('all');
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl liquid-glass-well font-sans tabular-nums text-indigo-800 dark:text-indigo-200 font-medium cursor-pointer"
                    >
                      <span>
                        {dateFrom ? toPersianDigits(dateFrom) : 'شروع'} تا{' '}
                        {dateTo ? toPersianDigits(dateTo) : 'امروز'}
                      </span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  {filterFormId !== 'all' && (
                    <button
                      type="button"
                      onClick={() => setFilterFormId('all')}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl liquid-glass-well font-medium cursor-pointer"
                    >
                      <span className="truncate max-w-[140px]">
                        {getTemplateTitle(filterFormId)}
                      </span>
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </>
              )}
            </div>

            <span className="text-xs font-sans tabular-nums text-slate-600 dark:text-slate-300">
              نمایش <strong className="text-sky-700 dark:text-sky-300">{toPersianDigits(filteredRecords.length)}</strong> از{' '}
              {toPersianDigits(records.length)} برگه
            </span>
          </div>
        </div>

        {/* Records Content Area */}
        <div className="relative z-10 liquid-glass rounded-3xl overflow-hidden flex-1 flex flex-col min-h-[420px]">
          {filteredRecords.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center min-h-[380px]">
              <FolderOpen className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-3" />
              <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
                هیچ برگه‌ای پیدا نشد
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-sm mt-1">
                {isFiltered
                  ? 'با جستجوی فعلی چیزی پیدا نشد. می‌توانید جستجو را پاک کنید.'
                  : 'هنوز هیچ برگه‌ای ذخیره نکرده‌اید. همین حالا اولین برگه را بسازید!'}
              </p>
              {isFiltered ? (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-4 px-5 py-2.5 rounded-2xl liquid-cta text-xs font-bold cursor-pointer"
                >
                  نشان دادن همه برگه‌ها
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onNewRecord}
                  className="mt-4 px-5 py-2.5 rounded-2xl liquid-cta text-xs font-bold cursor-pointer"
                >
                  ساخت اولین برگه
                </button>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div
              onScroll={() => setHoveredPreview(null)}
              className="flex-1 overflow-y-auto p-4 sm:p-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredRecords.map((rec) => {
                  const currentTpl =
                    templates.find((t) => t.id === rec.formId) || activeTemplate;
                  const itemsCount = rec.tableData
                    ? Object.values(rec.tableData)
                        .flat()
                        .filter((r) => r.description?.trim()).length
                    : 0;

                  return (
                    <div
                      key={rec.id}
                      data-testid="record-grid-card"
                      data-record-id={rec.id}
                      onMouseEnter={(e) => handleRecordMouseEnter(e, rec, currentTpl)}
                      onMouseLeave={handleRecordMouseLeave}
                      className="relative z-0 hover:z-20 focus-within:z-20 liquid-glass-elevated rounded-3xl hover:-translate-y-0.5 transition-all flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top row */}
                      <div className="px-3.5 py-2.5 bg-white/40 dark:bg-slate-900/40 border-b border-slate-300/35 dark:border-white/10 flex items-center justify-between gap-2">
                        <span className="font-mono font-bold text-xs text-sky-700 dark:text-sky-300 truncate">
                          {rec.recordNumber}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans tabular-nums shrink-0">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('fa-IR') : '—'}
                        </span>
                      </div>

                      {/* Thumbnail Preview */}
                      <div
                        className="p-3.5 flex items-center justify-center bg-white/25 dark:bg-slate-950/30 border-b border-slate-300/35 dark:border-white/10 cursor-pointer"
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

                      {/* Title & Info */}
                      <div className="p-3.5 space-y-1 text-xs flex-1">
                        <div
                          className="font-bold text-slate-900 dark:text-white truncate"
                          title={currentTpl.title}
                        >
                          {currentTpl.title}
                        </div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-sans tabular-nums">
                          {toPersianDigits(itemsCount)} کالا در برگه
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="px-3.5 py-2.5 bg-white/35 dark:bg-slate-900/35 border-t border-slate-300/35 dark:border-white/10 flex items-center justify-between gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadRecord(rec)}
                          className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-xl liquid-cta text-xs font-bold cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>باز کردن</span>
                        </button>

                        {onExportRecordPdf && (
                          <button
                            type="button"
                            data-testid="record-card-pdf-btn"
                            disabled={isExportingPdf}
                            aria-label={`خروجی PDF برگه ${rec.recordNumber}`}
                            onClick={() => onExportRecordPdf(rec)}
                            className="w-9 h-9 rounded-xl liquid-glass-well flex items-center justify-center text-rose-600 dark:text-rose-300 hover:bg-rose-500/15 disabled:opacity-50 transition-colors cursor-pointer"
                            title="دانلود فایل PDF"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => onPrintRecord(rec)}
                          className="w-9 h-9 rounded-xl liquid-glass-well flex items-center justify-center text-emerald-700 dark:text-emerald-300 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                          title="چاپ فوری"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          data-testid="record-card-delete-btn"
                          aria-label={`حذف برگه ${rec.recordNumber}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setHoveredPreview(null);
                            setPendingDeleteRecord(rec);
                          }}
                          className="w-9 h-9 rounded-xl liquid-glass-well flex items-center justify-center text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors cursor-pointer"
                          title="حذف برگه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div
              onScroll={() => setHoveredPreview(null)}
              className="overflow-x-auto flex-1"
            >
              <table className="w-full min-w-[700px] text-right border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-700 dark:text-slate-200 font-semibold border-b border-slate-300/40 dark:border-white/10">
                  <tr>
                    <th className="p-3 w-10 text-center">ردیف</th>
                    <th className="p-2 w-28 text-center">تصویر برگه</th>
                    <th className="p-3 w-36">شماره برگه</th>
                    <th className="p-3">نوع برگه</th>
                    <th className="p-3">خلاصه</th>
                    <th className="p-3 w-32">تاریخ</th>
                    <th className="p-3 w-36 text-center">کارها</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/30 dark:divide-white/10">
                  {filteredRecords.map((rec, idx) => {
                    const currentTpl =
                      templates.find((t) => t.id === rec.formId) || activeTemplate;
                    const summaryValues: string[] = [];
                    for (const field of currentTpl.fields) {
                      if (['divider', 'header_banner'].includes(field.type)) continue;
                      const val = rec.data[field.id] ?? field.defaultValue;
                      if (
                        val !== undefined &&
                        val !== null &&
                        String(val).trim() !== '' &&
                        typeof val !== 'boolean'
                      ) {
                        summaryValues.push(`${field.label}: ${toPersianDigits(String(val))}`);
                      }
                      if (summaryValues.length >= 2) break;
                    }

                    if (rec.tableData) {
                      const tableRows = Object.values(rec.tableData).flat();
                      if (tableRows.length > 0 && tableRows[0]) {
                        const firstRow = tableRows[0];
                        const parts: string[] = [];
                        if (firstRow.description) parts.push(firstRow.description);
                        if (firstRow.serialNumber) parts.push(`سریال: ${firstRow.serialNumber}`);
                        if (parts.length > 0 && summaryValues.length < 3) {
                          summaryValues.push(parts.join(' · '));
                        }
                      }
                    }

                    return (
                      <tr
                        key={rec.id}
                        data-testid="record-list-row"
                        data-record-id={rec.id}
                        onMouseEnter={(e) => handleRecordMouseEnter(e, rec, currentTpl)}
                        onMouseLeave={handleRecordMouseLeave}
                        className="hover:bg-white/45 dark:hover:bg-slate-800/35 transition-colors"
                      >
                        <td className="p-3 text-center text-slate-500 dark:text-slate-400 font-sans tabular-nums">
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
                        <td className="p-3 font-mono font-semibold text-sky-700 dark:text-sky-300">
                          {rec.recordNumber}
                        </td>
                        <td className="p-3 text-slate-900 dark:text-white font-semibold">
                          {getTemplateTitle(rec.formId)}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 truncate max-w-md">
                          {summaryValues.length > 0 ? summaryValues.join(' · ') : 'بدون توضیحات'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-sans tabular-nums">
                          {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString('fa-IR') : '—'}
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => onLoadRecord(rec)}
                              className="p-2 rounded-xl hover:bg-sky-500/15 text-sky-700 dark:text-sky-300 transition-colors cursor-pointer"
                              title="باز کردن برگه"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {onExportRecordPdf && (
                              <button
                                type="button"
                                data-testid="record-row-pdf-btn"
                                disabled={isExportingPdf}
                                aria-label={`خروجی PDF برگه ${rec.recordNumber}`}
                                onClick={() => onExportRecordPdf(rec)}
                                className="p-2 rounded-xl hover:bg-rose-500/15 text-rose-600 dark:text-rose-300 disabled:opacity-50 transition-colors cursor-pointer"
                                title="دانلود PDF"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => onPrintRecord(rec)}
                              className="p-2 rounded-xl hover:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 transition-colors cursor-pointer"
                              title="چاپ برگه"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              data-testid="record-row-delete-btn"
                              aria-label={`حذف برگه ${rec.recordNumber}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setHoveredPreview(null);
                                setPendingDeleteRecord(rec);
                              }}
                              className="p-2 rounded-xl hover:bg-rose-500/15 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                              title="حذف برگه"
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
      </div>

      {/* Enlarged Thumbnail Preview Modal (Portaled to Top Layer) */}
      {previewRecord &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            style={{ zIndex: 9990 }}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewRecord(null)}
          >
            <div
              className="liquid-glass-elevated bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-3xl max-w-xl w-full overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="px-5 py-3.5 border-b border-slate-300/40 dark:border-white/10 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">
                  پیش‌نمایش برگه {previewRecord.recordNumber}
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewRecord(null)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 bg-white/30 dark:bg-slate-950/35 flex items-center justify-center">
                <DocumentThumbnail
                  record={previewRecord}
                  template={templates.find((t) => t.id === previewRecord.formId) || activeTemplate}
                  size="lg"
                />
              </div>

              <div className="px-5 py-3.5 border-t border-slate-300/40 dark:border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <span className="text-xs text-slate-600 dark:text-slate-300 font-sans tabular-nums">
                  تاریخ ثبت: {new Date(previewRecord.createdAt).toLocaleDateString('fa-IR')}
                </span>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  {onExportRecordPdf && (
                    <button
                      type="button"
                      data-testid="record-preview-pdf-btn"
                      disabled={isExportingPdf}
                      onClick={() => {
                        onExportRecordPdf(previewRecord);
                        setPreviewRecord(null);
                      }}
                      className="h-10 px-4 rounded-xl liquid-glass-well border border-rose-400/40 bg-rose-500/12 hover:bg-rose-500/20 text-rose-700 dark:text-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      <FileDown className="w-4 h-4" />
                      <span>دانلود PDF</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onPrintRecord(previewRecord);
                      setPreviewRecord(null);
                    }}
                    className="h-10 px-4 rounded-xl liquid-cta-success text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>چاپ برگه</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onLoadRecord(previewRecord);
                      setPreviewRecord(null);
                    }}
                    className="h-10 px-4 rounded-xl liquid-cta text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>باز کردن و ویرایش</span>
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* In-App Delete Confirmation Dialog (Portaled to Top Layer, iframe-safe) */}
      {pendingDeleteRecord &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-record-dialog-title"
            data-testid="record-delete-confirm-modal"
            style={{ zIndex: 9992 }}
            className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPendingDeleteRecord(null)}
          >
            <div
              className="liquid-glass-elevated bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-3xl max-w-sm w-full p-5 space-y-4 text-right"
              onClick={(e) => e.stopPropagation()}
              dir="rtl"
            >
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/15 border border-rose-400/40 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="space-y-1 min-w-0">
                  <h3
                    id="delete-record-dialog-title"
                    className="text-sm font-bold text-slate-900 dark:text-white leading-snug"
                  >
                    حذف برگه {pendingDeleteRecord.recordNumber}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    آیا مطمئن هستید که می‌خواهید این برگه را از فهرست «برگه‌های من» حذف کنید؟
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  data-testid="cancel-delete-record-btn"
                  onClick={() => setPendingDeleteRecord(null)}
                  className="h-10 px-4 rounded-xl liquid-glass-well text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="button"
                  data-testid="confirm-delete-record-btn"
                  onClick={() => {
                    const targetId = pendingDeleteRecord.id;
                    if (previewRecord?.id === targetId) {
                      setPreviewRecord(null);
                    }
                    setPendingDeleteRecord(null);
                    onDeleteRecord(targetId);
                  }}
                  className="h-10 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>بله، حذف شود</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Hover Quick Preview Popover */}
      {hoveredPreview && !previewRecord && !pendingDeleteRecord && (
        <RecordHoverPreview
          record={hoveredPreview.record}
          template={hoveredPreview.template}
          anchorRect={hoveredPreview.rect}
        />
      )}
    </div>
  );
};

import React, { useState } from 'react';
import {
  Layers,
  PenTool,
  Database,
  Printer,
  LayoutDashboard,
  Sparkles,
  Truck,
  PackageCheck,
  Wrench,
  FileCheck2,
  Receipt,
  FilePlus2,
  Save,
  Download,
  Upload,
  FileSpreadsheet,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  ShieldCheck,
  Sliders,
  Copy,
  Trash2,
  Eye
} from 'lucide-react';
import { FormTemplate, PaperSize, PageOrientation } from '../types/form';
import { RibbonTab } from './RibbonBar';
import { ThemeMode } from '../utils/theme';
import { toPersianDigits } from '../utils/formLogic';

interface AppVerticalSidebarProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  isFillMode: boolean;
  onToggleFillMode: (fillMode: boolean) => void;
  templates: FormTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (template: FormTemplate) => void;
  onSaveRecord: () => void;
  onQuickPrint: () => void;
  onPreviewPrint: () => void;
  onNewVoucher: () => void;
  onResetCanvas: () => void;
  onExportCsv: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onOpenTemplates: () => void;
  onOpenImageToForm?: () => void;
  onSaveActiveTemplate?: () => void;
  onDuplicateActiveTemplate?: () => void;
  onDeleteActiveTemplate?: () => void;
  recordsCount: number;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  documentNumber?: string;
}

export const AppVerticalSidebar: React.FC<AppVerticalSidebarProps> = ({
  activeTab,
  onTabChange,
  isFillMode,
  onToggleFillMode,
  templates,
  activeTemplateId,
  onSelectTemplate,
  onSaveRecord,
  onQuickPrint,
  onPreviewPrint,
  onNewVoucher,
  onResetCanvas,
  onExportCsv,
  onExportBackup,
  onImportBackup,
  onOpenTemplates,
  onOpenImageToForm,
  onSaveActiveTemplate,
  onDuplicateActiveTemplate,
  onDeleteActiveTemplate,
  recordsCount,
  themeMode = 'system',
  onThemeChange,
  documentNumber = '۱',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const voucherTypes = [
    {
      id: 'preset_dispatch_voucher',
      title: 'حواله خروج محصول',
      code: 'AW-ST-FO-008',
      color: 'blue',
      activeColorClass: 'from-blue-600 to-indigo-600 text-white shadow-blue-500/25',
      badgeColorClass: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      icon: <Truck className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'preset_foreign_goods_receipt',
      title: 'رسید کالا و قطعات خارجی',
      code: 'AW-ST-FO-008',
      color: 'emerald',
      activeColorClass: 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
      badgeColorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      icon: <PackageCheck className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'preset_repair_receipt',
      title: 'رسید تعمیرات تجهیزات',
      code: 'AW-ST-FO-008',
      color: 'amber',
      activeColorClass: 'from-amber-600 to-orange-600 text-white shadow-amber-500/25',
      badgeColorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'preset_repair_inquiry',
      title: 'استعلام درخواست تعمیرات',
      code: 'AW-ST-FO-008',
      color: 'purple',
      activeColorClass: 'from-purple-600 to-violet-600 text-white shadow-purple-500/25',
      badgeColorClass: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      icon: <FileCheck2 className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'preset_material_requisition',
      title: 'درخواست اقلام مصرفی',
      code: 'AW-ST-FO-008',
      color: 'cyan',
      activeColorClass: 'from-cyan-600 to-blue-600 text-white shadow-cyan-500/25',
      badgeColorClass: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      icon: <Layers className="w-4 h-4 text-cyan-500" />,
    },
    {
      id: 'preset_official_invoice',
      title: 'فاکتور رسمی کالا و خدمات',
      code: 'INV-1403',
      color: 'indigo',
      activeColorClass: 'from-indigo-600 to-purple-600 text-white shadow-indigo-500/25',
      badgeColorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      icon: <Receipt className="w-4 h-4 text-indigo-500" />,
    },
  ];

  return (
    <aside
      className={`h-full bg-white dark:bg-[#161719] border-l border-slate-200 dark:border-[#282a2e] flex flex-col shrink-0 select-none shadow-xl transition-all duration-300 z-30 ${
        isCollapsed ? 'w-[72px]' : 'w-[270px]'
      }`}
    >
      {/* 1. Sidebar Brand & Toggle Bar */}
      <div className="p-3 border-b border-slate-200/80 dark:border-[#26282c] flex items-center justify-between gap-2 bg-gradient-to-b from-slate-50 to-white dark:from-[#1a1b1e] dark:to-[#161719]">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-xs font-black tracking-tight text-slate-800 dark:text-slate-100 truncate">
                منوی مدیریت و صدور حواله
              </h1>
              <span className="text-[10px] font-bold text-blue-600 dark:text-[#4cc2ff] block truncate font-mono">
                AW-ST-FO-008
              </span>
            </div>
          </div>
        )}

        {isCollapsed && (
          <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Truck className="w-4 h-4" />
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#25272b] transition-colors"
          title={isCollapsed ? 'باز کردن منوی عمودی' : 'جمع کردن منو'}
        >
          {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* 2. Main Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 space-y-4 text-xs">
        {/* Navigation Tabs (Vertical) */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              بخش‌های اصلی سیستم
            </div>
          )}

          <nav className="space-y-1">
            {/* 1. Fill Mode */}
            <button
              onClick={() => {
                onTabChange('fill');
                onToggleFillMode(true);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-bold transition-all relative group ${
                activeTab === 'fill' && isFillMode
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222428] hover:text-blue-600 dark:hover:text-[#4cc2ff]'
              }`}
              title="صدور و تکمیل حواله / رسید انبار"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === 'fill' && isFillMode
                  ? 'bg-white/20 text-white'
                  : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-[#4cc2ff]'
              }`}>
                <Layers className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="text-xs">صدور و تکمیل سند</div>
                  <div className={`text-[10px] font-normal truncate ${
                    activeTab === 'fill' && isFillMode ? 'text-blue-100' : 'text-slate-400'
                  }`}>
                    ورود داده و کاردکس کالا
                  </div>
                </div>
              )}
            </button>

            {/* 2. Design Mode */}
            <button
              onClick={() => {
                onTabChange('design');
                onToggleFillMode(false);
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-bold transition-all relative group ${
                activeTab === 'design' && !isFillMode
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222428] hover:text-purple-600 dark:hover:text-purple-400'
              }`}
              title="طراحی و ویرایش فیلدها و ساختار جدول"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === 'design' && !isFillMode
                  ? 'bg-white/20 text-white'
                  : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
              }`}>
                <PenTool className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="text-xs">طراحی ساختار فرم</div>
                  <div className={`text-[10px] font-normal truncate ${
                    activeTab === 'design' && !isFillMode ? 'text-purple-100' : 'text-slate-400'
                  }`}>
                    ویرایش فیلدها و ستون‌ها
                  </div>
                </div>
              )}
            </button>

            {/* 3. Archive / Database */}
            <button
              onClick={() => onTabChange('database')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-bold transition-all relative group ${
                activeTab === 'database'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222428] hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
              title="بایگانی اسناد و پیگیری رکوردهای ثبت‌شده"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === 'database'
                  ? 'bg-white/20 text-white'
                  : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
              }`}>
                <Database className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden">
                  <div className="truncate">
                    <div className="text-xs">بایگانی و رهگیری</div>
                    <div className={`text-[10px] font-normal truncate ${
                      activeTab === 'database' ? 'text-emerald-100' : 'text-slate-400'
                    }`}>
                      جستجو و خروجی اکسل
                    </div>
                  </div>
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full font-mono shrink-0 mr-1 ${
                    activeTab === 'database'
                      ? 'bg-white text-emerald-700'
                      : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                  }`}>
                    {toPersianDigits(recordsCount)}
                  </span>
                </div>
              )}
            </button>

            {/* 4. Print & Export */}
            <button
              onClick={() => onTabChange('print')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-bold transition-all relative group ${
                activeTab === 'print'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222428] hover:text-cyan-600 dark:hover:text-cyan-400'
              }`}
              title="چاپ و تنظیمات خروجی استاندارد ویندوز"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === 'print'
                  ? 'bg-white/20 text-white'
                  : 'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400'
              }`}>
                <Printer className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="text-xs">چاپ و پیش‌نمایش</div>
                  <div className={`text-[10px] font-normal truncate ${
                    activeTab === 'print' ? 'text-cyan-100' : 'text-slate-400'
                  }`}>
                    چاپ رسمی و واترمارک
                  </div>
                </div>
              )}
            </button>

            {/* 5. Templates Manager */}
            <button
              onClick={() => onTabChange('templates')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-bold transition-all relative group ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#222428] hover:text-amber-600 dark:hover:text-amber-400'
              }`}
              title="مدیریت قالب‌های رسمی و سفارشی"
            >
              <div className={`p-1.5 rounded-lg shrink-0 ${
                activeTab === 'templates'
                  ? 'bg-white/20 text-white'
                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
              }`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 truncate">
                  <div className="text-xs">الگوها و قالب‌ها</div>
                  <div className={`text-[10px] font-normal truncate ${
                    activeTab === 'templates' ? 'text-amber-100' : 'text-slate-400'
                  }`}>
                    تعریف، ویرایش و کپی
                  </div>
                </div>
              )}
            </button>
          </nav>
        </div>

        {/* 3. Hero Feature CTA: AI Image to Form */}
        {onOpenImageToForm && (
          <div className="pt-1">
            {!isCollapsed ? (
              <button
                onClick={onOpenImageToForm}
                className="w-full text-right p-3 rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 border border-white/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="flex items-center gap-1.5 text-xs font-black">
                    <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                    <span>تبدیل عکس به فرم</span>
                  </span>
                  <span className="text-[9px] font-bold bg-white/25 px-2 py-0.5 rounded-full text-white">
                    هوشمند Vision
                  </span>
                </div>
                <p className="text-[11px] text-indigo-100 leading-tight">
                  تصویر فیزیکی حواله یا رسید را بدهید و فوراً فرم دیجیتال تحویل بگیرید.
                </p>
              </button>
            ) : (
              <button
                onClick={onOpenImageToForm}
                className="w-full flex items-center justify-center p-2.5 rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 text-white shadow-md shadow-violet-500/30 hover:scale-105 transition-transform"
                title="تبدیل عکس به فرم (هوش مصنوعی)"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
              </button>
            )}
          </div>
        )}

        {/* 4. Quick Voucher Selector List (انواع سند) */}
        <div>
          {!isCollapsed && (
            <div className="px-2 mb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>انواع حواله و رسیدها</span>
              <span className="text-slate-400 font-mono">۶ الگو</span>
            </div>
          )}

          <div className="space-y-1">
            {voucherTypes.map((vt) => {
              const isActive = activeTemplateId === vt.id;
              const matchingTemplate = templates.find((t) => t.id === vt.id);

              return (
                <button
                  key={vt.id}
                  onClick={() => {
                    if (matchingTemplate) {
                      onSelectTemplate(matchingTemplate);
                      onTabChange('fill');
                      onToggleFillMode(true);
                    }
                  }}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-right transition-all border ${
                    isActive
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500/50 text-blue-700 dark:text-[#4cc2ff] font-bold shadow-xs'
                      : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#202226]'
                  }`}
                  title={`${vt.title} (${vt.code})`}
                >
                  <div className="shrink-0">{vt.icon}</div>
                  {!isCollapsed && (
                    <div className="flex-1 truncate">
                      <div className="text-xs truncate">{vt.title}</div>
                    </div>
                  )}
                  {!isCollapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-[#4cc2ff] shrink-0"></span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Primary Action Buttons */}
        <div className="pt-2 border-t border-slate-200/80 dark:border-[#26282c] space-y-1.5">
          {!isCollapsed && (
            <div className="px-2 mb-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              عملیات پرکاربرد سند
            </div>
          )}

          {/* Save Action */}
          <button
            onClick={onSaveRecord}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 active:scale-98 transition-all ${
              isCollapsed ? 'p-2' : ''
            }`}
            title="ثبت سند جاری در بایگانی و صدور شماره رهگیری (Ctrl + S)"
          >
            <Save className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>ثبت در بایگانی انبار</span>}
          </button>

          {/* Quick Print Action */}
          <button
            onClick={onQuickPrint}
            className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-blue-600/20 active:scale-98 transition-all ${
              isCollapsed ? 'p-2' : ''
            }`}
            title="چاپ فوری سند با تنظیمات ویندوز (Ctrl + P)"
          >
            <Printer className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>چاپ فوری سند</span>}
          </button>

          {/* New Blank Voucher */}
          <button
            onClick={onNewVoucher}
            className={`w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl font-bold border border-slate-300 dark:border-[#383a3e] bg-slate-50 dark:bg-[#1f2125] hover:bg-slate-100 dark:hover:bg-[#282a2f] text-slate-700 dark:text-slate-200 transition-colors ${
              isCollapsed ? 'p-2' : ''
            }`}
            title="صدور حواله یا رسید جدید با ردیف‌های خالی"
          >
            <FilePlus2 className="w-4 h-4 text-blue-600 dark:text-[#4cc2ff] shrink-0" />
            {!isCollapsed && <span>سند جدید با ردیف خالی</span>}
          </button>

          {/* Contextual actions for Database / Templates */}
          {activeTab === 'database' && !isCollapsed && (
            <div className="pt-1.5 space-y-1">
              <button
                onClick={onExportCsv}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold hover:bg-emerald-100 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>خروجی اکسل (Excel/CSV)</span>
              </button>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={onExportBackup}
                  className="flex items-center justify-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#202226] text-slate-700 dark:text-slate-300 text-[10px] hover:bg-slate-50 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>دانلود پشتیبان</span>
                </button>
                <button
                  onClick={onImportBackup}
                  className="flex items-center justify-center gap-1 p-1.5 rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#202226] text-slate-700 dark:text-slate-300 text-[10px] hover:bg-slate-50 transition-colors"
                >
                  <Upload className="w-3 h-3" />
                  <span>بازیابی</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design' && !isCollapsed && (
            <div className="pt-1.5 space-y-1">
              <button
                onClick={onResetCanvas}
                className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 bg-red-50/70 dark:bg-red-950/20 text-red-700 dark:text-red-300 text-[11px] font-bold hover:bg-red-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>پاک‌سازی کامل بوم</span>
              </button>
              {onSaveActiveTemplate && (
                <button
                  onClick={onSaveActiveTemplate}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/70 dark:bg-blue-950/20 text-blue-700 dark:text-[#4cc2ff] text-[11px] font-bold hover:bg-blue-100 transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ذخیره تغییرات قالب</span>
                </button>
              )}
            </div>
          )}

          {activeTab === 'templates' && !isCollapsed && (
            <div className="pt-1.5 space-y-1">
              <button
                onClick={onOpenTemplates}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black shadow-md shadow-amber-600/20 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>پنجره مدیریت الگوها</span>
              </button>
              {onDuplicateActiveTemplate && (
                <button
                  onClick={onDuplicateActiveTemplate}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#333] bg-white dark:bg-[#202226] text-slate-700 dark:text-slate-300 text-[11px] font-medium hover:bg-slate-50 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>تکثیر به عنوان قالب جدید</span>
                </button>
              )}
              {onDeleteActiveTemplate && (
                <button
                  onClick={onDeleteActiveTemplate}
                  className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-[11px] hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف این قالب</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Sidebar Footer Utilities (Theme, Info, Status) */}
      <div className="p-2.5 border-t border-slate-200/80 dark:border-[#26282c] bg-slate-50/70 dark:bg-[#141517] flex items-center justify-between text-[11px]">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                سند #{toPersianDigits(documentNumber)}
              </span>
            </div>

            {/* Theme Toggle Buttons */}
            {onThemeChange && (
              <div className="flex items-center gap-0.5 bg-slate-200/70 dark:bg-[#202226] p-0.5 rounded-lg">
                <button
                  onClick={() => onThemeChange('light')}
                  className={`p-1 rounded transition-colors ${
                    themeMode === 'light'
                      ? 'bg-white text-amber-500 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="تم روشن"
                >
                  <Sun className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onThemeChange('dark')}
                  className={`p-1 rounded transition-colors ${
                    themeMode === 'dark'
                      ? 'bg-[#2b2d31] text-[#4cc2ff] shadow-xs'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="تم تاریک (Dark Mode)"
                >
                  <Moon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onThemeChange('system')}
                  className={`p-1 rounded transition-colors ${
                    themeMode === 'system'
                      ? 'bg-white dark:bg-[#2b2d31] text-blue-600 dark:text-[#4cc2ff] shadow-xs'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title="تم خودکار هماهنگ با ویندوز"
                >
                  <Laptop className="w-3 h-3" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="w-full flex justify-center">
            {onThemeChange && (
              <button
                onClick={() => {
                  const next = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
                  onThemeChange(next);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#202226] transition-colors"
                title={`تغییر تم (فعلی: ${themeMode})`}
              >
                {themeMode === 'dark' ? (
                  <Moon className="w-4 h-4 text-[#4cc2ff]" />
                ) : themeMode === 'light' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Laptop className="w-4 h-4 text-blue-500" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};

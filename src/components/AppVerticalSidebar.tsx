import React, { useState } from 'react';
import {
  FileCheck2,
  FolderOpen,
  Camera,
  FilePlus2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Layers,
  PenTool,
  LayoutDashboard,
  Printer,
  Save,
  FileSpreadsheet,
  Download,
  Upload,
  RotateCcw,
  Sun,
  Moon,
  Laptop,
  X,
  SlidersHorizontal,
  Copy,
  Trash2,
  Truck,
  PackageCheck,
  Wrench,
  Receipt,
  FileDown,
  GitBranch,
} from 'lucide-react';
import { FormTemplate } from '../types/form';
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
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
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
  onOpenGitHubUpdate?: () => void;
  hasGitHubUpdate?: boolean;
  recordsCount: number;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  documentNumber?: string;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
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
  onExportPdf,
  isExportingPdf = false,
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
  onOpenGitHubUpdate,
  hasGitHubUpdate = false,
  recordsCount,
  themeMode = 'system',
  onThemeChange,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const closeOnMobile = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const effectiveCollapsed = isCollapsed && !isMobileOpen;

  const quickTemplates = [
    {
      id: 'preset_dispatch_voucher',
      title: 'حواله خروج کالا',
      icon: <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
    },
    {
      id: 'preset_receipt_foreign_goods',
      title: 'رسید ورود کالا',
      icon: <PackageCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'preset_repair_receipt',
      title: 'رسید تعمیرات',
      icon: <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
    },
    {
      id: 'preset_invoice_1',
      title: 'فاکتور فروش',
      icon: <Receipt className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />,
    },
  ];

  return (
    <>
      {/* Mobile / Tablet Drawer Backdrop */}
      {isMobileOpen && (
        <div
          aria-hidden="true"
          onClick={closeOnMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        data-testid="app-vertical-sidebar"
        className={`fixed inset-y-0 right-0 z-50 h-full lg:h-auto liquid-glass-elevated lg:rounded-3xl lg:my-3 lg:mr-3 flex flex-col shrink-0 select-none transition-transform lg:transition-all duration-200 lg:static lg:z-30 lg:translate-x-0 lg:pointer-events-auto ${
          isMobileOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        } ${effectiveCollapsed ? 'w-[76px]' : 'w-[280px] max-w-[85vw] lg:w-[252px]'}`}
      >
        {/* Top Sidebar Header */}
        <div className="p-3.5 border-b border-white/60 dark:border-white/10 flex items-center justify-between gap-2">
          {!effectiveCollapsed ? (
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                منوی سریع
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                همه کارها در چند کلیک
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-300 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          )}

          {/* Desktop Collapse Button */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:inline-flex p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
            aria-label={isCollapsed ? 'باز کردن منو' : 'جمع کردن منو'}
          >
            {isCollapsed ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={closeOnMobile}
              aria-label="بستن منو"
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Navigation Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4">
          {/* Everyday Simple Actions (Only 4 friendly buttons) */}
          <nav aria-label="کارهای اصلی" className="space-y-2">
            {/* 1. Make New Document (Wizard) */}
            <button
              type="button"
              onClick={() => {
                onTabChange('wizard');
                onToggleFillMode(true);
                closeOnMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-right transition-all cursor-pointer ${
                activeTab === 'wizard'
                  ? 'liquid-cta'
                  : 'liquid-glass-well hover:bg-white/80 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'wizard'
                    ? 'bg-white/20 text-white'
                    : 'bg-sky-500/12 text-sky-600 dark:text-sky-300'
                }`}
              >
                <FileCheck2 className="w-5 h-5" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">ساخت برگه جدید</div>
                  <div
                    className={`text-[11px] truncate ${
                      activeTab === 'wizard' ? 'text-sky-50' : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    ساده و مرحله‌به‌مرحله
                  </div>
                </div>
              )}
            </button>

            {/* 2. My Saved Documents (Archive) */}
            <button
              type="button"
              onClick={() => {
                onTabChange('database');
                closeOnMobile();
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-right transition-all cursor-pointer ${
                activeTab === 'database'
                  ? 'liquid-cta-success'
                  : 'liquid-glass-well hover:bg-white/80 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  activeTab === 'database'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-300'
                }`}
              >
                <FolderOpen className="w-5 h-5" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <div className="min-w-0">
                    <div className="text-xs font-bold truncate">برگه‌های من</div>
                    <div
                      className={`text-[11px] truncate ${
                        activeTab === 'database'
                          ? 'text-emerald-50'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      دیدن و چاپ برگه‌ها
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums shrink-0 ${
                      activeTab === 'database'
                        ? 'text-white'
                        : 'text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {toPersianDigits(recordsCount)}
                  </span>
                </div>
              )}
            </button>

            {/* 3. Create from Photo */}
            {onOpenImageToForm && (
              <button
                type="button"
                onClick={() => {
                  onOpenImageToForm();
                  closeOnMobile();
                }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-right liquid-glass-well hover:bg-white/80 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-100 transition-all cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/12 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                {!effectiveCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold truncate">ساخت برگه از عکس</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      از کاغذ عکس بگیر
                    </div>
                  </div>
                )}
              </button>
            )}

            {/* 4. Quick Fresh Start */}
            <button
              type="button"
              onClick={() => {
                onNewVoucher();
                closeOnMobile();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-right liquid-glass-well hover:bg-white/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-500/10 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <FilePlus2 className="w-5 h-5" />
              </div>
              {!effectiveCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate">برگه تازه و خالی</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    شروع از صفر
                  </div>
                </div>
              )}
            </button>
          </nav>

          {/* Progressive Disclosure: Advanced Tools (collapsed by default) */}
          {!effectiveCollapsed && (
            <div className="pt-3 border-t border-white/60 dark:border-white/10">
              <button
                type="button"
                onClick={() => setShowAdvanced((prev) => !prev)}
                aria-expanded={showAdvanced}
                data-testid="sidebar-advanced-toggle"
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>ابزارهای پیشرفته</span>
                </span>
                {showAdvanced ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {showAdvanced && (
                <div className="mt-2 space-y-1.5 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('fill');
                      onToggleFillMode(true);
                      closeOnMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium transition-colors cursor-pointer ${
                      activeTab === 'fill' && isFillMode
                        ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span className="truncate">بوم آزاد (کلاسیک)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onTabChange('design');
                      onToggleFillMode(false);
                      closeOnMobile();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium transition-colors cursor-pointer ${
                      activeTab === 'design' && !isFillMode
                        ? 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
                    }`}
                  >
                    <PenTool className="w-4 h-4 shrink-0" />
                    <span className="truncate">طراحی ساختار فرم</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onOpenTemplates();
                      closeOnMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span className="truncate">مدیریت قالب‌ها</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSaveRecord();
                      closeOnMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4 shrink-0" />
                    <span className="truncate">ذخیره سریع در بایگانی</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onQuickPrint();
                      closeOnMobile();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium text-slate-700 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span className="truncate">چاپ سریع</span>
                  </button>

                  {onExportPdf && (
                    <button
                      type="button"
                      data-testid="sidebar-export-pdf-btn"
                      disabled={isExportingPdf}
                      onClick={() => {
                        onExportPdf();
                        closeOnMobile();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-right font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      <FileDown className="w-4 h-4 shrink-0" />
                      <span className="truncate">
                        {isExportingPdf ? 'در حال ساخت PDF...' : 'خروجی PDF برگه'}
                      </span>
                    </button>
                  )}

                  {/* Quick template switcher inside Advanced */}
                  <div className="pt-2 border-t border-white/50 dark:border-white/10 space-y-1">
                    <div className="px-2 text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                      انتخاب سریع نوع برگه
                    </div>
                    {quickTemplates.map((vt) => {
                      const matching = templates.find((t) => t.id === vt.id);
                      if (!matching) return null;
                      const isActive = activeTemplateId === vt.id;
                      return (
                        <button
                          key={vt.id}
                          type="button"
                          onClick={() => {
                            onSelectTemplate(matching);
                            closeOnMobile();
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-right transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-sky-500/15 text-sky-700 dark:text-sky-300 font-semibold'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10'
                          }`}
                        >
                          {vt.icon}
                          <span className="truncate">{vt.title}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Contextual Design / Archive actions */}
                  {activeTab === 'database' && (
                    <div className="pt-2 border-t border-white/50 dark:border-white/10 space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onExportCsv();
                          closeOnMobile();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 transition-colors cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>خروجی اکسل</span>
                      </button>
                      <div className="grid grid-cols-2 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            onExportBackup();
                            closeOnMobile();
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-xl liquid-glass-well text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Download className="w-3 h-3" />
                          <span>پشتیبان</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onImportBackup();
                            closeOnMobile();
                          }}
                          className="flex items-center justify-center gap-1 py-1.5 rounded-xl liquid-glass-well text-[11px] text-slate-700 dark:text-slate-200 cursor-pointer"
                        >
                          <Upload className="w-3 h-3" />
                          <span>بازیابی</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'design' && (
                    <div className="pt-2 border-t border-white/50 dark:border-white/10 space-y-1">
                      {onSaveActiveTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            onSaveActiveTemplate();
                            closeOnMobile();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-sky-700 dark:text-sky-300 hover:bg-sky-500/10 transition-colors cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>ذخیره قالب</span>
                        </button>
                      )}
                      {onDuplicateActiveTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            onDuplicateActiveTemplate();
                            closeOnMobile();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>کپی قالب</span>
                        </button>
                      )}
                      {onDeleteActiveTemplate && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteActiveTemplate();
                            closeOnMobile();
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف قالب</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          onResetCanvas();
                          closeOnMobile();
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>پاک‌سازی بوم</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* GitHub Update Check Entry */}
          {onOpenGitHubUpdate && (
            <div className="pt-3 border-t border-white/60 dark:border-white/10">
              <button
                type="button"
                data-testid="sidebar-github-update-btn"
                onClick={() => {
                  onOpenGitHubUpdate();
                  closeOnMobile();
                }}
                aria-label="بروزرسانی نرم‌افزار از گیتهاب"
                title={effectiveCollapsed ? 'بروزرسانی از گیتهاب' : undefined}
                className={`w-full flex items-center ${
                  effectiveCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2.5 rounded-2xl text-xs font-semibold transition-colors cursor-pointer ${
                  hasGitHubUpdate
                    ? 'bg-amber-500/15 border border-amber-400/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                <span className="flex items-center gap-2.5 min-w-0">
                  <GitBranch className="w-4 h-4 shrink-0" />
                  {!effectiveCollapsed && (
                    <span className="truncate">بروزرسانی از گیتهاب</span>
                  )}
                </span>
                {hasGitHubUpdate && !effectiveCollapsed && (
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 shrink-0">
                    جدید
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Clean Sidebar Footer: Appearance Switch */}
        <div className="p-3 border-t border-white/60 dark:border-white/10 flex items-center justify-between gap-2">
          {!effectiveCollapsed ? (
            <>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                نمای صفحه
              </span>
              {onThemeChange && (
                <div className="flex items-center gap-0.5 liquid-glass-well p-0.5 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onThemeChange('light')}
                    aria-label="حالت روز"
                    title="حالت روز"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      themeMode === 'light'
                        ? 'bg-white text-amber-500 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onThemeChange('dark')}
                    aria-label="حالت شب"
                    title="حالت شب"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      themeMode === 'dark'
                        ? 'bg-slate-800 text-sky-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onThemeChange('system')}
                    aria-label="هماهنگ با سیستم"
                    title="هماهنگ با سیستم"
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                      themeMode === 'system'
                        ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex justify-center">
              {onThemeChange && (
                <button
                  type="button"
                  onClick={() => {
                    const next = themeMode === 'light' ? 'dark' : themeMode === 'dark' ? 'system' : 'light';
                    onThemeChange(next);
                  }}
                  aria-label="تغییر نمای صفحه"
                  className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {themeMode === 'dark' ? (
                    <Moon className="w-4 h-4 text-sky-300" />
                  ) : themeMode === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Laptop className="w-4 h-4 text-sky-600" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

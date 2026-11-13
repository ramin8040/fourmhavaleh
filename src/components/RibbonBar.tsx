import React from 'react';
import {
  LayoutDashboard,
  PenTool,
  Database,
  Printer,
  FilePlus,
  RotateCcw,
  Download,
  Upload,
  FileText,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Eye,
  Sliders,
  Layers,
  Save,
  Copy,
  Trash2,
  Moon,
  Sun,
  Laptop,
  Sparkles
} from 'lucide-react';
import { PaperSize, PageOrientation } from '../types/form';
import { ThemeMode } from '../utils/theme';

export type RibbonTab = 'wizard' | 'design' | 'fill' | 'database' | 'print' | 'templates';

interface RibbonBarProps {
  activeTab: RibbonTab;
  onTabChange: (tab: RibbonTab) => void;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  orientation: PageOrientation;
  onOrientationChange: (ori: PageOrientation) => void;
  showPageBorders: boolean;
  onTogglePageBorders: () => void;
  showWatermark: boolean;
  onToggleWatermark: () => void;
  watermarkText: string;
  onWatermarkTextChange: (text: string) => void;
  onResetCanvas: () => void;
  onSaveRecord: () => void;
  onQuickPrint: () => void;
  onExportCsv: () => void;
  onExportBackup: () => void;
  onImportBackup: () => void;
  onOpenTemplates: () => void;
  onPreviewPrint: () => void;
  isFillMode: boolean;
  onToggleFillMode: (fillMode: boolean) => void;
  recordsCount: number;
  onSaveActiveTemplate?: () => void;
  onDuplicateActiveTemplate?: () => void;
  onDeleteActiveTemplate?: () => void;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  onOpenImageToForm?: () => void;
}

export const RibbonBar: React.FC<RibbonBarProps> = ({
  activeTab,
  onTabChange,
  paperSize,
  onPaperSizeChange,
  orientation,
  onOrientationChange,
  showPageBorders,
  onTogglePageBorders,
  showWatermark,
  onToggleWatermark,
  watermarkText,
  onWatermarkTextChange,
  onResetCanvas,
  onSaveRecord,
  onQuickPrint,
  onExportCsv,
  onExportBackup,
  onImportBackup,
  onOpenTemplates,
  onPreviewPrint,
  isFillMode,
  onToggleFillMode,
  recordsCount,
  onSaveActiveTemplate,
  onDuplicateActiveTemplate,
  onDeleteActiveTemplate,
  themeMode,
  onThemeChange,
  onOpenImageToForm,
}) => {
  return (
    <div className="bg-[#f9fafb] dark:bg-[#252526] border-b border-[#d1d5db] dark:border-[#333333] flex flex-col shrink-0 select-none shadow-xs transition-colors">
      {/* Ribbon Tabs Header */}
      <div className="flex items-center gap-1 px-3 pt-1 border-b border-[#e5e7eb] dark:border-[#2d2d2d] bg-[#f3f4f6] dark:bg-[#1e1e1e]">
        <button
          onClick={() => {
            onTabChange('fill');
            onToggleFillMode(true);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
            isFillMode && activeTab === 'fill'
              ? 'bg-[#f9fafb] dark:bg-[#252526] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0] dark:border-[#4cc2ff] font-semibold'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>صدور و تکمیل حواله / رسید</span>
        </button>

        <button
          onClick={() => onTabChange('database')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
            activeTab === 'database'
              ? 'bg-[#f9fafb] dark:bg-[#252526] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0] dark:border-[#4cc2ff] font-semibold'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>بایگانی و رهگیری اسناد ({recordsCount})</span>
        </button>

        <button
          onClick={() => {
            onTabChange('design');
            onToggleFillMode(false);
          }}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
            activeTab === 'design' && !isFillMode
              ? 'bg-[#f9fafb] dark:bg-[#252526] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0] dark:border-[#4cc2ff] font-semibold'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" />
          <span>طراحی و ساختار فیلدها</span>
        </button>

        <button
          onClick={() => onTabChange('print')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
            activeTab === 'print'
              ? 'bg-[#f9fafb] dark:bg-[#252526] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0] dark:border-[#4cc2ff] font-semibold'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Printer className="w-3.5 h-3.5" />
          <span>چاپ و تنظیمات خروجی</span>
        </button>

        <button
          onClick={() => onTabChange('templates')}
          className={`px-3 py-1.5 text-xs font-medium rounded-t-md transition-colors flex items-center gap-1.5 border-t-2 ${
            activeTab === 'templates'
              ? 'bg-[#f9fafb] dark:bg-[#252526] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0] dark:border-[#4cc2ff] font-semibold'
              : 'text-slate-600 dark:text-slate-400 border-transparent hover:bg-slate-200/70 dark:hover:bg-[#2a2a2a] hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>الگوهای اسناد انبار</span>
        </button>
      </div>

      {/* Ribbon Action Bar Content */}
      <div className="h-14 px-3 flex items-center justify-between overflow-x-auto text-xs text-slate-700 dark:text-slate-200">
        <div className="flex items-center gap-3">
          {/* Action Group: Form Mode */}
          <div className="flex items-center gap-1 border-l border-slate-300 dark:border-slate-700 pl-3">
            <button
              onClick={() => onToggleFillMode(!isFillMode)}
              className={`flex flex-col items-center justify-center px-2.5 py-1 rounded transition-colors ${
                isFillMode
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 font-medium'
                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 border border-blue-200 dark:border-blue-800 font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60'
              }`}
            >
              <Eye className="w-4 h-4 mb-0.5 text-[#0067C0] dark:text-[#4cc2ff]" />
              <span className="text-[10px]">
                {isFillMode ? 'تغییر به حالت طراحی' : 'تغییر به حالت تکمیل'}
              </span>
            </button>
          </div>

          {/* Tab Specific Content: DESIGN */}
          {activeTab === 'design' && (
            <div className="flex items-center gap-3">
              {/* Paper Setup Group */}
              <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3">
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">اندازه کاغذ:</span>
                <select
                  value={paperSize}
                  onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
                  className="bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none hover:border-slate-400 dark:hover:border-slate-500"
                >
                  <option value="A4">A4 استاندارد</option>
                  <option value="A5">A5 کوچک</option>
                  <option value="Letter">Letter نامه‌ای</option>
                </select>

                <select
                  value={orientation}
                  onChange={(e) => onOrientationChange(e.target.value as PageOrientation)}
                  className="bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-xs text-slate-800 dark:text-slate-100 outline-none hover:border-slate-400 dark:hover:border-slate-500"
                >
                  <option value="portrait">عمودی (Portrait)</option>
                  <option value="landscape">افقی (Landscape)</option>
                </select>
              </div>

              {/* Watermark & Border Controls */}
              <div className="flex items-center gap-2 border-l border-slate-300 dark:border-slate-700 pl-3">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPageBorders}
                    onChange={onTogglePageBorders}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">کادر حاشیه صفحه</span>
                </label>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showWatermark}
                    onChange={onToggleWatermark}
                    className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
                  />
                  <span className="text-[11px] text-slate-700 dark:text-slate-300">واترمارک:</span>
                </label>
                {showWatermark && (
                  <input
                    type="text"
                    value={watermarkText}
                    onChange={(e) => onWatermarkTextChange(e.target.value)}
                    placeholder="متن واترمارک"
                    className="bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 rounded px-1.5 py-0.5 text-[11px] w-24 outline-none"
                  />
                )}
              </div>

              {/* Reset Canvas */}
              <div className="flex items-center">
                <button
                  onClick={onResetCanvas}
                  className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors"
                  title="پاک کردن تمام فیلدها و شروع از بوم سفید"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px]">پاک‌سازی بوم</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab Specific Content: FILL */}
          {activeTab === 'fill' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onSaveRecord}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded font-medium shadow-xs transition-colors"
                title="ثبت سند جاری و درج در بایگانی انبار (Ctrl + S)"
              >
                <Save className="w-3.5 h-3.5" />
                <span>ثبت و صدور رسمی حواله</span>
              </button>

              <button
                onClick={onQuickPrint}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded font-medium shadow-xs transition-colors"
                title="چاپ فوری سند با تنظیمات چاپگر ویندوز (Ctrl + P)"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ فوری سند</span>
              </button>

              <button
                onClick={onPreviewPrint}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-[#383838] transition-colors text-slate-700 dark:text-slate-200"
                title="مشاهده پیش‌نمایش برگه چاپ رسمی"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>پیش‌نمایش چاپ</span>
              </button>
            </div>
          )}

          {/* Tab Specific Content: DATABASE */}
          {activeTab === 'database' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onExportCsv}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2d2d2d] border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                title="دانلود فایل خروجی سازگار با Microsoft Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>خروجی اکسل (Excel/CSV)</span>
              </button>

              <button
                onClick={onExportBackup}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-[#383838] transition-colors text-slate-700 dark:text-slate-200"
                title="دانلود نسخه پشتیبان کامل JSON از تمام فرم‌ها و رکوردها"
              >
                <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>پشتیبان‌گیری کامل (JSON)</span>
              </button>

              <button
                onClick={onImportBackup}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-[#383838] transition-colors text-slate-700 dark:text-slate-200"
                title="بارگذاری و بازیابی فایل نسخه پشتیبان"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>بازیابی پشتیبان</span>
              </button>
            </div>
          )}

          {/* Tab Specific Content: PRINT */}
          {activeTab === 'print' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onQuickPrint}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded font-medium shadow-xs transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>چاپ فوری (Ctrl+P)</span>
              </button>

              <button
                onClick={onPreviewPrint}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 rounded hover:bg-slate-50 dark:hover:bg-[#383838] transition-colors text-slate-700 dark:text-slate-200"
              >
                <Eye className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                <span>پنجره تنظیمات پیشرفته چاپ</span>
              </button>
            </div>
          )}

          {/* Tab Specific Content: TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenTemplates}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded font-medium shadow-xs transition-colors"
                title="مشاهده و مدیریت تمام قالب‌های ذخیره شده"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>مدیریت و انتخاب قالب‌ها</span>
              </button>

              {onSaveActiveTemplate && (
                <button
                  onClick={onSaveActiveTemplate}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#383838] text-slate-800 dark:text-slate-200 rounded font-medium shadow-xs transition-colors"
                  title="ذخیره تغییرات اعمال‌شده در قالب جاری"
                >
                  <Save className="w-3.5 h-3.5 text-blue-600 dark:text-[#4cc2ff]" />
                  <span>ذخیره تغییرات قالب جاری</span>
                </button>
              )}

              {onDuplicateActiveTemplate && (
                <button
                  onClick={onDuplicateActiveTemplate}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#2d2d2d] border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-200 rounded transition-colors"
                  title="ایجاد یک نسخه کپی از قالب جاری"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  <span>تکثیر به عنوان قالب جدید</span>
                </button>
              )}

              {onDeleteActiveTemplate && (
                <button
                  onClick={onDeleteActiveTemplate}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white dark:bg-[#2d2d2d] border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 rounded transition-colors"
                  title="حذف این قالب از دیتابیس محلی"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف قالب جاری</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Left Side in RTL: AI Image to Form + Quick Stats */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
          {onOpenImageToForm && (
            <button
              onClick={onOpenImageToForm}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-md text-xs font-bold shadow-xs hover:shadow transition-all"
              title="بارگذاری یا انداختن تصویر هر نوع حواله/رسید و استخراج هوشمند فرم با هوش مصنوعی"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>تبدیل عکس به فرم (هوش مصنوعی)</span>
            </button>
          )}

          <span className="hidden sm:inline bg-white dark:bg-[#2d2d2d] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            {isFillMode ? 'حالت ورود داده' : 'حالت طراحی بوم'}
          </span>
          <span className="bg-white dark:bg-[#2d2d2d] px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-mono">
            {paperSize} {orientation === 'portrait' ? 'عمودی' : 'افقی'}
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Truck, 
  Minus, 
  Square, 
  X, 
  Save, 
  Printer, 
  Database,
  CheckCircle2,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';
import { ThemeMode } from '../utils/theme';

interface TitleBarProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  onSave: () => void;
  onPrint: () => void;
  recordsCount: number;
  lastSavedText: string;
  themeMode: ThemeMode;
  onThemeChange: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  documentTitle,
  onTitleChange,
  onSave,
  onPrint,
  recordsCount,
  lastSavedText,
  themeMode,
  onThemeChange,
  isDark,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(documentTitle);
  const [isMaximized, setIsMaximized] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onTitleChange(titleInput.trim());
    } else {
      setTitleInput(documentTitle);
    }
  };

  const toggleMaximize = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsMaximized(false);
    }
  };

  return (
    <header className="h-10 bg-[#e8ebee] dark:bg-[#1f1f1f] border-b border-[#d1d5db] dark:border-[#2d2d2d] flex items-center justify-between px-3 select-none text-xs text-slate-700 dark:text-slate-200 shrink-0 shadow-xs z-50 transition-colors">
      {/* Right side in RTL: App Wordmark & Quick Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <div className="w-5 h-5 rounded bg-[#0067C0] dark:bg-[#0078D4] flex items-center justify-center text-white shadow-xs">
            <Truck className="w-3.5 h-3.5" />
          </div>
          <span className="tracking-tight text-sm font-bold">سامانه صدور حواله و رسید انبار</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono hidden sm:inline">| AW-ST-FO-008</span>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1" />

        {/* Document Title Editable */}
        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="px-2 py-0.5 bg-white dark:bg-[#2d2d2d] border border-[#0067C0] dark:border-[#4cc2ff] rounded text-xs text-slate-900 dark:text-slate-100 outline-none w-48 font-medium"
            />
          ) : (
            <button
              onClick={() => {
                setTitleInput(documentTitle);
                setIsEditingTitle(true);
              }}
              className="px-2 py-1 rounded hover:bg-white/70 dark:hover:bg-white/10 border border-transparent hover:border-slate-300 dark:hover:border-slate-600 font-medium text-slate-800 dark:text-slate-200 transition-colors text-right max-w-56 truncate"
              title="کلیک برای ویرایش نام فرم"
            >
              {documentTitle}
            </button>
          )}
        </div>

        {/* Quick Save and Print Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            title="ذخیره سریع فرم (Ctrl + S)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white dark:hover:bg-[#2b2b2b] text-slate-700 dark:text-slate-300 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span className="text-[11px]">ذخیره</span>
          </button>
          <button
            onClick={onPrint}
            title="چاپ فوری فرم (Ctrl + P)"
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-white dark:hover:bg-[#2b2b2b] text-slate-700 dark:text-slate-300 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="text-[11px]">چاپ</span>
          </button>
        </div>
      </div>

      {/* Center in RTL: Storage Indicator Status */}
      <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-700 dark:text-slate-300 bg-white/60 dark:bg-[#2a2a2a] px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
        <Database className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
        <span>دیتابیس محلی:</span>
        <span className="font-semibold text-slate-800 dark:text-slate-200">{recordsCount} رکورد ثبت‌شده</span>
        <span className="text-slate-400 dark:text-slate-600">·</span>
        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 inline" />
          {lastSavedText}
        </span>
      </div>

      {/* Left side in RTL: Windows 11 Dark Mode Toggle & Windows Controls */}
      <div className="flex items-center gap-2">
        {/* Windows 11 Fluent Theme Mode Toggle */}
        <div 
          className="flex items-center p-0.5 bg-slate-200/80 dark:bg-[#2b2b2b] rounded-lg border border-slate-300/70 dark:border-slate-700 text-[11px]"
          title="تنظیم تم ویندوز ۱۱ (روشن، تاریک، یا هماهنگ با تم سیستم)"
        >
          <button
            onClick={() => onThemeChange('system')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
              themeMode === 'system'
                ? 'bg-white dark:bg-[#383838] text-[#0067C0] dark:text-[#4cc2ff] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="هماهنگ با تم سیستم ویندوز"
          >
            <Laptop className="w-3 h-3" />
            <span className="hidden sm:inline">سیستم</span>
          </button>

          <button
            onClick={() => onThemeChange('light')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
              themeMode === 'light'
                ? 'bg-white dark:bg-[#383838] text-amber-600 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="تم روشن فلوئنت"
          >
            <Sun className="w-3 h-3" />
            <span className="hidden sm:inline">روشن</span>
          </button>

          <button
            onClick={() => onThemeChange('dark')}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-md transition-all ${
              themeMode === 'dark'
                ? 'bg-white dark:bg-[#383838] text-[#4cc2ff] shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="تم تاریک فلوئنت ویندوز ۱۱"
          >
            <Moon className="w-3 h-3" />
            <span className="hidden sm:inline">تاریک</span>
          </button>
        </div>

        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-0.5" />

        {/* Windows Standard Window Buttons */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => {}}
            title="کمینه‌سازی پنجره"
            className="w-8 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={toggleMaximize}
            title={isMaximized ? "بازیابی ابعاد پنجره" : "بزرگ‌نمایی تمام‌صفحه"}
            className="w-8 h-7 flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Square className="w-3 h-3" />
          </button>
          <button
            onClick={() => {
              if (confirm('آیا مایل به بستن یا راه‌اندازی مجدد بوم فرم جاری هستید؟ داده‌های ذخیره‌شده محفوظ می‌مانند.')) {
                window.location.reload();
              }
            }}
            title="بستن برنامه"
            className="w-8 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

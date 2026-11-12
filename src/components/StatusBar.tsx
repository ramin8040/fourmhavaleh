import React from 'react';
import { 
  PaperSize, 
  PageOrientation 
} from '../types/form';
import { 
  toPersianDigits 
} from '../utils/formLogic';
import { ThemeMode } from '../utils/theme';
import { 
  ZoomIn, 
  ZoomOut, 
  Database, 
  CheckCircle2, 
  Sliders, 
  Layers,
  Save,
  Moon,
  Sun,
  Laptop
} from 'lucide-react';

interface StatusBarProps {
  paperSize: PaperSize;
  orientation: PageOrientation;
  fieldsCount: number;
  recordsCount: number;
  zoomScale: number;
  onZoomChange: (newScale: number) => void;
  isFillMode: boolean;
  selectedFieldLabel?: string | null;
  lastAutoSavedTime?: string | null;
  isAutoSaving?: boolean;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  isDark?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  paperSize,
  orientation,
  fieldsCount,
  recordsCount,
  zoomScale,
  onZoomChange,
  isFillMode,
  selectedFieldLabel,
  lastAutoSavedTime,
  isAutoSaving,
  themeMode = 'system',
  onThemeChange,
  isDark = false,
}) => {
  const paperNames: Record<PaperSize, string> = {
    A4: 'A4 (۲۱۰ × ۲۹۷ میلی‌متر)',
    A5: 'A5 (۱۴۸ × ۲۱۰ میلی‌متر)',
    Letter: 'Letter (۲۱۶ × ۲۷۹ میلی‌متر)',
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(1.5, Math.round((zoomScale + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.5, Math.round((zoomScale - 0.1) * 10) / 10));
  };

  const cycleTheme = () => {
    if (!onThemeChange) return;
    if (themeMode === 'system') onThemeChange('dark');
    else if (themeMode === 'dark') onThemeChange('light');
    else onThemeChange('system');
  };

  return (
    <footer className="h-7 bg-[#f3f4f6] dark:bg-[#181818] border-t border-[#d1d5db] dark:border-[#282828] px-3 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 select-none shrink-0 shadow-2xs z-40 transition-colors">
      {/* Right side in RTL: Paper and Field Stats */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span className="text-slate-400 dark:text-slate-500">کارتابل:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">انبار مرکزی و صدور کالا</span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
          <span>کاغذ چاپ:</span>
          <span>{paperNames[paperSize]}</span>
          <span className="text-slate-400 dark:text-slate-600">·</span>
          <span>{orientation === 'portrait' ? 'عمودی' : 'افقی'}</span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        <div className="flex items-center gap-1">
          <span>ردیف‌ها/فیلدها:</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{toPersianDigits(fieldsCount)}</span>
        </div>

        {selectedFieldLabel && !isFillMode && (
          <>
            <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex items-center gap-1 text-[#0067C0] dark:text-[#4cc2ff]">
              <Sliders className="w-3 h-3" />
              <span>انتخاب شده: {selectedFieldLabel}</span>
            </div>
          </>
        )}
      </div>

      {/* Left side in RTL: Database status, Theme indicator & Zoom Controls */}
      <div className="flex items-center gap-3">
        {/* Theme quick indicator / cycle button */}
        {onThemeChange && (
          <button
            onClick={cycleTheme}
            className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-[#252525] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px] transition-colors"
            title="تغییر سریع تم ویندوز ۱۱ (کلیک برای سوئیچ بین خودکار، تاریک و روشن)"
          >
            {themeMode === 'system' ? (
              <Laptop className="w-3 h-3 text-[#0067C0] dark:text-[#4cc2ff]" />
            ) : isDark ? (
              <Moon className="w-3 h-3 text-[#4cc2ff]" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
            <span>
              {themeMode === 'system' 
                ? `ویندوز (${isDark ? 'تاریک' : 'روشن'})` 
                : isDark ? 'تم تاریک' : 'تم روشن'}
            </span>
          </button>
        )}

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Auto-Save Status in Session Storage */}
        <div 
          className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-white dark:bg-[#252525] border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[10px]"
          title="ذخیره خودکار پیش‌نویس در حافظه موقت (Session Storage) هر ۱۰ ثانیه انجام می‌شود تا در صورت بسته شدن ناگهانی، داده‌ها حفظ شوند."
        >
          <span className={`w-1.5 h-1.5 rounded-full ${isAutoSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <span className="font-sans text-slate-600 dark:text-slate-400">ذخیره خودکار:</span>
          <span className="font-mono text-[#0067C0] dark:text-[#4cc2ff] font-semibold">
            {lastAutoSavedTime ? toPersianDigits(lastAutoSavedTime) : 'فعال (۱۰ ثانیه)'}
          </span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Local DB Status */}
        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <Database className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
          <span>دیتابیس محلی: {toPersianDigits(recordsCount)} رکورد</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
        </div>

        <div className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Zoom Slider */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomOut}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            title="کاهش بزرگ‌نمایی"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>

          <input
            type="range"
            min="0.5"
            max="1.5"
            step="0.05"
            value={zoomScale}
            onChange={(e) => onZoomChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#0067C0] dark:accent-[#4cc2ff]"
            title="تنظیم بزرگ‌نمایی صفحه"
          />

          <button
            onClick={handleZoomIn}
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
            title="افزایش بزرگ‌نمایی"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onZoomChange(1)}
            className="text-[10px] font-mono text-slate-700 dark:text-slate-300 hover:text-[#0067C0] dark:hover:text-[#4cc2ff] px-1 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-white/10"
            title="بازنشانی بزرگ‌نمایی به ۱۰۰٪"
          >
            {toPersianDigits(Math.round(zoomScale * 100))}٪
          </button>
        </div>
      </div>
    </footer>
  );
};

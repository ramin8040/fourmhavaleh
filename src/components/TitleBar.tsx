import React from 'react';
import {
  FileText,
  Printer,
  Menu,
  X,
  Sun,
  Moon,
  Laptop,
  Camera,
  FolderOpen,
  PlusCircle,
} from 'lucide-react';
import { ThemeMode } from '../utils/theme';
import { RibbonTab } from './RibbonBar';
import { toPersianDigits } from '../utils/formLogic';

interface TitleBarProps {
  documentTitle: string;
  onTitleChange: (newTitle: string) => void;
  onSave: () => void;
  onPrint: () => void;
  recordsCount?: number;
  lastSavedText?: string;
  themeMode?: ThemeMode;
  onThemeChange?: (mode: ThemeMode) => void;
  isDark?: boolean;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  activeTab?: RibbonTab;
  onTabChange?: (tab: RibbonTab) => void;
  onOpenImageToForm?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  onPrint,
  recordsCount = 0,
  themeMode = 'system',
  onThemeChange,
  isDark = false,
  onToggleMobileMenu,
  isMobileMenuOpen = false,
  activeTab = 'wizard',
  onTabChange,
  onOpenImageToForm,
}) => {
  const cycleTheme = () => {
    if (!onThemeChange) return;
    onThemeChange(isDark ? 'light' : 'dark');
  };

  return (
    <header className="h-12 sm:h-14 liquid-glass-elevated border-b border-white/70 dark:border-white/10 flex items-center justify-between gap-4 sm:gap-8 px-3 sm:px-5 select-none text-slate-800 dark:text-slate-100 shrink-0 z-20 transition-colors">
      {/* Zone 1: Brand & Mobile Drawer Trigger */}
      <div className="flex items-center gap-2.5 min-w-0 shrink-0">
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            data-testid="mobile-menu-toggle"
            aria-label={isMobileMenuOpen ? 'بستن منو' : 'باز کردن منو'}
            aria-expanded={isMobileMenuOpen}
            className="lg:hidden w-11 h-11 flex items-center justify-center rounded-2xl text-slate-700 dark:text-slate-200 hover:bg-white/70 dark:hover:bg-white/10 active:scale-95 transition-all shrink-0 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-b from-sky-400 to-sky-600 text-white flex items-center justify-center shadow-sm shadow-sky-500/25 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
            همیار برگه‌ها
          </span>
        </div>
      </div>

      {/* Zone 2: Simple Everyday Navigation (3 clear items) */}
      {onTabChange && (
        <nav
          aria-label="ناوبری اصلی"
          className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl liquid-glass-well shrink-0"
        >
          <button
            type="button"
            onClick={() => onTabChange('wizard')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'wizard'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>ساخت برگه جدید</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('database')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
              activeTab === 'database'
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>برگه‌های من</span>
            {recordsCount > 0 && (
              <span className="text-[11px] font-bold text-sky-600 dark:text-sky-400">
                ({toPersianDigits(recordsCount)})
              </span>
            )}
          </button>

          {onOpenImageToForm && (
            <button
              type="button"
              onClick={onOpenImageToForm}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>ساخت از عکس</span>
            </button>
          )}
        </nav>
      )}

      {/* Zone 3: Theme Switch & Primary Print Action */}
      <div className="flex items-center gap-2 shrink-0">
        {onThemeChange && (
          <button
            type="button"
            onClick={cycleTheme}
            data-testid="theme-cycle-button"
            aria-label={
              themeMode === 'dark'
                ? 'تغییر ظاهر به حالت خودکار'
                : themeMode === 'light'
                ? 'تغییر ظاهر به حالت شب'
                : 'تغییر ظاهر به حالت روز'
            }
            title={
              themeMode === 'system'
                ? `حالت خودکار (${isDark ? 'شب' : 'روز'})`
                : themeMode === 'dark'
                ? 'حالت شب'
                : 'حالت روز'
            }
            className="w-10 h-10 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          >
            {themeMode === 'dark' ? (
              <Moon className="w-4 h-4 text-sky-300" />
            ) : themeMode === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : (
              <Laptop className="w-4 h-4 text-sky-600 dark:text-sky-300" />
            )}
          </button>
        )}

        <button
          type="button"
          onClick={onPrint}
          aria-label="چاپ برگه"
          className="liquid-cta h-10 sm:h-9 px-3 sm:px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">چاپ برگه</span>
        </button>
      </div>
    </header>
  );
};

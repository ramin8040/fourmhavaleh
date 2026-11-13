import React from 'react';
import {
  PaperSize,
  PageOrientation,
  FormTemplate
} from '../types/form';
import {
  FileText,
  Eye,
  PenTool,
  Printer,
  Keyboard,
  Wrench,
  Sliders
} from 'lucide-react';
import { toPersianDigits } from '../utils/formLogic';

interface CanvasTopBarProps {
  activeTemplate: FormTemplate;
  isFillMode: boolean;
  onToggleFillMode: (fill: boolean) => void;
  paperSize: PaperSize;
  onPaperSizeChange: (size: PaperSize) => void;
  orientation: PageOrientation;
  onOrientationChange: (ori: PageOrientation) => void;
  showPageBorders: boolean;
  onTogglePageBorders: () => void;
  showWatermark: boolean;
  onToggleWatermark: () => void;
  zoomScale?: number;
  onZoomChange?: (scale: number) => void;
  documentNumber?: string;
  lastAutoSavedTime?: string | null;
  isAutoSaving?: boolean;
  onQuickPrint?: () => void;
  onOpenShortcuts?: () => void;
  mobileDesignPanel?: 'none' | 'toolbox' | 'inspector';
  onToggleMobileDesignPanel?: (panel: 'toolbox' | 'inspector') => void;
}

export const CanvasTopBar: React.FC<CanvasTopBarProps> = ({
  activeTemplate,
  isFillMode,
  onToggleFillMode,
  paperSize,
  onPaperSizeChange,
  orientation,
  onOrientationChange,
  documentNumber = '۱',
  onQuickPrint,
  onOpenShortcuts,
  mobileDesignPanel = 'none',
  onToggleMobileDesignPanel,
}) => {
  return (
    <div className="min-h-12 liquid-glass-elevated border-b border-white/60 dark:border-white/10 px-3 sm:px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none shrink-0 transition-colors z-20">
      {/* Right side in RTL: Document Identity */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/15 dark:bg-sky-400/20 border border-sky-400/35 text-sky-800 dark:text-sky-200 font-bold shrink-0">
          <FileText className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">شماره برگه:</span>
          <span className="font-sans tabular-nums text-xs font-extrabold">
            {toPersianDigits(documentNumber)}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold truncate max-w-[160px] sm:max-w-xs">
          <span className="truncate">{activeTemplate.title}</span>
          <span aria-hidden="true" className="hidden md:inline text-slate-400">·</span>
          <span className="hidden md:inline text-[11px] font-medium text-slate-500 dark:text-slate-400 shrink-0">
            {orientation === 'landscape' ? 'افقی' : 'عمودی'}
          </span>
        </div>
      </div>

      {/* Left side in RTL: Mode, Paper Specs & Mobile Design Drawer Toggles */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
        {!isFillMode && onToggleMobileDesignPanel && (
          <div className="flex lg:hidden items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleMobileDesignPanel('toolbox')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                mobileDesignPanel === 'toolbox'
                  ? 'liquid-cta text-white'
                  : 'liquid-glass-well text-slate-700 dark:text-slate-200'
              }`}
              title="نمایش ابزارهای فرم"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>ابزارها</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleMobileDesignPanel('inspector')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                mobileDesignPanel === 'inspector'
                  ? 'liquid-cta text-white'
                  : 'liquid-glass-well text-slate-700 dark:text-slate-200'
              }`}
              title="تنظیمات فیلد"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>تنظیمات</span>
            </button>
          </div>
        )}

        {/* Mode Switcher */}
        <button
          type="button"
          onClick={() => onToggleFillMode(!isFillMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
            isFillMode
              ? 'bg-sky-500/15 dark:bg-sky-400/20 text-sky-800 dark:text-sky-200 border border-sky-400/35'
              : 'bg-indigo-500/15 dark:bg-indigo-400/20 text-indigo-800 dark:text-indigo-200 border border-indigo-400/35'
          }`}
          title="تغییر بین پر کردن برگه و تغییر شکل برگه"
        >
          {isFillMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">نوشتن روی برگه</span>
              <span className="sm:hidden">نوشتن</span>
            </>
          ) : (
            <>
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">طراحی برگه</span>
              <span className="sm:hidden">طراحی</span>
            </>
          )}
        </button>

        {/* Paper Size selector */}
        <div className="hidden lg:flex items-center gap-1 liquid-glass-well px-2.5 py-1 rounded-xl">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">کاغذ:</span>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
            className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        {/* Orientation selector */}
        <div className="hidden lg:flex items-center gap-1 liquid-glass-well px-2.5 py-1 rounded-xl">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">جهت:</span>
          <select
            value={orientation}
            onChange={(e) => onOrientationChange(e.target.value as PageOrientation)}
            className="bg-transparent text-slate-800 dark:text-slate-100 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="landscape">افقی</option>
            <option value="portrait">عمودی</option>
          </select>
        </div>

        {onOpenShortcuts && (
          <button
            type="button"
            onClick={onOpenShortcuts}
            className="hidden sm:inline-flex p-2 rounded-xl liquid-glass-well text-slate-700 dark:text-slate-200 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
            title="میانبرهای صفحه‌کلید"
          >
            <Keyboard className="w-4 h-4" />
          </button>
        )}

        {onQuickPrint && (
          <button
            type="button"
            onClick={onQuickPrint}
            className="p-2 rounded-xl liquid-cta-success text-white cursor-pointer"
            title="چاپ برگه"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

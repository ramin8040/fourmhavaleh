import React from 'react';
import {
  PaperSize,
  PageOrientation,
  FormTemplate
} from '../types/form';
import {
  FileText,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  Clock,
  Eye,
  PenTool,
  Printer,
  Sparkles,
  Layers,
  FileCheck,
  Keyboard
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
  zoomScale: number;
  onZoomChange: (scale: number) => void;
  documentNumber?: string;
  lastAutoSavedTime?: string | null;
  isAutoSaving?: boolean;
  onQuickPrint?: () => void;
  onOpenShortcuts?: () => void;
}

export const CanvasTopBar: React.FC<CanvasTopBarProps> = ({
  activeTemplate,
  isFillMode,
  onToggleFillMode,
  paperSize,
  onPaperSizeChange,
  orientation,
  onOrientationChange,
  showPageBorders,
  onTogglePageBorders,
  showWatermark,
  onToggleWatermark,
  zoomScale,
  onZoomChange,
  documentNumber = '۱',
  lastAutoSavedTime,
  isAutoSaving,
  onQuickPrint,
  onOpenShortcuts,
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(1.5, Math.round((zoomScale + 0.1) * 10) / 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(0.6, Math.round((zoomScale - 0.1) * 10) / 10));
  };

  const resetZoom = () => {
    onZoomChange(1.0);
  };

  return (
    <div className="h-11 bg-white/95 dark:bg-[#1c1d20]/95 backdrop-blur-md border-b border-slate-200 dark:border-[#2d2f34] px-3.5 flex items-center justify-between text-xs select-none shadow-xs shrink-0 transition-colors z-20">
      {/* Right side in RTL: Document Identity & Status Badges */}
      <div className="flex items-center gap-2.5 overflow-hidden">
        {/* Document Number badge */}
        <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-2.5 py-0.5 rounded-lg text-[#0067C0] dark:text-[#4cc2ff] font-bold shrink-0">
          <FileText className="w-3.5 h-3.5" />
          <span>شماره سند:</span>
          <span className="font-mono text-xs font-black">#{toPersianDigits(documentNumber)}</span>
        </div>

        {/* Template Title */}
        <div className="hidden sm:flex items-center gap-1.5 text-slate-700 dark:text-slate-200 font-bold truncate">
          <span className="truncate">{activeTemplate.title}</span>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-100 dark:bg-[#26282c] px-1.5 py-0.5 rounded">
            {orientation === 'landscape' ? 'افقی' : 'عمودی'}
          </span>
        </div>

        {/* Live Auto-Save Indicator */}
        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 px-2 py-0.5 rounded-lg">
          <span className={`w-2 h-2 rounded-full ${isAutoSaving ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}></span>
          <span>{isAutoSaving ? 'در حال ذخیره‌سازی...' : lastAutoSavedTime ? `ذخیره خودکار: ${lastAutoSavedTime}` : 'ذخیره خودکار فعال'}</span>
        </div>
      </div>

      {/* Left side in RTL: Page Specs & Zoom Controls */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Mode Switcher Button */}
        <button
          onClick={() => onToggleFillMode(!isFillMode)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-xs transition-all border ${
            isFillMode
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-[#4cc2ff] border-blue-300 dark:border-blue-800 shadow-xs'
              : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800 shadow-xs'
          }`}
          title="تغییر بین حالت ورود داده و حالت طراحی ساختار"
        >
          {isFillMode ? (
            <>
              <Eye className="w-3.5 h-3.5 text-blue-600 dark:text-[#4cc2ff]" />
              <span>حالت صدور سند</span>
            </>
          ) : (
            <>
              <PenTool className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>حالت طراح بوم</span>
            </>
          )}
        </button>

        {/* Paper Size selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#25272b] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-[#333]">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">اندازه:</span>
          <select
            value={paperSize}
            onChange={(e) => onPaperSizeChange(e.target.value as PaperSize)}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="Letter">Letter</option>
          </select>
        </div>

        {/* Orientation selector */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-[#25272b] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-[#333]">
          <span className="text-[10px] text-slate-500 dark:text-slate-400">جهت:</span>
          <select
            value={orientation}
            onChange={(e) => onOrientationChange(e.target.value as PageOrientation)}
            className="bg-transparent text-slate-800 dark:text-slate-200 text-xs font-bold outline-none cursor-pointer"
          >
            <option value="landscape">افقی (Landscape)</option>
            <option value="portrait">عمودی (Portrait)</option>
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center bg-slate-100 dark:bg-[#25272b] rounded-lg p-0.5 border border-slate-200 dark:border-[#333]">
          <button
            onClick={handleZoomOut}
            className="p-1 hover:bg-white dark:hover:bg-[#333] rounded text-slate-600 dark:text-slate-300 transition-colors"
            title="کوچک‌نمایی (-)"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={resetZoom}
            className="px-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 font-mono transition-colors"
            title="بزرگ‌نمایی پیش‌فرض ۱۰۰٪"
          >
            {toPersianDigits(Math.round(zoomScale * 100))}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1 hover:bg-white dark:hover:bg-[#333] rounded text-slate-600 dark:text-slate-300 transition-colors"
            title="بزرگ‌نمایی (+)"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Keyboard Shortcuts Guide Button */}
        {onOpenShortcuts && (
          <button
            onClick={onOpenShortcuts}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#25272b] dark:hover:bg-[#333] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#3a3d44] transition-colors"
            title="راهنمای کلیدهای میانبر (F1)"
          >
            <Keyboard className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        )}

        {/* Quick Print Button */}
        {onQuickPrint && (
          <button
            onClick={onQuickPrint}
            className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            title="پیش‌نمایش و چاپ سند (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

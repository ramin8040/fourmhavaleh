import React, { useState } from 'react';
import { FormField, TableBorderLineStyle, TableColumn, TableStyleConfig } from '../types/form';
import {
  EXCEL_COLOR_SWATCHES,
  EXCEL_TABLE_PRESETS,
  ExcelBorderPresetId,
  applyExcelBorderPreset,
  applyExcelStylePreset,
  resolveTableStyle,
} from '../utils/tableStyling';
import { toPersianDigits } from '../utils/formLogic';
import {
  Bold,
  Check,
  Columns,
  Grid,
  PaintBucket,
  Palette,
  RotateCcw,
  Rows,
  Sparkles,
  Type,
} from 'lucide-react';

interface ExcelTableStylePanelProps {
  field: FormField;
  columns: TableColumn[];
  onUpdateField: (updated: FormField) => void;
  compact?: boolean;
  wide?: boolean;
}

const LINE_STYLE_OPTIONS: Array<{ value: TableBorderLineStyle; label: string }> = [
  { value: 'solid', label: 'خط ممتد' },
  { value: 'dashed', label: 'خط‌چین' },
  { value: 'dotted', label: 'نقطه‌چین' },
  { value: 'double', label: 'دوتایی (Double)' },
  { value: 'none', label: 'بدون خط' },
];

const BORDER_PRESET_BUTTONS: Array<{ id: ExcelBorderPresetId; label: string }> = [
  { id: 'all', label: 'همه خطوط' },
  { id: 'thick_official', label: 'رسمی ضخیم' },
  { id: 'outer_only', label: 'فقط کادر دور' },
  { id: 'horizontal_only', label: 'فقط افقی' },
  { id: 'no_vertical', label: 'بدون عمودی' },
  { id: 'dashed', label: 'خط‌چین' },
  { id: 'none', label: 'بدون خط' },
];

export const ExcelTableStylePanel: React.FC<ExcelTableStylePanelProps> = ({
  field,
  columns,
  onUpdateField,
  wide = false,
}) => {
  const [subSection, setSubSection] = useState<'presets' | 'borders' | 'colors' | 'cells'>('presets');
  const [selectedRowNum, setSelectedRowNum] = useState<number>(1);
  const [selectedColIdx, setSelectedColIdx] = useState<number>(0);

  const resolved = resolveTableStyle(field);
  const currentStyle: TableStyleConfig = field.tableStyle || {};

  const patchStyle = (patch: Partial<TableStyleConfig>) => {
    const next: TableStyleConfig = {
      ...currentStyle,
      ...patch,
    };
    onUpdateField({
      ...field,
      tableStyle: next,
      tableBorderThickness:
        next.outerBorderWidth && next.outerBorderWidth >= 2 ? 'thick' : 'normal',
    });
  };

  const handleSelectPreset = (presetId: string) => {
    const presetConfig = applyExcelStylePreset(presetId);
    onUpdateField({
      ...field,
      tableStyle: presetConfig,
      tableBorderThickness:
        presetConfig.outerBorderWidth && presetConfig.outerBorderWidth >= 2 ? 'thick' : 'normal',
    });
  };

  const handleBorderPreset = (presetId: ExcelBorderPresetId) => {
    const next = applyExcelBorderPreset(resolved, presetId);
    onUpdateField({
      ...field,
      tableStyle: next,
      tableBorderThickness:
        next.outerBorderWidth && next.outerBorderWidth >= 2 ? 'thick' : 'normal',
    });
  };

  const handleResetAllStyles = () => {
    const clearedCols = columns.map(({ bgColor, textColor, bold, headerBgColor, headerTextColor, widthPercent, ...rest }) => rest);
    onUpdateField({
      ...field,
      tableStyle: undefined,
      tableColumns: field.tableColumns ? clearedCols : undefined,
    });
  };

  const handleColumnStyleChange = (colIdx: number, patch: Partial<TableColumn>) => {
    const updatedCols = columns.map((c, i) => (i === colIdx ? { ...c, ...patch } : c));
    onUpdateField({
      ...field,
      tableColumns: updatedCols,
    });
  };

  const rowHighlight = resolved.rowHighlights[selectedRowNum] || {};
  const patchRowHighlight = (patch: { bgColor?: string; textColor?: string; bold?: boolean }) => {
    const nextHighlights = {
      ...(currentStyle.rowHighlights || {}),
      [selectedRowNum]: {
        ...rowHighlight,
        ...patch,
      },
    };
    patchStyle({ rowHighlights: nextHighlights });
  };

  const clearRowHighlight = (rowNum: number) => {
    const nextHighlights = { ...(currentStyle.rowHighlights || {}) };
    delete nextHighlights[rowNum];
    patchStyle({ rowHighlights: nextHighlights });
  };

  const activeCol = columns[selectedColIdx] || columns[0];

  const maxRows = Math.max(field.tableInitialRows || 10, 10);

  return (
    <div className="space-y-3 text-xs select-none" dir="rtl" data-testid="excel-table-style-panel">
      {/* Sub-navigation pills */}
      <div className="grid grid-cols-4 gap-1 p-1 rounded-2xl liquid-glass-well">
        {[
          { id: 'presets', label: 'طرح آماده', icon: Sparkles },
          { id: 'borders', label: 'خطوط', icon: Grid },
          { id: 'colors', label: 'رنگ سطر', icon: PaintBucket },
          { id: 'cells', label: 'ستون و سطر', icon: Columns },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = subSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSubSection(item.id as any)}
              className={`py-1.5 px-1 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                isActive
                  ? 'liquid-cta text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================================================================
          1. EXCEL TABLE STYLES GALLERY
         ================================================================ */}
      {subSection === 'presets' && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px]">
              گالری طرح‌های آماده (سبک اکسل):
            </span>
            <button
              type="button"
              onClick={handleResetAllStyles}
              className="text-[10px] text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>بازنشانی</span>
            </button>
          </div>

          <div className={`grid ${wide ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2'} gap-2`}>
            {EXCEL_TABLE_PRESETS.map((preset) => {
              const selected = resolved.presetId === preset.id;
              const c = preset.config;
              return (
                <button
                  key={preset.id}
                  type="button"
                  data-testid={`excel-preset-${preset.id}`}
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-2 rounded-2xl text-right transition-all cursor-pointer border ${
                    selected
                      ? 'ring-2 ring-sky-500 border-sky-400 bg-white dark:bg-slate-800/90 shadow-sm'
                      : 'liquid-glass-well hover:bg-white/80 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {/* Visual mini 3x3 table swatch */}
                  <div
                    className="w-full rounded overflow-hidden mb-1.5 bg-white"
                    style={{
                      border:
                        c.outerBorderStyle === 'none'
                          ? '1px solid #e2e8f0'
                          : `${c.outerBorderWidth || 1}px ${c.outerBorderStyle || 'solid'} ${c.outerBorderColor || '#000'}`,
                    }}
                  >
                    <div
                      className="h-3 w-full"
                      style={{
                        backgroundColor: c.headerBgColor || '#ffffff',
                        borderBottom: `1.5px solid ${c.headerBottomBorderColor || '#000'}`,
                      }}
                    />
                    <div
                      className="h-2.5 w-full"
                      style={{
                        backgroundColor: c.oddRowBgColor || '#ffffff',
                        borderBottom:
                          c.horizontalGridStyle === 'none'
                            ? 'none'
                            : `1px ${c.horizontalGridStyle || 'solid'} ${c.horizontalGridColor || '#cbd5e1'}`,
                      }}
                    />
                    <div
                      className="h-2.5 w-full"
                      style={{
                        backgroundColor: c.zebraRows ? c.evenRowBgColor || '#eff6ff' : '#ffffff',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                      {preset.label}
                    </span>
                    {selected && <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Quick Excel Table Style Options Checkboxes */}
          <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2">
            <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-100">
              گزینه‌های سریع جدول (Table Options):
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={resolved.zebraRows}
                  onChange={(e) => patchStyle({ zebraRows: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>سطر یکی‌درمیان</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={resolved.bandedColumns}
                  onChange={(e) => patchStyle({ bandedColumns: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>ستون یکی‌درمیان</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={resolved.highlightFirstColumn}
                  onChange={(e) => patchStyle({ highlightFirstColumn: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>تأکید ستون اول</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={resolved.highlightLastColumn}
                  onChange={(e) => patchStyle({ highlightLastColumn: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-0"
                />
                <span>تأکید ستون آخر</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          2. BORDERS & LINES (FORMAT CELLS -> BORDER)
         ================================================================ */}
      {subSection === 'borders' && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] block">
              الگوی سریع خط‌کشی (Borders):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BORDER_PRESET_BUTTONS.map((bp) => (
                <button
                  key={bp.id}
                  type="button"
                  data-testid={`border-preset-${bp.id}`}
                  onClick={() => handleBorderPreset(bp.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/80 dark:bg-slate-800/80 hover:bg-sky-50 dark:hover:bg-sky-900/40 text-slate-800 dark:text-slate-100 border border-slate-300/60 dark:border-white/15 text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  {bp.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Individual Border Rule Cards */}
          {[
            {
              title: 'کادر بیرونی جدول (دور تا دور)',
              styleKey: 'outerBorderStyle' as const,
              widthKey: 'outerBorderWidth' as const,
              colorKey: 'outerBorderColor' as const,
              styleVal: resolved.outerBorderStyle,
              widthVal: resolved.outerBorderWidth,
              colorVal: resolved.outerBorderColor,
            },
            {
              title: 'خط زیر سطر عنوان (سرستون)',
              styleKey: 'headerBottomBorderStyle' as const,
              widthKey: 'headerBottomBorderWidth' as const,
              colorKey: 'headerBottomBorderColor' as const,
              styleVal: resolved.headerBottomBorderStyle,
              widthVal: resolved.headerBottomBorderWidth,
              colorVal: resolved.headerBottomBorderColor,
            },
            {
              title: 'خطوط افقی بین سطرها',
              styleKey: 'horizontalGridStyle' as const,
              widthKey: 'horizontalGridWidth' as const,
              colorKey: 'horizontalGridColor' as const,
              styleVal: resolved.horizontalGridStyle,
              widthVal: resolved.horizontalGridWidth,
              colorVal: resolved.horizontalGridColor,
            },
            {
              title: 'خطوط عمودی بین ستون‌ها',
              styleKey: 'verticalGridStyle' as const,
              widthKey: 'verticalGridWidth' as const,
              colorKey: 'verticalGridColor' as const,
              styleVal: resolved.verticalGridStyle,
              widthVal: resolved.verticalGridWidth,
              colorVal: resolved.verticalGridColor,
            },
          ].map((rule) => (
            <div key={rule.title} className="p-2.5 rounded-2xl liquid-glass-well space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
                  {rule.title}
                </span>
                <input
                  type="color"
                  aria-label={`رنگ ${rule.title}`}
                  value={rule.colorVal || '#000000'}
                  onChange={(e) => patchStyle({ [rule.colorKey]: e.target.value })}
                  className="w-6 h-6 rounded-lg border border-slate-300 dark:border-white/20 cursor-pointer bg-transparent p-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={rule.styleVal}
                  onChange={(e) => {
                    const nextStyle = e.target.value as TableBorderLineStyle;
                    patchStyle({
                      [rule.styleKey]: nextStyle,
                      [rule.widthKey]: nextStyle === 'none' ? 0 : rule.widthVal || 1,
                    });
                  }}
                  className="h-8 px-2 rounded-xl bg-white/85 dark:bg-slate-900/75 border border-slate-300/60 dark:border-white/15 text-[11px] text-slate-900 dark:text-slate-100 outline-none"
                >
                  {LINE_STYLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70">
                  {([0, 1, 2, 3] as const).map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() =>
                        patchStyle({
                          [rule.widthKey]: w,
                          [rule.styleKey]: w === 0 ? 'none' : rule.styleVal === 'none' ? 'solid' : rule.styleVal,
                        })
                      }
                      className={`flex-1 py-1 text-[10px] font-sans tabular-nums font-bold transition-colors cursor-pointer ${
                        rule.widthVal === w
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {w === 0 ? '۰' : `${toPersianDigits(w)}px`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Border Color Swatches */}
              <div className="flex items-center gap-1.5 pt-0.5">
                {EXCEL_COLOR_SWATCHES.borders.map((sw) => (
                  <button
                    key={sw.color}
                    type="button"
                    title={sw.label}
                    onClick={() => patchStyle({ [rule.colorKey]: sw.color })}
                    style={{ backgroundColor: sw.color }}
                    className={`w-5 h-5 rounded-full border transition-transform cursor-pointer ${
                      rule.colorVal?.toLowerCase() === sw.color
                        ? 'ring-2 ring-sky-500 scale-110 border-white'
                        : 'border-white/70 dark:border-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================
          3. HEADER, ZEBRA BANDING & TYPOGRAPHY COLORS
         ================================================================ */}
      {subSection === 'colors' && (
        <div className="space-y-3">
          {/* Header Row Styling */}
          <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-sky-600" />
                رنگ و متن سطر عنوان (سرستون):
              </span>
              <button
                type="button"
                onClick={() => patchStyle({ headerBold: !resolved.headerBold })}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 border cursor-pointer ${
                  resolved.headerBold
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/15'
                }`}
              >
                <Bold className="w-3 h-3" />
                <span>ضخیم</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {EXCEL_COLOR_SWATCHES.headers.map((sw) => (
                <button
                  key={sw.bg}
                  type="button"
                  title={sw.label}
                  onClick={() =>
                    patchStyle({ headerBgColor: sw.bg, headerTextColor: sw.text })
                  }
                  style={{ backgroundColor: sw.bg, color: sw.text }}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold border border-slate-300/80 dark:border-white/20 cursor-pointer ${
                    resolved.headerBgColor.toLowerCase() === sw.bg.toLowerCase()
                      ? 'ring-2 ring-sky-500'
                      : ''
                  }`}
                >
                  {sw.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">رنگ زمینه:</span>
                <input
                  type="color"
                  value={resolved.headerBgColor}
                  onChange={(e) => patchStyle({ headerBgColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">رنگ متن:</span>
                <input
                  type="color"
                  value={resolved.headerTextColor}
                  onChange={(e) => patchStyle({ headerTextColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
            </div>
          </div>

          {/* Banded Rows & Banded Columns */}
          <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2.5">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Rows className="w-3.5 h-3.5 text-emerald-600" />
                رنگ‌بندی سطرهای یکی‌درمیان (Zebra)
              </span>
              <input
                type="checkbox"
                checked={resolved.zebraRows}
                onChange={(e) => patchStyle({ zebraRows: e.target.checked })}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">سطر فرد:</span>
                <input
                  type="color"
                  value={resolved.oddRowBgColor}
                  onChange={(e) => patchStyle({ oddRowBgColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">سطر زوج:</span>
                <input
                  type="color"
                  value={resolved.evenRowBgColor}
                  onChange={(e) => patchStyle({ evenRowBgColor: e.target.value, zebraRows: true })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
            </div>

            <div className="pt-1 border-t border-slate-300/40 dark:border-white/10 flex items-center justify-between gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={resolved.bandedColumns}
                  onChange={(e) => patchStyle({ bandedColumns: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-0"
                />
                <span>ستون یکی‌درمیان</span>
              </label>
              <input
                type="color"
                aria-label="رنگ ستون یکی‌درمیان"
                value={resolved.bandedColumnBgColor}
                onChange={(e) =>
                  patchStyle({ bandedColumnBgColor: e.target.value, bandedColumns: true })
                }
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
            </div>
          </div>

          {/* Font Size, Padding & Text Color */}
          <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2.5">
            <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-600" />
              اندازه فونت، رنگ متن و ارتفاع سطرها:
            </span>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  فاصله و ارتفاع سطر:
                </span>
                <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70">
                  {(
                    [
                      { id: 'compact', label: 'فشرده' },
                      { id: 'normal', label: 'معمولی' },
                      { id: 'relaxed', label: 'باز' },
                    ] as const
                  ).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => patchStyle({ cellPadding: p.id })}
                      className={`flex-1 py-1.5 text-[10px] font-semibold cursor-pointer ${
                        resolved.cellPadding === p.id
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  اندازه متن:
                </span>
                <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70">
                  {(
                    [
                      { id: 'xs', label: 'کوچک' },
                      { id: 'sm', label: 'متوسط' },
                      { id: 'base', label: 'درشت' },
                    ] as const
                  ).map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => patchStyle({ fontSize: sz.id, headerFontSize: sz.id })}
                      className={`flex-1 py-1.5 text-[10px] font-semibold cursor-pointer ${
                        resolved.fontSize === sz.id
                          ? 'bg-sky-600 text-white'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {sz.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">رنگ متن:</span>
                <input
                  type="color"
                  value={resolved.textColor}
                  onChange={(e) => patchStyle({ textColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
              <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                <span className="text-[11px] text-slate-700 dark:text-slate-200">زمینه جمع:</span>
                <input
                  type="color"
                  value={resolved.summaryBgColor}
                  onChange={(e) => patchStyle({ summaryBgColor: e.target.value })}
                  className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================
          4. SPECIFIC ROW & COLUMN COLORS / WIDTHS (LIKE EXCEL FILL)
         ================================================================ */}
      {subSection === 'cells' && (
        <div className="space-y-3">
          {/* Per-Row Color Highlighting */}
          <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
                رنگ‌بندی یک سطر خاص:
              </span>
              {Object.keys(resolved.rowHighlights).length > 0 && (
                <button
                  type="button"
                  onClick={() => patchStyle({ rowHighlights: {} })}
                  className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  پاک کردن رنگ سطرها
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <select
                aria-label="انتخاب شماره سطر"
                value={selectedRowNum}
                onChange={(e) => setSelectedRowNum(Number(e.target.value))}
                className="flex-1 h-9 px-2.5 rounded-xl bg-white/85 dark:bg-slate-900/75 border border-slate-300/60 dark:border-white/15 text-xs text-slate-900 dark:text-slate-100 outline-none"
              >
                {Array.from({ length: maxRows }, (_, i) => i + 1).map((rNum) => (
                  <option key={rNum} value={rNum}>
                    سطر شماره {toPersianDigits(rNum)}
                    {resolved.rowHighlights[rNum]?.bgColor ? ' (رنگ‌دار)' : ''}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => patchRowHighlight({ bold: !rowHighlight.bold })}
                className={`h-9 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                  rowHighlight.bold
                    ? 'bg-sky-600 text-white border-sky-600'
                    : 'bg-white/85 dark:bg-slate-900/75 text-slate-700 dark:text-slate-200 border-slate-300/60 dark:border-white/15'
                }`}
              >
                <Bold className="w-3.5 h-3.5" />
                <span>بولد</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {EXCEL_COLOR_SWATCHES.cellFills.map((sw) => (
                <button
                  key={sw.label}
                  type="button"
                  title={sw.label}
                  onClick={() =>
                    sw.color
                      ? patchRowHighlight({ bgColor: sw.color })
                      : clearRowHighlight(selectedRowNum)
                  }
                  style={{ backgroundColor: sw.color || '#ffffff' }}
                  className={`w-6 h-6 rounded-lg border border-slate-300 dark:border-white/25 flex items-center justify-center text-[9px] cursor-pointer ${
                    (rowHighlight.bgColor || '') === sw.color ? 'ring-2 ring-sky-500 scale-105' : ''
                  }`}
                >
                  {!sw.color && '×'}
                </button>
              ))}
              <input
                type="color"
                aria-label="رنگ دلخواه سطر"
                value={rowHighlight.bgColor || '#fef9c3'}
                onChange={(e) => patchRowHighlight({ bgColor: e.target.value })}
                className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border border-slate-300 p-0"
              />
            </div>
          </div>

          {/* Per-Column Color & Width */}
          {activeCol && (
            <div className="p-2.5 rounded-2xl liquid-glass-well space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] text-slate-800 dark:text-slate-100">
                  رنگ و عرض یک ستون خاص:
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleColumnStyleChange(selectedColIdx, {
                      bgColor: undefined,
                      textColor: undefined,
                      headerBgColor: undefined,
                      headerTextColor: undefined,
                      bold: undefined,
                      widthPercent: undefined,
                    })
                  }
                  className="text-[10px] text-slate-500 hover:text-rose-600 cursor-pointer"
                >
                  ساده کردن ستون
                </button>
              </div>

              <div className="flex items-center gap-2">
                <select
                  aria-label="انتخاب ستون"
                  value={selectedColIdx}
                  onChange={(e) => setSelectedColIdx(Number(e.target.value))}
                  className="flex-1 h-9 px-2.5 rounded-xl bg-white/85 dark:bg-slate-900/75 border border-slate-300/60 dark:border-white/15 text-xs text-slate-900 dark:text-slate-100 outline-none"
                >
                  {columns.map((c, idx) => (
                    <option key={c.id || idx} value={idx}>
                      {toPersianDigits(idx + 1)}. {c.title}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    handleColumnStyleChange(selectedColIdx, { bold: !activeCol.bold })
                  }
                  className={`h-9 px-2.5 rounded-xl border text-[11px] font-bold flex items-center gap-1 cursor-pointer ${
                    activeCol.bold
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-white/85 dark:bg-slate-900/75 text-slate-700 dark:text-slate-200 border-slate-300/60 dark:border-white/15'
                  }`}
                >
                  <Bold className="w-3.5 h-3.5" />
                  <span>بولد</span>
                </button>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                  رنگ پس‌زمینه ستون در بدنه جدول:
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {EXCEL_COLOR_SWATCHES.cellFills.map((sw) => (
                    <button
                      key={sw.label}
                      type="button"
                      title={sw.label}
                      onClick={() =>
                        handleColumnStyleChange(selectedColIdx, { bgColor: sw.color || undefined })
                      }
                      style={{ backgroundColor: sw.color || '#ffffff' }}
                      className={`w-6 h-6 rounded-lg border border-slate-300 dark:border-white/25 flex items-center justify-center text-[9px] cursor-pointer ${
                        (activeCol.bgColor || '') === sw.color ? 'ring-2 ring-sky-500 scale-105' : ''
                      }`}
                    >
                      {!sw.color && '×'}
                    </button>
                  ))}
                  <input
                    type="color"
                    aria-label="رنگ دلخواه ستون"
                    value={activeCol.bgColor || '#eff6ff'}
                    onChange={(e) =>
                      handleColumnStyleChange(selectedColIdx, { bgColor: e.target.value })
                    }
                    className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border border-slate-300 p-0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                  <span className="text-[11px] text-slate-700 dark:text-slate-200">رنگ متن:</span>
                  <input
                    type="color"
                    value={activeCol.textColor || resolved.textColor}
                    onChange={(e) =>
                      handleColumnStyleChange(selectedColIdx, { textColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </label>

                <label className="flex items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/70 px-2.5 py-1.5 rounded-xl border border-slate-300/50 dark:border-white/15">
                  <span className="text-[11px] text-slate-700 dark:text-slate-200">سرستون:</span>
                  <input
                    type="color"
                    value={activeCol.headerBgColor || resolved.headerBgColor}
                    onChange={(e) =>
                      handleColumnStyleChange(selectedColIdx, { headerBgColor: e.target.value })
                    }
                    className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
                  />
                </label>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-600 dark:text-slate-300">
                  <span>عرض دقیق ستون:</span>
                  <span className="font-sans tabular-nums font-bold">
                    {activeCol.widthPercent ? `${toPersianDigits(activeCol.widthPercent)}٪` : 'خودکار'}
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={1}
                  value={activeCol.widthPercent || 15}
                  onChange={(e) =>
                    handleColumnStyleChange(selectedColIdx, {
                      widthPercent: Number(e.target.value),
                    })
                  }
                  className="w-full accent-sky-600 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

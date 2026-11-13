import type { CSSProperties } from 'react';
import type {
  FormField,
  TableBorderLineStyle,
  TableColumn,
  TableStyleConfig,
} from '../types/form';

export type ExcelBorderPresetId =
  | 'all'
  | 'outer_only'
  | 'horizontal_only'
  | 'no_vertical'
  | 'dashed'
  | 'thick_official'
  | 'none';

export interface ExcelTablePreset {
  id: string;
  label: string;
  description: string;
  config: TableStyleConfig;
}

export interface ResolvedTableStyle {
  presetId: string;
  outerBorderStyle: TableBorderLineStyle;
  outerBorderWidth: 0 | 1 | 2 | 3;
  outerBorderColor: string;
  horizontalGridStyle: TableBorderLineStyle;
  horizontalGridWidth: 0 | 1 | 2 | 3;
  horizontalGridColor: string;
  verticalGridStyle: TableBorderLineStyle;
  verticalGridWidth: 0 | 1 | 2 | 3;
  verticalGridColor: string;
  headerBottomBorderStyle: TableBorderLineStyle;
  headerBottomBorderWidth: 0 | 1 | 2 | 3;
  headerBottomBorderColor: string;
  headerBgColor: string;
  headerTextColor: string;
  headerBold: boolean;
  headerFontSize: 'xs' | 'sm' | 'base';
  headerAlign: 'inherit' | 'right' | 'center' | 'left';
  zebraRows: boolean;
  oddRowBgColor: string;
  evenRowBgColor: string;
  bandedColumns: boolean;
  bandedColumnBgColor: string;
  highlightFirstColumn: boolean;
  highlightLastColumn: boolean;
  textColor: string;
  fontSize: 'xs' | 'sm' | 'base';
  cellPadding: 'compact' | 'normal' | 'relaxed';
  rowHighlights: Record<number, { bgColor?: string; textColor?: string; bold?: boolean }>;
  summaryBgColor: string;
  summaryTextColor: string;
}

export const EXCEL_COLOR_SWATCHES = {
  headers: [
    { label: 'سفید رسمی', bg: '#ffffff', text: '#0f172a' },
    { label: 'طوسی اداری', bg: '#e2e8f0', text: '#0f172a' },
    { label: 'سرمه‌ای رسمی', bg: '#1e3a5f', text: '#ffffff' },
    { label: 'آبی اکسل', bg: '#1d4ed8', text: '#ffffff' },
    { label: 'سبز مالی', bg: '#15803d', text: '#ffffff' },
    { label: 'نارنجی صنعتی', bg: '#c2410c', text: '#ffffff' },
    { label: 'مشکی کلاسیک', bg: '#18181b', text: '#ffffff' },
  ],
  cellFills: [
    { label: 'بدون رنگ', color: '' },
    { label: 'سفید', color: '#ffffff' },
    { label: 'طوسی بسیار روشن', color: '#f8fafc' },
    { label: 'آبی ملایم', color: '#eff6ff' },
    { label: 'سبز ملایم', color: '#f0fdf4' },
    { label: 'زرد اکسل', color: '#fef9c3' },
    { label: 'صورتی هشدار', color: '#fff1f2' },
    { label: 'بنفش روشن', color: '#f5f3ff' },
  ],
  borders: [
    { label: 'مشکی رسمی', color: '#000000' },
    { label: 'سرمه‌ای تیره', color: '#1e293b' },
    { label: 'طوسی متوسط', color: '#64748b' },
    { label: 'طوسی روشن', color: '#cbd5e1' },
    { label: 'آبی اکسل', color: '#2563eb' },
    { label: 'سبز اکسل', color: '#16a34a' },
  ],
  textColors: [
    { label: 'مشکی', color: '#0f172a' },
    { label: 'خاکستری تیره', color: '#334155' },
    { label: 'سفید', color: '#ffffff' },
    { label: 'آبی تیره', color: '#1e40af' },
    { label: 'سبز تیره', color: '#166534' },
    { label: 'قرمز', color: '#b91c1c' },
  ],
};

export const EXCEL_TABLE_PRESETS: ExcelTablePreset[] = [
  {
    id: 'classic_official',
    label: 'رسمی اداری (مشکی)',
    description: 'کادر و خطوط مشکی استاندارد حواله و سند رسمی',
    config: {
      presetId: 'classic_official',
      outerBorderStyle: 'solid',
      outerBorderWidth: 2,
      outerBorderColor: '#000000',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#000000',
      verticalGridStyle: 'solid',
      verticalGridWidth: 2,
      verticalGridColor: '#000000',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#000000',
      headerBgColor: '#ffffff',
      headerTextColor: '#000000',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'center',
      zebraRows: false,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#f8fafc',
      bandedColumns: false,
      bandedColumnBgColor: '#f1f5f9',
      textColor: '#000000',
      fontSize: 'xs',
      cellPadding: 'normal',
      summaryBgColor: '#f8fafc',
      summaryTextColor: '#0f172a',
    },
  },
  {
    id: 'excel_blue',
    label: 'آبی شرکتی اکسل',
    description: 'سرستون آبی، ردیف‌های یکی‌درمیان و خطوط ظریف',
    config: {
      presetId: 'excel_blue',
      outerBorderStyle: 'solid',
      outerBorderWidth: 2,
      outerBorderColor: '#1d4ed8',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#bfdbfe',
      verticalGridStyle: 'solid',
      verticalGridWidth: 1,
      verticalGridColor: '#bfdbfe',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#1e40af',
      headerBgColor: '#1d4ed8',
      headerTextColor: '#ffffff',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'center',
      zebraRows: true,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#eff6ff',
      bandedColumns: false,
      bandedColumnBgColor: '#dbeafe',
      textColor: '#0f172a',
      fontSize: 'xs',
      cellPadding: 'normal',
      summaryBgColor: '#dbeafe',
      summaryTextColor: '#1e3a8a',
    },
  },
  {
    id: 'excel_green',
    label: 'سبز مالی و حسابداری',
    description: 'سبک اکسل سبز با ردیف‌های راه‌راه خوانا',
    config: {
      presetId: 'excel_green',
      outerBorderStyle: 'solid',
      outerBorderWidth: 2,
      outerBorderColor: '#15803d',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#bbf7d0',
      verticalGridStyle: 'solid',
      verticalGridWidth: 1,
      verticalGridColor: '#bbf7d0',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#166534',
      headerBgColor: '#15803d',
      headerTextColor: '#ffffff',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'center',
      zebraRows: true,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#f0fdf4',
      bandedColumns: false,
      bandedColumnBgColor: '#dcfce7',
      textColor: '#0f172a',
      fontSize: 'xs',
      cellPadding: 'normal',
      summaryBgColor: '#dcfce7',
      summaryTextColor: '#14532d',
    },
  },
  {
    id: 'excel_slate',
    label: 'طوسی مدرن سازمانی',
    description: 'سرستون طوسی ملایم و ردیف‌های متناوب تمیز',
    config: {
      presetId: 'excel_slate',
      outerBorderStyle: 'solid',
      outerBorderWidth: 1,
      outerBorderColor: '#475569',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#cbd5e1',
      verticalGridStyle: 'solid',
      verticalGridWidth: 1,
      verticalGridColor: '#cbd5e1',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#334155',
      headerBgColor: '#e2e8f0',
      headerTextColor: '#0f172a',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'center',
      zebraRows: true,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#f8fafc',
      bandedColumns: false,
      bandedColumnBgColor: '#f1f5f9',
      textColor: '#0f172a',
      fontSize: 'xs',
      cellPadding: 'normal',
      summaryBgColor: '#f1f5f9',
      summaryTextColor: '#0f172a',
    },
  },
  {
    id: 'excel_amber',
    label: 'نارنجی انبار و صنعتی',
    description: 'سرستون گرم صنعتی با تفکیک واضح سطرها',
    config: {
      presetId: 'excel_amber',
      outerBorderStyle: 'solid',
      outerBorderWidth: 2,
      outerBorderColor: '#c2410c',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#fed7aa',
      verticalGridStyle: 'solid',
      verticalGridWidth: 1,
      verticalGridColor: '#fed7aa',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#9a3412',
      headerBgColor: '#c2410c',
      headerTextColor: '#ffffff',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'center',
      zebraRows: true,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#fff7ed',
      bandedColumns: false,
      bandedColumnBgColor: '#ffedd5',
      textColor: '#0f172a',
      fontSize: 'xs',
      cellPadding: 'normal',
      summaryBgColor: '#ffedd5',
      summaryTextColor: '#7c2d12',
    },
  },
  {
    id: 'minimal_clean',
    label: 'ساده و بدون خط عمودی',
    description: 'فقط خطوط افقی نازک بین ردیف‌ها (سبک گزارش مدرن)',
    config: {
      presetId: 'minimal_clean',
      outerBorderStyle: 'none',
      outerBorderWidth: 0,
      outerBorderColor: '#cbd5e1',
      horizontalGridStyle: 'solid',
      horizontalGridWidth: 1,
      horizontalGridColor: '#cbd5e1',
      verticalGridStyle: 'none',
      verticalGridWidth: 0,
      verticalGridColor: '#cbd5e1',
      headerBottomBorderStyle: 'solid',
      headerBottomBorderWidth: 2,
      headerBottomBorderColor: '#0f172a',
      headerBgColor: '#f8fafc',
      headerTextColor: '#0f172a',
      headerBold: true,
      headerFontSize: 'xs',
      headerAlign: 'inherit',
      zebraRows: false,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#f8fafc',
      bandedColumns: false,
      bandedColumnBgColor: '#f8fafc',
      textColor: '#0f172a',
      fontSize: 'xs',
      cellPadding: 'relaxed',
      summaryBgColor: '#f8fafc',
      summaryTextColor: '#0f172a',
    },
  },
];

export function resolveTableStyle(field?: FormField): ResolvedTableStyle {
  const isDispatch = field?.tableVariant === 'dispatch';
  const isThick = isDispatch || field?.tableBorderThickness === 'thick';
  const baseDefault: ResolvedTableStyle = {
    presetId: isThick ? 'classic_official' : 'custom',
    outerBorderStyle: 'solid',
    outerBorderWidth: isThick ? 2 : 1,
    outerBorderColor: isThick ? '#000000' : '#94a3b8',
    horizontalGridStyle: 'solid',
    horizontalGridWidth: 1,
    horizontalGridColor: isThick ? '#000000' : '#cbd5e1',
    verticalGridStyle: 'solid',
    verticalGridWidth: isThick ? 2 : 1,
    verticalGridColor: isThick ? '#000000' : '#cbd5e1',
    headerBottomBorderStyle: 'solid',
    headerBottomBorderWidth: isThick ? 2 : 1,
    headerBottomBorderColor: isThick ? '#000000' : '#94a3b8',
    headerBgColor: isDispatch ? '#ffffff' : '#f1f5f9',
    headerTextColor: '#0f172a',
    headerBold: true,
    headerFontSize: 'xs',
    headerAlign: isDispatch ? 'center' : 'inherit',
    zebraRows: false,
    oddRowBgColor: '#ffffff',
    evenRowBgColor: '#f8fafc',
    bandedColumns: false,
    bandedColumnBgColor: '#f1f5f9',
    highlightFirstColumn: false,
    highlightLastColumn: false,
    textColor: '#0f172a',
    fontSize: 'xs',
    cellPadding: 'normal',
    rowHighlights: {},
    summaryBgColor: '#f8fafc',
    summaryTextColor: '#0f172a',
  };

  const ts = field?.tableStyle;
  if (!ts) return baseDefault;

  return {
    ...baseDefault,
    ...ts,
    rowHighlights: ts.rowHighlights || {},
  };
}

export function applyExcelStylePreset(presetId: string): TableStyleConfig {
  const found = EXCEL_TABLE_PRESETS.find((p) => p.id === presetId) || EXCEL_TABLE_PRESETS[0];
  return { ...found.config, rowHighlights: {} };
}

export function applyExcelBorderPreset(
  current: TableStyleConfig | undefined,
  preset: ExcelBorderPresetId
): TableStyleConfig {
  const base: TableStyleConfig = { ...(current || {}) };
  const color = base.outerBorderColor || base.horizontalGridColor || '#000000';

  switch (preset) {
    case 'all':
      return {
        ...base,
        outerBorderStyle: 'solid',
        outerBorderWidth: 1,
        outerBorderColor: color,
        horizontalGridStyle: 'solid',
        horizontalGridWidth: 1,
        horizontalGridColor: color,
        verticalGridStyle: 'solid',
        verticalGridWidth: 1,
        verticalGridColor: color,
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: color,
      };
    case 'thick_official':
      return {
        ...base,
        outerBorderStyle: 'solid',
        outerBorderWidth: 2,
        outerBorderColor: '#000000',
        horizontalGridStyle: 'solid',
        horizontalGridWidth: 1,
        horizontalGridColor: '#000000',
        verticalGridStyle: 'solid',
        verticalGridWidth: 2,
        verticalGridColor: '#000000',
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: '#000000',
      };
    case 'outer_only':
      return {
        ...base,
        outerBorderStyle: 'solid',
        outerBorderWidth: 2,
        outerBorderColor: color,
        horizontalGridStyle: 'none',
        horizontalGridWidth: 0,
        verticalGridStyle: 'none',
        verticalGridWidth: 0,
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: color,
      };
    case 'horizontal_only':
      return {
        ...base,
        outerBorderStyle: 'none',
        outerBorderWidth: 0,
        horizontalGridStyle: 'solid',
        horizontalGridWidth: 1,
        horizontalGridColor: color,
        verticalGridStyle: 'none',
        verticalGridWidth: 0,
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: color,
      };
    case 'no_vertical':
      return {
        ...base,
        outerBorderStyle: 'solid',
        outerBorderWidth: 1,
        outerBorderColor: color,
        horizontalGridStyle: 'solid',
        horizontalGridWidth: 1,
        horizontalGridColor: color,
        verticalGridStyle: 'none',
        verticalGridWidth: 0,
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: color,
      };
    case 'dashed':
      return {
        ...base,
        outerBorderStyle: 'solid',
        outerBorderWidth: 2,
        outerBorderColor: color,
        horizontalGridStyle: 'dashed',
        horizontalGridWidth: 1,
        horizontalGridColor: color,
        verticalGridStyle: 'dashed',
        verticalGridWidth: 1,
        verticalGridColor: color,
        headerBottomBorderStyle: 'solid',
        headerBottomBorderWidth: 2,
        headerBottomBorderColor: color,
      };
    case 'none':
      return {
        ...base,
        outerBorderStyle: 'none',
        outerBorderWidth: 0,
        horizontalGridStyle: 'none',
        horizontalGridWidth: 0,
        verticalGridStyle: 'none',
        verticalGridWidth: 0,
        headerBottomBorderStyle: 'none',
        headerBottomBorderWidth: 0,
      };
  }
}

export function formatCssBorder(
  style: TableBorderLineStyle | undefined,
  width: number | undefined,
  color: string | undefined
): string {
  if (!style || style === 'none' || !width || width <= 0) {
    return 'none';
  }
  const effectiveWidth = style === 'double' && width < 3 ? 3 : width;
  return `${effectiveWidth}px ${style} ${color || '#000000'}`;
}

export function getTableWrapperStyle(resolved: ResolvedTableStyle): CSSProperties {
  const outer = formatCssBorder(
    resolved.outerBorderStyle,
    resolved.outerBorderWidth,
    resolved.outerBorderColor
  );
  return {
    border: outer === 'none' ? 'none' : outer,
  };
}

export function getFontSizePx(size: 'xs' | 'sm' | 'base' | undefined): string {
  switch (size) {
    case 'sm':
      return '13px';
    case 'base':
      return '14px';
    default:
      return '11.5px';
  }
}

export function getCellPaddingStyle(padding: 'compact' | 'normal' | 'relaxed' | undefined): string {
  switch (padding) {
    case 'compact':
      return '3px 6px';
    case 'relaxed':
      return '9px 10px';
    default:
      return '5px 8px';
  }
}

export function getHeaderCellCssStyle(
  resolved: ResolvedTableStyle,
  col: TableColumn,
  colIndex: number,
  totalCols: number,
  includeTrailingActionCol = false
): CSSProperties {
  const headerBottom = formatCssBorder(
    resolved.headerBottomBorderStyle,
    resolved.headerBottomBorderWidth,
    resolved.headerBottomBorderColor
  );
  const vertical = formatCssBorder(
    resolved.verticalGridStyle,
    resolved.verticalGridWidth,
    resolved.verticalGridColor
  );

  // In RTL, column 0 is on the right and last column is on the left.
  // Vertical gridlines appear on the left edge (borderLeft) of every column except the very last column.
  const isLastVisualCol = !includeTrailingActionCol && colIndex === totalCols - 1;

  const align =
    resolved.headerAlign && resolved.headerAlign !== 'inherit'
      ? resolved.headerAlign
      : col.align || 'center';

  return {
    backgroundColor: col.headerBgColor || resolved.headerBgColor,
    color: col.headerTextColor || resolved.headerTextColor,
    fontWeight: resolved.headerBold ? 700 : 500,
    fontSize: getFontSizePx(resolved.headerFontSize),
    padding: getCellPaddingStyle(resolved.cellPadding),
    textAlign: align,
    borderBottom: headerBottom,
    borderLeft: isLastVisualCol ? 'none' : vertical,
    width: col.widthPercent ? `${col.widthPercent}%` : undefined,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  } as CSSProperties;
}

export function getBodyCellCssStyle(
  resolved: ResolvedTableStyle,
  col: TableColumn,
  rowIndex: number,
  totalRows: number,
  colIndex: number,
  totalCols: number,
  includeTrailingActionCol = false
): CSSProperties {
  const horizontal = formatCssBorder(
    resolved.horizontalGridStyle,
    resolved.horizontalGridWidth,
    resolved.horizontalGridColor
  );
  const vertical = formatCssBorder(
    resolved.verticalGridStyle,
    resolved.verticalGridWidth,
    resolved.verticalGridColor
  );

  const isLastRow = rowIndex === totalRows - 1;
  const isLastVisualCol = !includeTrailingActionCol && colIndex === totalCols - 1;

  // Priority: Per-row highlight > Per-column fill > Banded Column > Zebra Row > Odd row base
  const rowHighlight = resolved.rowHighlights?.[rowIndex + 1];
  let backgroundColor = resolved.oddRowBgColor || '#ffffff';
  if (resolved.zebraRows && rowIndex % 2 === 1) {
    backgroundColor = resolved.evenRowBgColor || '#f8fafc';
  }
  if (resolved.bandedColumns && colIndex % 2 === 1) {
    backgroundColor = resolved.bandedColumnBgColor || '#f1f5f9';
  }
  if (col.bgColor) {
    backgroundColor = col.bgColor;
  }
  if (rowHighlight?.bgColor) {
    backgroundColor = rowHighlight.bgColor;
  }

  const isFirstHighlight = resolved.highlightFirstColumn && colIndex === 0;
  const isLastHighlight = resolved.highlightLastColumn && colIndex === totalCols - 1;

  const color =
    rowHighlight?.textColor ||
    col.textColor ||
    resolved.textColor ||
    '#0f172a';

  const fontWeight =
    rowHighlight?.bold || col.bold || isFirstHighlight || isLastHighlight ? 700 : 400;

  return {
    backgroundColor,
    color,
    fontWeight,
    fontSize: getFontSizePx(resolved.fontSize),
    padding: getCellPaddingStyle(resolved.cellPadding),
    textAlign: col.align || (col.id === 'description' || col.id === 'notes' ? 'right' : 'center'),
    borderBottom: isLastRow ? 'none' : horizontal,
    borderLeft: isLastVisualCol ? 'none' : vertical,
    width: col.widthPercent ? `${col.widthPercent}%` : undefined,
    WebkitPrintColorAdjust: 'exact',
    printColorAdjust: 'exact',
  } as CSSProperties;
}

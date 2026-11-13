import test from 'node:test';
import assert from 'node:assert/strict';
import type { FormField, TableColumn } from '../types/form';
import {
  EXCEL_TABLE_PRESETS,
  applyExcelBorderPreset,
  applyExcelStylePreset,
  formatCssBorder,
  getBodyCellCssStyle,
  getHeaderCellCssStyle,
  resolveTableStyle,
} from './tableStyling';
import { resolveHeaderLogo } from './companyBrand';

test('resolveTableStyle preserves legacy dispatch thick black grid defaults when no custom tableStyle exists', () => {
  const dispatchField: FormField = {
    id: 't1',
    type: 'table',
    label: 'جدول حواله',
    width: '100%',
    tableVariant: 'dispatch',
  };
  const resolved = resolveTableStyle(dispatchField);
  assert.equal(resolved.outerBorderWidth, 2);
  assert.equal(resolved.outerBorderColor, '#000000');
  assert.equal(resolved.verticalGridWidth, 2);
  assert.equal(resolved.horizontalGridWidth, 1);
  assert.equal(resolved.zebraRows, false);
});

test('applyExcelStylePreset returns distinct Excel theme styling for excel_blue', () => {
  const blueConfig = applyExcelStylePreset('excel_blue');
  assert.equal(blueConfig.headerBgColor, '#1d4ed8');
  assert.equal(blueConfig.headerTextColor, '#ffffff');
  assert.equal(blueConfig.zebraRows, true);
  assert.equal(blueConfig.evenRowBgColor, '#eff6ff');
  assert.ok(EXCEL_TABLE_PRESETS.length >= 6);
});

test('applyExcelBorderPreset configures all, outer_only, horizontal_only, dashed, and none cleanly', () => {
  const none = applyExcelBorderPreset({}, 'none');
  assert.equal(none.outerBorderStyle, 'none');
  assert.equal(none.horizontalGridStyle, 'none');
  assert.equal(none.verticalGridStyle, 'none');

  const horizontalOnly = applyExcelBorderPreset({ outerBorderColor: '#334155' }, 'horizontal_only');
  assert.equal(horizontalOnly.outerBorderStyle, 'none');
  assert.equal(horizontalOnly.verticalGridStyle, 'none');
  assert.equal(horizontalOnly.horizontalGridStyle, 'solid');
  assert.equal(horizontalOnly.headerBottomBorderWidth, 2);

  const dashed = applyExcelBorderPreset({}, 'dashed');
  assert.equal(dashed.horizontalGridStyle, 'dashed');
  assert.equal(dashed.verticalGridStyle, 'dashed');
  assert.equal(formatCssBorder('double', 2, '#000000'), '3px double #000000');
});

test('getBodyCellCssStyle respects priority: rowHighlight > column bgColor > bandedColumns > zebraRows', () => {
  const field: FormField = {
    id: 't2',
    type: 'table',
    label: 'جدول',
    width: '100%',
    tableStyle: {
      zebraRows: true,
      oddRowBgColor: '#ffffff',
      evenRowBgColor: '#eff6ff',
      bandedColumns: true,
      bandedColumnBgColor: '#f1f5f9',
      rowHighlights: {
        2: { bgColor: '#fef9c3', textColor: '#854d0e', bold: true },
      },
    },
  };
  const resolved = resolveTableStyle(field);
  const cols: TableColumn[] = [
    { id: 'c1', title: 'ستون ۱', type: 'text', align: 'center' },
    { id: 'c2', title: 'ستون ۲', type: 'text', align: 'right', bgColor: '#dcfce7' },
    { id: 'c3', title: 'ستون ۳', type: 'text', align: 'center' },
  ];

  // Row 0, Col 0 -> odd base white
  const r0c0 = getBodyCellCssStyle(resolved, cols[0], 0, 3, 0, 3);
  assert.equal(r0c0.backgroundColor, '#ffffff');

  // Row 0, Col 1 -> column bgColor overrides banded column
  const r0c1 = getBodyCellCssStyle(resolved, cols[1], 0, 3, 1, 3);
  assert.equal(r0c1.backgroundColor, '#dcfce7');

  // Row 1 (2nd row, 1-indexed = 2), Col 0 -> rowHighlight overrides zebra/column
  const r1c0 = getBodyCellCssStyle(resolved, cols[0], 1, 3, 0, 3);
  assert.equal(r1c0.backgroundColor, '#fef9c3');
  assert.equal(r1c0.color, '#854d0e');
  assert.equal(r1c0.fontWeight, 700);
  // Last row should suppress bottom border inside wrapper
  const lastRowCell = getBodyCellCssStyle(resolved, cols[0], 2, 3, 0, 3);
  assert.equal(lastRowCell.borderBottom, 'none');
});

test('getHeaderCellCssStyle applies custom header colors and hides left border on last visual RTL column', () => {
  const resolved = resolveTableStyle({
    id: 't3',
    type: 'table',
    label: 'جدول',
    width: '100%',
    tableStyle: applyExcelStylePreset('excel_green'),
  });
  const cols: TableColumn[] = [
    { id: 'a', title: 'الف', type: 'text' },
    { id: 'b', title: 'ب', type: 'text', headerBgColor: '#065f46' },
  ];
  const h0 = getHeaderCellCssStyle(resolved, cols[0], 0, 2);
  const h1 = getHeaderCellCssStyle(resolved, cols[1], 1, 2);
  assert.equal(h0.backgroundColor, '#15803d');
  assert.notEqual(h0.borderLeft, 'none');
  assert.equal(h1.backgroundColor, '#065f46');
  assert.equal(h1.borderLeft, 'none');
});

test('resolveHeaderLogo prefers field custom logo, falls back to company brand, and respects none mode', () => {
  const fieldWithLogo: FormField = {
    id: 'h1',
    type: 'header_banner',
    label: 'سربرگ',
    width: '100%',
    logoUrl: 'data:image/png;base64,FIELDLOGO',
    logoMode: 'custom',
    logoSize: 'lg',
  };
  const r1 = resolveHeaderLogo(fieldWithLogo, { logoUrl: 'data:image/png;base64,BRANDLOGO' });
  assert.equal(r1.mode, 'custom');
  assert.equal(r1.logoUrl, 'data:image/png;base64,FIELDLOGO');
  assert.equal(r1.sizePx, 68);

  const fieldUsingBrand: FormField = {
    id: 'h2',
    type: 'header_banner',
    label: 'سربرگ',
    width: '100%',
  };
  const r2 = resolveHeaderLogo(fieldUsingBrand, { logoUrl: 'data:image/png;base64,BRANDLOGO', logoSize: 'sm' });
  assert.equal(r2.mode, 'custom');
  assert.equal(r2.logoUrl, 'data:image/png;base64,BRANDLOGO');
  assert.equal(r2.sizePx, 36);

  const fieldNone: FormField = {
    id: 'h3',
    type: 'header_banner',
    label: 'سربرگ',
    width: '100%',
    logoMode: 'none',
  };
  const r3 = resolveHeaderLogo(fieldNone, { logoUrl: 'data:image/png;base64,BRANDLOGO' });
  assert.equal(r3.mode, 'none');
  assert.equal(r3.logoUrl, undefined);
});

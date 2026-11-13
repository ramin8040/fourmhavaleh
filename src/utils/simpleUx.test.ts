import test from 'node:test';
import assert from 'node:assert/strict';
import { FormTemplate, TableItemRow } from '../types/form';
import {
  getFriendlyTemplateMeta,
  getSimpleStepInstruction,
  getVisibleWizardRows,
} from './simpleUx';

const makeRow = (idx: number, description = '', quantity = 0): TableItemRow => ({
  id: `r-${idx}`,
  rowNumber: idx,
  description,
  quantity,
  unit: '',
  unitPrice: 0,
  totalPrice: 0,
});

const sampleTemplate: FormTemplate = {
  id: 'preset_dispatch_voucher',
  title: 'حواله خروج محصول',
  description: 'توضیح فنی',
  category: 'انبار',
  paperSize: 'A4',
  orientation: 'landscape',
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  fields: [],
};

test('getFriendlyTemplateMeta maps domain templates to plain friendly descriptions and tones', () => {
  const meta = getFriendlyTemplateMeta(sampleTemplate);
  assert.equal(meta.tone, 'sky');
  assert.ok(meta.shortHint.includes('انبار'));

  const unknownMeta = getFriendlyTemplateMeta({
    ...sampleTemplate,
    title: 'فرم دلخواه کاربر',
    description: 'توضیح دلخواه',
  });
  assert.equal(unknownMeta.shortHint, 'توضیح دلخواه');
  assert.equal(unknownMeta.tone, 'sky');
});

test('getSimpleStepInstruction returns plain, non-jargon guidance for all 3 steps', () => {
  const s1 = getSimpleStepInstruction(1);
  const s2 = getSimpleStepInstruction(2);
  const s3 = getSimpleStepInstruction(3);
  assert.ok(s1.title.includes('۱'));
  assert.ok(s2.title.includes('۲'));
  assert.ok(s3.title.includes('۳'));
  assert.ok(s1.helper.length > 10 && s2.helper.length > 10 && s3.helper.length > 10);
});

test('getVisibleWizardRows progressively reveals empty rows without overwhelming the user', () => {
  const tenEmptyRows = Array.from({ length: 10 }, (_, idx) => makeRow(idx + 1));
  const initial = getVisibleWizardRows(tenEmptyRows, false, 2);
  assert.equal(initial.visibleRows.length, 2);
  assert.equal(initial.hiddenEmptyCount, 8);

  // If row 4 is populated, show rows 1..5 (up to 1 trailing empty row)
  const partialRows = tenEmptyRows.map((r, idx) =>
    idx === 3 ? makeRow(4, 'پروفیل آلومینیوم', 3) : r
  );
  const expanded = getVisibleWizardRows(partialRows, false, 2);
  assert.equal(expanded.visibleRows.length, 5);
  assert.equal(expanded.hiddenEmptyCount, 5);

  // When showAllRows is true, return all rows
  const all = getVisibleWizardRows(tenEmptyRows, true, 2);
  assert.equal(all.visibleRows.length, 10);
  assert.equal(all.hiddenEmptyCount, 0);
});

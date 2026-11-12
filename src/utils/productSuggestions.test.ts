import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePersianSearch,
  extractProductHistory,
  getMatchingProducts,
  applyProductSuggestionToRow,
  ProductSuggestion,
} from './productSuggestions';
import { FormRecord, TableItemRow } from '../types/form';

test('normalizePersianSearch handles Persian and Arabic characters and digits', () => {
  assert.equal(normalizePersianSearch('دريل برقي'), 'دریل برقی');
  assert.equal(normalizePersianSearch('كارتن ۵ لایه'), 'کارتن 5 لایه');
  assert.equal(normalizePersianSearch('  فیلتر   آب  '), 'فیلتر آب');
});

test('extractProductHistory pulls and counts items across records and templates', () => {
  const dummyRecords: FormRecord[] = [
    {
      id: 'rec-1',
      formId: 'tpl-1',
      recordNumber: 'REC-001',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-01',
      status: 'finalized',
      data: {},
      tableData: {
        'table-1': [
          {
            id: 'r1',
            rowNumber: 1,
            description: 'کابل شبکه Cat6 شیلددار',
            unit: 'متر',
            quantity: 2,
          },
          {
            id: 'r2',
            rowNumber: 2,
            description: 'روغن هیدرولیک صنعتی',
            unit: 'لیتر',
            quantity: 5,
            productCode: 'OIL-01',
          },
        ],
      },
    },
    {
      id: 'rec-2',
      formId: 'tpl-1',
      recordNumber: 'REC-002',
      createdAt: '2026-01-02',
      updatedAt: '2026-01-02',
      status: 'finalized',
      data: {},
      tableData: {
        'table-1': [
          {
            id: 'r3',
            rowNumber: 1,
            description: 'کابل شبکه Cat6 شیلددار', // repeated!
            unit: 'متر',
            quantity: 3,
          },
        ],
      },
    },
  ];

  const history = extractProductHistory(dummyRecords, []);
  const cableItem = history.find((h) => h.description.includes('کابل شبکه'));
  assert.ok(cableItem, 'Found cable item');
  assert.equal(cableItem.frequency, 2, 'Frequency incremented for duplicate items');
  assert.equal(cableItem.unit, 'متر', 'Unit persisted correctly');
});

test('getMatchingProducts ranks prefix matches first and finds partial queries', () => {
  const catalog: ProductSuggestion[] = [
    { description: 'دریل برقی چکشی', frequency: 1 },
    { description: 'دریل شارژی رونیکس', frequency: 3 },
    { description: 'مته دریل فولادی', frequency: 2 },
    { description: 'آچار فرانسه ۱۰ اینچ', frequency: 4 },
  ];

  const results = getMatchingProducts('دریل', catalog);
  assert.ok(results.length >= 3);
  // 'دریل برقی' or 'دریل شارژی' starts with 'دریل' so should come before 'مته دریل'
  assert.equal(results[0].description.startsWith('دریل'), true);
  assert.equal(results[1].description.startsWith('دریل'), true);

  // Partial match inside
  const matchAchar = getMatchingProducts('فرانسه', catalog);
  assert.equal(matchAchar[0].description, 'آچار فرانسه ۱۰ اینچ');
});

test('applyProductSuggestionToRow fills description and companion empty columns', () => {
  const row: TableItemRow = {
    id: 'row-1',
    rowNumber: 1,
    description: '',
    quantity: 2,
    unit: '',
    productCode: '',
  };

  const suggestion: ProductSuggestion = {
    description: 'روغن صنعتی هیدرولیک ۶۸',
    productCode: 'OIL-H68',
    unit: 'لیتر',
    unitPrice: 1200000,
    frequency: 5,
  };

  const updated = applyProductSuggestionToRow(row, suggestion);
  assert.equal(updated.description, 'روغن صنعتی هیدرولیک ۶۸');
  assert.equal(updated.productCode, 'OIL-H68');
  assert.equal(updated.unit, 'لیتر');
  assert.equal(updated.unitPrice, 1200000);
  assert.equal(updated.totalPrice, 2400000); // quantity (2) * unitPrice (1,200,000)
});

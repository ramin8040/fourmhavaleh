import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toPersianDigits,
  formatCurrency,
  calculateRowTotal,
  calculateTableSummary,
  generateRecordNumber,
  generateCsvExport,
  filterFormRecords,
  extractRecordPreviewData,
} from './formLogic';
import { FormRecord, FormTemplate } from '../types/form';

test('toPersianDigits converts digits correctly', () => {
  assert.equal(toPersianDigits('12345'), '۱۲۳۴۵');
  assert.equal(toPersianDigits(1403), '۱۴۰۳');
  assert.equal(toPersianDigits(''), '');
});

test('formatCurrency formats with thousands separators and Persian digits', () => {
  assert.equal(formatCurrency(1500000), '۱,۵۰۰,۰۰۰');
  assert.equal(formatCurrency(0), '۰');
  assert.equal(formatCurrency(1000, false), '1,000');
});

test('calculateRowTotal computes quantity * unitPrice correctly', () => {
  assert.equal(calculateRowTotal(5, 20000), 100000);
  assert.equal(calculateRowTotal(0, 50000), 0);
  assert.equal(calculateRowTotal(2.5, 10000), 25000);
});

test('calculateTableSummary handles subtotals, discount, and tax correctly', () => {
  const rows = [
    { id: '1', rowNumber: 1, description: 'کالای ۱', quantity: 2, unitPrice: 50000, totalPrice: 100000 },
    { id: '2', rowNumber: 2, description: 'کالای ۲', quantity: 1, unitPrice: 200000, totalPrice: 200000 },
  ];

  // Subtotal = 300,000. Discount = 50,000. Taxable = 250,000. Tax (10%) = 25,000. GrandTotal = 275,000.
  const summary = calculateTableSummary(rows, 50000, 10);
  assert.equal(summary.subtotal, 300000);
  assert.equal(summary.discountAmount, 50000);
  assert.equal(summary.taxableAmount, 250000);
  assert.equal(summary.taxAmount, 25000);
  assert.equal(summary.grandTotal, 275000);
  assert.equal(summary.itemsCount, 2);
});

test('generateRecordNumber pads index properly', () => {
  assert.equal(generateRecordNumber(1, 'INV'), 'INV-1403-0001');
  assert.equal(generateRecordNumber(42, 'DOC'), 'DOC-1403-0042');
});

test('generateCsvExport produces valid CSV with BOM', () => {
  const headers = [
    { id: 'name', label: 'نام مشتری' },
    { id: 'amount', label: 'مبلغ' },
  ];
  const records = [
    {
      recordNumber: 'DOC-1403-0001',
      createdAt: '1403/08/20',
      data: { name: 'شرکت رایان', amount: '۱۵۰,۰۰۰' },
    },
  ];

  const csv = generateCsvExport(headers, records);
  assert.ok(csv.startsWith('\uFEFF'));
  assert.ok(csv.includes('نام مشتری'));
  assert.ok(csv.includes('شرکت رایان'));
  assert.ok(csv.includes('DOC-1403-0001'));
});

test('filterFormRecords filters by keyword in form data (letter number, customer name) and table data', () => {
  const sampleRecords: FormRecord[] = [
    {
      id: 'rec-1',
      formId: 'preset_dispatch_voucher',
      recordNumber: 'AW-1403-0001',
      createdAt: '2026-11-01T10:00:00.000Z',
      updatedAt: '2026-11-01T10:00:00.000Z',
      status: 'finalized',
      data: {
        letterNumber: 'ن/۱۴۰۳/۸۹۰',
        customerName: 'شرکت پتروشیمی زاگرس',
        receiverName: 'علی رضایی',
      },
      tableData: {
        table_products: [
          {
            id: 'row-1',
            rowNumber: 1,
            productCode: 'AW-902',
            description: 'تلویزیون ۵۵ اینچ اسمارت',
            quantity: 4,
            unit: 'دستگاه',
            serialNumber: 'SN-778899',
          },
        ],
      },
    },
    {
      id: 'rec-2',
      formId: 'preset_official_invoice',
      recordNumber: 'INV-1403-0002',
      createdAt: '2026-11-09T14:30:00.000Z',
      updatedAt: '2026-11-09T14:30:00.000Z',
      status: 'finalized',
      data: {
        letterNumber: 'ن/۱۴۰۳/۹۱۲',
        customerName: 'فروشگاه سپهر الکترونیک',
      },
      tableData: {},
    },
    {
      id: 'rec-3',
      formId: 'preset_dispatch_voucher',
      recordNumber: 'AW-1403-0003',
      createdAt: '2026-10-15T09:00:00.000Z',
      updatedAt: '2026-10-15T09:00:00.000Z',
      status: 'finalized',
      data: {
        customerName: 'صنایع فولاد هرمزگان',
      },
      tableData: {},
    },
  ];


  // 1. Search by letter number (Persian digits or English digits)
  const byLetter = filterFormRecords(sampleRecords, { searchQuery: '890' });
  assert.equal(byLetter.length, 1);
  assert.equal(byLetter[0].id, 'rec-1');

  // 2. Search by customer name
  const byCustomer = filterFormRecords(sampleRecords, { searchQuery: 'سپهر الکترونیک' });
  assert.equal(byCustomer.length, 1);
  assert.equal(byCustomer[0].id, 'rec-2');

  // 3. Search by table product code
  const byCode = filterFormRecords(sampleRecords, { searchQuery: 'AW-902' });
  assert.equal(byCode.length, 1);
  assert.equal(byCode[0].id, 'rec-1');

  // 4. Search by serial number
  const bySerial = filterFormRecords(sampleRecords, { searchQuery: 'SN-778899' });
  assert.equal(bySerial.length, 1);
  assert.equal(bySerial[0].id, 'rec-1');

  // 5. Filter by Date range (2026-11-01 to 2026-11-10)
  const byDateRange = filterFormRecords(sampleRecords, {
    dateFrom: '2026-11-01',
    dateTo: '2026-11-10',
  });
  assert.equal(byDateRange.length, 2); // rec-1 and rec-2, rec-3 is in October

  // 6. Filter by formId + search
  const byFormAndSearch = filterFormRecords(sampleRecords, {
    formId: 'preset_dispatch_voucher',
    searchQuery: 'فولاد',
  });
  assert.equal(byFormAndSearch.length, 1);
  assert.equal(byFormAndSearch[0].id, 'rec-3');

  // 7. Advanced: Search specifically by documentNumber
  const byDocNumber = filterFormRecords(sampleRecords, {
    documentNumber: 'AW-1403-0001',
  });
  assert.equal(byDocNumber.length, 1);
  assert.equal(byDocNumber[0].id, 'rec-1');

  // 8. Advanced: Search specifically by customerName
  const byCustomerSpecific = filterFormRecords(sampleRecords, {
    customerName: 'پتروشیمی',
  });
  assert.equal(byCustomerSpecific.length, 1);
  assert.equal(byCustomerSpecific[0].id, 'rec-1');

  // 9. Advanced: Combined documentNumber + customerName + dateRange
  const byCombined = filterFormRecords(sampleRecords, {
    documentNumber: '0001',
    customerName: 'زاگرس',
    dateFrom: '2026-11-01',
    dateTo: '2026-11-05',
  });
  assert.equal(byCombined.length, 1);
  assert.equal(byCombined[0].id, 'rec-1');

  // 10. Combined with no match
  const noMatch = filterFormRecords(sampleRecords, {
    documentNumber: '0001',
    customerName: 'فولاد', // belongs to 0003, not 0001
  });
  assert.equal(noMatch.length, 0);
});

test('dynamic table column manipulation and custom fields', () => {
  const columns = [
    { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' as const },
    { id: 'productCode', title: 'کد کالا', width: 'w-24', type: 'text' as const },
    { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number' as const },
    { id: 'unitPrice', title: 'فی', width: 'w-24', type: 'currency' as const },
    { id: 'totalPrice', title: 'جمع', width: 'w-28', type: 'currency' as const, isFormula: true },
  ];

  assert.equal(columns.length, 5);

  // Add custom column
  const withCustom = [
    ...columns,
    { id: 'col_warranty', title: 'مدت گارانتی', width: 'w-24', type: 'text' as const },
  ];
  assert.equal(withCustom.length, 6);
  assert.equal(withCustom[5].title, 'مدت گارانتی');

  // Remove column
  const removed = withCustom.filter((c) => c.id !== 'col_warranty');
  assert.equal(removed.length, 5);
});

test('extractRecordPreviewData summarizes header, counterparty, fields, items, and signatures cleanly', () => {
  const tpl: FormTemplate = {
    id: 'preset_dispatch_voucher',
    title: 'حواله خروج محصول',
    description: 'حواله رسمی',
    category: 'انبار',
    paperSize: 'A4',
    orientation: 'landscape',
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    fields: [
      { id: 'hdr', type: 'header_banner', label: 'سربرگ', headerTitle: 'حواله خروج محصول', formCode: 'AW-ST-FO-008', width: '100%' },
      { id: 'f_driver', type: 'text', label: 'نام راننده', width: '50%' },
      { id: 'f_plate', type: 'text', label: 'پلاک خودرو', width: '50%' },
      { id: 'tbl', type: 'table', label: 'جدول کالا', width: '100%' },
    ],
  };

  const rec: FormRecord = {
    id: 'rec-preview-1',
    formId: 'preset_dispatch_voucher',
    recordNumber: 'DOC-1405-0042',
    createdAt: '2026-11-02T10:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
    status: 'finalized',
    data: {
      f_doc_no: '۴۲',
      f_doc_date: '1405/08/11',
      f_customer: 'شرکت پتروشیمی پارس',
      f_driver: 'حسین محمدی',
      f_plate: '۱۲ ع ۳۴۵ ایران ۶۶',
    },
    tableData: {
      tbl: [
        { id: '1', rowNumber: 1, productCode: 'K-10', description: 'مانیتور صنعتی ۲۴ اینچ', quantity: 3, unit: 'دستگاه', unitPrice: 10000000, totalPrice: 30000000, serialNumber: 'SN-101' },
        { id: '2', rowNumber: 2, productCode: 'K-11', description: 'پاور سوئیچینگ ۲۴ ولت', quantity: 2, unit: 'عدد', unitPrice: 2500000, totalPrice: 5000000 },
        { id: '3', rowNumber: 3, productCode: 'K-12', description: 'کابل کنترل شیلددار', quantity: 10, unit: 'متر' },
        { id: '4', rowNumber: 4, productCode: 'K-13', description: 'رله صنعتی ۴ کنتاکت', quantity: 5, unit: 'عدد' },
        { id: '5', rowNumber: 5, productCode: 'K-14', description: 'ترمینال ریلی', quantity: 20, unit: 'عدد' },
        { id: '6', rowNumber: 6, productCode: 'K-15', description: 'داکت کابل ۴ در ۴', quantity: 4, unit: 'شاخه' },
        { id: '7', rowNumber: 7, productCode: '', description: '', quantity: 0 }, // empty trailing row should be ignored
      ],
    },
    signatureData: {
      sig_0: 'data:image/png;base64,AAA',
      sig_1: '',
      sig_2: 'data:image/png;base64,BBB',
    },
  };

  const preview = extractRecordPreviewData(rec, tpl);
  assert.equal(preview.title, 'حواله خروج محصول');
  assert.equal(preview.formCode, 'AW-ST-FO-008');
  assert.equal(preview.docNumber, '۴۲');
  assert.equal(preview.docDate, '1405/08/11');
  assert.equal(preview.counterparty, 'شرکت پتروشیمی پارس');
  assert.equal(preview.statusLabel, 'ثبت نهایی');
  assert.equal(preview.fields.length, 2);
  assert.equal(preview.fields[0].label, 'نام راننده');
  assert.equal(preview.totalItemsCount, 6);
  assert.equal(preview.items.length, 5);
  assert.equal(preview.remainingItemsCount, 1);
  assert.equal(preview.totalQuantity, 44);
  assert.equal(preview.totalAmount, 35000000);
  assert.equal(preview.signedCount, 2);
});



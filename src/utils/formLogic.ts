import { TableItemRow, FormRecord, FormTemplate } from '../types/form';
import { parseShamsiString, jalaliToGregorian } from './shamsiCalendar';

// Convert English numbers to Persian digits
export function toPersianDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

// Format numbers with thousand separators (e.g. 1,500,000)
export function formatCurrency(amount: number | string, usePersianDigits = true): string {
  if (amount === '' || amount === null || amount === undefined || isNaN(Number(amount))) {
    return '۰';
  }
  const cleanNumber = Math.round(Number(amount));
  const parts = cleanNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return usePersianDigits ? toPersianDigits(parts) : parts;
}

// Calculate table row total
export function calculateRowTotal(quantity: number, unitPrice: number): number {
  const qty = Number(quantity) || 0;
  const price = Number(unitPrice) || 0;
  return Math.max(0, qty * price);
}

// Calculate overall table totals: Subtotal, Discount, Tax, Grand Total
export interface TableSummaryTotals {
  subtotal: number;
  discountAmount: number;
  taxableAmount: number;
  taxAmount: number;
  grandTotal: number;
  itemsCount: number;
}

export function calculateTableSummary(
  rows: TableItemRow[],
  discountAmount = 0,
  taxRatePercent = 0
): TableSummaryTotals {
  const subtotal = rows.reduce((acc, row) => acc + (Number(row.totalPrice) || 0), 0);
  const discount = Math.min(subtotal, Math.max(0, Number(discountAmount) || 0));
  const taxableAmount = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxableAmount * (Number(taxRatePercent) || 0)) / 100);
  const grandTotal = taxableAmount + taxAmount;

  return {
    subtotal,
    discountAmount: discount,
    taxableAmount,
    taxAmount,
    grandTotal,
    itemsCount: rows.filter((r) => r.description.trim().length > 0 || (r.totalPrice ?? 0) > 0).length,
  };
}

// Simple deterministic Shamsi (Jalali) date helper
export function getTodayShamsiString(date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Fallback if Intl Persian is unavailable
    const y = date.getFullYear() - 621;
    return `${y}/۰۱/۰۱`;
  }
}

// Generate serial record number: e.g. REC-1403-0001
export function generateRecordNumber(index: number, prefix = 'DOC'): string {
  const currentYear = 1403;
  const paddedIndex = String(index).padStart(4, '0');
  return `${prefix}-${currentYear}-${paddedIndex}`;
}

// Convert an array of form records to CSV format for Excel export
export function generateCsvExport(
  headers: { id: string; label: string }[],
  records: Array<{ recordNumber: string; createdAt: string; data: Record<string, any> }>
): string {
  // UTF-8 BOM so Excel opens Persian text correctly
  const BOM = '\uFEFF';
  
  const headerRow = ['شماره رکورد', 'تاریخ ایجاد', ...headers.map((h) => h.label)]
    .map((val) => `"${(val || '').replace(/"/g, '""')}"`)
    .join(',');

  const dataRows = records.map((rec) => {
    const rowValues = [
      rec.recordNumber,
      rec.createdAt,
      ...headers.map((h) => {
        const val = rec.data[h.id];
        if (typeof val === 'boolean') return val ? 'بله' : 'خیر';
        if (val === null || val === undefined) return '';
        return String(val);
      }),
    ];
    return rowValues.map((val) => `"${(val || '').replace(/"/g, '""')}"`).join(',');
  });

  return BOM + [headerRow, ...dataRows].join('\r\n');
}

// Number to Persian words (for checks, invoices, amounts)
export function numberToPersianWords(num: number): string {
  if (num === 0) return 'صفر';
  if (isNaN(num)) return '';

  const ones = ['', 'یک', 'دو', 'سه', 'چهار', 'پنج', 'شش', 'هفت', 'هشت', 'نه'];
  const teens = ['ده', 'یازده', 'دوازده', 'سیزده', 'چهارده', 'پانزده', 'شانزده', 'هفده', 'هجده', 'نوزده'];
  const tens = ['', '', 'بیست', 'سی', 'چهل', 'پنجاه', 'شصت', 'هفتاد', 'هشتاد', 'نود'];
  const hundreds = ['', 'یکصد', 'دویست', 'سیصد', 'چهارصد', 'پانصد', 'ششصد', 'هفتصد', 'هشتصد', 'نهصد'];
  const thousands = ['', 'هزار', 'میلیون', 'میلیارد', 'تریلیون'];

  function convertGroup(n: number): string {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const rest = n % 100;
    const t = Math.floor(rest / 10);
    const o = rest % 10;

    if (h > 0) parts.push(hundreds[h]);
    if (rest >= 10 && rest <= 19) {
      parts.push(teens[rest - 10]);
    } else {
      if (t > 0) parts.push(tens[t]);
      if (o > 0) parts.push(ones[o]);
    }
    return parts.join(' و ');
  }

  let n = Math.abs(Math.round(num));
  const groups: string[] = [];
  let groupIdx = 0;

  while (n > 0) {
    const groupVal = n % 1000;
    if (groupVal > 0) {
      const groupStr = convertGroup(groupVal);
      const scaleStr = thousands[groupIdx];
      groups.unshift(scaleStr ? `${groupStr} ${scaleStr}` : groupStr);
    }
    n = Math.floor(n / 1000);
    groupIdx++;
  }

  return groups.join(' و ') + ' ریال';
}

// Convert Persian/Arabic numbers to English digits
export function toEnglishDigits(num: number | string): string {
  if (num === null || num === undefined) return '';
  const str = String(num);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(persianDigits[i], String(i)).replaceAll(arabicDigits[i], String(i));
  }
  return res;
}

// Resilient search text normalization for Persian, Arabic and English characters/digits
export function normalizeSearchText(text: unknown): string {
  if (text === null || text === undefined) return '';
  return toEnglishDigits(String(text))
    .replace(/[يئي]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Extract effective date for a form record (prioritizing form document date over creation timestamp)
export function getRecordDate(rec: FormRecord): Date | null {
  const docDateStr = rec.data?.['f_doc_date'] || rec.data?.['doc_date'] || rec.data?.['date'] || rec.data?.['تاریخ'];
  if (docDateStr && typeof docDateStr === 'string' && docDateStr.trim()) {
    const sh = parseShamsiString(docDateStr);
    if (sh) {
      const g = jalaliToGregorian(sh.year, sh.month, sh.day);
      return new Date(g.year, g.month - 1, g.day);
    }
    const d = new Date(docDateStr);
    if (!isNaN(d.getTime())) return d;
  }

  if (rec.createdAt) {
    const d = new Date(rec.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
}

export interface FilterRecordsOptions {
  searchQuery?: string;
  documentNumber?: string; // جستجوی اختصاصی شماره سند یا رهگیری
  customerName?: string;   // جستجوی اختصاصی نام مشتری، خریدار، طرف حساب یا تحویل‌گیرنده
  itemQuery?: string;      // جستجو در شرح، کد کالا یا شماره سریال اقلام
  formId?: string;         // نوع فرم/الگو
  dateFrom?: string;       // از تاریخ (شمسی یا میلادی)
  dateTo?: string;         // تا تاریخ (شمسی یا میلادی)
}

// Search and filter records across formId, date range, document number, customer, and general keywords
export function filterFormRecords(
  records: FormRecord[],
  options: FilterRecordsOptions
): FormRecord[] {
  const {
    searchQuery = '',
    documentNumber = '',
    customerName = '',
    itemQuery = '',
    formId = 'all',
    dateFrom = '',
    dateTo = '',
  } = options;

  const normGeneral = normalizeSearchText(searchQuery);
  const normDocNo = normalizeSearchText(documentNumber);
  const normCustomer = normalizeSearchText(customerName);
  const normItem = normalizeSearchText(itemQuery);

  // Pre-parse date boundaries
  let fromDate: Date | null = null;
  if (dateFrom) {
    const shFrom = parseShamsiString(dateFrom);
    if (shFrom) {
      const g = jalaliToGregorian(shFrom.year, shFrom.month, shFrom.day);
      fromDate = new Date(g.year, g.month - 1, g.day);
    } else {
      const d = new Date(dateFrom);
      if (!isNaN(d.getTime())) fromDate = d;
    }
    if (fromDate) fromDate.setHours(0, 0, 0, 0);
  }

  let toDate: Date | null = null;
  if (dateTo) {
    const shTo = parseShamsiString(dateTo);
    if (shTo) {
      const g = jalaliToGregorian(shTo.year, shTo.month, shTo.day);
      toDate = new Date(g.year, g.month - 1, g.day);
    } else {
      const d = new Date(dateTo);
      if (!isNaN(d.getTime())) toDate = d;
    }
    if (toDate) toDate.setHours(23, 59, 59, 999);
  }

  return records.filter((rec) => {
    // 1. Form Template Filter
    if (formId && formId !== 'all' && rec.formId !== formId) {
      return false;
    }

    // 2. Date Range Filter
    if (fromDate || toDate) {
      const recDate = getRecordDate(rec);
      if (recDate) {
        if (fromDate && recDate < fromDate) return false;
        if (toDate && recDate > toDate) return false;
      }
    }

    // 3. Document Number Filter
    if (normDocNo) {
      const docNoCandidates = [
        rec.recordNumber,
        rec.data?.['f_doc_no'],
        rec.data?.['documentNumber'],
        rec.data?.['doc_no'],
        rec.data?.['letterNumber'],
        rec.data?.['شماره سند'],
        rec.data?.['شماره نامه'],
        rec.data?.['شماره فاکتور'],
      ];
      const matchDocNo = docNoCandidates.some((c) =>
        normalizeSearchText(c).includes(normDocNo)
      );
      if (!matchDocNo) return false;
    }

    // 4. Customer / Counterparty / Recipient Filter
    if (normCustomer) {
      const dataEntries = Object.entries(rec.data || {});
      const customerKeywords = [
        'customer', 'buyer', 'client', 'recipient', 'receiver', 'counterparty',
        'party', 'company', 'f_customer', 'unit', 'req_unit', 'خریدار', 'مشتری',
        'طرف حساب', 'تحویل گیرنده', 'واحد درخواست کننده', 'واحد درخواست', 'نام خریدار'
      ];

      const matchedKeyEntry = dataEntries.some(([k, v]) => {
        const normKey = normalizeSearchText(k);
        const isCustomerKey = customerKeywords.some((ck) => normKey.includes(normalizeSearchText(ck)));
        return isCustomerKey && normalizeSearchText(v).includes(normCustomer);
      });

      const matchedAnyField = dataEntries.some(([_, v]) =>
        typeof v === 'string' && normalizeSearchText(v).includes(normCustomer)
      );

      if (!matchedKeyEntry && !matchedAnyField) return false;
    }

    // 5. Item / Product Filter
    if (normItem) {
      const inTable = Object.values(rec.tableData || {}).some((rows) =>
        Array.isArray(rows) &&
        rows.some((row) =>
          normalizeSearchText(row.productCode).includes(normItem) ||
          normalizeSearchText(row.description).includes(normItem) ||
          normalizeSearchText(row.serialNumber).includes(normItem) ||
          normalizeSearchText(row.unit).includes(normItem) ||
          normalizeSearchText(row.notes).includes(normItem)
        )
      );
      if (!inTable) return false;
    }

    // 6. General Keyword Search (across everything)
    if (normGeneral) {
      const inRecordNumber = normalizeSearchText(rec.recordNumber).includes(normGeneral);
      if (inRecordNumber) return true;

      const inFormData = Object.values(rec.data || {}).some((val) =>
        normalizeSearchText(val).includes(normGeneral)
      );
      if (inFormData) return true;

      const inTableData = Object.values(rec.tableData || {}).some((rows) =>
        Array.isArray(rows) &&
        rows.some((row) =>
          normalizeSearchText(row.productCode).includes(normGeneral) ||
          normalizeSearchText(row.description).includes(normGeneral) ||
          normalizeSearchText(row.serialNumber).includes(normGeneral) ||
          normalizeSearchText(row.unit).includes(normGeneral) ||
          normalizeSearchText(row.notes).includes(normGeneral)
        )
      );
      if (inTableData) return true;

      return false;
    }

    return true;
  });
}

export interface RecordQuickPreviewItem {
  rowNumber: number;
  productCode: string;
  description: string;
  quantity: number;
  unit: string;
  serialNumber: string;
  totalPrice: number;
}

export interface RecordQuickPreviewData {
  title: string;
  formCode: string;
  recordNumber: string;
  docNumber: string;
  docDate: string;
  counterparty: string;
  statusLabel: string;
  fields: Array<{ label: string; value: string }>;
  items: RecordQuickPreviewItem[];
  totalItemsCount: number;
  remainingItemsCount: number;
  totalQuantity: number;
  totalAmount: number;
  signedCount: number;
}

/**
 * Extracts structured, concise preview information from a FormRecord and its FormTemplate
 * so hover popovers can display a fast, legible snapshot without loading the full canvas.
 */
export function extractRecordPreviewData(
  record: FormRecord,
  template: FormTemplate
): RecordQuickPreviewData {
  const headerField = template.fields.find((f) => f.type === 'header_banner');
  const title = headerField?.headerTitle || template.title || 'سند انبار';
  const formCode = headerField?.formCode || '';

  const docNoRaw =
    record.data?.['f_doc_no'] ||
    (headerField ? record.data?.[`${headerField.id}_doc_no`] : undefined) ||
    record.data?.['documentNumber'] ||
    record.data?.['doc_no'] ||
    record.recordNumber;
  const docNumber = docNoRaw ? String(docNoRaw) : record.recordNumber;

  const docDateRaw =
    record.data?.['f_doc_date'] ||
    (headerField ? record.data?.[`${headerField.id}_header_date`] : undefined) ||
    record.data?.['doc_date'] ||
    (record.createdAt ? new Date(record.createdAt).toLocaleDateString('fa-IR') : '—');
  const docDate = docDateRaw ? String(docDateRaw) : '—';

  // Counterparty / Customer / Requesting Unit lookup
  const counterpartyKeys = [
    'f_customer',
    'customerName',
    'buyerName',
    'receiverName',
    'recipient',
    'counterparty',
    'f_req_unit',
    ...(headerField ? [`${headerField.id}_req_unit`] : []),
  ];
  let counterparty = '';
  for (const key of counterpartyKeys) {
    const v = record.data?.[key];
    if (v && String(v).trim() !== '') {
      counterparty = String(v).trim();
      break;
    }
  }
  if (!counterparty) {
    const matchedField = template.fields.find((f) => {
      if (['divider', 'header_banner', 'table', 'signature', 'qrcode'].includes(f.type)) return false;
      const lbl = normalizeSearchText(f.label);
      return (
        lbl.includes('مشتری') ||
        lbl.includes('خریدار') ||
        lbl.includes('تحویل') ||
        lbl.includes('واحد') ||
        lbl.includes('طرف حساب') ||
        lbl.includes('شرکت')
      );
    });
    if (matchedField) {
      const val = record.data?.[matchedField.id];
      if (val && String(val).trim() !== '') {
        counterparty = String(val).trim();
      }
    }
  }

  // Extract other filled fields (up to 4)
  const fields: Array<{ label: string; value: string }> = [];
  const skippedKeys = new Set(['f_doc_no', 'f_doc_date', ...counterpartyKeys]);

  for (const field of template.fields) {
    if (['divider', 'header_banner', 'table', 'signature', 'qrcode'].includes(field.type)) continue;
    if (skippedKeys.has(field.id)) continue;

    const rawVal = record.data?.[field.id];
    if (rawVal === undefined || rawVal === null) continue;
    if (typeof rawVal === 'boolean') {
      if (rawVal) {
        fields.push({ label: field.label, value: 'تأیید شده' });
      }
    } else if (String(rawVal).trim() !== '') {
      const formattedVal =
        field.type === 'currency'
          ? `${formatCurrency(rawVal)} ${field.unitLabel || 'ریال'}`
          : toPersianDigits(String(rawVal).trim());
      fields.push({ label: field.label, value: formattedVal });
    }
    if (fields.length >= 4) break;
  }

  // Fallback: if template fields didn't match record.data keys (e.g. ad-hoc keys like letterNumber)
  if (fields.length === 0 && record.data) {
    for (const [k, v] of Object.entries(record.data)) {
      if (skippedKeys.has(k) || k.endsWith('_doc_no') || k.endsWith('_header_date') || k.endsWith('_req_unit')) {
        continue;
      }
      if (v !== undefined && v !== null && typeof v !== 'boolean' && String(v).trim() !== '') {
        fields.push({ label: k === 'letterNumber' ? 'شماره نامه' : k, value: toPersianDigits(String(v).trim()) });
      }
      if (fields.length >= 4) break;
    }
  }

  // Extract filled table rows
  const allRows: RecordQuickPreviewItem[] = [];
  let totalQuantity = 0;
  let totalAmount = 0;

  if (record.tableData) {
    for (const rows of Object.values(record.tableData)) {
      if (!Array.isArray(rows)) continue;
      for (const row of rows) {
        const hasContent =
          (row.description && row.description.trim() !== '') ||
          (row.productCode && row.productCode.trim() !== '') ||
          (row.serialNumber && row.serialNumber.trim() !== '') ||
          Number(row.quantity) > 0;
        if (!hasContent) continue;

        const qty = Number(row.quantity) || 0;
        const total = Number(row.totalPrice) || calculateRowTotal(qty, Number(row.unitPrice) || 0);
        totalQuantity += qty;
        totalAmount += total;

        allRows.push({
          rowNumber: row.rowNumber || allRows.length + 1,
          productCode: row.productCode?.trim() || '',
          description: row.description?.trim() || row.model?.trim() || 'کالا بدون شرح',
          quantity: qty,
          unit: row.unit?.trim() || 'عدد',
          serialNumber: row.serialNumber?.trim() || '',
          totalPrice: total,
        });
      }
    }
  }

  const maxPreviewItems = 5;
  const items = allRows.slice(0, maxPreviewItems);
  const totalItemsCount = allRows.length;
  const remainingItemsCount = Math.max(0, totalItemsCount - maxPreviewItems);

  const signedCount = record.signatureData
    ? Object.values(record.signatureData).filter((v) => typeof v === 'string' && v.trim() !== '').length
    : 0;

  const statusLabel =
    record.status === 'printed'
      ? 'چاپ‌شده'
      : record.status === 'draft'
      ? 'پیش‌نویس'
      : 'ثبت نهایی';

  return {
    title,
    formCode,
    recordNumber: record.recordNumber,
    docNumber,
    docDate,
    counterparty,
    statusLabel,
    fields,
    items,
    totalItemsCount,
    remainingItemsCount,
    totalQuantity,
    totalAmount,
    signedCount,
  };
}




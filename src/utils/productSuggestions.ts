import { TableItemRow, FormRecord, FormTemplate } from '../types/form';
import { toEnglishDigits } from './formLogic';

export interface ProductSuggestion {
  description: string;
  productCode?: string;
  model?: string;
  unit?: string;
  unitPrice?: number;
  usageLocation?: string;
  notes?: string;
  frequency: number;
  source?: string;
}

/**
 * Normalizes Persian and Arabic text for resilient fuzzy search and comparison.
 * Maps Arabic Kaf, Yeh, Teh Marbuta, Persian numbers, and collapses spaces.
 */
export function normalizePersianSearch(text: string): string {
  if (!text) return '';
  return toEnglishDigits(text)
    .replace(/[يئي]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/ة/g, 'ه')
    .replace(/[\u200B-\u200D\uFEFF]/g, ' ') // Zero-width spaces to normal space
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Extracts distinct product items and their associated metadata from past records and templates,
 * ranking them by occurrence frequency.
 */
export function extractProductHistory(
  records: FormRecord[] = [],
  templates: FormTemplate[] = []
): ProductSuggestion[] {
  const map = new Map<string, ProductSuggestion>();

  // Helper to accumulate a row into map
  const addRow = (row: TableItemRow, sourceLabel: string) => {
    const rawDesc = (row.description || '').trim();
    if (!rawDesc || rawDesc.length < 2) return;

    const normKey = normalizePersianSearch(rawDesc);
    if (!normKey) return;

    const existing = map.get(normKey);
    if (existing) {
      existing.frequency += 1;
      // Enrich with metadata if existing is missing
      if (!existing.productCode && row.productCode) existing.productCode = row.productCode;
      if (!existing.model && row.model) existing.model = row.model;
      if (!existing.unit && row.unit) existing.unit = row.unit;
      if ((!existing.unitPrice || existing.unitPrice === 0) && row.unitPrice) existing.unitPrice = row.unitPrice;
      if (!existing.usageLocation && row.usageLocation) existing.usageLocation = row.usageLocation;
      if (!existing.notes && row.notes) existing.notes = row.notes;
    } else {
      map.set(normKey, {
        description: rawDesc,
        productCode: row.productCode ? String(row.productCode).trim() : undefined,
        model: row.model ? String(row.model).trim() : undefined,
        unit: row.unit ? String(row.unit).trim() : undefined,
        unitPrice: typeof row.unitPrice === 'number' ? row.unitPrice : undefined,
        usageLocation: row.usageLocation ? String(row.usageLocation).trim() : undefined,
        notes: row.notes ? String(row.notes).trim() : undefined,
        frequency: 1,
        source: sourceLabel,
      });
    }
  };

  // 1. Scan all historical records in reverse (newest first)
  for (const rec of records) {
    if (rec.tableData) {
      for (const rows of Object.values(rec.tableData)) {
        if (Array.isArray(rows)) {
          for (const row of rows) {
            addRow(row, `سند ${rec.recordNumber || ''}`);
          }
        }
      }
    }
  }

  // 2. Scan template defaults and initial data
  for (const tpl of templates) {
    if (tpl.fields) {
      for (const field of tpl.fields) {
        if (field.type === 'table' && Array.isArray(field.tableInitialData)) {
          for (const row of field.tableInitialData) {
            addRow(row, `الگوی ${tpl.title || ''}`);
          }
        }
      }
    }
  }

  // 3. Fallback standard catalog items common in warehouse / vouchers if catalog is empty
  const defaultWarehouseCatalog: Array<Partial<TableItemRow>> = [
    { description: 'فیلتر دستگاه تصفیه آب', unit: 'دستگاه', usageLocation: 'آیریا ونداد کسری', notes: 'جهت سرویس' },
    { description: 'دریل برقی رونیکس مدل 2110', model: '2110', unit: 'دستگاه', usageLocation: 'خط تولید', notes: 'تعمیر و سرویس' },
    { description: 'خوراک سنجاق کوب بزرگ', unit: 'بسته', notes: 'جهت استفاده تدارکات' },
    { description: 'خوراک سنجاق کوب کوچک', unit: 'بسته', notes: 'جهت استفاده تدارکات' },
    { description: 'کارتن بسته‌بندی ۵ لایه', unit: 'عدد', productCode: 'BOX-5L' },
    { description: 'چسب پهن شیشه‌ای ۵ سانتی‌متر', unit: 'حلقه', productCode: 'TAPE-50' },
    { description: 'روغن صنعتی هیدرولیک ۶۸', unit: 'لیتر', productCode: 'OIL-H68' },
    { description: 'پیچ و مهره فولادی M8', unit: 'کیلوگرم', productCode: 'BLT-M8' },
  ];

  for (const item of defaultWarehouseCatalog) {
    addRow(item as TableItemRow, 'کاتالوگ انبار');
  }

  return Array.from(map.values()).sort((a, b) => b.frequency - a.frequency);
}

/**
 * Searches product suggestions matching the user's input query.
 * Prioritizes prefix matches on description, then word matches, then model/code matches.
 */
export function getMatchingProducts(
  query: string,
  catalog: ProductSuggestion[],
  limit = 6
): ProductSuggestion[] {
  const normQ = normalizePersianSearch(query);

  // If query is empty, return the top frequent products from history
  if (!normQ) {
    return catalog.slice(0, limit);
  }

  const prefixMatches: ProductSuggestion[] = [];
  const substringMatches: ProductSuggestion[] = [];
  const secondaryMatches: ProductSuggestion[] = [];

  for (const item of catalog) {
    const normDesc = normalizePersianSearch(item.description);
    const normCode = normalizePersianSearch(item.productCode || '');
    const normModel = normalizePersianSearch(item.model || '');

    if (normDesc.startsWith(normQ)) {
      prefixMatches.push(item);
    } else if (normDesc.includes(normQ)) {
      substringMatches.push(item);
    } else if (normCode.includes(normQ) || normModel.includes(normQ)) {
      secondaryMatches.push(item);
    }
  }

  const combined = [...prefixMatches, ...substringMatches, ...secondaryMatches];
  return combined.slice(0, limit);
}

/**
 * Applies selected suggestion to the target row, auto-filling empty companion fields.
 */
export function applyProductSuggestionToRow(
  currentRow: TableItemRow,
  suggestion: ProductSuggestion
): TableItemRow {
  const updated: TableItemRow = {
    ...currentRow,
    description: suggestion.description,
  };

  // Auto-fill productCode if current row is empty
  if ((!updated.productCode || updated.productCode.trim() === '') && suggestion.productCode) {
    updated.productCode = suggestion.productCode;
  }

  // Auto-fill model if current row is empty
  if ((!updated.model || updated.model.trim() === '') && suggestion.model) {
    updated.model = suggestion.model;
  }

  // Auto-fill unit if current row is empty
  if ((!updated.unit || updated.unit.trim() === '') && suggestion.unit) {
    updated.unit = suggestion.unit;
  }

  // Auto-fill usageLocation if current row is empty
  if ((!updated.usageLocation || updated.usageLocation.trim() === '') && suggestion.usageLocation) {
    updated.usageLocation = suggestion.usageLocation;
  }

  // Auto-fill notes if current row is empty
  if ((!updated.notes || updated.notes.trim() === '') && suggestion.notes) {
    updated.notes = suggestion.notes;
  }

  // Auto-fill unitPrice if current row price is 0 and suggestion has price
  if ((!updated.unitPrice || updated.unitPrice === 0) && suggestion.unitPrice) {
    updated.unitPrice = suggestion.unitPrice;
    const qty = Number(updated.quantity) || 1;
    updated.totalPrice = qty * suggestion.unitPrice;
  }

  return updated;
}

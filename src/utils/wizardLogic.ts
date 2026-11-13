import { FormTemplate, PageOrientation, PaperSize, TableItemRow } from '../types/form';
import { getTodayShamsiString, normalizeSearchText, toPersianDigits } from './formLogic';

export type WizardStep = 1 | 2 | 3;

export interface WizardTemplateSummary {
  formCode: string;
  category: string;
  paperSize: PaperSize;
  orientation: PageOrientation;
  orientationLabel: string;
  inputFieldsCount: number;
  hasTable: boolean;
  tableRowsCount: number;
  signatureSlotsCount: number;
}

export interface WizardValidationResult {
  valid: boolean;
  errors: string[];
  missingFields: string[];
}

export interface InitializedWizardData {
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
}

export function extractTemplateCategories(templates: FormTemplate[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const tpl of templates) {
    const cat = tpl.category?.trim();
    if (cat && !seen.has(cat)) {
      seen.add(cat);
      categories.push(cat);
    }
  }
  return categories;
}

export function filterWizardTemplates(
  templates: FormTemplate[],
  query: string,
  category: string
): FormTemplate[] {
  const normalizedQuery = normalizeSearchText(query);
  return templates.filter((tpl) => {
    if (category && category !== 'all' && tpl.category !== category) {
      return false;
    }
    if (!normalizedQuery) return true;
    const headerField = tpl.fields.find((f) => f.type === 'header_banner');
    const searchable = normalizeSearchText(
      [
        tpl.title,
        tpl.description,
        tpl.category,
        headerField?.formCode || '',
        headerField?.headerTitle || '',
        headerField?.companyName || '',
      ].join(' ')
    );
    return searchable.includes(normalizedQuery);
  });
}

export function getWizardTemplateSummary(template: FormTemplate): WizardTemplateSummary {
  const headerField = template.fields.find((f) => f.type === 'header_banner');
  const tableField = template.fields.find((f) => f.type === 'table');
  const sigFields = template.fields.filter((f) => f.type === 'signature');

  const inputFieldsCount = template.fields.filter(
    (f) => !['header_banner', 'divider', 'table', 'signature', 'qrcode'].includes(f.type)
  ).length;

  const signatureSlotsCount = sigFields.reduce((sum, f) => {
    return sum + (f.signatureLabels && f.signatureLabels.length > 0 ? f.signatureLabels.length : 1);
  }, 0);

  return {
    formCode: headerField?.formCode || 'CUSTOM',
    category: template.category || 'عمومی',
    paperSize: template.paperSize,
    orientation: template.orientation,
    orientationLabel: template.orientation === 'landscape' ? 'افقی' : 'عمودی',
    inputFieldsCount,
    hasTable: Boolean(tableField),
    tableRowsCount: tableField?.tableInitialRows || (tableField ? 5 : 0),
    signatureSlotsCount,
  };
}

export function createEmptyWizardRow(
  rowNumber: number,
  tableVariant: 'invoice' | 'dispatch' | 'standard' = 'dispatch'
): TableItemRow {
  return {
    id: `wiz-row-${Date.now()}-${rowNumber}-${Math.random().toString(36).slice(2, 6)}`,
    rowNumber,
    description: '',
    quantity: tableVariant === 'dispatch' ? 0 : 1,
    unit: '',
    unitPrice: 0,
    totalPrice: 0,
    productCode: '',
    model: '',
    usageLocation: '',
    serialNumber: '',
    notes: '',
  };
}

export function initializeWizardDataForTemplate(
  template: FormTemplate,
  defaultDocNumber?: string
): InitializedWizardData {
  const formData: Record<string, any> = {};
  const tableData: Record<string, TableItemRow[]> = {};
  const headerField = template.fields.find((f) => f.type === 'header_banner');

  const docNo =
    defaultDocNumber?.trim() ||
    headerField?.documentNumber?.trim() ||
    String(
      template.fields.find((f) => f.id === 'f_doc_no')?.defaultValue ?? '۱'
    );
  const docDate =
    headerField?.headerDate?.trim() ||
    String(
      template.fields.find((f) => f.id === 'f_doc_date')?.defaultValue ??
        getTodayShamsiString()
    );

  formData['f_doc_no'] = docNo;
  formData['f_doc_date'] = docDate || getTodayShamsiString();

  if (headerField?.requestingUnit) {
    formData['f_req_unit'] = headerField.requestingUnit;
    formData[`${headerField.id}_req_unit`] = headerField.requestingUnit;
  }

  for (const field of template.fields) {
    if (['header_banner', 'divider', 'signature', 'qrcode'].includes(field.type)) {
      continue;
    }

    if (field.type === 'table') {
      const targetRows = Math.max(field.tableInitialRows || 5, 1);
      const initialData = Array.isArray(field.tableInitialData)
        ? field.tableInitialData.map((r, idx) => ({ ...r, rowNumber: idx + 1 }))
        : [];
      const rows: TableItemRow[] = [...initialData];
      while (rows.length < targetRows) {
        rows.push(createEmptyWizardRow(rows.length + 1, field.tableVariant || 'dispatch'));
      }
      tableData[field.id] = rows;
      continue;
    }

    if (
      field.id !== 'f_doc_no' &&
      field.id !== 'f_doc_date' &&
      field.defaultValue !== undefined &&
      field.defaultValue !== null &&
      String(field.defaultValue) !== ''
    ) {
      formData[field.id] = field.defaultValue;
    } else if (field.type === 'select' && field.options && field.options.length > 0) {
      formData[field.id] = field.options[0];
    }
  }

  return {
    formData,
    tableData,
    signatureData: {},
  };
}

export function isTableRowPopulated(row: TableItemRow): boolean {
  if (!row) return false;
  return Boolean(
    (row.description && row.description.trim() !== '') ||
      (row.productCode && row.productCode.trim() !== '') ||
      (row.model && row.model.trim() !== '') ||
      (row.serialNumber && row.serialNumber.trim() !== '') ||
      (row.usageLocation && row.usageLocation.trim() !== '') ||
      Number(row.quantity) > 0
  );
}

export function countWizardFilledItems(
  template: FormTemplate,
  tableData: Record<string, TableItemRow[]>
): number {
  let count = 0;
  for (const field of template.fields) {
    if (field.type !== 'table') continue;
    const rows = tableData[field.id] || [];
    count += rows.filter(isTableRowPopulated).length;
  }
  return count;
}

export function countWizardSignedSlots(signatureData: Record<string, string>): number {
  return Object.values(signatureData).filter(
    (val) => typeof val === 'string' && val.trim() !== ''
  ).length;
}

export function validateWizardStepTwo(
  template: FormTemplate,
  formData: Record<string, any>,
  tableData: Record<string, TableItemRow[]>
): WizardValidationResult {
  const errors: string[] = [];
  const missingFields: string[] = [];

  const docNo = String(formData['f_doc_no'] ?? '').trim();
  const docDate = String(formData['f_doc_date'] ?? '').trim();

  if (!docNo) {
    errors.push('لطفاً شماره سند را وارد نمایید.');
    missingFields.push('f_doc_no');
  }
  if (!docDate) {
    errors.push('لطفاً تاریخ صدور سند را مشخص نمایید.');
    missingFields.push('f_doc_date');
  }

  for (const field of template.fields) {
    if (['header_banner', 'divider', 'signature', 'qrcode', 'table'].includes(field.type)) {
      continue;
    }
    if (field.id === 'f_doc_no' || field.id === 'f_doc_date') continue;
    if (!field.required) continue;

    const val = formData[field.id];
    const isEmpty =
      val === undefined ||
      val === null ||
      (typeof val === 'boolean' ? !val : String(val).trim() === '');

    if (isEmpty) {
      errors.push(`فیلد الزامی «${field.label}» تکمیل نشده است.`);
      missingFields.push(field.id);
    }
  }

  const tableFields = template.fields.filter((f) => f.type === 'table');
  if (tableFields.length > 0) {
    const filledCount = countWizardFilledItems(template, tableData);
    if (filledCount === 0) {
      errors.push('حداقل یک ردیف کالا یا شرح در جدول اقلام وارد نمایید.');
      missingFields.push(tableFields[0].id);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missingFields,
  };
}

export function formatWizardStepBadge(step: WizardStep): string {
  return `مرحله ${toPersianDigits(step)} از ${toPersianDigits(3)}`;
}

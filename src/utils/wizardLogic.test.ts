import test from 'node:test';
import assert from 'node:assert/strict';
import { FormTemplate } from '../types/form';
import {
  extractTemplateCategories,
  filterWizardTemplates,
  getWizardTemplateSummary,
  initializeWizardDataForTemplate,
  validateWizardStepTwo,
  countWizardFilledItems,
  countWizardSignedSlots,
} from './wizardLogic';

const dispatchTemplate: FormTemplate = {
  id: 'tpl_dispatch',
  title: 'حواله خروج محصول',
  description: 'فرم رسمی خروج کالا از انبار مرکزی',
  category: 'انبار و لجستیک',
  paperSize: 'A4',
  orientation: 'landscape',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fields: [
    {
      id: 'f_hdr',
      type: 'header_banner',
      label: 'سربرگ',
      formCode: 'AW-ST-FO-008',
      documentNumber: '12',
      headerDate: '1405/08/15',
      requestingUnit: 'واحد تولید',
      width: '100%',
    },
    {
      id: 'f_tbl',
      type: 'table',
      label: 'جدول کالا',
      tableVariant: 'dispatch',
      tableInitialRows: 4,
      width: '100%',
    },
    {
      id: 'f_sig',
      type: 'signature',
      label: 'امضاها',
      signatureLabels: ['انبار', 'مالی', 'مدیریت'],
      width: '100%',
    },
  ],
};

const generalTemplate: FormTemplate = {
  id: 'tpl_general',
  title: 'فرم صورتجلسه داخلی',
  description: 'ثبت گزارش و مکاتبات اداری',
  category: 'اداری',
  paperSize: 'A4',
  orientation: 'portrait',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  fields: [
    {
      id: 'f_doc_no',
      type: 'text',
      label: 'شماره سند',
      defaultValue: '۱۰۵',
      required: true,
      width: '50%',
    },
    {
      id: 'f_doc_date',
      type: 'shamsi_date',
      label: 'تاریخ',
      defaultValue: '1405/08/20',
      required: true,
      width: '50%',
    },
    {
      id: 'f_subject',
      type: 'text',
      label: 'موضوع',
      required: true,
      width: '100%',
    },
  ],
};

test('extractTemplateCategories and filterWizardTemplates handle search and category', () => {
  const list = [dispatchTemplate, generalTemplate];
  assert.deepEqual(extractTemplateCategories(list), ['انبار و لجستیک', 'اداری']);

  assert.equal(filterWizardTemplates(list, '', 'all').length, 2);
  assert.equal(filterWizardTemplates(list, '', 'اداری').length, 1);
  assert.equal(filterWizardTemplates(list, 'AW-ST-FO-008', 'all')[0].id, 'tpl_dispatch');
  assert.equal(filterWizardTemplates(list, 'صورتجلسه', 'all')[0].id, 'tpl_general');
  assert.equal(filterWizardTemplates(list, 'ناموجود', 'all').length, 0);
});

test('getWizardTemplateSummary calculates metadata counts accurately', () => {
  const summary = getWizardTemplateSummary(dispatchTemplate);
  assert.equal(summary.formCode, 'AW-ST-FO-008');
  assert.equal(summary.orientationLabel, 'افقی');
  assert.equal(summary.hasTable, true);
  assert.equal(summary.tableRowsCount, 4);
  assert.equal(summary.signatureSlotsCount, 3);
  assert.equal(summary.inputFieldsCount, 0);

  const genSummary = getWizardTemplateSummary(generalTemplate);
  assert.equal(genSummary.formCode, 'CUSTOM');
  assert.equal(genSummary.orientationLabel, 'عمودی');
  assert.equal(genSummary.inputFieldsCount, 3);
  assert.equal(genSummary.hasTable, false);
});

test('initializeWizardDataForTemplate populates doc header defaults and initial table rows', () => {
  const init = initializeWizardDataForTemplate(dispatchTemplate);
  assert.equal(init.formData['f_doc_no'], '12');
  assert.equal(init.formData['f_doc_date'], '1405/08/15');
  assert.equal(init.formData['f_req_unit'], 'واحد تولید');
  assert.equal(init.tableData['f_tbl'].length, 4);
  assert.equal(init.tableData['f_tbl'][0].rowNumber, 1);
});

test('validateWizardStepTwo enforces required fields and non-empty table rows', () => {
  const initDispatch = initializeWizardDataForTemplate(dispatchTemplate);
  const failEmptyTable = validateWizardStepTwo(
    dispatchTemplate,
    initDispatch.formData,
    initDispatch.tableData
  );
  assert.equal(failEmptyTable.valid, false);
  assert.ok(failEmptyTable.missingFields.includes('f_tbl'));

  initDispatch.tableData['f_tbl'][0].description = 'مانیتور صنعتی';
  initDispatch.tableData['f_tbl'][0].quantity = 2;
  const passDispatch = validateWizardStepTwo(
    dispatchTemplate,
    initDispatch.formData,
    initDispatch.tableData
  );
  assert.equal(passDispatch.valid, true);
  assert.equal(countWizardFilledItems(dispatchTemplate, initDispatch.tableData), 1);

  const initGen = initializeWizardDataForTemplate(generalTemplate);
  const failMissingSubject = validateWizardStepTwo(
    generalTemplate,
    initGen.formData,
    initGen.tableData
  );
  assert.equal(failMissingSubject.valid, false);
  assert.ok(failMissingSubject.missingFields.includes('f_subject'));

  initGen.formData['f_subject'] = 'تحویل تجهیزات';
  const passGen = validateWizardStepTwo(generalTemplate, initGen.formData, initGen.tableData);
  assert.equal(passGen.valid, true);
});

test('countWizardSignedSlots ignores empty values', () => {
  assert.equal(
    countWizardSignedSlots({
      a: 'data:image/png;base64,abc',
      b: '',
      c: 'data:image/png;base64,xyz',
    }),
    2
  );
});

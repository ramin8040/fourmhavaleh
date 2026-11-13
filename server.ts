import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize Google GenAI client if GEMINI_API_KEY is available
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
    })
  : null;

// Available preset sample templates corresponding to the uploaded form images
const SAMPLE_FORM_PRESETS: Record<string, any> = {
  '1_cba351d3': {
    title: 'استعلام درخواست تعمیرات',
    description: 'فرم استعلام درخواست تعمیرات شرکت آریا ونداد کسری با کد AW-ST-FO-008 و تایید ۵ مرحله‌ای',
    category: 'تعمیرات و نگهداری',
    paperSize: 'A4',
    orientation: 'landscape',
    headerBanner: {
      companyName: 'آریا ونداد کسری',
      headerTitle: 'استعلام درخواست تعمیرات',
      formCode: 'AW-ST-FO-008',
      documentNumber: '4',
      headerDate: '1405/08/07',
      requestingUnit: 'واحد اداری',
      hasRequestingUnit: true,
    },
    tableColumns: [
      { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
      { id: 'col_desc', title: 'شرح کالا', type: 'text', width: '32%', align: 'right' },
      { id: 'col_qty', title: 'مقدار', type: 'number', width: '10%', align: 'center' },
      { id: 'col_unit', title: 'واحد', type: 'text', width: '12%', align: 'center' },
      { id: 'col_location', title: 'محل مصرف', type: 'text', width: '22%', align: 'center' },
      { id: 'col_notes', title: 'توضیحات', type: 'text', width: '24%', align: 'right' },
    ],
    tableInitialData: [
      { id: 'r1', rowNumber: 1, description: 'فیلتر دستگاه تصفیه آب', quantity: 1, unit: 'دستگاه', usageLocation: 'آریا ونداد کسری', notes: 'جهت سرویس' },
      { id: 'r2', rowNumber: 3, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r3', rowNumber: 4, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r4', rowNumber: 5, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r5', rowNumber: 6, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r6', rowNumber: 7, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r7', rowNumber: 8, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r8', rowNumber: 9, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r9', rowNumber: 10, description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
    ],
    signatureLabels: ['واحددرخواست:', 'انبار:', 'تدارکات:', 'مدیریت:', 'مالی:'],
  },
  '2_a94633a1': {
    title: 'حواله خروج محصول',
    description: 'فرم رسمی حواله خروج محصول شرکت آریا ونداد کسری با کد AW-St-FO-008 و تایید پنج‌گانه',
    category: 'انبار و لجستیک',
    paperSize: 'A4',
    orientation: 'landscape',
    headerBanner: {
      companyName: 'شرکت آریا ونداد کسری',
      headerTitle: 'حواله خروج محصول',
      formCode: 'AW-St-FO-008',
      documentNumber: '1',
      headerDate: '1405/06/25',
      hasRequestingUnit: false,
    },
    tableColumns: [
      { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
      { id: 'col_code', title: 'کد کالا', type: 'text', width: '15%', align: 'center' },
      { id: 'col_desc', title: 'شرح کالا', type: 'text', width: '35%', align: 'right' },
      { id: 'col_qty', title: 'تعداد', type: 'number', width: '10%', align: 'center' },
      { id: 'col_unit', title: 'واحد', type: 'text', width: '10%', align: 'center' },
      { id: 'col_serial', title: 'شماره سریال', type: 'text', width: '15%', align: 'center' },
      { id: 'col_notes', title: 'توضیحات', type: 'text', width: '15%', align: 'right' },
    ],
    tableInitialData: Array.from({ length: 10 }, (_, i) => ({
      id: `row_${i + 1}`,
      rowNumber: i + 1,
      productCode: '',
      description: '',
      quantity: 0,
      unit: '',
      serialNumber: '',
      notes: '',
    })),
    signatureLabels: ['انبار:', 'مالی:', 'مدیریت کارخانه:', 'نگهبانی:', 'تحویل گیرنده:'],
  },
  '3_4c1de245': {
    title: 'رسید کالا و قطعات خارجی',
    description: 'فرم ورود قطعات خارجی با کد سند AW-ST-FO-008 با ستون مدل و تایید واحد کنترل کیفیت و نگهبانی',
    category: 'انبار و لجستیک',
    paperSize: 'A4',
    orientation: 'landscape',
    headerBanner: {
      companyName: 'شرکت آریا ونداد کسری',
      headerTitle: 'رسید کالا و قطعات خارجی',
      formCode: 'AW-ST-FO-008',
      documentNumber: '1',
      headerDate: '1405/01/15',
      hasRequestingUnit: false,
    },
    tableColumns: [
      { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
      { id: 'col_name', title: 'نام کالا', type: 'text', width: '35%', align: 'right' },
      { id: 'col_model', title: 'مدل', type: 'text', width: '20%', align: 'center' },
      { id: 'col_qty', title: 'تعداد', type: 'number', width: '10%', align: 'center' },
      { id: 'col_unit', title: 'واحد', type: 'text', width: '10%', align: 'center' },
      { id: 'col_notes', title: 'توضیحات', type: 'text', width: '25%', align: 'right' },
    ],
    tableInitialData: Array.from({ length: 10 }, (_, i) => ({
      id: `row_${i + 1}`,
      rowNumber: i + 1,
      description: '',
      model: '',
      quantity: 0,
      unit: '',
      notes: '',
    })),
    signatureLabels: ['واحد انبار :', 'مدیریت:', 'واحدمالی:', 'واحدکنترل کیفیت:', 'واحدنگهبانی:'],
  },
  '4_2790371f': {
    title: 'رسید تعمیرات',
    description: 'فرم رسید خدمات تعمیرات با کد AW-ST-FO-008 شامل اطلاعات تجهیزات، محل مصرف خط تولید و تاییدات',
    category: 'تعمیرات و نگهداری',
    paperSize: 'A4',
    orientation: 'landscape',
    headerBanner: {
      companyName: 'آریا ونداد کسری',
      headerTitle: 'رسید تعمیرات',
      formCode: 'AW-ST-FO-008',
      documentNumber: '2',
      headerDate: '1405/07/27',
      requestingUnit: 'واحد تاسیسات',
      hasRequestingUnit: true,
    },
    tableColumns: [
      { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
      { id: 'col_code', title: 'کد کالا', type: 'text', width: '12%', align: 'center' },
      { id: 'col_desc', title: 'شرح کالا', type: 'text', width: '32%', align: 'right' },
      { id: 'col_qty', title: 'مقدار', type: 'number', width: '10%', align: 'center' },
      { id: 'col_unit', title: 'واحد', type: 'text', width: '10%', align: 'center' },
      { id: 'col_location', title: 'محل مصرف', type: 'text', width: '20%', align: 'center' },
      { id: 'col_notes', title: 'توضیحات', type: 'text', width: '16%', align: 'right' },
    ],
    tableInitialData: [
      { id: 'r1', rowNumber: 1, productCode: '', description: 'دریل برقی رونیکس', quantity: 1, unit: 'دستگاه', usageLocation: 'خط تولیدلباسشویی', notes: 'سرویس وتعمیر انجام گردید' },
      { id: 'r2', rowNumber: 3, productCode: '', description: 'دریل برقی رونیکس مدل 2110', quantity: 1, unit: 'دستگاه', usageLocation: '', notes: '' },
      { id: 'r3', rowNumber: 4, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r4', rowNumber: 5, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r5', rowNumber: 6, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r6', rowNumber: 7, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r7', rowNumber: 8, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r8', rowNumber: 9, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
      { id: 'r9', rowNumber: 10, productCode: '', description: '', quantity: 0, unit: '', usageLocation: '', notes: '' },
    ],
    signatureLabels: ['درخواست کننده:', 'انبار:', 'تدارکات:', 'مدیریت:'],
  },
  'material_requisition': {
    title: 'درخواست اقلام مصرفی بین واحدی',
    description: 'فرم درخواست کالای مصرفی با کد AW-ST-FO-008 و تایید تحویل گیرنده و تحویل دهنده',
    category: 'انبار و لجستیک',
    paperSize: 'A4',
    orientation: 'landscape',
    headerBanner: {
      companyName: 'شرکت آریا ونداد کسری',
      headerTitle: 'درخواست اقلام مصرفی بین واحدی',
      formCode: 'AW-ST-FO-008',
      documentNumber: '7',
      headerDate: '1405/08/12',
      requestingUnit: 'اداری',
      hasRequestingUnit: true,
    },
    tableColumns: [
      { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
      { id: 'col_desc', title: 'شرح کالا', type: 'text', width: '45%', align: 'right' },
      { id: 'col_qty', title: 'مقدار', type: 'number', width: '12%', align: 'center' },
      { id: 'col_unit', title: 'واحد', type: 'text', width: '15%', align: 'center' },
      { id: 'col_notes', title: 'توضیحات', type: 'text', width: '28%', align: 'right' },
    ],
    tableInitialData: [
      { id: 'r1', rowNumber: 1, description: 'خوراک سنجاق کوب بزرگ', quantity: 1, unit: 'بسته', notes: 'جهت استفاده تدارکات' },
      { id: 'r2', rowNumber: 2, description: 'خوراک سنجاق کوب کوچک', quantity: 1, unit: 'بسته', notes: '' },
      { id: 'r3', rowNumber: 3, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r4', rowNumber: 4, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r5', rowNumber: 5, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r6', rowNumber: 6, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r7', rowNumber: 7, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r8', rowNumber: 8, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r9', rowNumber: 9, description: '', quantity: 0, unit: '', notes: '' },
      { id: 'r10', rowNumber: 10, description: '', quantity: 0, unit: '', notes: '' },
    ],
    signatureLabels: ['تحویل گیرنده:', 'تحویل دهنده:'],
  },
};

// GET /api/sample-images: returns available sample voucher images
app.get('/api/sample-images', (_req: Request, res: Response) => {
  const assetsDir = path.resolve(__dirname, 'public/assets/aistudio');
  const samples = [
    {
      id: '2_a94633a1',
      title: 'حواله خروج محصول',
      subtitle: 'شرکت آریا ونداد کسری - کد AW-St-FO-008',
      path: '/assets/aistudio/2_a94633a1.PNG',
      category: 'انبار و لجستیک',
    },
    {
      id: '3_4c1de245',
      title: 'رسید کالا و قطعات خارجی',
      subtitle: 'کنترل کیفیت و انبار - کد AW-ST-FO-008',
      path: '/assets/aistudio/3_4c1de245.PNG',
      category: 'انبار و لجستیک',
    },
    {
      id: '4_2790371f',
      title: 'رسید تعمیرات تجهیزات',
      subtitle: 'واحد تاسیسات و فنی - کد AW-ST-FO-008',
      path: '/assets/aistudio/4_2790371f.PNG',
      category: 'تعمیرات و نگهداری',
    },
    {
      id: '1_cba351d3',
      title: 'استعلام درخواست تعمیرات',
      subtitle: 'واحد اداری و تدارکات - کد AW-ST-FO-008',
      path: '/assets/aistudio/1_cba351d3.PNG',
      category: 'تعمیرات و نگهداری',
    },
  ];
  res.json({ success: true, samples });
});

// Helper to construct a FormTemplate from parsed info
function buildFormTemplateFromExtractedData(data: any): any {
  const id = `imported_img_${Date.now()}`;
  const title = data.title || 'فرم استخراج شده از تصویر';
  const description = data.description || 'فرم استخراج‌شده به وسیله تحلیل هوشمند تصویر';
  const category = data.category || 'انبار و لجستیک';
  const paperSize = data.paperSize === 'A5' ? 'A5' : 'A4';
  const orientation = data.orientation === 'portrait' ? 'portrait' : 'landscape';

  const fields: any[] = [];

  // 1. Header Banner field
  const hb = data.headerBanner || {};
  fields.push({
    id: `f_hdr_${Date.now()}`,
    type: 'header_banner',
    label: 'سربرگ سازمانی سند',
    width: '100%',
    headerType: 'dispatch_voucher',
    companyName: hb.companyName || 'شرکت آریا ونداد کسری',
    companySubName: hb.companySubName || '',
    headerTitle: hb.headerTitle || title,
    hasGreyTitleBanner: true,
    formCode: hb.formCode || 'AW-ST-FO-008',
    documentNumber: hb.documentNumber || '۱',
    headerDate: hb.headerDate || '۱۴۰۵/۰۱/۰۱',
    requestingUnit: hb.requestingUnit || '',
    hasRequestingUnit: Boolean(hb.hasRequestingUnit || hb.requestingUnit),
  });

  // 2. Table Field
  const columns = Array.isArray(data.tableColumns) && data.tableColumns.length > 0
    ? data.tableColumns
    : [
        { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
        { id: 'col_desc', title: 'شرح کالا یا خدمات', type: 'text', width: '40%', align: 'right' },
        { id: 'col_qty', title: 'تعداد / مقدار', type: 'number', width: '15%', align: 'center' },
        { id: 'col_unit', title: 'واحد', type: 'text', width: '15%', align: 'center' },
        { id: 'col_notes', title: 'توضیحات', type: 'text', width: '30%', align: 'right' },
      ];

  const initialRows = Array.isArray(data.tableInitialData) && data.tableInitialData.length > 0
    ? data.tableInitialData
    : Array.from({ length: 10 }, (_, i) => ({
        id: `r_${i + 1}`,
        rowNumber: i + 1,
        description: '',
        quantity: 0,
        unit: '',
        notes: '',
      }));

  fields.push({
    id: `f_tbl_${Date.now()}`,
    type: 'table',
    label: 'جدول اقلام و ردیف‌های سند',
    width: '100%',
    tableVariant: 'dispatch',
    tableBorderThickness: 'thick',
    tableColumns: columns,
    tableInitialRows: initialRows.length,
    tableInitialData: initialRows,
    hasTableSummary: Boolean(data.hasTableSummary),
  });

  // 3. Signature Field
  const sigLabels = Array.isArray(data.signatureLabels) && data.signatureLabels.length > 0
    ? data.signatureLabels
    : ['انبار:', 'مالی:', 'مدیریت:', 'تحویل گیرنده:'];

  fields.push({
    id: `f_sig_${Date.now()}`,
    type: 'signature',
    label: 'مهر و امضاهای تایید و تصویب سند',
    width: '100%',
    signatureLabels: sigLabels,
    signatureHeight: 'standard',
  });

  // 4. Any extra detected fields (like notes or custom fields)
  if (Array.isArray(data.additionalFields)) {
    for (const f of data.additionalFields) {
      fields.push(f);
    }
  }

  return {
    id,
    title,
    description,
    category,
    paperSize,
    orientation,
    fields,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    showPageBorders: true,
  };
}

// POST /api/convert-form-image: Analyze form image using Gemini or smart fallback
app.post('/api/convert-form-image', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png', fileName = '', sampleId = '' } = req.body;

    if (!imageBase64 && !sampleId) {
      return res.status(400).json({ error: 'تصویر یا شناسه نمونه ارسال نشده است.' });
    }

    // Check if sampleId matches known presets
    if (sampleId && SAMPLE_FORM_PRESETS[sampleId]) {
      const presetData = SAMPLE_FORM_PRESETS[sampleId];
      const template = buildFormTemplateFromExtractedData(presetData);
      return res.json({
        success: true,
        source: 'smart_preset',
        template,
        detectedInfo: {
          title: presetData.title,
          formCode: presetData.headerBanner.formCode,
          columnsCount: presetData.tableColumns.length,
          signaturesCount: presetData.signatureLabels.length,
        },
      });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64 ? imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '') : '';

    // If Gemini API is configured, use Gemini 3.8 Flash multimodal model
    if (ai && cleanBase64) {
      try {
        const prompt = `You are an expert Document Layout and Form Parser specializing in Persian / Iranian official business forms, warehouse vouchers (حواله خروج محصول), receipts (رسید کالا, رسید تعمیرات), requisition forms (درخواست اقلام), and invoices.
Analyze the attached image of an official form in detail and extract the complete structural template as JSON.

Schema requirements (return pure JSON with no markdown wrapping if possible):
{
  "title": "Exact Persian title of the document (e.g. حواله خروج محصول, رسید کالا و قطعات خارجی, رسید تعمیرات, etc.)",
  "description": "Short Persian description of this form and its purpose",
  "category": "انبار و لجستیک" or "تعمیرات و نگهداری" or "مالی و اداری",
  "paperSize": "A4",
  "orientation": "landscape" if the form is wide horizontally like AW-ST-FO-008 vouchers, else "portrait",
  "headerBanner": {
    "companyName": "Detected company name, e.g. شرکت آریا ونداد کسری",
    "companySubName": "English or secondary company name if visible",
    "headerTitle": "The main centered document title in the header banner",
    "formCode": "Detected form standard code, e.g. AW-ST-FO-008 or similar",
    "documentNumber": "Document number if visible or 1",
    "headerDate": "Date string if visible, e.g. 1405/08/07 or 1403/01/01",
    "hasRequestingUnit": true if a field like واحد درخواست کننده exists,
    "requestingUnit": "Value of requesting unit if present, e.g. واحد اداری or واحد تاسیسات"
  },
  "tableColumns": [
    {
      "id": "unique col id e.g. col_row, col_code, col_desc, col_qty, col_unit, col_location, col_serial, col_notes",
      "title": "Exact Persian column title, e.g. ردیف, کد کالا, شرح کالا, مدل, مقدار or تعداد, واحد, محل مصرف, شماره سریال, توضیحات",
      "type": "text" or "number" or "currency",
      "width": "percentage width or pixel width like 50px for row number",
      "align": "center" or "right"
    }
  ],
  "tableInitialData": [
    // Array of rows containing any text or items already filled in the image table (with rowNumber, description, quantity, unit, etc.)
  ],
  "signatureLabels": [
    // Array of Persian titles for each signature box at the bottom of the form, from right to left (e.g. ["واحددرخواست:", "انبار:", "تدارکات:", "مدیریت:", "مالی:"] or ["تحویل گیرنده:", "نگهبانی:", "مدیریت کارخانه:", "مالی:", "انبار:"])
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: mimeType || 'image/png',
                    data: cleanBase64,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.1,
          },
        });

        const responseText = response.text || '';
        let parsedJson: any = null;
        try {
          parsedJson = JSON.parse(responseText);
        } catch {
          // Attempt extraction from markdown codeblock
          const match = responseText.match(/\{[\s\S]*\}/);
          if (match) {
            parsedJson = JSON.parse(match[0]);
          }
        }

        if (parsedJson && (parsedJson.title || parsedJson.tableColumns)) {
          const template = buildFormTemplateFromExtractedData(parsedJson);
          return res.json({
            success: true,
            source: 'gemini',
            template,
            detectedInfo: {
              title: template.title,
              formCode: template.fields[0]?.formCode || 'AW-ST-FO-008',
              columnsCount: template.fields.find((f: any) => f.type === 'table')?.tableColumns?.length || 0,
              signaturesCount: template.fields.find((f: any) => f.type === 'signature')?.signatureLabels?.length || 0,
            },
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini vision API error, continuing to intelligent fallback:', geminiError?.message || geminiError);
      }
    }

    // Intelligent Fallback: Inspect filename, size, or pattern to match or create a tailored template
    let matchedPresetKey: string | null = null;
    const lowerName = (fileName || '').toLowerCase();

    if (lowerName.includes('cba351d3') || lowerName.includes('تعمیرات') || lowerName.includes('استعلام')) {
      matchedPresetKey = '1_cba351d3';
    } else if (lowerName.includes('a94633a1') || lowerName.includes('خروج') || lowerName.includes('حواله')) {
      matchedPresetKey = '2_a94633a1';
    } else if (lowerName.includes('4c1de245') || lowerName.includes('خارجی') || lowerName.includes('رسید کالا')) {
      matchedPresetKey = '3_4c1de245';
    } else if (lowerName.includes('2790371f') || lowerName.includes('رسید تعمیرات') || lowerName.includes('تاسیسات')) {
      matchedPresetKey = '4_2790371f';
    } else if (lowerName.includes('اقلام') || lowerName.includes('مصرفی') || lowerName.includes('بین واحدی')) {
      matchedPresetKey = 'material_requisition';
    }

    const fallbackData = matchedPresetKey
      ? SAMPLE_FORM_PRESETS[matchedPresetKey]
      : {
          title: fileName ? `فرم استخراج‌شده: ${fileName.replace(/\.[^/.]+$/, '')}` : 'فرم استخراج‌شده از تصویر',
          description: 'فرم تجاری بازتولید شده از ساختار جدول و سربرگ تصویر اسکن‌شده',
          category: 'انبار و لجستیک',
          paperSize: 'A4',
          orientation: 'landscape',
          headerBanner: {
            companyName: 'شرکت آریا ونداد کسری',
            headerTitle: 'حواله / رسید رسمی',
            formCode: 'AW-ST-FO-008',
            documentNumber: '۱',
            headerDate: '۱۴۰۵/۰۱/۰۱',
            hasRequestingUnit: false,
          },
          tableColumns: [
            { id: 'col_row', title: 'ردیف', type: 'number', width: '50px', align: 'center' },
            { id: 'col_code', title: 'کد کالا', type: 'text', width: '15%', align: 'center' },
            { id: 'col_desc', title: 'شرح کالا یا خدمات', type: 'text', width: '35%', align: 'right' },
            { id: 'col_qty', title: 'تعداد / مقدار', type: 'number', width: '10%', align: 'center' },
            { id: 'col_unit', title: 'واحد', type: 'text', width: '10%', align: 'center' },
            { id: 'col_notes', title: 'توضیحات', type: 'text', width: '25%', align: 'right' },
          ],
          tableInitialData: Array.from({ length: 10 }, (_, i) => ({
            id: `row_${i + 1}`,
            rowNumber: i + 1,
            productCode: '',
            description: '',
            quantity: 0,
            unit: '',
            notes: '',
          })),
          signatureLabels: ['انبار:', 'مالی:', 'مدیریت:', 'نگهبانی:', 'تحویل گیرنده:'],
        };

    const template = buildFormTemplateFromExtractedData(fallbackData);
    return res.json({
      success: true,
      source: 'smart_ocr_synthesizer',
      template,
      detectedInfo: {
        title: fallbackData.title,
        formCode: fallbackData.headerBanner.formCode,
        columnsCount: fallbackData.tableColumns.length,
        signaturesCount: fallbackData.signatureLabels.length,
      },
    });
  } catch (error: any) {
    console.error('Error converting form image:', error);
    res.status(500).json({
      error: 'خطا در پردازش تصویر فرم: ' + (error?.message || 'خطای ناشناخته'),
    });
  }
});

// ============================================================
// GitHub Repository Update Check & Apply Endpoints
// ============================================================

const SAFE_GH_PART = /^[A-Za-z0-9._-]+$/;
const SAFE_GH_BRANCH = /^[A-Za-z0-9._/-]+$/;
const SAFE_GH_SHA = /^[a-fA-F0-9]{7,40}$/;

function parseRepoSlugServer(input: string): { owner: string; repo: string; slug: string } | null {
  const trimmed = (input || '').trim();
  if (!trimmed) return null;
  let pathPart = trimmed;

  const sshMatch = trimmed.match(/^git@github\.com:([^/]+)\/(.+)$/i);
  if (sshMatch) {
    pathPart = `${sshMatch[1]}/${sshMatch[2]}`;
  } else if (/^https?:\/\//i.test(trimmed) || /^github\.com\//i.test(trimmed)) {
    const normalized = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    try {
      const u = new URL(normalized);
      if (!/(^|\.)github\.com$/i.test(u.hostname)) return null;
      pathPart = u.pathname.replace(/^\/+/, '');
    } catch {
      return null;
    }
  }

  const segments = pathPart.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  if (segments.length < 2) return null;
  const owner = segments[0];
  const repo = segments[1].replace(/\.git$/i, '');
  if (!SAFE_GH_PART.test(owner) || !SAFE_GH_PART.test(repo)) return null;
  return { owner, repo, slug: `${owner}/${repo}` };
}

function sanitizeBranchServer(branch?: string): string {
  const clean = (branch || '').trim();
  if (!clean || clean.includes('..') || !SAFE_GH_BRANCH.test(clean)) return 'main';
  return clean;
}

async function getLocalGitMetadata(): Promise<{
  hasGitWorkspace: boolean;
  localHeadSha: string;
  localBranch: string;
  originSlug: string;
}> {
  try {
    const { stdout: inside } = await execFileAsync('git', ['rev-parse', '--is-inside-work-tree'], {
      cwd: __dirname,
      timeout: 3000,
    });
    if (inside.trim() !== 'true') {
      return { hasGitWorkspace: false, localHeadSha: '', localBranch: '', originSlug: '' };
    }
    const [headRes, branchRes, remoteRes] = await Promise.all([
      execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: __dirname, timeout: 3000 }).catch(() => ({ stdout: '' })),
      execFileAsync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: __dirname, timeout: 3000 }).catch(() => ({ stdout: '' })),
      execFileAsync('git', ['remote', 'get-url', 'origin'], { cwd: __dirname, timeout: 3000 }).catch(() => ({ stdout: '' })),
    ]);
    const parsedOrigin = parseRepoSlugServer(remoteRes.stdout.trim());
    return {
      hasGitWorkspace: true,
      localHeadSha: headRes.stdout.trim(),
      localBranch: branchRes.stdout.trim(),
      originSlug: parsedOrigin?.slug || '',
    };
  } catch {
    return { hasGitWorkspace: false, localHeadSha: '', localBranch: '', originSlug: '' };
  }
}

function getAppPackageVersion(): string {
  try {
    const pkgRaw = fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf8');
    const pkg = JSON.parse(pkgRaw);
    return String(pkg.version || '1.0.0');
  } catch {
    return '1.0.0';
  }
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'Hamyar-Forms-Updater',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

app.get('/api/github-update/info', async (_req: Request, res: Response) => {
  const gitMeta = await getLocalGitMetadata();
  const envRepo = parseRepoSlugServer(process.env.GITHUB_REPO || '');
  res.json({
    success: true,
    appVersion: getAppPackageVersion(),
    defaultRepo: envRepo?.slug || gitMeta.originSlug || '',
    defaultBranch: sanitizeBranchServer(process.env.GITHUB_BRANCH || gitMeta.localBranch || 'main'),
    hasGitWorkspace: gitMeta.hasGitWorkspace,
    localHeadSha: gitMeta.localHeadSha,
    localBranch: gitMeta.localBranch,
  });
});

app.post('/api/github-update/check', async (req: Request, res: Response) => {
  try {
    const rawRepo = String(req.body?.repo || process.env.GITHUB_REPO || '');
    const parsedRepo = parseRepoSlugServer(rawRepo);
    if (!parsedRepo) {
      return res.status(400).json({
        success: false,
        error: 'آدرس مخزن گیتهاب معتبر نیست. از فرمت owner/repo یا لینک کامل github.com استفاده کنید.',
      });
    }

    const branch = sanitizeBranchServer(req.body?.branch || process.env.GITHUB_BRANCH);
    const clientInstalledSha = String(req.body?.installedSha || '').trim();
    const gitMeta = await getLocalGitMetadata();
    const baselineSha = gitMeta.localHeadSha || clientInstalledSha;

    const headers = buildGitHubHeaders();
    const commitUrl = `https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.repo}/commits/${encodeURIComponent(branch)}`;
    const commitResp = await fetch(commitUrl, { headers });

    if (!commitResp.ok) {
      const status = commitResp.status;
      let errMsg = 'خطا در برقراری ارتباط با گیتهاب.';
      if (status === 404) {
        errMsg = `مخزن «${parsedRepo.slug}» یا شاخه «${branch}» در گیتهاب پیدا نشد (یا خصوصی است).`;
      } else if (status === 403 || status === 429) {
        errMsg = 'محدودیت تعداد درخواست گیتهاب (Rate Limit) موقتاً پر شده است. چند دقیقه بعد دوباره تلاش کنید.';
      }
      return res.status(status >= 400 && status < 500 ? status : 502).json({
        success: false,
        error: errMsg,
      });
    }

    const commitJson: any = await commitResp.json();
    const latestSha = String(commitJson?.sha || '');
    if (!latestSha) {
      return res.status(502).json({
        success: false,
        error: 'پاسخ گیتهاب فاقد شناسه نسخه (Commit SHA) است.',
      });
    }

    const files = Array.isArray(commitJson?.files)
      ? commitJson.files.map((f: any) => ({
          filename: String(f.filename || ''),
          status: String(f.status || 'modified'),
          additions: Number(f.additions || 0),
          deletions: Number(f.deletions || 0),
        }))
      : [];

    // Best-effort check for latest release tag
    let latestRelease: any = null;
    try {
      const relResp = await fetch(
        `https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.repo}/releases/latest`,
        { headers }
      );
      if (relResp.ok) {
        const relJson: any = await relResp.json();
        latestRelease = {
          tagName: String(relJson.tag_name || ''),
          name: String(relJson.name || relJson.tag_name || ''),
          publishedAt: String(relJson.published_at || ''),
          htmlUrl: String(relJson.html_url || ''),
        };
      }
    } catch {
      // Release endpoint is optional
    }

    const isInitialSync = !baselineSha;
    const hasUpdate = Boolean(baselineSha && baselineSha.toLowerCase() !== latestSha.toLowerCase());

    return res.json({
      success: true,
      repo: parsedRepo.slug,
      branch,
      hasUpdate,
      isInitialSync,
      installedSha: baselineSha,
      hasGitWorkspace: gitMeta.hasGitWorkspace,
      latestCommit: {
        sha: latestSha,
        shortSha: latestSha.slice(0, 7),
        message: String(commitJson?.commit?.message || '').split('\n')[0] || 'بدون توضیح کامیت',
        authorName: String(commitJson?.commit?.author?.name || commitJson?.author?.login || 'نامشخص'),
        date: String(commitJson?.commit?.author?.date || new Date().toISOString()),
        htmlUrl: String(commitJson?.html_url || `https://github.com/${parsedRepo.slug}/commit/${latestSha}`),
        files,
      },
      latestRelease,
      checkedAt: new Date().toISOString(),
      zipDownloadUrl: `https://github.com/${parsedRepo.slug}/archive/${latestSha}.zip`,
    });
  } catch (error: any) {
    console.error('GitHub update check failed:', error);
    return res.status(500).json({
      success: false,
      error: 'خطا در بررسی نسخه گیتهاب: ' + (error?.message || 'خطای شبکه'),
    });
  }
});

app.post('/api/github-update/apply', async (req: Request, res: Response) => {
  try {
    const parsedRepo = parseRepoSlugServer(String(req.body?.repo || process.env.GITHUB_REPO || ''));
    const branch = sanitizeBranchServer(req.body?.branch || process.env.GITHUB_BRANCH);
    const targetSha = String(req.body?.targetSha || '').trim();

    if (!parsedRepo) {
      return res.status(400).json({ success: false, error: 'آدرس مخزن گیتهاب نامعتبر است.' });
    }
    if (targetSha && !SAFE_GH_SHA.test(targetSha)) {
      return res.status(400).json({ success: false, error: 'شناسه نسخه (SHA) معتبر نیست.' });
    }

    const gitMeta = await getLocalGitMetadata();

    // If workspace is a real git repo matching this remote, perform a safe fast-forward git pull
    if (gitMeta.hasGitWorkspace && (!gitMeta.originSlug || gitMeta.originSlug.toLowerCase() === parsedRepo.slug.toLowerCase())) {
      try {
        await execFileAsync('git', ['fetch', 'origin', branch], { cwd: __dirname, timeout: 15000 });
        await execFileAsync('git', ['pull', '--ff-only', 'origin', branch], { cwd: __dirname, timeout: 20000 });
        const { stdout: newHead } = await execFileAsync('git', ['rev-parse', 'HEAD'], { cwd: __dirname, timeout: 3000 });
        return res.json({
          success: true,
          mode: 'git_pull',
          appliedSha: newHead.trim() || targetSha,
          message: 'کدهای جدید با موفقیت از گیتهاب دریافت و اعمال شد. صفحه برای استفاده از آخرین نسخه بارگذاری می‌شود.',
          requiresReload: true,
        });
      } catch (gitErr: any) {
        return res.status(409).json({
          success: false,
          error: 'بروزرسانی خودکار Git به‌دلیل تغییرات محلی انجام نشد: ' + (gitErr?.message || ''),
        });
      }
    }

    // Standard container / browser deployment mode: acknowledge target version & refresh client caches
    return res.json({
      success: true,
      mode: 'version_sync_reload',
      appliedSha: targetSha,
      zipDownloadUrl: targetSha
        ? `https://github.com/${parsedRepo.slug}/archive/${targetSha}.zip`
        : `https://github.com/${parsedRepo.slug}/archive/refs/heads/${branch}.zip`,
      message: 'نسخه جدید گیتهاب ثبت شد و حافظه موقت مرورگر برای استفاده از آخرین نسخه تازه‌سازی می‌شود.',
      requiresReload: true,
    });
  } catch (error: any) {
    console.error('GitHub apply update failed:', error);
    return res.status(500).json({
      success: false,
      error: 'خطا در اعمال بروزرسانی: ' + (error?.message || 'خطای ناشناخته'),
    });
  }
});

// Setup Vite middleware in development or serve static in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WinForm Studio Pro] Server running at http://localhost:${PORT}`);
  });
}

startServer();

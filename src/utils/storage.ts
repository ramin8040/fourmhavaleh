import { FormTemplate, FormRecord, TableItemRow } from '../types/form';
import { getTodayShamsiString } from './formLogic';

const TEMPLATES_KEY = 'winform_templates_v2';
const RECORDS_KEY = 'winform_records_v2';
const ACTIVE_FORM_ID_KEY = 'winform_active_form_id_v2';

export const BLANK_FORM_TEMPLATE: FormTemplate = {
  id: 'blank-form-default',
  title: 'فرم جدید (بوم سفید)',
  description: 'طراحی فرم اداری یا تجاری از روی بوم کاملاً سفید و سفارشی',
  category: 'سفارشی',
  paperSize: 'A4',
  orientation: 'portrait',
  headerTitle: 'عنوان سند یا شرکت',
  headerSubtitle: 'زیرعنوان یا مشخصات سند',
  showWatermark: false,
  watermarkText: 'محرمانه',
  showPageBorders: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  fields: [
    {
      id: 'f_header_1',
      type: 'header_banner',
      label: 'سربرگ سازمانی',
      companyName: 'شرکت تجارت نوین آریا',
      registrationNumber: '۴۸۲۹۰۱',
      nationalId: '۱۰۳۲۰۵۱۴۲۳۰',
      width: '100%',
    },
    {
      id: 'f_doc_no',
      type: 'text',
      label: 'شماره سند',
      defaultValue: '۱۰۱/۱۴۰۳',
      width: '33%',
      required: true,
      boxed: true,
    },
    {
      id: 'f_doc_date',
      type: 'shamsi_date',
      label: 'تاریخ صدور',
      defaultValue: getTodayShamsiString(),
      width: '33%',
      required: true,
      boxed: true,
    },
    {
      id: 'f_doc_ref',
      type: 'text',
      label: 'پیوست / شماره عطف',
      defaultValue: 'ندارد',
      width: '33%',
      boxed: true,
    },
    {
      id: 'f_div_1',
      type: 'divider',
      label: 'خط جداکننده',
      width: '100%',
    },
    {
      id: 'f_desc',
      type: 'textarea',
      label: 'شرح موضوع و متن سند',
      placeholder: 'متن گزارش، توافق یا توضیحات تکمیلی را در این بخش یادداشت فرمایید...',
      width: '100%',
      boxed: true,
    },
    {
      id: 'f_sig_1',
      type: 'signature',
      label: 'مهر و امضای متقاضی / تاییدکننده',
      width: '50%',
      boxed: true,
    },
    {
      id: 'f_sig_2',
      type: 'signature',
      label: 'مهر و امضای مدیریت',
      width: '50%',
      boxed: true,
    },
  ],
};

export const PRESET_TEMPLATES: FormTemplate[] = [
  BLANK_FORM_TEMPLATE,
  {
    id: 'preset_dispatch_voucher',
    title: 'حواله خروج محصول (شرکت آریا ونداد کسری)',
    description: 'فرم رسمی حواله خروج انبار با کد AW-St-FO-008، جدول ۱۰ ردیفه کد و شرح کالا و ۵ مرحله امضا و تایید رسمی',
    category: 'انبار و لجستیک',
    paperSize: 'A4',
    orientation: 'landscape',
    headerTitle: '',
    headerSubtitle: '',
    showWatermark: false,
    watermarkText: 'خروج کالا',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_dispatch_header',
        type: 'header_banner',
        headerType: 'dispatch_voucher',
        label: 'سربرگ رسمی حواله خروج محصول',
        companyName: 'شرکت آریا ونداد کسری',
        companySubName: 'شرکت بین‌المللی آریا ونداد کسری',
        headerTitle: 'حواله خروج محصول',
        formCode: 'AW-St-FO-008',
        documentNumber: '1',
        headerDate: '1405/06/25',
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_dispatch_table',
        type: 'table',
        tableVariant: 'dispatch',
        label: 'جدول مشخصات و اقلام خروج محصول',
        tableColumns: [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
          { id: 'productCode', title: 'کد کالا', width: 'w-28', type: 'text' },
          { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
          { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number' },
          { id: 'unit', title: 'واحد', width: 'w-16', type: 'text' },
          { id: 'serialNumber', title: 'شماره سریال', width: 'w-36', type: 'text' },
          { id: 'notes', title: 'توضیحات', width: 'w-44', type: 'text' },
        ],
        tableInitialRows: 10,
        hasTableSummary: false,
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_dispatch_signatures',
        type: 'signature',
        label: 'محل امضا و تاییدیه‌های خروج',
        signatureLabels: [
          'انبار:',
          'مالی:',
          'مدیریت کارخانه:',
          'نگهبانی:',
          'تحویل گیرنده:',
        ],
        width: '100%',
        boxed: false,
      },
    ],
  },
  {
    id: 'preset_receipt_foreign_goods',
    title: 'رسید کالا و قطعات خارجی (شرکت آیریا ونداد کسری)',
    description: 'فرم رسمی ورود قطعات خارجی با کد AW-ST-FO-008، ستون‌های نام کالا، مدل، تعداد، واحد، توضیحات و ۵ امضای انبار، مدیریت، مالی، کنترل کیفیت و نگهبانی',
    category: 'انبار و لجستیک',
    paperSize: 'A4',
    orientation: 'landscape',
    headerTitle: '',
    headerSubtitle: '',
    showWatermark: false,
    watermarkText: 'ورود قطعات',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_foreign_header',
        type: 'header_banner',
        headerType: 'dispatch_voucher',
        label: 'سربرگ رسید کالا و قطعات خارجی',
        companyName: 'شرکت آیریا ونداد کسری',
        companySubName: 'شرکت بین‌المللی آیریا ونداد کسری',
        headerTitle: 'رسید کالا و قطعات خارجی',
        hasGreyTitleBanner: true,
        formCode: 'AW-ST-FO-008',
        documentNumber: '1',
        headerDate: '1405/01/15',
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_foreign_table',
        type: 'table',
        tableVariant: 'dispatch',
        label: 'جدول اقلام رسید کالا و قطعات خارجی',
        tableColumns: [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
          { id: 'description', title: 'نام کالا', width: 'flex-1', type: 'text' },
          { id: 'model', title: 'مدل', width: 'w-36', type: 'text' },
          { id: 'quantity', title: 'تعداد', width: 'w-20', type: 'number' },
          { id: 'unit', title: 'واحد', width: 'w-20', type: 'text' },
          { id: 'notes', title: 'توضیحات', width: 'w-48', type: 'text' },
        ],
        tableInitialRows: 10,
        hasTableSummary: false,
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_foreign_signatures',
        type: 'signature',
        label: 'محل امضا و تایید واحدها',
        signatureLabels: [
          'واحد انبار:',
          'مدیریت:',
          'واحد مالی:',
          'واحد کنترل کیفیت:',
          'واحد نگهبانی:',
        ],
        width: '100%',
        boxed: false,
      },
    ],
  },
  {
    id: 'preset_inquiry_repair_request',
    title: 'استعلام درخواست تعمیرات (آیریا ونداد کسری)',
    description: 'فرم استعلام درخواست سرویس و تعمیرات اداری با کد AW-ST-FO-008، ستون محل مصرف و ۵ مرحله تایید واحد درخواست، انبار، تدارکات، مدیریت و مالی',
    category: 'فنی و مهندسی',
    paperSize: 'A4',
    orientation: 'landscape',
    headerTitle: '',
    headerSubtitle: '',
    showWatermark: false,
    watermarkText: 'تعمیرات',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_inquiry_header',
        type: 'header_banner',
        headerType: 'dispatch_voucher',
        label: 'سربرگ استعلام درخواست تعمیرات',
        companyName: 'آیریا ونداد کسری',
        companySubName: 'شرکت بین‌المللی آیریا ونداد کسری',
        headerTitle: 'استعلام درخواست تعمیرات',
        formCode: 'AW-ST-FO-008',
        documentNumber: '4',
        headerDate: '1405/08/07',
        requestingUnit: 'واحد اداری',
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_inquiry_table',
        type: 'table',
        tableVariant: 'dispatch',
        label: 'جدول اقلام استعلام تعمیرات',
        tableColumns: [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
          { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
          { id: 'quantity', title: 'مقدار', width: 'w-20', type: 'number' },
          { id: 'unit', title: 'واحد', width: 'w-20', type: 'text' },
          { id: 'usageLocation', title: 'محل مصرف', width: 'w-36', type: 'text' },
          { id: 'notes', title: 'توضیحات', width: 'w-48', type: 'text' },
        ],
        tableInitialRows: 10,
        tableInitialData: [
          {
            id: 'row-1',
            rowNumber: 1,
            description: 'فیلتر دستگاه تصفیه آب',
            quantity: 1,
            unit: 'دستگاه',
            usageLocation: 'آیریا ونداد کسری',
            notes: 'جهت سرویس',
          },
        ],
        hasTableSummary: false,
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_inquiry_signatures',
        type: 'signature',
        label: 'تایید و امضای مراحل',
        signatureLabels: [
          'واحد درخواست:',
          'انبار:',
          'تدارکات:',
          'مدیریت:',
          'مالی:',
        ],
        width: '100%',
        boxed: false,
      },
    ],
  },
  {
    id: 'preset_repair_receipt',
    title: 'رسید تعمیرات (آیریا ونداد کسری)',
    description: 'فرم رسمی تحویل و رسید تعمیرات تاسیسات با کد کالا، محل مصرف و تایید ۴ مرحله‌ای درخواست‌کننده، انبار، تدارکات و مدیریت',
    category: 'فنی و مهندسی',
    paperSize: 'A4',
    orientation: 'landscape',
    headerTitle: '',
    headerSubtitle: '',
    showWatermark: false,
    watermarkText: 'تعمیرات',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_repair_header',
        type: 'header_banner',
        headerType: 'dispatch_voucher',
        label: 'سربرگ رسید تعمیرات',
        companyName: 'آیریا ونداد کسری',
        companySubName: 'شرکت بین‌المللی آیریا ونداد کسری',
        headerTitle: 'رسید تعمیرات',
        hasGreyTitleBanner: true,
        formCode: 'AW-ST-FO-008',
        documentNumber: '2',
        headerDate: '1405/07/27',
        requestingUnit: 'واحد تاسیسات',
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_repair_table',
        type: 'table',
        tableVariant: 'dispatch',
        label: 'جدول اقلام رسید تعمیرات',
        tableColumns: [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
          { id: 'productCode', title: 'کد کالا', width: 'w-24', type: 'text' },
          { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
          { id: 'quantity', title: 'مقدار', width: 'w-20', type: 'number' },
          { id: 'unit', title: 'واحد', width: 'w-20', type: 'text' },
          { id: 'usageLocation', title: 'محل مصرف', width: 'w-36', type: 'text' },
          { id: 'notes', title: 'توضیحات', width: 'w-44', type: 'text' },
        ],
        tableInitialRows: 10,
        tableInitialData: [
          {
            id: 'row-1',
            rowNumber: 1,
            productCode: '',
            description: 'دریل برقی رونیکس',
            quantity: 1,
            unit: 'دستگاه',
            usageLocation: 'خط تولید لباسشویی',
            notes: 'سرویس وتعمیر انجام گردید',
          },
          {
            id: 'row-3',
            rowNumber: 3,
            productCode: '',
            description: 'دریل برقی رونیکس مدل 2110',
            quantity: 1,
            unit: 'دستگاه',
            usageLocation: '',
            notes: '',
          },
        ],
        hasTableSummary: false,
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_repair_signatures',
        type: 'signature',
        label: 'تایید و امضای واحدها',
        signatureLabels: [
          'درخواست کننده:',
          'انبار:',
          'تدارکات:',
          'مدیریت:',
        ],
        width: '100%',
        boxed: false,
      },
    ],
  },
  {
    id: 'preset_inter_unit_consumable_request',
    title: 'درخواست اقلام مصرفی بین واحدی (شرکت آیریا ونداد کسری)',
    description: 'فرم درخواست و تحویل اقلام مصرفی بین واحدی با کد AW-ST-FO-008 و تایید دوطرفه تحویل گیرنده و تحویل دهنده',
    category: 'اداری و تدارکات',
    paperSize: 'A4',
    orientation: 'landscape',
    headerTitle: '',
    headerSubtitle: '',
    showWatermark: false,
    watermarkText: 'مصرفی',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_consumable_header',
        type: 'header_banner',
        headerType: 'dispatch_voucher',
        label: 'سربرگ درخواست اقلام مصرفی بین واحدی',
        companyName: 'شرکت آیریا ونداد کسری',
        companySubName: 'شرکت بین‌المللی آیریا ونداد کسری',
        headerTitle: 'درخواست اقلام مصرفی بین واحدی',
        formCode: 'AW-ST-FO-008',
        documentNumber: '7',
        headerDate: '1405/08/12',
        requestingUnit: 'اداری',
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_consumable_table',
        type: 'table',
        tableVariant: 'dispatch',
        label: 'جدول اقلام مصرفی بین واحدی',
        tableColumns: [
          { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
          { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
          { id: 'quantity', title: 'مقدار', width: 'w-24', type: 'number' },
          { id: 'unit', title: 'واحد', width: 'w-24', type: 'text' },
          { id: 'notes', title: 'توضیحات', width: 'w-48', type: 'text' },
        ],
        tableInitialRows: 10,
        tableInitialData: [
          {
            id: 'row-1',
            rowNumber: 1,
            description: 'خوراک سنجاق کوب بزرگ',
            quantity: 1,
            unit: 'بسته',
            notes: 'جهت استفاده تدارکات',
          },
          {
            id: 'row-2',
            rowNumber: 2,
            description: 'خوراک سنجاق کوب کوچک',
            quantity: 1,
            unit: 'بسته',
            notes: '',
          },
        ],
        hasTableSummary: false,
        width: '100%',
        boxed: false,
      },
      {
        id: 'f_consumable_signatures',
        type: 'signature',
        label: 'امضای تحویل',
        signatureLabels: [
          'تحویل گیرنده:',
          'تحویل دهنده:',
        ],
        width: '100%',
        boxed: false,
      },
    ],
  },
  {
    id: 'preset_invoice_1',
    title: 'فاکتور رسمی فروش کالا و خدمات',
    description: 'صورتحساب معتبر با مشخصات فروشنده و خریدار، جدول اقلام، مالیات و محاسبه خودکار جمع کل',
    category: 'مالی و فروش',
    paperSize: 'A4',
    orientation: 'portrait',
    headerTitle: 'صورتحساب فروش کالا و خدمات',
    headerSubtitle: 'مطابق استانداردهای نظام مالیاتی کشور',
    showWatermark: false,
    watermarkText: 'نسخه حسابداری',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_inv_header',
        type: 'header_banner',
        label: 'سربرگ فاکتور',
        companyName: 'شرکت توسعه بازرگانی پیشرو (سهامی خاص)',
        registrationNumber: '۴۸۷۲۱۹',
        nationalId: '۱۰۸۶۱۵۲۴۳۰۱',
        width: '100%',
      },
      {
        id: 'f_inv_serial',
        type: 'text',
        label: 'شماره صورتحساب',
        defaultValue: 'INV-1403-882',
        width: '33%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_inv_date',
        type: 'shamsi_date',
        label: 'تاریخ فاکتور',
        defaultValue: getTodayShamsiString(),
        width: '33%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_inv_payment_type',
        type: 'select',
        label: 'نوع تسویه',
        options: ['نقدی', 'چک صیادی', 'واریز به حساب', 'اعتباری ۳۰ روزه'],
        defaultValue: 'نقدی',
        width: '33%',
        boxed: true,
      },
      {
        id: 'f_inv_buyer_name',
        type: 'text',
        label: 'نام خریدار / شرکت',
        placeholder: 'نام شخص یا شرکت خریدار',
        width: '50%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_inv_buyer_national_id',
        type: 'text',
        label: 'شناسه ملی / کد ملی خریدار',
        placeholder: '۱۰ رقمی یا ۱۱ رقمی',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_inv_table',
        type: 'table',
        label: 'جدول مشخصات کالا و خدمات',
        width: '100%',
        hasTableSummary: true,
        taxRatePercent: 10,
        discountAmount: 0,
        tableInitialRows: 3,
      },
      {
        id: 'f_inv_notes',
        type: 'textarea',
        label: 'شرایط و توضیحات فاکتور',
        defaultValue: 'اجناس تحویل شده تا ۲۴ ساعت پس از تحویل دارای ضمانت تعویض یا مرجوعی می‌باشند.',
        width: '66%',
        boxed: true,
      },
      {
        id: 'f_inv_qr',
        type: 'qrcode',
        label: 'اصالت‌سنجی فاکتور',
        qrContent: 'https://tax.gov.ir/invoice-verify?id=INV-1403-882',
        width: '33%',
        boxed: true,
      },
      {
        id: 'f_inv_sig_seller',
        type: 'signature',
        label: 'مهر و امضای فروشنده',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_inv_sig_buyer',
        type: 'signature',
        label: 'امضا و اثر انگشت خریدار',
        width: '50%',
        boxed: true,
      },
    ],
  },
  {
    id: 'preset_leave_request',
    title: 'برگه درخواست مرخصی و ماموریت اداری',
    description: 'فرم اداری استحقاقی، استعلاجی یا ماموریت با جدول ساعات و تاییدیه‌ها',
    category: 'منابع انسانی',
    paperSize: 'A5',
    orientation: 'portrait',
    headerTitle: 'برگه درخواست مرخصی / ماموریت اداری',
    headerSubtitle: 'معاونت اداری و پشتیبانی',
    showWatermark: false,
    watermarkText: 'تایید شده',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_emp_name',
        type: 'text',
        label: 'نام و نام خانوادگی همکار',
        placeholder: 'مثال: علی احمدی',
        width: '50%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_emp_code',
        type: 'text',
        label: 'کد پرسنلی',
        placeholder: '۱۲۴۰',
        width: '50%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_leave_type',
        type: 'select',
        label: 'نوع درخواست',
        options: ['مرخصی استحقاقی (روزانه)', 'مرخصی ساعتی', 'مرخصی استعلاجی (پزشکی)', 'ماموریت درون شهری', 'ماموریت برون شهری'],
        defaultValue: 'مرخصی استحقاقی (روزانه)',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_leave_date',
        type: 'shamsi_date',
        label: 'تاریخ شروع',
        defaultValue: getTodayShamsiString(),
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_leave_duration',
        type: 'text',
        label: 'مدت درخواست (روز / ساعت)',
        placeholder: 'مثلاً: ۲ روز کاری',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_substitute_emp',
        type: 'text',
        label: 'همکار جانشین در مدت غیبت',
        placeholder: 'نام جانشین مورد توافق',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_leave_reason',
        type: 'textarea',
        label: 'علت و توضیحات درخواست',
        placeholder: 'توضیحات تکمیلی...',
        width: '100%',
        boxed: true,
      },
      {
        id: 'f_emp_sig',
        type: 'signature',
        label: 'امضای متقاضی',
        width: '33%',
        boxed: true,
      },
      {
        id: 'f_substitute_sig',
        type: 'signature',
        label: 'امضای همکار جانشین',
        width: '33%',
        boxed: true,
      },
      {
        id: 'f_manager_sig',
        type: 'signature',
        label: 'موافقت مدیر مستقیم',
        width: '33%',
        boxed: true,
      },
    ],
  },
  {
    id: 'preset_receipt_voucher',
    title: 'رسید دریافت وجه و تحویل کالا',
    description: 'سند تسویه حساب صندوق یا تحویل کالا با مشخصات پرداخت، چک و امضای دریافت‌کننده',
    category: 'مالی و انبار',
    paperSize: 'A5',
    orientation: 'landscape',
    headerTitle: 'رسید دریافت وجه و اسناد مالی',
    headerSubtitle: 'امور مالی و خزانه‌داری',
    showWatermark: false,
    watermarkText: 'وصول شد',
    showPageBorders: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fields: [
      {
        id: 'f_rec_no',
        type: 'text',
        label: 'شماره رسید',
        defaultValue: 'REC-1403-104',
        width: '33%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_rec_date',
        type: 'shamsi_date',
        label: 'تاریخ وصول',
        defaultValue: getTodayShamsiString(),
        width: '33%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_rec_from',
        type: 'text',
        label: 'دریافت شده از شخص/شرکت',
        placeholder: 'نام پرداخت‌کننده',
        width: '33%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_rec_amount',
        type: 'currency',
        label: 'مبلغ دریافتی (ریال)',
        defaultValue: 25000000,
        width: '50%',
        required: true,
        boxed: true,
      },
      {
        id: 'f_rec_method',
        type: 'select',
        label: 'بابت / روش دریافت',
        options: ['نقدی به صندوق', 'واریز پایا/ساتنا به بانک', 'دستگاه کارتخوان (POS)', 'چک بانکی صیادی'],
        defaultValue: 'دستگاه کارتخوان (POS)',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_rec_details',
        type: 'textarea',
        label: 'بابت / شرح و شماره پیگیری بانکی',
        placeholder: 'شماره تراکنش، شماره چک یا بابت فاکتور...',
        width: '100%',
        boxed: true,
      },
      {
        id: 'f_rec_payer_sig',
        type: 'signature',
        label: 'امضای پرداخت‌کننده',
        width: '50%',
        boxed: true,
      },
      {
        id: 'f_rec_cashier_sig',
        type: 'signature',
        label: 'مهر و امضای صندوق‌دار / خزانه‌دار',
        width: '50%',
        boxed: true,
      },
    ],
  },
];

const DELETED_TEMPLATES_KEY = 'winform_deleted_template_ids_v2';

export function getDeletedTemplateIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Local Storage Helper Methods
export function loadAllTemplates(): FormTemplate[] {
  try {
    const raw = localStorage.getItem(TEMPLATES_KEY);
    const deletedIds = getDeletedTemplateIds();

    if (!raw) {
      const initial = PRESET_TEMPLATES.filter((p) => !deletedIds.includes(p.id));
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      const initial = PRESET_TEMPLATES.filter((p) => !deletedIds.includes(p.id));
      return initial;
    }
    // Auto-merge any preset templates that are not present in localStorage and have not been deleted by the user
    const missingPresets = PRESET_TEMPLATES.filter(
      (p) => !parsed.some((t) => t.id === p.id) && !deletedIds.includes(p.id)
    );
    if (missingPresets.length > 0) {
      const merged = [...parsed, ...missingPresets];
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(merged));
      return merged;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load templates from localStorage', err);
    return PRESET_TEMPLATES;
  }
}

export function saveAllTemplates(templates: FormTemplate[]): void {
  try {
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
  } catch (err) {
    console.error('Failed to save templates to localStorage', err);
  }
}

export function saveTemplate(template: FormTemplate): void {
  const all = loadAllTemplates();
  // If user saves/edits a template, remove its id from deletedIds if present
  const deleted = getDeletedTemplateIds().filter((id) => id !== template.id);
  localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify(deleted));

  const existingIdx = all.findIndex((t) => t.id === template.id);
  if (existingIdx >= 0) {
    all[existingIdx] = { ...template, updatedAt: new Date().toISOString() };
  } else {
    all.push({ ...template, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveAllTemplates(all);
}

export function deleteTemplate(templateId: string): void {
  // Add to deleted IDs list so auto-merge never restores it
  const deleted = getDeletedTemplateIds();
  if (!deleted.includes(templateId)) {
    deleted.push(templateId);
    localStorage.setItem(DELETED_TEMPLATES_KEY, JSON.stringify(deleted));
  }
  const all = loadAllTemplates().filter((t) => t.id !== templateId);
  saveAllTemplates(all);
}

export function resetAllTemplatesToDefaults(): FormTemplate[] {
  try {
    localStorage.removeItem(DELETED_TEMPLATES_KEY);
    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(PRESET_TEMPLATES));
  } catch (err) {
    console.error('Failed to reset templates', err);
  }
  return PRESET_TEMPLATES;
}


// Records (Submissions) methods
export function loadAllRecords(): FormRecord[] {
  try {
    const raw = localStorage.getItem(RECORDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load records from localStorage', err);
    return [];
  }
}

export function saveAllRecords(records: FormRecord[]): void {
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Failed to save records to localStorage', err);
  }
}

export function saveRecord(record: FormRecord): void {
  const records = loadAllRecords();
  const idx = records.findIndex((r) => r.id === record.id);
  if (idx >= 0) {
    records[idx] = { ...record, updatedAt: new Date().toISOString() };
  } else {
    records.unshift({ ...record, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  saveAllRecords(records);
}

export function deleteRecord(recordId: string): void {
  const records = loadAllRecords().filter((r) => r.id !== recordId);
  saveAllRecords(records);
}

// Active Form Tracking
export function getActiveFormId(): string {
  return localStorage.getItem(ACTIVE_FORM_ID_KEY) || BLANK_FORM_TEMPLATE.id;
}

export function setActiveFormId(id: string): void {
  localStorage.setItem(ACTIVE_FORM_ID_KEY, id);
}

// Full Database Export / Backup
export function exportFullBackup(): string {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    templates: loadAllTemplates(),
    records: loadAllRecords(),
  };
  return JSON.stringify(data, null, 2);
}

export function importFullBackup(jsonString: string): { success: boolean; templatesCount: number; recordsCount: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.templates || !Array.isArray(parsed.templates)) {
      return { success: false, templatesCount: 0, recordsCount: 0, error: 'قالب نامعتبر است: داده‌های فرم یافت نشد.' };
    }
    saveAllTemplates(parsed.templates);
    if (parsed.records && Array.isArray(parsed.records)) {
      saveAllRecords(parsed.records);
    }
    return {
      success: true,
      templatesCount: parsed.templates.length,
      recordsCount: (parsed.records || []).length,
    };
  } catch (err: any) {
    console.error('Failed to import backup', err);
    return {
      success: false,
      templatesCount: 0,
      recordsCount: 0,
      error: err?.message || 'خطا در خواندن فایل پشتیبان',
    };
  }
}

// Session Auto-Save (Draft in sessionStorage)
export const FORM_DRAFT_SESSION_KEY = 'winform_form_draft_session_v1';

export interface FormSessionDraft {
  templateId: string;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  currentRecordId: string | null;
  savedAt: string; // ISO string
}

export function saveFormSessionDraft(draft: FormSessionDraft): void {
  try {
    sessionStorage.setItem(FORM_DRAFT_SESSION_KEY, JSON.stringify(draft));
  } catch (err) {
    console.warn('Failed to save draft to sessionStorage', err);
  }
}

export function loadFormSessionDraft(): FormSessionDraft | null {
  try {
    const raw = sessionStorage.getItem(FORM_DRAFT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && parsed.templateId) {
      return parsed as FormSessionDraft;
    }
    return null;
  } catch (err) {
    console.warn('Failed to load draft from sessionStorage', err);
    return null;
  }
}

export function clearFormSessionDraft(): void {
  try {
    sessionStorage.removeItem(FORM_DRAFT_SESSION_KEY);
  } catch (err) {
    console.warn('Failed to clear draft from sessionStorage', err);
  }
}


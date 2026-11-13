export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'shamsi_date'
  | 'select'
  | 'checkbox'
  | 'table'
  | 'signature'
  | 'qrcode'
  | 'header_banner'
  | 'divider';

export type FieldWidth = '100%' | '75%' | '66%' | '50%' | '33%' | '25%';

export type TableBorderLineStyle = 'solid' | 'dashed' | 'dotted' | 'double' | 'none';

export interface TableRowHighlightStyle {
  bgColor?: string;
  textColor?: string;
  bold?: boolean;
}

export interface TableStyleConfig {
  presetId?: string;
  // Borders (Excel Format Cells -> Border)
  outerBorderStyle?: TableBorderLineStyle;
  outerBorderWidth?: 0 | 1 | 2 | 3;
  outerBorderColor?: string;
  horizontalGridStyle?: TableBorderLineStyle;
  horizontalGridWidth?: 0 | 1 | 2 | 3;
  horizontalGridColor?: string;
  verticalGridStyle?: TableBorderLineStyle;
  verticalGridWidth?: 0 | 1 | 2 | 3;
  verticalGridColor?: string;
  headerBottomBorderStyle?: TableBorderLineStyle;
  headerBottomBorderWidth?: 0 | 1 | 2 | 3;
  headerBottomBorderColor?: string;
  // Header Row
  headerBgColor?: string;
  headerTextColor?: string;
  headerBold?: boolean;
  headerFontSize?: 'xs' | 'sm' | 'base';
  headerAlign?: 'inherit' | 'right' | 'center' | 'left';
  // Rows & Banding (Excel Table Style Options)
  zebraRows?: boolean;
  oddRowBgColor?: string;
  evenRowBgColor?: string;
  bandedColumns?: boolean;
  bandedColumnBgColor?: string;
  highlightFirstColumn?: boolean;
  highlightLastColumn?: boolean;
  textColor?: string;
  fontSize?: 'xs' | 'sm' | 'base';
  cellPadding?: 'compact' | 'normal' | 'relaxed';
  // Per-row highlights (1-indexed row number -> style)
  rowHighlights?: Record<number, TableRowHighlightStyle>;
  // Summary Footer Row
  summaryBgColor?: string;
  summaryTextColor?: string;
}

export interface TableColumn {
  id: string;
  title: string;
  type: 'text' | 'number' | 'currency';
  width?: string;
  widthPercent?: number;
  align?: 'right' | 'center' | 'left';
  isFormula?: boolean;
  // Per-column Excel styling
  bgColor?: string;
  textColor?: string;
  bold?: boolean;
  headerBgColor?: string;
  headerTextColor?: string;
}

export interface TableItemRow {
  id: string;
  rowNumber: number;
  productCode?: string;
  description: string;
  model?: string; // e.g. for رسید کالا و قطعات خارجی
  quantity: number;
  unit?: string;
  unitPrice?: number;
  totalPrice?: number;
  usageLocation?: string; // e.g. for استعلام تعمیرات و رسید تعمیرات (محل مصرف)
  serialNumber?: string;
  notes?: string;
  [key: string]: any;
}

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  defaultValue?: string | number | boolean;
  required?: boolean;
  width: FieldWidth;
  helperText?: string;
  textAlign?: 'right' | 'center' | 'left';
  options?: string[]; // For select or radio
  
  // Specific for Text / Textarea
  rowsCount?: number;
  maxLength?: number;

  // Specific for Number / Currency
  unitLabel?: string; // e.g. عدد, دستگاه, ریال, تومان
  min?: number;
  max?: number;
  step?: number;
  showNumberInWords?: boolean;

  // Specific for Table / Items Grid
  tableVariant?: 'invoice' | 'dispatch' | 'standard';
  tableColumns?: TableColumn[];
  tableInitialRows?: number;
  tableInitialData?: TableItemRow[];
  hasTableSummary?: boolean; // Total, tax, discount
  taxRatePercent?: number; // e.g. 10%
  discountAmount?: number;
  tableBorderThickness?: 'normal' | 'thick'; // for official thick lines like AW-St-FO-008
  showTableWords?: boolean;
  tableStyle?: TableStyleConfig;
  
  // Specific for Header Banner / Logo
  companyName?: string;
  companySubName?: string;
  headerTitle?: string;
  hasGreyTitleBanner?: boolean;
  requestingUnit?: string; // e.g. واحد درخواست کننده: واحد اداری
  hasRequestingUnit?: boolean;
  registrationNumber?: string;
  nationalId?: string;
  logoUrl?: string;
  logoMode?: 'custom' | 'default_awox' | 'none';
  logoSize?: 'sm' | 'md' | 'lg';
  logoPosition?: 'left' | 'right' | 'center';
  showCompanySubName?: boolean;
  formCode?: string; // e.g. AW-ST-FO-008
  documentNumber?: string; // e.g. 1, 2, 4, 7
  headerDate?: string; // e.g. 1405/01/15
  headerType?: 'standard' | 'dispatch_voucher';
  
  // Specific for Signatures block (e.g. 2, 4, or 5 approval stages)
  signatureLabels?: string[]; // ['انبار:', 'مالی:', 'مدیریت کارخانه:', 'نگهبانی:', 'تحویل گیرنده:']
  signatureHeight?: 'compact' | 'standard' | 'large';
  
  // Specific for QR / Barcode
  qrContent?: string;
  qrSize?: 'small' | 'medium' | 'large';
  qrCaption?: string;

  // Specific for Divider
  dividerStyle?: 'solid' | 'dashed' | 'dotted';
  dividerThickness?: number; // 1, 2, 3
  dividerSpacing?: 'small' | 'medium' | 'large';
  
  // Print options
  hideOnPrint?: boolean;
  boxed?: boolean; // Visual border around field
}

export type PaperSize = 'A4' | 'A5' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  paperSize: PaperSize;
  orientation: PageOrientation;
  fields: FormField[];
  createdAt: string;
  updatedAt: string;
  headerTitle?: string;
  headerSubtitle?: string;
  showWatermark?: boolean;
  watermarkText?: string;
  showPageBorders?: boolean;
}

export interface FormRecord {
  id: string;
  formId: string;
  recordNumber: string; // e.g. REC-1403-001
  createdAt: string;
  updatedAt: string;
  data: Record<string, any>;
  tableData?: Record<string, TableItemRow[]>;
  signatureData?: Record<string, string>; // base64 canvas drawings
  status: 'draft' | 'finalized' | 'printed';
}

export interface PrintSettings {
  paperSize: PaperSize;
  orientation: PageOrientation;
  showWatermark: boolean;
  watermarkText: string;
  highContrastMode: boolean;
  showPageNumbers: boolean;
  printMode: 'filled' | 'blank';
  scale: number;
}

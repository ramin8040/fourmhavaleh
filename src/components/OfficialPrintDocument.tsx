import React from 'react';
import { 
  FormTemplate, 
  PrintSettings, 
  TableItemRow 
} from '../types/form';
import { 
  toPersianDigits, 
  formatCurrency, 
  calculateTableSummary 
} from '../utils/formLogic';

interface OfficialPrintDocumentProps {
  template: FormTemplate;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  printSettings?: PrintSettings;
}

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  template,
  formData,
  tableData,
  signatureData,
  printSettings,
}) => {
  const isBlankMode = printSettings?.printMode === 'blank';
  const effectiveFormData = isBlankMode ? {} : formData;
  const effectiveTableData = isBlankMode ? {} : tableData;
  const effectiveSigData = isBlankMode ? {} : signatureData;

  const orientation = printSettings?.orientation || template.orientation;
  const paperSize = printSettings?.paperSize || template.paperSize;
  const showWatermark = printSettings?.showWatermark ?? template.showWatermark ?? false;
  const watermarkText = printSettings?.watermarkText || template.watermarkText || 'رسمی و محرمانه';

  // Find header banner field
  const headerField = template.fields.find((f) => f.type === 'header_banner');
  // Find table field
  const tableField = template.fields.find((f) => f.type === 'table');
  // Find signature field
  const signatureField = template.fields.find((f) => f.type === 'signature');

  // Prepare table columns and rows
  const columns = tableField?.tableColumns || [
    { id: 'rowNumber', title: 'ردیف', width: 'w-12', type: 'number' },
    { id: 'productCode', title: 'کد کالا', width: 'w-28', type: 'text' },
    { id: 'description', title: 'شرح کالا', width: 'flex-1', type: 'text' },
    { id: 'quantity', title: 'تعداد', width: 'w-16', type: 'number' },
    { id: 'unit', title: 'واحد', width: 'w-16', type: 'text' },
    { id: 'serialNumber', title: 'شماره سریال', width: 'w-36', type: 'text' },
    { id: 'notes', title: 'توضیحات', width: 'w-44', type: 'text' },
  ];

  const rawRows: TableItemRow[] = (tableField && effectiveTableData[tableField.id]) || [];
  const minRows = tableField?.tableInitialRows || 10;
  const rowCount = Math.max(rawRows.length, minRows);

  const displayRows: TableItemRow[] = Array.from({ length: rowCount }, (_, idx) => {
    if (rawRows[idx]) return rawRows[idx];
    return {
      id: `print-row-${idx + 1}`,
      rowNumber: idx + 1,
      description: '',
      quantity: 0,
      unit: '',
      productCode: '',
      model: '',
      serialNumber: '',
      notes: '',
    };
  });

  const sigLabels = signatureField?.signatureLabels || [
    'واحد درخواست:',
    'انبار:',
    'تدارکات:',
    'مدیریت:',
    'مالی:',
  ];

  const docDate = effectiveFormData['f_doc_date'] || headerField?.headerDate || '۱۴۰۵/۰۶/۲۵';
  const docNo = effectiveFormData['f_doc_no'] || headerField?.documentNumber || '۱';
  const formCode = headerField?.formCode || 'AW-ST-FO-008';
  const requestingUnit = effectiveFormData[`${headerField?.id}_req_unit`] || headerField?.requestingUnit;

  return (
    <div
      id="official-print-document"
      dir="rtl"
      className="bg-white text-black p-4 w-full select-none"
      style={{
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
      }}
    >
      {/* Watermark if enabled */}
      {showWatermark && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-0 opacity-15 overflow-hidden">
          <span className="text-7xl md:text-9xl font-black text-slate-800 -rotate-45 select-none tracking-widest border-4 border-dashed border-slate-500 p-8 rounded-3xl">
            {watermarkText}
          </span>
        </div>
      )}

      <div className="relative z-10 w-full flex flex-col justify-between">
        {/* 1. OFFICIAL THREE-COLUMN HEADER BANNER */}
        <div className="w-full border-2 border-black bg-white">
          <div className="flex divide-x-2 divide-x-reverse divide-black">
            {/* Box 1 (Right in RTL): Date, Serial, Code */}
            <div className="w-[28%] p-2 flex flex-col justify-center text-xs space-y-1.5 font-bold">
              <div className="flex items-center gap-1">
                <span className="text-black">تاریخ :</span>
                <span className="font-mono text-xs">{toPersianDigits(docDate)}</span>
              </div>
              <div className="flex items-center gap-1 border-t border-black pt-1">
                <span className="text-black">شماره سند :</span>
                <span className="font-mono text-xs">{toPersianDigits(docNo)}</span>
              </div>
              <div className="flex items-center gap-1 border-t border-black pt-1">
                <span className="text-black">کد فرم :</span>
                <span className="font-sans text-xs tracking-wider font-bold">{formCode}</span>
              </div>
            </div>

            {/* Box 2 (Center in RTL): Company Title & Voucher Title */}
            <div className="w-[44%] text-center flex flex-col justify-between">
              <div className="font-black text-sm md:text-base text-black py-2">
                {headerField?.companyName || 'آیریا ونداد کسری'}
              </div>
              <div
                className={`font-black text-sm md:text-base text-black tracking-tight py-1.5 border-t-2 border-black ${
                  headerField?.hasGreyTitleBanner ? 'bg-[#d0d0d0]' : 'bg-white'
                }`}
                style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
              >
                {headerField?.headerTitle || template.title || 'حواله خروج محصول'}
              </div>
            </div>

            {/* Box 3 (Left in RTL): AWOX Logo */}
            <div className="w-[28%] p-2 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-1">
                <span className="font-black text-base tracking-widest text-black font-sans">AWOX</span>
                <span className="text-red-600 text-sm">◆</span>
              </div>
              <div className="text-[7.5px] text-black font-sans font-bold tracking-tight uppercase">
                AYRIA VANDAD KASRA Int'l Co.
              </div>
              <div className="text-[8px] text-black font-medium mt-0.5 border-t border-black pt-0.5 w-full">
                {headerField?.companySubName || 'شرکت بین‌المللی آیریا ونداد کسری'}
              </div>
            </div>
          </div>

          {/* Optional Requesting Unit sub-bar */}
          {requestingUnit && (
            <div className="w-full border-t-2 border-black bg-white py-1 px-4 text-center font-bold text-xs text-black">
              واحد درخواست کننده : {requestingUnit}
            </div>
          )}
        </div>

        {/* 2. TABLE GRID */}
        <div className="w-full border-2 border-black border-t-0 bg-white">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-black bg-white divide-x-2 divide-x-reverse divide-black font-bold">
                {columns.map((col) => (
                  <th key={col.id} className={`p-1.5 text-center ${col.width || 'flex-1'} text-black`}>
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-black">
              {displayRows.map((row, rIdx) => (
                <tr key={row.id || rIdx} className="divide-x-2 divide-x-reverse divide-black h-7">
                  {columns.map((col) => {
                    if (col.id === 'rowNumber') {
                      return (
                        <td key={col.id} className="p-1 text-center font-mono font-medium text-black">
                          {toPersianDigits(rIdx + 1)}
                        </td>
                      );
                    }
                    const rawVal = row[col.id];
                    const isNumber = col.type === 'number';
                    const isLeftText = col.id === 'description' || col.id === 'notes';

                    return (
                      <td
                        key={col.id}
                        className={`p-1 text-black ${isLeftText ? 'text-right pr-2' : 'text-center'}`}
                      >
                        {isNumber && rawVal
                          ? toPersianDigits(rawVal)
                          : rawVal !== 0 && rawVal !== null && rawVal !== undefined
                          ? String(rawVal)
                          : ''}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. SIGNATURES FOOTER BOX */}
        <div className="w-full border-2 border-black border-t-0 bg-white">
          <div className="grid grid-cols-5 divide-x-2 divide-x-reverse divide-black text-center min-h-[90px]">
            {sigLabels.map((lbl, idx) => {
              const sigKey = `${signatureField?.id || 'f_signatures'}_sig_${idx}`;
              const sigDrawing = effectiveSigData[sigKey];

              return (
                <div key={idx} className="p-2 flex flex-col justify-between h-full">
                  <div className="font-bold text-[11px] text-black text-right border-b border-dotted border-black pb-1">
                    {lbl}
                  </div>
                  <div className="flex-1 flex items-center justify-center my-1">
                    {sigDrawing ? (
                      <img
                        src={sigDrawing}
                        alt="امضا"
                        className="max-h-12 max-w-full object-contain filter contrast-150"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-400">محل امضا</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Print Metadata Footer */}
        <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1 px-1">
          <span>سامانه رسمی صدور حواله و رسید انبار — کد سند: {formCode}</span>
          <span>چاپ‌شده در: {toPersianDigits(new Date().toLocaleDateString('fa-IR'))}</span>
        </div>
      </div>
    </div>
  );
};

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
import { resolveHeaderLogo } from '../utils/companyBrand';
import {
  resolveTableStyle,
  getTableWrapperStyle,
  getHeaderCellCssStyle,
  getBodyCellCssStyle,
} from '../utils/tableStyling';

interface OfficialPrintDocumentProps {
  template: FormTemplate;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  printSettings?: PrintSettings;
  embeddedPreview?: boolean;
}

export const OfficialPrintDocument: React.FC<OfficialPrintDocumentProps> = ({
  template,
  formData,
  tableData,
  signatureData,
  printSettings,
  embeddedPreview = false,
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

  // Collect custom / metadata non-table fields to show cleanly on official print
  const extraFields: Array<{ label: string; value: string }> = [];
  if (!isBlankMode) {
    if (effectiveFormData['customerName']) {
      extraFields.push({ label: 'طرف حساب / مشتری', value: String(effectiveFormData['customerName']) });
    }
    if (effectiveFormData['letterNumber']) {
      extraFields.push({ label: 'شماره نامه / عطف', value: toPersianDigits(String(effectiveFormData['letterNumber'])) });
    }
    for (const field of template.fields) {
      if (['header_banner', 'divider', 'table', 'signature', 'qrcode'].includes(field.type)) continue;
      if (field.id === 'f_doc_no' || field.id === 'f_doc_date' || field.id === 'f_req_unit' || field.hideOnPrint) continue;
      const rawVal = effectiveFormData[field.id];
      if (rawVal === undefined || rawVal === null || rawVal === '') continue;
      const displayVal =
        typeof rawVal === 'boolean'
          ? rawVal
            ? 'تأیید شده'
            : 'خیر'
          : field.type === 'currency'
          ? `${formatCurrency(rawVal)} ${field.unitLabel || 'ریال'}`
          : toPersianDigits(String(rawVal));
      extraFields.push({ label: field.label, value: displayVal });
    }
  }

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
  const minRows = tableField ? tableField.tableInitialRows || 10 : 0;
  const rowCount = tableField ? Math.max(rawRows.length, minRows) : 0;

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

  const tableSummary =
    tableField?.hasTableSummary && !isBlankMode
      ? calculateTableSummary(
          rawRows,
          tableField.discountAmount || 0,
          tableField.taxRatePercent ?? 10
        )
      : null;

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
  const requestingUnit =
    effectiveFormData['f_req_unit'] ||
    effectiveFormData[`${headerField?.id}_req_unit`] ||
    headerField?.requestingUnit;
  const resolvedLogo = resolveHeaderLogo(headerField);
  const resolvedTable = tableField ? resolveTableStyle(tableField) : null;

  const renderLogoMark = (alignClass = 'items-center justify-center') => {
    if (resolvedLogo.mode === 'custom' && resolvedLogo.logoUrl) {
      return (
        <div className={`flex flex-col ${alignClass} gap-1`}>
          <img
            src={resolvedLogo.logoUrl}
            alt={headerField?.companyName || 'لوگوی شرکت'}
            style={{ maxHeight: `${resolvedLogo.sizePx}px` }}
            className="max-w-full object-contain"
          />
          {headerField?.companySubName && (
            <div className="text-[8px] text-black font-medium w-full text-center">
              {headerField.companySubName}
            </div>
          )}
        </div>
      );
    }
    if (resolvedLogo.mode === 'none') {
      return (
        <div className="text-[10px] text-black font-bold text-center">
          {headerField?.companySubName || headerField?.companyName || ''}
        </div>
      );
    }
    return (
      <>
        <div className="flex items-center gap-1">
          <span className="font-black text-base tracking-widest text-black font-sans">AWOX</span>
          <span className="text-red-600 text-sm">◆</span>
        </div>
        <div className="text-[7.5px] text-black font-sans font-bold tracking-tight uppercase">
          AYRIA VANDAD KASRA Int&apos;l Co.
        </div>
        <div className="text-[8px] text-black font-medium mt-0.5 border-t border-black pt-0.5 w-full">
          {headerField?.companySubName || 'شرکت بین‌المللی آیریا ونداد کسری'}
        </div>
      </>
    );
  };

  return (
    <div
      id={embeddedPreview ? 'wizard-print-preview-sheet' : 'official-print-document'}
      dir="rtl"
      data-paper-size={paperSize}
      data-orientation={orientation}
      className="bg-white text-black p-4 w-full select-none relative"
      style={{
        fontFamily: 'Vazirmatn, Tahoma, sans-serif',
      }}
    >
      {/* Watermark if enabled */}
      {showWatermark && (
        <div
          className={`${
            embeddedPreview ? 'absolute inset-0' : 'fixed inset-0'
          } pointer-events-none flex items-center justify-center z-0 opacity-15 overflow-hidden`}
        >
          <span className="text-6xl md:text-8xl font-black text-slate-800 -rotate-45 select-none tracking-widest border-4 border-dashed border-slate-500 p-6 rounded-3xl">
            {watermarkText}
          </span>
        </div>
      )}

      <div className="relative z-10 w-full flex flex-col justify-between">
        {/* 1. OFFICIAL THREE-COLUMN HEADER BANNER */}
        <div className="w-full border-2 border-black bg-white">
          <div className="flex divide-x-2 divide-x-reverse divide-black">
            {/* Box 1 (Right in RTL): Date, Serial, Code (and optional right-positioned logo) */}
            <div className="w-[28%] p-2 flex flex-col justify-center text-xs space-y-1.5 font-bold">
              {resolvedLogo.position === 'right' && resolvedLogo.mode !== 'none' && (
                <div className="pb-1.5 border-b border-black flex flex-col items-center">
                  {renderLogoMark()}
                </div>
              )}
              <div className="flex items-center gap-1">
                <span className="text-black">تاریخ :</span>
                <span className="font-sans tabular-nums text-xs">{toPersianDigits(docDate)}</span>
              </div>
              <div className="flex items-center gap-1 border-t border-black pt-1">
                <span className="text-black">شماره سند :</span>
                <span className="font-sans tabular-nums text-xs">{toPersianDigits(docNo)}</span>
              </div>
              <div className="flex items-center gap-1 border-t border-black pt-1">
                <span className="text-black">کد فرم :</span>
                <span className="font-sans text-xs tracking-wider font-bold">{formCode}</span>
              </div>
            </div>

            {/* Box 2 (Center in RTL): Company Title & Voucher Title */}
            <div className="w-[44%] text-center flex flex-col justify-between">
              <div className="font-black text-sm md:text-base text-black py-2 px-2 flex flex-col items-center justify-center gap-1">
                {resolvedLogo.position === 'center' && resolvedLogo.mode === 'custom' && resolvedLogo.logoUrl && (
                  <img
                    src={resolvedLogo.logoUrl}
                    alt={headerField?.companyName || 'لوگوی شرکت'}
                    style={{ maxHeight: `${resolvedLogo.sizePx}px` }}
                    className="max-w-full object-contain"
                  />
                )}
                <span>{headerField?.companyName || 'آیریا ونداد کسری'}</span>
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

            {/* Box 3 (Left in RTL): Logo */}
            <div className="w-[28%] p-2 flex flex-col items-center justify-center text-center">
              {resolvedLogo.position === 'left'
                ? renderLogoMark()
                : (
                  <div className="text-[9px] text-black font-semibold text-center leading-relaxed">
                    {headerField?.companySubName || 'سند رسمی سازمانی'}
                  </div>
                )}
            </div>
          </div>

          {/* Optional Requesting Unit sub-bar */}
          {requestingUnit && (
            <div className="w-full border-t-2 border-black bg-white py-1 px-4 text-center font-bold text-xs text-black">
              واحد درخواست کننده : {requestingUnit}
            </div>
          )}
        </div>

        {/* Extra Non-Table Metadata / Form Fields */}
        {extraFields.length > 0 && (
          <div className="w-full border-2 border-black border-t-0 bg-white px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            {extraFields.map((ef, idx) => (
              <div key={idx} className="flex items-baseline gap-1.5">
                <span className="font-bold text-black shrink-0">{ef.label}:</span>
                <span className="text-black">{ef.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 2. TABLE GRID (with Excel-grade Borders, Row/Col Colors & Banding) */}
        {tableField && resolvedTable && (
          <div
            className="w-full bg-white mt-1.5"
            style={getTableWrapperStyle(resolvedTable)}
          >
            <table className="w-full text-center border-collapse text-xs">
              <thead>
                <tr>
                  {columns.map((col, colIdx) => (
                    <th
                      key={col.id}
                      style={getHeaderCellCssStyle(resolvedTable, col, colIdx, columns.length)}
                      className={col.widthPercent ? '' : col.width || 'flex-1'}
                    >
                      {col.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayRows.map((row, rIdx) => (
                  <tr key={row.id || rIdx} className="h-7">
                    {columns.map((col, colIdx) => {
                      const cellStyle = getBodyCellCssStyle(
                        resolvedTable,
                        col,
                        rIdx,
                        displayRows.length,
                        colIdx,
                        columns.length
                      );

                      if (col.id === 'rowNumber') {
                        return (
                          <td
                            key={col.id}
                            style={cellStyle}
                            className="font-sans tabular-nums"
                          >
                            {toPersianDigits(rIdx + 1)}
                          </td>
                        );
                      }
                      const rawVal = row[col.id];
                      const isCurrency = col.type === 'currency';
                      const isNumber = col.type === 'number';

                      return (
                        <td
                          key={col.id}
                          style={cellStyle}
                          className={isCurrency || isNumber ? 'font-sans tabular-nums' : ''}
                        >
                          {isCurrency && rawVal
                            ? formatCurrency(rawVal)
                            : isNumber && rawVal
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

            {tableSummary && (
              <div
                style={{
                  backgroundColor: resolvedTable.summaryBgColor,
                  color: resolvedTable.summaryTextColor,
                  borderTop: `2px solid ${resolvedTable.outerBorderColor || '#000000'}`,
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
                className="px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-4">
                  <span>
                    جمع کل: <strong className="font-sans tabular-nums">{formatCurrency(tableSummary.subtotal)} ریال</strong>
                  </span>
                  {tableSummary.discountAmount > 0 && (
                    <span>
                      تخفیف: <strong className="font-sans tabular-nums">{formatCurrency(tableSummary.discountAmount)} ریال</strong>
                    </span>
                  )}
                  {(tableField.taxRatePercent ?? 10) > 0 && (
                    <span>
                      مالیات ({toPersianDigits(tableField.taxRatePercent ?? 10)}٪):{' '}
                      <strong className="font-sans tabular-nums">{formatCurrency(tableSummary.taxAmount)} ریال</strong>
                    </span>
                  )}
                </div>
                <div className="font-bold">
                  مبلغ نهایی: <span className="font-sans tabular-nums">{formatCurrency(tableSummary.grandTotal)} ریال</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SIGNATURES FOOTER BOX */}
        <div className="w-full border-2 border-black border-t-0 bg-white">
          <div
            className={`grid divide-x-2 divide-x-reverse divide-black text-center min-h-[90px] ${
              sigLabels.length === 2
                ? 'grid-cols-2'
                : sigLabels.length === 3
                ? 'grid-cols-3'
                : sigLabels.length === 4
                ? 'grid-cols-4'
                : 'grid-cols-5'
            }`}
          >
            {sigLabels.map((lbl, idx) => {
              const sigKey = `${signatureField?.id || 'f_signatures'}_sig_${idx}`;
              const sigDrawing = effectiveSigData[sigKey] || effectiveSigData[signatureField?.id || ''];

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

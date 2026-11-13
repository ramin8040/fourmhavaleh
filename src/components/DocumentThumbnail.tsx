import React from 'react';
import { FormRecord, FormTemplate } from '../types/form';
import { toPersianDigits } from '../utils/formLogic';
import { resolveHeaderLogo } from '../utils/companyBrand';
import { FileText, Eye, Printer } from 'lucide-react';

interface DocumentThumbnailProps {
  record: FormRecord;
  template: FormTemplate;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  onPrint?: () => void;
  disableHoverOverlay?: boolean;
}

export const DocumentThumbnail: React.FC<DocumentThumbnailProps> = ({
  record,
  template,
  size = 'md',
  onClick,
  onPrint,
  disableHoverOverlay = false,
}) => {
  const isLandscape = template.orientation === 'landscape';

  // Dimension classes based on size prop
  const sizeClasses = {
    sm: isLandscape ? 'w-20 h-14 text-[5px]' : 'w-14 h-20 text-[5px]',
    md: isLandscape ? 'w-36 h-24 text-[6.5px]' : 'w-24 h-36 text-[6.5px]',
    lg: isLandscape ? 'w-64 h-44 text-[8px]' : 'w-44 h-64 text-[8px]',
  }[size];

  // Extract first 3 items from tableData if available
  const items: string[] = [];
  if (record.tableData) {
    for (const rows of Object.values(record.tableData)) {
      if (Array.isArray(rows)) {
        for (const row of rows) {
          if (row.description && row.description.trim()) {
            items.push(row.description);
          }
          if (items.length >= 3) break;
        }
      }
      if (items.length >= 3) break;
    }
  }

  // Header info
  const headerField = template.fields.find((f) => f.type === 'header_banner');
  const title = headerField?.headerTitle || template.title || 'حواله انبار';
  const docNo = record.data?.['f_doc_no'] || record.recordNumber || '۱';
  const docDate = record.data?.['f_doc_date'] || (record.createdAt ? new Date(record.createdAt).toLocaleDateString('fa-IR') : '۱۴۰۵');
  const logoInfo = resolveHeaderLogo(headerField);

  return (
    <div
      onClick={onClick}
      className={`group relative ${onClick ? 'cursor-pointer' : ''} ${sizeClasses} bg-white text-slate-900 border border-slate-300 dark:border-white/30 rounded-md shadow-sm hover:shadow-md transition-all duration-200 select-none overflow-hidden flex flex-col justify-between p-1`}
      dir="rtl"
      title={`پیش‌نمایش سند #${docNo} - ${title}`}
    >
      {/* 1. Miniature 3-box Header */}
      <div className="border border-slate-800 grid grid-cols-3 divide-x divide-x-reverse divide-slate-800 bg-slate-50 leading-none">
        {/* Right: Date & Number */}
        <div className="p-0.5 truncate flex flex-col justify-center">
          <span className="font-sans tabular-nums font-bold text-slate-800 truncate">
            #{toPersianDigits(docNo)}
          </span>
          <span className="font-sans tabular-nums text-slate-500 text-[80%] truncate">
            {toPersianDigits(docDate)}
          </span>
        </div>

        {/* Center: Title */}
        <div className="p-0.5 flex flex-col items-center justify-center text-center font-black bg-slate-200 text-slate-900 truncate">
          <span className="truncate">{title}</span>
        </div>

        {/* Left: Company Logo */}
        <div className="p-0.5 flex items-center justify-center font-bold text-slate-800 overflow-hidden">
          {logoInfo.mode === 'custom' && logoInfo.logoUrl ? (
            <img
              src={logoInfo.logoUrl}
              alt={headerField?.companyName || 'لوگو'}
              className="max-h-4 max-w-full object-contain"
            />
          ) : logoInfo.mode === 'none' ? (
            <span className="text-[75%] truncate">{headerField?.companyName || ''}</span>
          ) : (
            <>
              <span className="font-sans font-black tracking-tighter text-[90%]">AWOX</span>
              <span className="text-orange-500 mr-0.5">◆</span>
            </>
          )}
        </div>
      </div>

      {/* 2. Miniature Table Grid */}
      <div className="flex-1 my-0.5 border border-slate-800 flex flex-col bg-white overflow-hidden">
        {/* Header row */}
        <div className="bg-slate-100 border-b border-slate-800 px-1 py-0.5 flex justify-between font-bold text-slate-700">
          <span>شرح کالا</span>
          <span>تعداد</span>
        </div>

        {/* 3 mini item lines */}
        <div className="flex-1 flex flex-col justify-around px-1 py-0.5 space-y-0.5 text-slate-800">
          {items.length > 0 ? (
            items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center border-b border-dotted border-slate-200 last:border-0 truncate">
                <span className="truncate max-w-[80%] font-medium">{item}</span>
                <span className="font-sans tabular-nums text-slate-500">۱</span>
              </div>
            ))
          ) : (
            <>
              <div className="h-1 bg-slate-200 rounded-xs w-5/6"></div>
              <div className="h-1 bg-slate-200 rounded-xs w-4/6"></div>
              <div className="h-1 bg-slate-200 rounded-xs w-3/6"></div>
            </>
          )}
        </div>
      </div>

      {/* 3. Miniature Signatures */}
      <div className="border border-slate-800 grid grid-cols-4 divide-x divide-x-reverse divide-slate-800 text-center bg-slate-50 h-2.5">
        <span className="text-slate-500 leading-none self-center">امضا</span>
        <span className="text-slate-500 leading-none self-center">انبار</span>
        <span className="text-slate-500 leading-none self-center">مدیر</span>
        <span className="text-slate-500 leading-none self-center">مالی</span>
      </div>

      {/* Hover Overlay with Quick Action Buttons */}
      {!disableHoverOverlay && (
        <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
        {onClick && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="p-1 rounded-md bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-colors"
            title="مشاهده و ویرایش"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        )}
        {onPrint && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPrint();
            }}
            className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-colors"
            title="چاپ فوری"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      )}
    </div>
  );
};

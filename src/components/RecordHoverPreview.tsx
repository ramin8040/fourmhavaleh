import React, { useLayoutEffect, useRef, useState, useMemo } from 'react';
import { FormRecord, FormTemplate } from '../types/form';
import {
  extractRecordPreviewData,
  formatCurrency,
  toPersianDigits,
} from '../utils/formLogic';
import { DocumentThumbnail } from './DocumentThumbnail';
import { FileText, Package, PenTool, User } from 'lucide-react';

interface RecordHoverPreviewProps {
  record: FormRecord;
  template: FormTemplate;
  anchorRect: DOMRect;
}

export const RecordHoverPreview: React.FC<RecordHoverPreviewProps> = ({
  record,
  template,
  anchorRect,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: Math.max(12, anchorRect.bottom + 8),
    left: Math.max(12, anchorRect.left),
  });

  const preview = useMemo(
    () => extractRecordPreviewData(record, template),
    [record, template]
  );

  useLayoutEffect(() => {
    const el = cardRef.current;
    const width = el?.offsetWidth || 420;
    const height = el?.offsetHeight || 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 12;

    let top = anchorRect.bottom + 8;
    let left = anchorRect.left;

    const isWideRow = anchorRect.width > vw * 0.45;

    if (isWideRow) {
      // Table row hover: place cleanly below or flip above so row remains unobstructed
      if (anchorRect.bottom + height + margin <= vh) {
        top = anchorRect.bottom + 6;
      } else if (anchorRect.top - height - margin >= 0) {
        top = anchorRect.top - height - 6;
      } else {
        top = Math.max(margin, vh - height - margin);
      }

      // Position horizontally toward the right/center of the row (away from far-left action column in RTL)
      left = anchorRect.right - width - 24;
      if (left < margin) left = margin;
      if (left + width > vw - margin) left = vw - width - margin;
    } else {
      // Card hover: prefer placing beside the card (left or right) so card actions stay visible
      if (anchorRect.left - width - 12 >= margin) {
        left = anchorRect.left - width - 12;
        top = Math.min(Math.max(margin, anchorRect.top), vh - height - margin);
      } else if (anchorRect.right + width + 12 <= vw - margin) {
        left = anchorRect.right + 12;
        top = Math.min(Math.max(margin, anchorRect.top), vh - height - margin);
      } else {
        // Fallback: above or below card
        left = Math.min(Math.max(margin, anchorRect.left), vw - width - margin);
        if (anchorRect.bottom + height + margin <= vh) {
          top = anchorRect.bottom + 8;
        } else {
          top = Math.max(margin, anchorRect.top - height - 8);
        }
      }
    }

    setCoords({ top, left });
  }, [anchorRect, preview]);

  return (
    <div
      ref={cardRef}
      role="tooltip"
      data-testid="record-hover-preview"
      dir="rtl"
      style={{ top: `${coords.top}px`, left: `${coords.left}px` }}
      className="fixed z-50 w-[440px] max-w-[92vw] pointer-events-none liquid-glass-elevated rounded-3xl overflow-hidden text-xs text-slate-800 dark:text-slate-100 transition-opacity duration-150"
    >
      {/* 1. Compact Header */}
      <div className="px-4 py-3 bg-white/45 dark:bg-slate-900/45 border-b border-slate-300/40 dark:border-white/10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <FileText className="w-4 h-4 text-sky-700 dark:text-sky-300 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-bold text-slate-900 dark:text-white truncate">
              {preview.title}
            </div>
            <div className="text-[11px] text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 font-sans tabular-nums mt-0.5">
              <span className="font-mono font-semibold text-sky-700 dark:text-sky-300 whitespace-nowrap">
                {preview.recordNumber}
              </span>
              {preview.docNumber && preview.docNumber !== preview.recordNumber && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="whitespace-nowrap">شماره برگه: {toPersianDigits(preview.docNumber)}</span>
                </>
              )}
              {preview.formCode && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono whitespace-nowrap">{preview.formCode}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-left shrink-0">
          <div className="font-sans tabular-nums text-[11px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {toPersianDigits(preview.docDate)}
          </div>
          <div className="text-[10px] text-emerald-700 dark:text-emerald-300 font-medium whitespace-nowrap">
            {preview.statusLabel}
          </div>
        </div>
      </div>

      {/* 2. Miniature Thumbnail + Key Header Details */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-start gap-3">
          {/* Miniature Document Sheet */}
          <div className="shrink-0">
            <DocumentThumbnail
              record={record}
              template={template}
              size="sm"
              disableHoverOverlay
            />
          </div>

          {/* Primary Metadata & Form Fields */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {preview.counterparty && (
              <div className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-200">
                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-500 dark:text-slate-400 shrink-0">طرف حساب:</span>
                <span className="font-semibold truncate">{preview.counterparty}</span>
              </div>
            )}

            {preview.fields.length > 0 ? (
              <div className="grid grid-cols-1 gap-1 text-[11px]">
                {preview.fields.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 border-b border-dotted border-slate-200 dark:border-slate-700/70 pb-0.5 last:border-0">
                    <span className="text-slate-500 dark:text-slate-400 truncate max-w-[45%]">
                      {f.label}:
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate text-left">
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : !preview.counterparty && preview.items.length === 0 ? (
              <div className="text-[11px] text-slate-400 dark:text-slate-500 italic py-1">
                اطلاعات متنی تکمیلی ثبت نشده است.
              </div>
            ) : null}
          </div>
        </div>

        {/* 3. Items Table Snapshot */}
        {preview.items.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="bg-slate-50 dark:bg-[#232a36] px-2.5 py-1.5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                <span>اقلام و ردیف‌های سند</span>
              </span>
              <span className="font-mono tabular-nums text-[10px] text-slate-500 dark:text-slate-400">
                {toPersianDigits(preview.totalItemsCount)} قلم
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#161a22]">
              {preview.items.map((item, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-1.5 flex items-center justify-between gap-2 text-[11px]"
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <span className="font-mono tabular-nums text-[10px] text-slate-400 w-4 shrink-0">
                      {toPersianDigits(idx + 1)}.
                    </span>
                    {item.productCode && (
                      <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
                        [{item.productCode}]
                      </span>
                    )}
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.description}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 font-mono tabular-nums text-[10px]">
                    {item.serialNumber && (
                      <span className="text-slate-400 dark:text-slate-500 truncate max-w-[80px]">
                        {item.serialNumber}
                      </span>
                    )}
                    <span className="font-bold text-[#0067C0] dark:text-[#4cc2ff]">
                      {toPersianDigits(item.quantity)} {item.unit}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {preview.remainingItemsCount > 0 && (
              <div className="px-2.5 py-1 bg-slate-50/80 dark:bg-[#1e2430] border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 text-center">
                و {toPersianDigits(preview.remainingItemsCount)} قلم کالای دیگر...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Compact Summary Footer */}
      <div className="px-3.5 py-2 bg-slate-50 dark:bg-[#181d25] border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2 font-mono tabular-nums">
          {preview.totalQuantity > 0 && (
            <span>جمع تعداد: {toPersianDigits(preview.totalQuantity)}</span>
          )}
          {preview.totalAmount > 0 && (
            <>
              {preview.totalQuantity > 0 && <span aria-hidden="true">·</span>}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {formatCurrency(preview.totalAmount)} ریال
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <PenTool className="w-3 h-3 text-slate-400" />
          <span className="font-mono tabular-nums">
            {preview.signedCount > 0
              ? `${toPersianDigits(preview.signedCount)} امضا`
              : 'بدون امضا'}
          </span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { 
  Truck, 
  PackageCheck, 
  Wrench, 
  FileCheck2, 
  Layers, 
  Receipt, 
  Plus, 
  Printer, 
  Save, 
  FilePlus2,
  Clock,
  Building,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { FormTemplate } from '../types/form';
import { toPersianDigits } from '../utils/formLogic';

interface VoucherQuickSelectorProps {
  templates: FormTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (tpl: FormTemplate) => void;
  onNewVoucher: () => void;
  onSaveRecord: () => void;
  onPrintRecord: () => void;
  isFillMode: boolean;
  documentNumber?: string;
  itemsCount?: number;
  onOpenImageToForm?: () => void;
}

export const VoucherQuickSelector: React.FC<VoucherQuickSelectorProps> = ({
  templates,
  activeTemplateId,
  onSelectTemplate,
  onNewVoucher,
  onSaveRecord,
  onPrintRecord,
  isFillMode,
  documentNumber = '۱',
  itemsCount = 10,
  onOpenImageToForm,
}) => {
  const voucherTypes = [
    {
      id: 'preset_dispatch_voucher',
      title: 'حواله خروج محصول',
      code: 'AW-ST-FO-008',
      icon: <Truck className="w-3.5 h-3.5 text-blue-600 dark:text-[#4cc2ff]" />,
      badge: 'انبار محصول',
    },
    {
      id: 'preset_foreign_goods_receipt',
      title: 'رسید کالا و قطعات خارجی',
      code: 'AW-ST-FO-008',
      icon: <PackageCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
      badge: 'انبار خارجی',
    },
    {
      id: 'preset_repair_receipt',
      title: 'رسید تعمیرات',
      code: 'AW-ST-FO-008',
      icon: <Wrench className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
      badge: 'واحد فنی',
    },
    {
      id: 'preset_repair_inquiry',
      title: 'استعلام درخواست تعمیرات',
      code: 'AW-ST-FO-008',
      icon: <FileCheck2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />,
      badge: 'تدارکات',
    },
    {
      id: 'preset_material_requisition',
      title: 'درخواست اقلام بین‌واحدی',
      code: 'AW-ST-FO-008',
      icon: <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />,
      badge: 'مصرفی',
    },
    {
      id: 'preset_official_invoice',
      title: 'فاکتور رسمی کالا/خدمات',
      code: 'INV-1403',
      icon: <Receipt className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />,
      badge: 'مالی',
    },
  ];

  return (
    <div className="bg-[#f0f3f6] dark:bg-[#1c1c1e] border-b border-[#d1d5db] dark:border-[#2d2d2d] px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs select-none transition-colors shadow-2xs">
      {/* Right side in RTL: Quick Switcher Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 ml-1 shrink-0 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
          <span>نوع سند:</span>
        </span>

        {voucherTypes.map((vt) => {
          const isActive = activeTemplateId === vt.id;
          const matchingTemplate = templates.find((t) => t.id === vt.id);

          return (
            <button
              key={vt.id}
              onClick={() => {
                if (matchingTemplate) {
                  onSelectTemplate(matchingTemplate);
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-all shrink-0 border ${
                isActive
                  ? 'bg-white dark:bg-[#2b2b2b] text-[#0067C0] dark:text-[#4cc2ff] border-[#0067C0]/40 dark:border-[#4cc2ff]/40 shadow-xs font-bold'
                  : 'bg-transparent text-slate-700 dark:text-slate-300 border-transparent hover:bg-white/60 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-[#383838]'
              }`}
              title={`تعویض به ${vt.title} (${vt.code})`}
            >
              {vt.icon}
              <span className="truncate">{vt.title}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
                [{vt.code}]
              </span>
            </button>
          );
        })}
      </div>

      {/* Left side in RTL: Document Quick Actions & Status */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Document Status info */}
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400 bg-white/70 dark:bg-[#252528] px-2.5 py-1 rounded border border-slate-200 dark:border-[#333333]">
          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>سند جاری:</span>
            <span className="font-bold text-[#0067C0] dark:text-[#4cc2ff] font-mono">
              #{toPersianDigits(documentNumber)}
            </span>
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>
            ظرفیت کاردکس: <strong className="text-slate-800 dark:text-slate-200">{toPersianDigits(itemsCount)}</strong> قلم
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
            <CheckCircle2 className="w-3 h-3" />
            آماده صدور
          </span>
        </div>

        {/* Quick Voucher Action Buttons */}
        {onOpenImageToForm && (
          <button
            onClick={onOpenImageToForm}
            className="flex items-center gap-1 px-2.5 py-1 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded shadow-xs text-xs font-semibold transition-all hover:shadow"
            title="تبدیل تصویر هر حواله یا رسید به فرم دیجیتال با هوش مصنوعی"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>عکس به فرم</span>
          </button>
        )}

        <button
          onClick={onNewVoucher}
          className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-[#2b2b2b] hover:bg-slate-50 dark:hover:bg-[#333] text-slate-800 dark:text-slate-200 rounded border border-slate-300 dark:border-[#404040] shadow-xs text-xs transition-colors"
          title="صدور حواله / رسید جدید با ردیف‌های خالی"
        >
          <FilePlus2 className="w-3.5 h-3.5 text-blue-600 dark:text-[#4cc2ff]" />
          <span>سند جدید</span>
        </button>

        <button
          onClick={onSaveRecord}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded shadow-xs text-xs font-medium transition-colors"
          title="ثبت سند جاری در بایگانی و اختصاص شماره پیگیری"
        >
          <Save className="w-3.5 h-3.5" />
          <span>ثبت در بایگانی</span>
        </button>

        <button
          onClick={onPrintRecord}
          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded shadow-xs text-xs font-medium transition-colors"
          title="چاپ فوری سند حواله / رسید (Ctrl+P)"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>چاپ سند</span>
        </button>
      </div>
    </div>
  );
};

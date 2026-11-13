import React, { useState } from 'react';
import { 
  FormTemplate, 
  PrintSettings, 
  TableItemRow 
} from '../types/form';
import { 
  Printer, 
  X, 
  Sliders, 
  FileText, 
  Check, 
  Eye, 
  Download 
} from 'lucide-react';
import { FormCanvas } from './FormCanvas';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: FormTemplate;
  formData: Record<string, any>;
  tableData: Record<string, TableItemRow[]>;
  signatureData: Record<string, string>;
  onTriggerPrint: (settings: PrintSettings) => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  template,
  formData,
  tableData,
  signatureData,
  onTriggerPrint,
}) => {
  const [printSettings, setPrintSettings] = useState<PrintSettings>({
    paperSize: template.paperSize,
    orientation: template.orientation,
    showWatermark: template.showWatermark ?? false,
    watermarkText: template.watermarkText || 'محرمانه',
    highContrastMode: false,
    showPageNumbers: true,
    printMode: 'filled',
    scale: 1,
  });

  if (!isOpen) return null;

  const handlePrint = () => {
    onTriggerPrint(printSettings);
    // Allow state to apply then trigger browser print
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Build active template with preview print settings applied
  const previewTemplate: FormTemplate = {
    ...template,
    paperSize: printSettings.paperSize,
    orientation: printSettings.orientation,
    showWatermark: printSettings.showWatermark,
    watermarkText: printSettings.watermarkText,
  };

  // If blank mode is chosen, pass empty formData
  const activeFormData = printSettings.printMode === 'blank' ? {} : formData;
  const activeTableData = printSettings.printMode === 'blank' ? {} : tableData;
  const activeSigData = printSettings.printMode === 'blank' ? {} : signatureData;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex flex-col select-none no-print">
      {/* Liquid Glass Print Header */}
      <div className="min-h-14 py-2 liquid-glass-elevated border-b border-white/60 dark:border-white/10 px-3 sm:px-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center gap-2.5 font-bold text-xs sm:text-sm min-w-0">
          <div className="w-8 h-8 rounded-xl liquid-cta flex items-center justify-center shrink-0">
            <Printer className="w-4 h-4" />
          </div>
          <span className="truncate">پیش‌نمایش و چاپ برگه</span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={handlePrint}
            className="h-10 flex items-center gap-1.5 px-4 sm:px-5 liquid-cta rounded-2xl font-bold text-xs sm:text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ برگه</span>
          </button>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl liquid-glass-well flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Settings Side & Live Paper Preview */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        <aside className="w-full lg:w-72 liquid-glass-elevated border-b lg:border-b-0 lg:border-l border-white/60 dark:border-white/10 p-4 sm:p-5 lg:overflow-y-auto shrink-0 text-xs space-y-4 text-slate-700 dark:text-slate-200 transition-colors">
          <div className="space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white block text-xs">
              چطور چاپ شود؟
            </span>
            <div className="grid grid-cols-2 gap-1 p-1 liquid-glass-well rounded-2xl">
              <button
                onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'filled' }))}
                className={`py-2 px-2 rounded-xl text-center font-semibold transition-all cursor-pointer ${
                  printSettings.printMode === 'filled'
                    ? 'liquid-cta text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                با نوشته‌های من
              </button>
              <button
                onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'blank' }))}
                className={`py-2 px-2 rounded-xl text-center font-semibold transition-all cursor-pointer ${
                  printSettings.printMode === 'blank'
                    ? 'liquid-cta text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                برگه خام و خالی
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-300/40 dark:border-white/10">
            <label className="font-semibold text-slate-900 dark:text-white block">
              اندازه و جهت کاغذ:
            </label>
            <select
              value={printSettings.paperSize}
              onChange={(e) => setPrintSettings((s) => ({ ...s, paperSize: e.target.value as any }))}
              className="w-full h-10 liquid-glass-well text-slate-900 dark:text-slate-100 rounded-xl px-3 outline-none"
            >
              <option value="A4">A4 (۲۱۰ × ۲۹۷ میلی‌متر)</option>
              <option value="A5">A5 (۱۴۸ × ۲۱۰ میلی‌متر)</option>
              <option value="Letter">Letter (۲۱۶ × ۲۷۹ میلی‌متر)</option>
            </select>

            <select
              value={printSettings.orientation}
              onChange={(e) => setPrintSettings((s) => ({ ...s, orientation: e.target.value as any }))}
              className="w-full h-10 liquid-glass-well text-slate-900 dark:text-slate-100 rounded-xl px-3 outline-none"
            >
              <option value="portrait">عمودی</option>
              <option value="landscape">افقی</option>
            </select>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-300/40 dark:border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showWatermark}
                onChange={(e) => setPrintSettings((s) => ({ ...s, showWatermark: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                نوشته کم‌رنگ روی برگه (واترمارک)
              </span>
            </label>
            {printSettings.showWatermark && (
              <input
                type="text"
                value={printSettings.watermarkText}
                onChange={(e) => setPrintSettings((s) => ({ ...s, watermarkText: e.target.value }))}
                placeholder="مثلاً محرمانه"
                className="w-full h-10 liquid-glass-well text-slate-900 dark:text-slate-100 rounded-xl px-3 outline-none text-xs"
              />
            )}
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-300/40 dark:border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.highContrastMode}
                onChange={(e) => setPrintSettings((s) => ({ ...s, highContrastMode: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-600 focus:ring-0"
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                چاپ سیاه و سفید پررنگ
              </span>
            </label>
          </div>
        </aside>

        {/* Live Canvas Sheet Preview */}
        <div className="flex-1 bg-slate-200/45 dark:bg-slate-950/55 lg:overflow-auto p-3 sm:p-6 flex justify-center items-start transition-colors">
          <FormCanvas
            template={previewTemplate}
            selectedFieldId={null}
            onSelectField={() => {}}
            onUpdateField={() => {}}
            onDeleteField={() => {}}
            onDuplicateField={() => {}}
            onMoveField={() => {}}
            isFillMode={printSettings.printMode === 'filled'}
            zoomScale={0.85}
            formData={activeFormData}
            onFormDataChange={() => {}}
            tableData={activeTableData}
            onTableDataChange={() => {}}
            signatureData={activeSigData}
            onSignatureDataChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

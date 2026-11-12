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
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex flex-col select-none no-print">
      {/* Windows Print Dialog Header */}
      <div className="h-12 bg-[#f3f4f6] dark:bg-[#1a1a1a] border-b border-slate-300 dark:border-[#2d2d2d] px-4 flex items-center justify-between text-xs text-slate-800 dark:text-slate-100 shadow-xs transition-colors">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Printer className="w-4 h-4 text-[#0067C0] dark:text-[#4cc2ff]" />
          <span>پیش‌نمایش چاپ و تنظیمات چاپگر ویندوز</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded font-medium shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>چاپ برگه (Print)</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Body: Settings Side & Live Paper Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Settings Sidebar */}
        <aside className="w-72 bg-white dark:bg-[#202020] border-l border-slate-300 dark:border-[#2d2d2d] p-4 overflow-y-auto text-xs space-y-4 text-slate-700 dark:text-slate-300 transition-colors">
          <div className="space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">حالت محتوای چاپ:</span>
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-[#18181a] rounded-lg border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'filled' }))}
                className={`py-1.5 px-2 rounded text-center transition-colors ${
                  printSettings.printMode === 'filled'
                    ? 'bg-white dark:bg-[#2a2a2a] text-[#0067C0] dark:text-[#4cc2ff] font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                تکمیل‌شده (داده‌ها)
              </button>
              <button
                onClick={() => setPrintSettings((s) => ({ ...s, printMode: 'blank' }))}
                className={`py-1.5 px-2 rounded text-center transition-colors ${
                  printSettings.printMode === 'blank'
                    ? 'bg-white dark:bg-[#2a2a2a] text-[#0067C0] dark:text-[#4cc2ff] font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                فرم خام (خالی)
              </button>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              حالت خام برای پر کردن دستی با خودکار مناسب است.
            </p>
          </div>

          {/* Paper Size & Orientation */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <label className="font-semibold text-slate-800 dark:text-slate-200 block">اندازه کاغذ پرینتر:</label>
            <select
              value={printSettings.paperSize}
              onChange={(e) => setPrintSettings((s) => ({ ...s, paperSize: e.target.value as any }))}
              className="w-full bg-slate-50 dark:bg-[#2a2a2a] border border-slate-300 dark:border-[#3d3d3d] text-slate-800 dark:text-slate-100 rounded px-2.5 py-1.5 outline-none"
            >
              <option value="A4">A4 (۲۱۰ × ۲۹۷ میلی‌متر)</option>
              <option value="A5">A5 (۱۴۸ × ۲۱۰ میلی‌متر)</option>
              <option value="Letter">Letter (۲۱۶ × ۲۷۹ میلی‌متر)</option>
            </select>

            <select
              value={printSettings.orientation}
              onChange={(e) => setPrintSettings((s) => ({ ...s, orientation: e.target.value as any }))}
              className="w-full bg-slate-50 dark:bg-[#2a2a2a] border border-slate-300 dark:border-[#3d3d3d] text-slate-800 dark:text-slate-100 rounded px-2.5 py-1.5 outline-none"
            >
              <option value="portrait">عمودی (Portrait)</option>
              <option value="landscape">افقی (Landscape)</option>
            </select>
          </div>

          {/* Watermark in Print */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.showWatermark}
                onChange={(e) => setPrintSettings((s) => ({ ...s, showWatermark: e.target.checked }))}
                className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">چاپ واترمارک روی برگه</span>
            </label>
            {printSettings.showWatermark && (
              <input
                type="text"
                value={printSettings.watermarkText}
                onChange={(e) => setPrintSettings((s) => ({ ...s, watermarkText: e.target.value }))}
                placeholder="متن واترمارک (مثلاً: محرمانه)"
                className="w-full bg-slate-50 dark:bg-[#2a2a2a] border border-slate-300 dark:border-[#3d3d3d] text-slate-800 dark:text-slate-100 rounded px-2 py-1 outline-none text-xs"
              />
            )}
          </div>

          {/* High Contrast / Save Ink Mode */}
          <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-700/60">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={printSettings.highContrastMode}
                onChange={(e) => setPrintSettings((s) => ({ ...s, highContrastMode: e.target.checked }))}
                className="rounded text-[#0067C0] dark:text-[#4cc2ff] focus:ring-0"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">حالت صرفه‌جویی در جوهر (سیاه و سفید)</span>
            </label>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              حذف پس‌زمینه‌ها و افزایش وضوح خطوط برای دستگاه‌های چاپ لیزری.
            </p>
          </div>

          {/* Print instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 p-2.5 rounded text-[11px] text-blue-900 dark:text-blue-300 leading-relaxed">
            💡 <strong>راهنما:</strong> در پنجره پرینت ویندوز، گزینه <em>«Margins»</em> را روی <em>«Default»</em> یا <em>«Minimum»</em> قرار داده و گزینه <em>«Background Graphics»</em> را علامت بزنید.
          </div>
        </aside>

        {/* Live Canvas Sheet Preview */}
        <div className="flex-1 bg-slate-700/80 dark:bg-[#111215] overflow-auto p-6 flex justify-center items-start transition-colors">
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

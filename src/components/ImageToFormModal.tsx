import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  X,
  FileImage,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Scan,
  LayoutTemplate,
  Edit3,
  Columns,
  PenTool,
  ArrowLeft,
  FileText,
  Eye,
  RefreshCw
} from 'lucide-react';
import { FormTemplate } from '../types/form';
import { toPersianDigits } from '../utils/formLogic';

interface ImageToFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateCreated: (template: FormTemplate, openInFillMode: boolean) => void;
  showToast: (msg: string) => void;
}

interface SampleImage {
  id: string;
  title: string;
  subtitle: string;
  path: string;
  category: string;
}

const PRESET_SAMPLES: SampleImage[] = [
  {
    id: '2_a94633a1',
    title: 'حواله خروج محصول',
    subtitle: 'کد AW-St-FO-008 | انبار محصول',
    path: '/assets/aistudio/2_a94633a1.PNG',
    category: 'انبار و لجستیک',
  },
  {
    id: '3_4c1de245',
    title: 'رسید کالا و قطعات خارجی',
    subtitle: 'کد AW-ST-FO-008 | کنترل کیفیت',
    path: '/assets/aistudio/3_4c1de245.PNG',
    category: 'انبار و لجستیک',
  },
  {
    id: '4_2790371f',
    title: 'رسید تعمیرات تجهیزات',
    subtitle: 'کد AW-ST-FO-008 | واحد تاسیسات',
    path: '/assets/aistudio/4_2790371f.PNG',
    category: 'تعمیرات و نگهداری',
  },
  {
    id: '1_cba351d3',
    title: 'استعلام درخواست تعمیرات',
    subtitle: 'کد AW-ST-FO-008 | واحد اداری',
    path: '/assets/aistudio/1_cba351d3.PNG',
    category: 'تعمیرات و نگهداری',
  },
];

export const ImageToFormModal: React.FC<ImageToFormModalProps> = ({
  isOpen,
  onClose,
  onTemplateCreated,
  showToast,
}) => {
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [selectedSampleId, setSelectedSampleId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [extractedTemplate, setExtractedTemplate] = useState<FormTemplate | null>(null);
  const [extractedInfo, setExtractedInfo] = useState<{
    title: string;
    formCode: string;
    columnsCount: number;
    signaturesCount: number;
    source?: string;
  } | null>(null);
  const [openInFillMode, setOpenInFillMode] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clipboard paste listener (Ctrl+V) when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileSelection(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen]);

  // Reset modal state upon closing
  const handleClose = () => {
    if (isProcessing) return;
    setSelectedImageSrc(null);
    setSelectedFileName('');
    setSelectedSampleId('');
    setExtractedTemplate(null);
    setExtractedInfo(null);
    setError(null);
    onClose();
  };

  const handleFileSelection = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری معتبر (PNG, JPG, WEBP) انتخاب نمایید.');
      return;
    }

    setError(null);
    setExtractedTemplate(null);
    setExtractedInfo(null);
    setSelectedFileName(file.name);
    setSelectedSampleId('');

    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImageSrc(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample: SampleImage) => {
    setError(null);
    setExtractedTemplate(null);
    setExtractedInfo(null);
    setSelectedSampleId(sample.id);
    setSelectedFileName(`${sample.title}.PNG`);
    setSelectedImageSrc(sample.path);
  };

  // Trigger form extraction
  const handleProcessImage = async () => {
    if (!selectedImageSrc && !selectedSampleId) {
      setError('لطفاً ابتدا یک تصویر را انتخاب یا جای‌گذاری کنید.');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setProcessingStep('آماده‌سازی تصویر برای ارسال به هوش مصنوعی...');

    try {
      let base64Data = selectedImageSrc || '';

      // If a preset sample path was chosen, convert it to base64 if needed
      if (selectedSampleId && selectedImageSrc?.startsWith('/')) {
        setProcessingStep('بارگذاری نمونه سند انتخابی...');
        try {
          const res = await fetch(selectedImageSrc);
          const blob = await res.blob();
          base64Data = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.readAsDataURL(blob);
          });
        } catch {
          // If fetch fails, we still pass selectedSampleId to server
        }
      }

      setProcessingStep('تحلیل ساختار سربرگ، کد استاندارد و جدول اقلام...');

      const response = await fetch('/api/convert-form-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Data,
          fileName: selectedFileName,
          sampleId: selectedSampleId,
          mimeType: 'image/png',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `خطای سرور: ${response.status}`);
      }

      setProcessingStep('تولید بستر فرم و ستون‌های کاردکس...');
      const data = await response.json();

      if (data.success && data.template) {
        setExtractedTemplate(data.template);
        setExtractedInfo({
          title: data.template.title || 'فرم استخراج‌شده',
          formCode: data.detectedInfo?.formCode || 'AW-ST-FO-008',
          columnsCount: data.detectedInfo?.columnsCount || 6,
          signaturesCount: data.detectedInfo?.signaturesCount || 5,
          source: data.source,
        });
        showToast('فرم با موفقیت از روی تصویر استخراج و آماده شد.');
      } else {
        throw new Error('قالب معتبری از تصویر دریافت نشد.');
      }
    } catch (err: any) {
      console.error('Extraction error:', err);
      setError(err?.message || 'خطا در ارتباط با سرور تحلیل تصویر.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  // Apply template to app
  const handleApplyTemplate = () => {
    if (!extractedTemplate) return;
    onTemplateCreated(extractedTemplate, openInFillMode);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-[#1f1f20] border border-slate-300 dark:border-[#383838] rounded-xl shadow-2xl flex flex-col overflow-hidden text-right transition-colors"
        dir="rtl"
      >
        {/* Modal Title Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#2d2d2d] bg-[#f8fafc] dark:bg-[#181819]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-[#0067C0] to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>تبدیل هوشمند تصویر به فرم قابل صدور و ویرایش</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-950/70 text-[#0067C0] dark:text-[#4cc2ff] px-2 py-0.5 rounded-full font-semibold border border-blue-200 dark:border-blue-800">
                  مبتنی بر هوش مصنوعی (Vision)
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                تصویر هر نوع حواله انبار، رسید کالا، فرم چاپی یا اسکن‌شده را بدهید تا فوراً به فرم دیجیتال، قابل تایپ و چاپ رسمی تبدیل شود.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#2c2c2e] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preset Sample Gallery */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <LayoutTemplate className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                <span>نمونه‌های آماده اسناد شرکت آریا ونداد کسری (کد AW-ST-FO-008):</span>
              </label>
              <span className="text-[10px] text-slate-400">یک نمونه را انتخاب کنید یا تصویر دلخواه خود را آپلود فرمایید</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_SAMPLES.map((sample) => {
                const isSelected = selectedSampleId === sample.id;
                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    disabled={isProcessing}
                    className={`p-2.5 rounded-lg border text-right transition-all flex flex-col gap-2 relative group ${
                      isSelected
                        ? 'border-[#0067C0] dark:border-[#4cc2ff] bg-blue-50/70 dark:bg-blue-950/30 ring-2 ring-[#0067C0]/20'
                        : 'border-slate-200 dark:border-[#333333] bg-white dark:bg-[#252527] hover:border-slate-300 dark:hover:border-[#444]'
                    }`}
                  >
                    <div className="w-full h-20 bg-slate-100 dark:bg-[#1a1a1b] rounded border border-slate-200 dark:border-[#333] overflow-hidden relative flex items-center justify-center">
                      <img
                        src={sample.path}
                        alt={sample.title}
                        className="w-full h-full object-contain p-1 group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                      {isSelected && (
                        <div className="absolute top-1 left-1 bg-[#0067C0] text-white p-0.5 rounded-full shadow-xs">
                          <CheckCircle2 className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                        {sample.title}
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono truncate">
                        {sample.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload & Drag-and-Drop Area */}
          <div
            ref={dropZoneRef}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                handleFileSelection(files[0]);
              }
            }}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
              selectedImageSrc
                ? 'border-blue-400 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/10'
                : 'border-slate-300 dark:border-[#3a3a3c] bg-slate-50/50 dark:bg-[#1a1a1c] hover:bg-slate-100/60 dark:hover:bg-[#222224]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelection(e.target.files[0]);
                }
              }}
            />

            {selectedImageSrc ? (
              <div className="flex flex-col md:flex-row items-center gap-5 justify-between">
                <div className="w-full md:w-1/2 max-h-56 overflow-hidden rounded-lg border border-slate-200 dark:border-[#383838] bg-black/5 dark:bg-black/30 relative flex items-center justify-center p-2">
                  <img
                    src={selectedImageSrc}
                    alt="Preview"
                    className="max-h-52 w-auto object-contain rounded"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-2xs flex flex-col items-center justify-center gap-2 text-white">
                      <Scan className="w-8 h-8 text-[#4cc2ff] animate-pulse" />
                      <span className="text-xs font-semibold">{processingStep}</span>
                    </div>
                  )}
                </div>

                <div className="w-full md:w-1/2 text-right space-y-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      تصویر انتخاب شده:
                    </span>
                    <span className="text-xs text-[#0067C0] dark:text-[#4cc2ff] font-mono break-all">
                      {selectedFileName || 'تصویر بارگذاری شده'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    هوش مصنوعی جدول اقلام، سربرگ سازمانی، ستون‌ها، تعداد ردیف‌ها و کادرهای امضا را به صورت خودکار شناسایی و بازتولید می‌کند.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <button
                      onClick={handleProcessImage}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-[#0067C0] hover:bg-[#005a9e] text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>در حال پردازش هوشمند...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>تبدیل به فرم دیجیتال (استخراج)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSelectedImageSrc(null);
                        setSelectedFileName('');
                        setSelectedSampleId('');
                        setExtractedTemplate(null);
                      }}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-[#2b2b2d] dark:hover:bg-[#353538] text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors"
                    >
                      تعویض تصویر
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[#0067C0] dark:text-[#4cc2ff] flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    فایل تصویر فرم را اینجا رها کنید (Drag & Drop)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    یا از کلید‌های <kbd className="px-1.5 py-0.5 bg-slate-200 dark:bg-[#2d2d2d] rounded text-[10px] font-mono">Ctrl + V</kbd> برای چسباندن تصویر از کلیپ‌بورد استفاده نمایید
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <FileImage className="w-3.5 h-3.5" />
                  <span>انتخاب فایل تصویر از کامپیوتر</span>
                </button>
              </div>
            )}
          </div>

          {/* Extracted Template Preview Card */}
          {extractedTemplate && extractedInfo && (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-800/60 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      ساختار فرم با موفقیت استخراج و بازسازی گردید!
                    </h4>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      تمامی المان‌ها اعم از سربرگ رسمی، کدهای کنترلی، ستون‌های کاردکس و مراحل امضا آماده‌اند.
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                  {extractedInfo.source === 'gemini' ? 'پردازش مستقیم Gemini 3.8 Flash' : 'سنتزگر هوشمند ساختار اسناد'}
                </span>
              </div>

              {/* Extraction Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-white dark:bg-[#222224] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-right">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">عنوان سند:</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                    {extractedInfo.title}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#222224] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-right">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">کد استاندارد فرم:</div>
                  <div className="text-xs font-bold text-blue-600 dark:text-[#4cc2ff] font-mono mt-0.5">
                    {extractedInfo.formCode}
                  </div>
                </div>

                <div className="bg-white dark:bg-[#222224] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-right">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">تعداد ستون‌های جدول:</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {toPersianDigits(extractedInfo.columnsCount)} ستون رسمی
                  </div>
                </div>

                <div className="bg-white dark:bg-[#222224] p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-900/40 text-right">
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">مراحل تایید و امضا:</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {toPersianDigits(extractedInfo.signaturesCount)} مرحله امضا
                  </div>
                </div>
              </div>

              {/* Mode choice: Fill Mode vs Design Mode */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-emerald-200 dark:border-emerald-900/40">
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">نحوه بازگشایی فرم:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="openMode"
                      checked={openInFillMode}
                      onChange={() => setOpenInFillMode(true)}
                      className="text-[#0067C0] focus:ring-[#0067C0]"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">حالت صدور و تکمیل داده (Fill Mode)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="openMode"
                      checked={!openInFillMode}
                      onChange={() => setOpenInFillMode(false)}
                      className="text-[#0067C0] focus:ring-[#0067C0]"
                    />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">حالت طراح فرم (ویرایش ساختار)</span>
                  </label>
                </div>

                <button
                  onClick={handleApplyTemplate}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>بارگذاری و شروع استفاده از فرم</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#2d2d2d] bg-[#f8fafc] dark:bg-[#181819] flex items-center justify-between">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span>فرمت‌های پشتیبانی‌شده: PNG, JPG, WEBP | اسناد افقی (Landscape) و عمودی (Portrait)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-4 py-1.5 border border-slate-300 dark:border-[#383838] bg-white dark:bg-[#252527] hover:bg-slate-50 dark:hover:bg-[#2c2c2e] text-slate-700 dark:text-slate-300 rounded-lg text-xs transition-colors"
            >
              انصراف و بستن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

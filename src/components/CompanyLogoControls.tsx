import React, { useRef, useState } from 'react';
import { FormField } from '../types/form';
import {
  loadCompanyBrandProfile,
  readLogoFileAsDataUrl,
  resolveHeaderLogo,
  saveCompanyBrandProfile,
} from '../utils/companyBrand';
import { ImagePlus, Sparkles, Trash2, Check } from 'lucide-react';

interface CompanyLogoControlsProps {
  headerField: FormField;
  onUpdateHeaderField: (updated: FormField) => void;
  onBrandSaved?: (msg: string) => void;
  compact?: boolean;
  wide?: boolean;
}

export const CompanyLogoControls: React.FC<CompanyLogoControlsProps> = ({
  headerField,
  onUpdateHeaderField,
  onBrandSaved,
  compact = false,
  wide = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedAsGlobal, setSavedAsGlobal] = useState(false);

  const brand = loadCompanyBrandProfile();
  const resolved = resolveHeaderLogo(headerField, brand);
  const currentLogoUrl = headerField.logoUrl || brand.logoUrl;

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await readLogoFileAsDataUrl(file, 320);
      onUpdateHeaderField({
        ...headerField,
        logoUrl: dataUrl,
        logoMode: 'custom',
        logoSize: headerField.logoSize || 'md',
      });
      // Persist to shared company brand profile so other templates can reuse it immediately
      saveCompanyBrandProfile({
        ...brand,
        logoUrl: dataUrl,
        logoMode: 'custom',
        logoSize: headerField.logoSize || brand.logoSize || 'md',
        logoPosition: headerField.logoPosition || brand.logoPosition || 'left',
        companyName: headerField.companyName || brand.companyName,
        companySubName: headerField.companySubName || brand.companySubName,
      });
      setSavedAsGlobal(true);
      onBrandSaved?.('لوگوی شرکت در سربرگ ثبت و برای برگه‌های دیگر ذخیره شد.');
    } catch (err: any) {
      setUploadError(err?.message || 'امکان خواندن تصویر لوگو وجود ندارد.');
    }
  };

  const handleRemoveCustomLogo = () => {
    setUploadError(null);
    onUpdateHeaderField({
      ...headerField,
      logoUrl: undefined,
      logoMode: 'default_awox',
    });
    saveCompanyBrandProfile({
      ...brand,
      logoUrl: undefined,
      logoMode: 'default_awox',
    });
    setSavedAsGlobal(false);
    onBrandSaved?.('لوگوی اختصاصی حذف شد.');
  };

  const handleApplyToAll = () => {
    saveCompanyBrandProfile({
      logoUrl: currentLogoUrl,
      logoMode: resolved.mode,
      logoSize: headerField.logoSize || 'md',
      logoPosition: headerField.logoPosition || 'left',
      companyName: headerField.companyName,
      companySubName: headerField.companySubName,
    });
    setSavedAsGlobal(true);
    onBrandSaved?.('لوگو و نام شرکت برای همه برگه‌ها ذخیره شد.');
  };

  return (
    <div className="space-y-2.5 text-xs select-none" dir="rtl" data-testid="company-logo-controls">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        onChange={handleFileSelected}
        className="hidden"
        data-testid="company-logo-file-input"
      />

      {/* Preview & Upload Bar */}
      <div className="flex items-center gap-3 p-2.5 rounded-2xl liquid-glass-well">
        <div className="w-14 h-14 rounded-xl bg-white border border-slate-300/70 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
          {resolved.mode === 'custom' && resolved.logoUrl ? (
            <img
              src={resolved.logoUrl}
              alt="لوگوی شرکت"
              className="max-w-full max-h-full object-contain p-1"
            />
          ) : resolved.mode === 'none' ? (
            <span className="text-[10px] text-slate-400">بدون لوگو</span>
          ) : (
            <div className="text-center leading-none">
              <span className="font-black text-[10px] text-slate-900">AWOX</span>
              <span className="text-orange-500 text-[10px]">◆</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              data-testid="upload-company-logo-btn"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 px-3 rounded-xl liquid-cta text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ImagePlus className="w-3.5 h-3.5" />
              <span>{currentLogoUrl ? 'تغییر لوگو' : 'انتخاب لوگوی شرکت'}</span>
            </button>

            {currentLogoUrl && (
              <button
                type="button"
                onClick={handleRemoveCustomLogo}
                aria-label="حذف لوگوی اختصاصی"
                className="h-8 px-2.5 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-slate-300/60 dark:border-white/15 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {!compact && <span>حذف</span>}
              </button>
            )}
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            فرمت PNG، JPG یا SVG با پس‌زمینه شفاف بهترین نتیجه را در چاپ می‌دهد.
          </p>
        </div>
      </div>

      {uploadError && (
        <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium px-1">
          {uploadError}
        </div>
      )}

      {/* Logo Mode + Size + Position */}
      <div className={`grid ${wide ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'} gap-2`}>
        <div className="space-y-1">
          <span className="text-[10px] text-slate-600 dark:text-slate-300 block">حالت نمایش لوگو:</span>
          <select
            aria-label="حالت نمایش لوگو"
            value={headerField.logoMode || (currentLogoUrl ? 'custom' : 'default_awox')}
            onChange={(e) => {
              const mode = e.target.value as 'custom' | 'default_awox' | 'none';
              onUpdateHeaderField({
                ...headerField,
                logoMode: mode,
                logoUrl: mode === 'custom' ? currentLogoUrl : headerField.logoUrl,
              });
            }}
            className="w-full h-8 px-2 rounded-xl bg-white/85 dark:bg-slate-900/75 border border-slate-300/60 dark:border-white/15 text-[11px] text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value="custom" disabled={!currentLogoUrl}>
              لوگوی شرکت من
            </option>
            <option value="default_awox">لوگوی پیش‌فرض AWOX</option>
            <option value="none">بدون لوگو</option>
          </select>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-slate-600 dark:text-slate-300 block">اندازه لوگو:</span>
          <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70 h-8">
            {(
              [
                { id: 'sm', label: 'کوچک' },
                { id: 'md', label: 'متوسط' },
                { id: 'lg', label: 'بزرگ' },
              ] as const
            ).map((sz) => (
              <button
                key={sz.id}
                type="button"
                onClick={() => onUpdateHeaderField({ ...headerField, logoSize: sz.id })}
                className={`flex-1 px-1 text-[10px] font-semibold cursor-pointer ${
                  (headerField.logoSize || brand.logoSize || 'md') === sz.id
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>

        {compact && (
          <div className="space-y-1">
            <span className="text-[10px] text-slate-600 dark:text-slate-300 block">
              جای لوگو در سربرگ:
            </span>
            <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70 h-8">
              {(
                [
                  { id: 'left', label: 'چپ' },
                  { id: 'center', label: 'وسط' },
                  { id: 'right', label: 'راست' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onUpdateHeaderField({ ...headerField, logoPosition: pos.id })}
                  className={`flex-1 px-1 text-[10px] font-semibold cursor-pointer ${
                    (headerField.logoPosition || brand.logoPosition || 'left') === pos.id
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-[10px] text-slate-600 dark:text-slate-300 block">
              جایگاه لوگو در سربرگ:
            </span>
            <div className="flex rounded-xl overflow-hidden border border-slate-300/60 dark:border-white/15 bg-white/80 dark:bg-slate-900/70 h-8">
              {(
                [
                  { id: 'left', label: 'کادر سمت چپ' },
                  { id: 'center', label: 'بالای عنوان وسط' },
                  { id: 'right', label: 'کادر سمت راست' },
                ] as const
              ).map((pos) => (
                <button
                  key={pos.id}
                  type="button"
                  onClick={() => onUpdateHeaderField({ ...headerField, logoPosition: pos.id })}
                  className={`flex-1 text-[10px] font-semibold cursor-pointer ${
                    (headerField.logoPosition || brand.logoPosition || 'left') === pos.id
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyToAll}
            className="w-full h-8 rounded-xl liquid-glass-well hover:bg-white/85 dark:hover:bg-slate-800/80 text-[11px] font-semibold text-sky-700 dark:text-sky-300 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {savedAsGlobal ? <Check className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>ذخیره به عنوان لوگوی پیش‌فرض همه برگه‌ها</span>
          </button>
        </div>
      )}
    </div>
  );
};

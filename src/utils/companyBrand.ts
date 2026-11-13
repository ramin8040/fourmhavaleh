import type { FormField } from '../types/form';

export interface CompanyBrandProfile {
  logoUrl?: string;
  logoMode?: 'custom' | 'default_awox' | 'none';
  logoSize?: 'sm' | 'md' | 'lg';
  logoPosition?: 'left' | 'right' | 'center';
  companyName?: string;
  companySubName?: string;
}

const STORAGE_KEY = 'winform_company_brand_v1';

export function loadCompanyBrandProfile(): CompanyBrandProfile {
  if (typeof window === 'undefined' || !window.localStorage) {
    return {};
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveCompanyBrandProfile(profile: CompanyBrandProfile): CompanyBrandProfile {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Ignore storage quota issues safely
    }
  }
  return profile;
}

export function clearCompanyBrandLogo(): CompanyBrandProfile {
  const current = loadCompanyBrandProfile();
  const next: CompanyBrandProfile = {
    ...current,
    logoUrl: undefined,
    logoMode: 'default_awox',
  };
  return saveCompanyBrandProfile(next);
}

export interface ResolvedHeaderLogo {
  mode: 'custom' | 'default_awox' | 'none';
  logoUrl?: string;
  size: 'sm' | 'md' | 'lg';
  sizePx: number;
  position: 'left' | 'right' | 'center';
}

export function resolveHeaderLogo(
  headerField?: FormField,
  brand?: CompanyBrandProfile
): ResolvedHeaderLogo {
  const activeBrand = brand ?? loadCompanyBrandProfile();
  const fieldMode = headerField?.logoMode;
  const effectiveLogoUrl = headerField?.logoUrl || activeBrand.logoUrl;

  let mode: 'custom' | 'default_awox' | 'none' = 'default_awox';
  if (fieldMode === 'none') {
    mode = 'none';
  } else if (fieldMode === 'custom' && effectiveLogoUrl) {
    mode = 'custom';
  } else if (!fieldMode && effectiveLogoUrl) {
    mode = 'custom';
  } else if (activeBrand.logoMode === 'none' && !headerField?.logoMode) {
    mode = 'none';
  }

  const size = headerField?.logoSize || activeBrand.logoSize || 'md';
  const sizePx = size === 'sm' ? 36 : size === 'lg' ? 68 : 50;
  const position = headerField?.logoPosition || activeBrand.logoPosition || 'left';

  return {
    mode,
    logoUrl: mode === 'custom' ? effectiveLogoUrl : undefined,
    size,
    sizePx,
    position,
  };
}

export async function readLogoFileAsDataUrl(file: File, maxDimension = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('خطا در خواندن فایل لوگو'));
    reader.onload = () => {
      const rawUrl = String(reader.result || '');
      if (!rawUrl) {
        reject(new Error('فایل لوگو خالی است'));
        return;
      }
      // Keep crisp SVG data URLs untouched
      if (file.type === 'image/svg+xml' || rawUrl.startsWith('data:image/svg+xml')) {
        resolve(rawUrl);
        return;
      }
      if (typeof Image === 'undefined' || typeof document === 'undefined') {
        resolve(rawUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h || (w <= maxDimension && h <= maxDimension && rawUrl.length < 180_000)) {
          resolve(rawUrl);
          return;
        }
        const ratio = Math.min(maxDimension / w, maxDimension / h, 1);
        const targetW = Math.max(1, Math.round(w * ratio));
        const targetH = Math.max(1, Math.round(h * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawUrl);
          return;
        }
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error('فرمت تصویر لوگو معتبر نیست'));
      img.src = rawUrl;
    };
    reader.readAsDataURL(file);
  });
}

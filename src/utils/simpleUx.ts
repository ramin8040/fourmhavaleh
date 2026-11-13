import { FormTemplate, TableItemRow } from '../types/form';
import { isTableRowPopulated } from './wizardLogic';

export type TemplateTone = 'sky' | 'emerald' | 'amber' | 'indigo' | 'rose' | 'teal';

export interface FriendlyTemplateMeta {
  shortHint: string;
  tone: TemplateTone;
  stepOnePrompt: string;
}

const TEMPLATE_HINTS: Array<{ match: string; hint: string; tone: TemplateTone }> = [
  {
    match: 'خروج',
    hint: 'وقتی می‌خواهید کالایی را از انبار برای مشتری یا بخش دیگر بفرستید.',
    tone: 'sky',
  },
  {
    match: 'قطعات خارجی',
    hint: 'وقتی کالا یا قطعه جدیدی وارد انبار می‌شود و می‌خواهید رسید بدهید.',
    tone: 'emerald',
  },
  {
    match: 'استعلام',
    hint: 'برای درخواست بررسی و تعمیر وسایل یا دستگاه‌های خراب.',
    tone: 'indigo',
  },
  {
    match: 'تعمیرات',
    hint: 'وقتی وسیله‌ای تعمیر شده و دوباره تحویل گرفته یا ارسال می‌شود.',
    tone: 'amber',
  },
  {
    match: 'مصرفی',
    hint: 'برای درخواست وسایل مصرفی روزانه بین بخش‌های مختلف.',
    tone: 'teal',
  },
  {
    match: 'فاکتور',
    hint: 'برای صدور صورتحساب رسمی فروش کالا یا خدمات با جمع مبلغ.',
    tone: 'indigo',
  },
  {
    match: 'مرخصی',
    hint: 'برای ثبت سریع درخواست مرخصی یا ماموریت اداری.',
    tone: 'rose',
  },
  {
    match: 'دریافت وجه',
    hint: 'رسید ساده برای تحویل گرفتن پول یا کالا.',
    tone: 'emerald',
  },
  {
    match: 'بوم سفید',
    hint: 'یک صفحه خالی و ساده که خودتان آن را بچینید.',
    tone: 'teal',
  },
];

export function getFriendlyTemplateMeta(template: FormTemplate): FriendlyTemplateMeta {
  const title = template.title || '';
  const found = TEMPLATE_HINTS.find((entry) => title.includes(entry.match));
  if (found) {
    return {
      shortHint: found.hint,
      tone: found.tone,
      stepOnePrompt: `انتخاب «${title}»`,
    };
  }
  return {
    shortHint: template.description || 'برگه آماده برای پر کردن، ذخیره و چاپ آسان.',
    tone: 'sky',
    stepOnePrompt: `انتخاب «${title}»`,
  };
}

export function getSimpleStepInstruction(step: 1 | 2 | 3): {
  title: string;
  helper: string;
} {
  if (step === 1) {
    return {
      title: '۱. می‌خواهید چه برگه‌ای بسازید؟',
      helper: 'روی یکی از کارت‌های زیر بزنید و بعد دکمه «بریم مرحله بعد» را فشار دهید.',
    };
  }
  if (step === 2) {
    return {
      title: '۲. جاهای خالی برگه را پر کنید',
      helper: 'اسم مشتری و کالاها را بنویسید. هر جا آماده بودید دکمه «ساخت برگه آماده چاپ» را بزنید.',
    };
  }
  return {
    title: '۳. برگه‌تان آماده است!',
    helper: 'می‌توانید همین الان برگه‌تان را چاپ کنید یا در «برگه‌های من» نگه دارید.',
  };
}

/**
 * Progressive disclosure for wizard item rows:
 * Keeps beginners calm by showing populated rows + at most `minEmptySlots` trailing empty rows,
 * unless the user explicitly expands all rows.
 */
export function getVisibleWizardRows(
  rows: TableItemRow[],
  showAllRows: boolean,
  minInitialVisible = 2
): {
  visibleRows: TableItemRow[];
  hiddenEmptyCount: number;
} {
  if (showAllRows || rows.length <= minInitialVisible) {
    return { visibleRows: rows, hiddenEmptyCount: 0 };
  }

  let lastPopulatedIdx = -1;
  for (let i = 0; i < rows.length; i++) {
    if (isTableRowPopulated(rows[i])) {
      lastPopulatedIdx = i;
    }
  }

  // Always show at least `minInitialVisible` rows, or up to 1 empty row after last populated row
  const visibleCount = Math.min(
    rows.length,
    Math.max(minInitialVisible, lastPopulatedIdx + 2)
  );

  return {
    visibleRows: rows.slice(0, visibleCount),
    hiddenEmptyCount: Math.max(0, rows.length - visibleCount),
  };
}

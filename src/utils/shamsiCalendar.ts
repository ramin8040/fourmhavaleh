/**
 * Pure TypeScript Shamsi (Jalali) Calendar Utilities
 * Conversion between Gregorian and Jalali using standard native Intl API and mathematical fallbacks,
 * month days, weekday alignment, formatting, parsing, and helper functions for Shamsi DatePicker.
 */

export const PERSIAN_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const PERSIAN_WEEKDAY_NAMES = [
  { short: 'ش', full: 'شنبه' },
  { short: 'ی', full: 'یک‌شنبه' },
  { short: 'د', full: 'دوشنبه' },
  { short: 'س', full: 'سه‌شنبه' },
  { short: 'چ', full: 'چهارشنبه' },
  { short: 'پ', full: 'پنج‌شنبه' },
  { short: 'ج', full: 'جمعه' },
];

export interface ShamsiDateObject {
  year: number;
  month: number; // 1 to 12
  day: number;   // 1 to 31
}

// Check if a Jalali year is a leap year (30 days in Esfand)
export function isJalaliLeapYear(jy: number): boolean {
  const breaks = [
    -61, 9, 38, 199, 426, 686, 756, 818, 1111, 1181, 1210, 1635, 2060, 2097, 2192,
    2262, 2324, 2394, 2456, 3178,
  ];
  const bl = breaks.length;
  let jp = breaks[0];
  let jm: number;
  let jump = 0;

  if (jy < jp || jy >= breaks[bl - 1]) return false;

  for (let i = 1; i < bl; i += 1) {
    jm = breaks[i];
    jump = jm - jp;
    if (jy < jm) break;
    jp = jm;
  }
  let n = jy - jp;

  if (jump - n < 6) n = n - jump + Math.floor((jump + 4) / 33) * 33;
  let leap = (((n + 1) % 33) - 1) % 4;
  if (leap === -1) leap = 4;
  return leap === 0;
}

// Get number of days in a Jalali month
export function getDaysInJalaliMonth(jy: number, jm: number): number {
  if (jm >= 1 && jm <= 6) return 31;
  if (jm >= 7 && jm <= 11) return 30;
  if (jm === 12) return isJalaliLeapYear(jy) ? 30 : 29;
  return 30;
}

// Convert Gregorian date to Jalali
export function gregorianToJalali(gy: number, gm: number, gd: number): ShamsiDateObject {
  try {
    const jsDate = new Date(Date.UTC(gy, gm - 1, gd));
    const parts = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    }).formatToParts(jsDate);

    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;

    return {
      year: parseInt(map.year, 10),
      month: parseInt(map.month, 10),
      day: parseInt(map.day, 10),
    };
  } catch {
    // Math fallback
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let gy2 = gm > 2 ? gy + 1 : gy;
    let days =
      355666 +
      365 * gy +
      Math.floor((gy2 + 3) / 4) -
      Math.floor((gy2 + 99) / 100) +
      Math.floor((gy2 + 399) / 400) +
      gd +
      g_d_m[gm - 1];

    let jy = -1595 + 33 * Math.floor(days / 12053);
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;

    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }

    let jm: number;
    let jd: number;
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }

    return { year: jy, month: jm, day: jd };
  }
}

// Convert Jalali date to Gregorian
export function jalaliToGregorian(
  jy: number,
  jm: number,
  jd: number
): { year: number; month: number; day: number } {
  try {
    let est = new Date(Date.UTC(jy + 621, 2, 21));
    const days = (jm <= 6 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) + (jd - 1);
    est = new Date(est.getTime() + days * 86400000);

    const fmt = new Intl.DateTimeFormat('en-US-u-ca-persian', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });

    for (let step = 0; step < 6; step++) {
      const parts = fmt.formatToParts(est);
      const m: Record<string, string> = {};
      for (const p of parts) m[p.type] = p.value;
      const curY = parseInt(m.year, 10);
      const curM = parseInt(m.month, 10);
      const curD = parseInt(m.day, 10);

      if (curY === jy && curM === jm && curD === jd) {
        return {
          year: est.getUTCFullYear(),
          month: est.getUTCMonth() + 1,
          day: est.getUTCDate(),
        };
      }

      const curDays = (curM <= 6 ? (curM - 1) * 31 : (curM - 1) * 30 + 6) + curD;
      const targetDays = (jm <= 6 ? (jm - 1) * 31 : (jm - 1) * 30 + 6) + jd;
      const diff = (jy - curY) * 365 + (targetDays - curDays);
      est = new Date(est.getTime() + diff * 86400000);
    }

    return {
      year: est.getUTCFullYear(),
      month: est.getUTCMonth() + 1,
      day: est.getUTCDate(),
    };
  } catch {
    return { year: jy + 621, month: jm, day: jd };
  }
}

// Convert Date object to ShamsiDateObject
export function dateToShamsi(date: Date = new Date()): ShamsiDateObject {
  return gregorianToJalali(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

// Format Shamsi date object into string YYYY/MM/DD
export function formatShamsiDate(shamsi: ShamsiDateObject, separator = '/'): string {
  const y = String(shamsi.year).padStart(4, '0');
  const m = String(shamsi.month).padStart(2, '0');
  const d = String(shamsi.day).padStart(2, '0');
  return `${y}${separator}${m}${separator}${d}`;
}

// Parse Shamsi date string (supports YYYY/MM/DD, YYYY-MM-DD, Persian/English digits)
export function parseShamsiString(str: string): ShamsiDateObject | null {
  if (!str) return null;
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  let normalized = String(str).trim();
  persianDigits.forEach((pd, idx) => {
    normalized = normalized.split(pd).join(String(idx));
  });

  const match = normalized.match(/(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})/);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  if (year < 1300 || year > 1500) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > getDaysInJalaliMonth(year, month)) return null;

  return { year, month, day };
}

// Get the starting weekday for the 1st of a given Jalali month (0 for Saturday, 6 for Friday)
export function getFirstWeekdayOfJalaliMonth(jy: number, jm: number): number {
  const greg = jalaliToGregorian(jy, jm, 1);
  const jsDate = new Date(greg.year, greg.month - 1, greg.day);
  const jsDay = jsDate.getDay(); // 0=Sunday, 6=Saturday
  return (jsDay + 1) % 7;
}

// Today in Shamsi
export function getTodayShamsi(): ShamsiDateObject {
  return dateToShamsi(new Date());
}

// Format Shamsi date with Persian digits
export function formatShamsiDatePersian(shamsi: ShamsiDateObject): string {
  const s = formatShamsiDate(shamsi);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return s.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

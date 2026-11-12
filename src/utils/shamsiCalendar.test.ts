import { test, describe } from 'node:test';
import assert from 'node:assert';
import {
  isJalaliLeapYear,
  getDaysInJalaliMonth,
  gregorianToJalali,
  jalaliToGregorian,
  formatShamsiDate,
  parseShamsiString,
  getFirstWeekdayOfJalaliMonth,
  PERSIAN_MONTH_NAMES,
} from './shamsiCalendar';

describe('Shamsi Calendar Utilities', () => {
  test('leap year detection works correctly', () => {
    assert.strictEqual(isJalaliLeapYear(1403), true);
    assert.strictEqual(isJalaliLeapYear(1404), false);
    assert.strictEqual(isJalaliLeapYear(1399), true);
    assert.strictEqual(isJalaliLeapYear(1400), false);
  });

  test('month days count matches Iranian standard', () => {
    assert.strictEqual(getDaysInJalaliMonth(1403, 1), 31); // Farvardin
    assert.strictEqual(getDaysInJalaliMonth(1403, 6), 31); // Shahrivar
    assert.strictEqual(getDaysInJalaliMonth(1403, 7), 30); // Mehr
    assert.strictEqual(getDaysInJalaliMonth(1403, 11), 30); // Bahman
    assert.strictEqual(getDaysInJalaliMonth(1403, 12), 30); // Esfand in leap year
    assert.strictEqual(getDaysInJalaliMonth(1404, 12), 29); // Esfand in common year
  });

  test('converts Gregorian to Jalali accurately', () => {
    // 2026-09-16 should be 1405/06/25 (the date on user voucher image)
    const j = gregorianToJalali(2026, 9, 16);
    assert.strictEqual(j.year, 1405);
    assert.strictEqual(j.month, 6);
    assert.strictEqual(j.day, 25);
  });

  test('round-trips between Jalali and Gregorian', () => {
    const origJalali = { year: 1405, month: 6, day: 25 };
    const greg = jalaliToGregorian(origJalali.year, origJalali.month, origJalali.day);
    const backToJalali = gregorianToJalali(greg.year, greg.month, greg.day);
    assert.deepStrictEqual(backToJalali, origJalali);
  });

  test('parses both Persian and English digits with various delimiters', () => {
    const p1 = parseShamsiString('1405/06/25');
    assert.deepStrictEqual(p1, { year: 1405, month: 6, day: 25 });

    const p2 = parseShamsiString('۱۴۰۵/۰۶/۲۵');
    assert.deepStrictEqual(p2, { year: 1405, month: 6, day: 25 });

    const p3 = parseShamsiString('1403-08-20');
    assert.deepStrictEqual(p3, { year: 1403, month: 8, day: 20 });
  });

  test('formats ShamsiDateObject into standard padded string', () => {
    const s = formatShamsiDate({ year: 1405, month: 6, day: 5 });
    assert.strictEqual(s, '1405/06/05');
  });

  test('month names array has 12 Persian names', () => {
    assert.strictEqual(PERSIAN_MONTH_NAMES.length, 12);
    assert.strictEqual(PERSIAN_MONTH_NAMES[0], 'فروردین');
    assert.strictEqual(PERSIAN_MONTH_NAMES[11], 'اسفند');
  });
});

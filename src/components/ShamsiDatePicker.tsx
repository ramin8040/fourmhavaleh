import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  PERSIAN_MONTH_NAMES,
  PERSIAN_WEEKDAY_NAMES,
  ShamsiDateObject,
  getDaysInJalaliMonth,
  getFirstWeekdayOfJalaliMonth,
  getTodayShamsi,
  formatShamsiDate,
  parseShamsiString,
  formatShamsiDatePersian
} from '../utils/shamsiCalendar';
import { toPersianDigits } from '../utils/formLogic';

export interface ShamsiDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
  align?: 'right' | 'left' | 'center';
}

export const ShamsiDatePicker: React.FC<ShamsiDatePickerProps> = ({
  value,
  onChange,
  placeholder = '۱۴۰۵/۰۶/۲۵',
  label,
  required = false,
  disabled = false,
  compact = false,
  className = '',
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Today in Shamsi
  const today = getTodayShamsi();

  // Active view year and month
  const parsedValue = parseShamsiString(value);
  const [viewYear, setViewYear] = useState<number>(parsedValue ? parsedValue.year : today.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedValue ? parsedValue.month : today.month);

  // Update view month/year when value changes from outside
  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Navigation handlers
  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Day selection
  const handleSelectDay = (day: number) => {
    const selectedDate: ShamsiDateObject = {
      year: viewYear,
      month: viewMonth,
      day,
    };
    const formatted = formatShamsiDate(selectedDate);
    onChange(formatted);
    setIsOpen(false);
  };

  // Pick Today
  const handlePickToday = () => {
    const formatted = formatShamsiDate(today);
    onChange(formatted);
    setViewYear(today.year);
    setViewMonth(today.month);
    setIsOpen(false);
  };

  // Clear value
  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  // Calculate calendar grid for viewYear & viewMonth
  const daysInCurrentMonth = getDaysInJalaliMonth(viewYear, viewMonth);
  const startWeekday = getFirstWeekdayOfJalaliMonth(viewYear, viewMonth); // 0=Sat, 6=Fri

  // Available years list (e.g. 1380 to 1420)
  const availableYears = Array.from({ length: 41 }, (_, i) => 1380 + i);

  return (
    <div ref={containerRef} className={`relative select-none text-right ${className}`} dir="rtl">
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}

      {/* Trigger Input & Calendar Button */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 cursor-pointer transition-all border ${
          compact
            ? 'px-1.5 py-0.5 rounded text-xs h-7'
            : 'px-2.5 py-1.5 rounded-lg text-xs h-8'
        } ${
          isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/20 bg-white dark:bg-[#1f2228]'
            : 'border-slate-300 dark:border-[#383d47] bg-white dark:bg-[#1a1c22] hover:border-slate-400 dark:hover:border-slate-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#15161a]' : ''}`}
      >
        <span
          className={`font-mono font-medium truncate ${
            value ? 'text-slate-800 dark:text-slate-100 font-bold' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {value ? toPersianDigits(value) : placeholder}
        </span>

        <div className="flex items-center gap-1 shrink-0 text-slate-400 hover:text-blue-600 dark:hover:text-[#4cc2ff]">
          <CalendarIcon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </div>
      </div>

      {/* Shamsi Calendar Popover */}
      {isOpen && (
        <div
          className="absolute z-50 mt-1 right-0 w-72 bg-white dark:bg-[#1c1f26] border border-slate-200 dark:border-[#333842] rounded-xl shadow-2xl p-3 text-xs overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          style={{ minWidth: '270px' }}
        >
          {/* Header: Month and Year Navigators */}
          <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-[#2a2e38] pb-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282d38] transition-colors"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Month & Year Selectors */}
            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-[#252a34] text-slate-800 dark:text-slate-100 font-bold border border-slate-200 dark:border-[#353b47] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
              >
                {PERSIAN_MONTH_NAMES.map((name, idx) => (
                  <option key={name} value={idx + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-[#252a34] text-slate-800 dark:text-slate-100 font-bold font-mono border border-slate-200 dark:border-[#353b47] rounded-lg px-2 py-1 text-xs outline-none cursor-pointer"
              >
                {availableYears.map((yr) => (
                  <option key={yr} value={yr}>
                    {toPersianDigits(yr)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#282d38] transition-colors"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Labels: ش، ی، د، س، چ، پ، ج */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {PERSIAN_WEEKDAY_NAMES.map((day, idx) => (
              <span
                key={day.short}
                className={`text-[10px] font-bold py-0.5 ${
                  idx === 6 ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'
                }`}
                title={day.full}
              >
                {day.short}
              </span>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before the 1st day of the month */}
            {Array.from({ length: startWeekday }).map((_, i) => (
              <span key={`empty_${i}`} className="w-8 h-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((day) => {
              const isSelected =
                parsedValue &&
                parsedValue.year === viewYear &&
                parsedValue.month === viewMonth &&
                parsedValue.day === day;

              const isToday =
                today.year === viewYear && today.month === viewMonth && today.day === day;

              // Check if Friday (last column in 7-col grid)
              const dayColumn = (startWeekday + day - 1) % 7;
              const isFriday = dayColumn === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-lg font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/25 scale-105'
                      : isToday
                      ? 'border border-blue-500 text-blue-600 dark:text-[#4cc2ff] bg-blue-50/70 dark:bg-blue-950/40 font-bold'
                      : isFriday
                      ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#282d38]'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Action Buttons */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-[#2a2e38] flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handlePickToday}
              className="px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-600 dark:text-[#4cc2ff] font-bold text-[11px] transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>امروز ({toPersianDigits(today.day)} {PERSIAN_MONTH_NAMES[today.month - 1]})</span>
            </button>

            <div className="flex items-center gap-1">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 text-[11px] transition-colors"
                >
                  پاک کردن
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#282d38] text-[11px] transition-colors"
              >
                بستن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

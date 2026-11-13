import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon,
  ChevronRight,
  ChevronLeft,
  Sparkles,
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
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverCoords, setPopoverCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const today = getTodayShamsi();
  const parsedValue = parseShamsiString(value);
  const [viewYear, setViewYear] = useState<number>(parsedValue ? parsedValue.year : today.year);
  const [viewMonth, setViewMonth] = useState<number>(parsedValue ? parsedValue.month : today.month);

  useEffect(() => {
    if (parsedValue) {
      setViewYear(parsedValue.year);
      setViewMonth(parsedValue.month);
    }
  }, [value]);

  const updatePopoverPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.min(288, window.innerWidth - 16);
    const estimatedHeight = popoverRef.current?.offsetHeight || 340;

    let left =
      align === 'left'
        ? rect.left
        : align === 'center'
        ? rect.left + (rect.width - width) / 2
        : rect.right - width;

    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    let top = rect.bottom + 6;
    if (top + estimatedHeight > window.innerHeight - 8 && rect.top - estimatedHeight - 6 >= 8) {
      top = rect.top - estimatedHeight - 6;
    } else {
      top = Math.max(8, Math.min(top, window.innerHeight - Math.min(estimatedHeight, window.innerHeight - 16) - 8));
    }

    setPopoverCoords({ top, left, width });
  }, [align]);

  useEffect(() => {
    if (!isOpen) {
      setPopoverCoords(null);
      return;
    }

    updatePopoverPosition();
    const raf = window.requestAnimationFrame(updatePopoverPosition);

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    const handleReposition = () => updatePopoverPosition();

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);
    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen, updatePopoverPosition]);

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

  const handleSelectDay = (day: number) => {
    const selectedDate: ShamsiDateObject = {
      year: viewYear,
      month: viewMonth,
      day,
    };
    onChange(formatShamsiDate(selectedDate));
    setIsOpen(false);
  };

  const handlePickToday = () => {
    onChange(formatShamsiDate(today));
    setViewYear(today.year);
    setViewMonth(today.month);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const daysInCurrentMonth = getDaysInJalaliMonth(viewYear, viewMonth);
  const startWeekday = getFirstWeekdayOfJalaliMonth(viewYear, viewMonth);
  const availableYears = Array.from({ length: 41 }, (_, i) => 1380 + i);

  return (
    <div ref={containerRef} className={`relative select-none text-right ${className}`} dir="rtl">
      {label && (
        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
          {label}
          {required && <span className="text-rose-500 mr-1">*</span>}
        </label>
      )}

      {/* Trigger Input */}
      <button
        type="button"
        data-testid="shamsi-date-picker-trigger"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 cursor-pointer transition-all liquid-glass-well ${
          compact
            ? 'px-2.5 py-1 rounded-xl text-xs h-8'
            : 'px-3.5 py-2 rounded-2xl text-xs sm:text-sm h-11'
        } ${
          isOpen ? 'ring-2 ring-sky-500/45' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <span
          className={`font-sans tabular-nums font-medium truncate ${
            value ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          {value ? toPersianDigits(value) : placeholder}
        </span>

        <span className="flex items-center shrink-0 text-slate-500 dark:text-slate-400">
          <CalendarIcon className={compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        </span>
      </button>

      {/* Shamsi Calendar Liquid Glass Popover (Portaled above all glass stacking contexts) */}
      {isOpen &&
        popoverCoords &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popoverRef}
            data-testid="shamsi-date-picker-popover"
            dir="rtl"
            style={{
              position: 'fixed',
              top: popoverCoords.top,
              left: popoverCoords.left,
              width: popoverCoords.width,
              zIndex: 9999,
            }}
            className="liquid-glass-elevated bg-white/95 dark:bg-slate-900/95 shadow-2xl rounded-3xl p-3.5 text-xs overflow-hidden select-none text-right"
          >
          <div className="flex items-center justify-between mb-3 border-b border-slate-300/40 dark:border-white/10 pb-2.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              title="ماه قبل"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="liquid-glass-well text-slate-900 dark:text-slate-100 font-bold rounded-xl px-2 py-1 text-xs outline-none cursor-pointer"
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
                className="liquid-glass-well text-slate-900 dark:text-slate-100 font-bold font-sans tabular-nums rounded-xl px-2 py-1 text-xs outline-none cursor-pointer"
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
              className="p-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70 transition-colors cursor-pointer"
              title="ماه بعد"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {PERSIAN_WEEKDAY_NAMES.map((day, idx) => (
              <span
                key={day.short}
                className={`text-[10px] font-bold py-0.5 ${
                  idx === 6 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
                }`}
                title={day.full}
              >
                {day.short}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: startWeekday }).map((_, i) => (
              <span key={`empty_${i}`} className="w-8 h-8" />
            ))}

            {Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1).map((day) => {
              const isSelected =
                parsedValue &&
                parsedValue.year === viewYear &&
                parsedValue.month === viewMonth &&
                parsedValue.day === day;

              const isToday =
                today.year === viewYear && today.month === viewMonth && today.day === day;

              const dayColumn = (startWeekday + day - 1) % 7;
              const isFriday = dayColumn === 6;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 rounded-xl font-sans tabular-nums text-xs font-semibold flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? 'liquid-cta text-white font-bold'
                      : isToday
                      ? 'border border-sky-500 text-sky-700 dark:text-sky-300 bg-sky-500/15 font-bold'
                      : isFriday
                      ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/10'
                      : 'text-slate-800 dark:text-slate-100 hover:bg-white/75 dark:hover:bg-slate-800/70'
                  }`}
                >
                  {toPersianDigits(day)}
                </button>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-300/40 dark:border-white/10 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handlePickToday}
              className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 dark:bg-sky-400/20 text-sky-700 dark:text-sky-200 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>
                امروز ({toPersianDigits(today.day)} {PERSIAN_MONTH_NAMES[today.month - 1]})
              </span>
            </button>

            <div className="flex items-center gap-1">
              {value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-2 py-1 rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 text-[11px] transition-colors cursor-pointer"
                >
                  پاک کردن
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white/75 dark:hover:bg-slate-800/70 text-[11px] transition-colors cursor-pointer"
              >
                بستن
              </button>
            </div>
          </div>
        </div>,
          document.body
        )}
    </div>
  );
};

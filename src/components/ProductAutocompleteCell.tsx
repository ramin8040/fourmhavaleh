import React, { useState, useRef, useEffect, useMemo } from 'react';
import { TableItemRow } from '../types/form';
import { 
  ProductSuggestion, 
  getMatchingProducts, 
  applyProductSuggestionToRow 
} from '../utils/productSuggestions';
import { toPersianDigits } from '../utils/formLogic';
import { Sparkles, History, Package, Check } from 'lucide-react';

interface ProductAutocompleteCellProps {
  value: string;
  row: TableItemRow;
  catalog: ProductSuggestion[];
  onChange: (value: string) => void;
  onSelectSuggestion: (updatedRow: TableItemRow) => void;
  placeholder?: string;
  isFillMode?: boolean;
}

export const ProductAutocompleteCell: React.FC<ProductAutocompleteCellProps> = ({
  value,
  row,
  catalog,
  onChange,
  onSelectSuggestion,
  placeholder = 'شرح کالا',
  isFillMode = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute suggestions based on query and catalog
  const suggestions = useMemo(() => {
    return getMatchingProducts(value || '', catalog, 6);
  }, [value, catalog]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: ProductSuggestion) => {
    const updated = applyProductSuggestionToRow(row, item);
    onSelectSuggestion(updated);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions[highlightedIndex]) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isFillMode) {
    return (
      <span className="text-xs text-slate-900 dark:text-slate-100">
        {value || ''}
      </span>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          type="text"
          value={value || ''}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => {
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full px-1.5 py-0.5 bg-transparent border-0 outline-none text-xs text-slate-900 dark:text-slate-100 text-right pr-1"
        />
        {/* Subtle sparkle indicator when suggestions are available and user is typing */}
        {value && suggestions.length > 0 && !isOpen && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setIsOpen(true)}
            className="absolute left-1 text-blue-500 hover:text-blue-700 dark:text-blue-400 no-print opacity-60 hover:opacity-100 transition-opacity"
            title="نمایش پیشنهادات سوابق"
          >
            <Sparkles className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Floating Suggestions Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div
          dir="rtl"
          className="absolute z-50 top-full right-0 mt-1 w-80 md:w-96 max-w-[90vw] bg-white dark:bg-[#1e232d] rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden text-right animate-in fade-in duration-100 no-print"
        >
          {/* Header */}
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-semibold select-none">
            <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
              <History className="w-3 h-3" />
              <span>پیشنهاد هوشمند از سوابق حواله‌ها</span>
            </span>
            <span>{toPersianDigits(suggestions.length)} مورد مشابه</span>
          </div>

          {/* Suggestions List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1">
            {suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <div
                  key={`${item.description}-${idx}`}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  onClick={() => handleSelect(item)}
                  className={`p-2 rounded-lg cursor-pointer transition-colors ${
                    isHighlighted
                      ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Package className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                      <span className="leading-snug">{item.description}</span>
                    </div>
                    {item.frequency > 1 && (
                      <span className="shrink-0 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                        {toPersianDigits(item.frequency)} بار ثبت‌شده
                      </span>
                    )}
                  </div>

                  {/* Metadata Chips / Auto-fill preview */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 mr-5 text-[10px]">
                    {item.unit && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        واحد: {item.unit}
                      </span>
                    )}
                    {item.productCode && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                        کد: {item.productCode}
                      </span>
                    )}
                    {item.model && (
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-medium">
                        مدل: {item.model}
                      </span>
                    )}
                    {item.usageLocation && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        محل: {item.usageLocation}
                      </span>
                    )}
                    {item.source && (
                      <span className="text-slate-400 dark:text-slate-500 text-[9px] mr-auto">
                        منبع: {item.source}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer tip */}
          <div className="px-3 py-1 bg-slate-50/80 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 select-none">
            <span>
              با کلیدهای <kbd className="px-1 bg-white dark:bg-slate-700 rounded border text-[9px]">↑</kbd> <kbd className="px-1 bg-white dark:bg-slate-700 rounded border text-[9px]">↓</kbd> و <kbd className="px-1 bg-white dark:bg-slate-700 rounded border text-[9px]">Enter</kbd> انتخاب کنید
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-medium">
              <Check className="w-3 h-3" /> تکمیل خودکار ستون‌ها
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

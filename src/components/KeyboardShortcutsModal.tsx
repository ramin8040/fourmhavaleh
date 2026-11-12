import React from 'react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'عمومی' | 'مدیریت اسناد' | 'بوم و چاپ';
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['Ctrl', 'S'], description: 'ثبت سند فعلی در بایگانی (Save Record)', category: 'مدیریت اسناد' },
  { keys: ['Ctrl', 'P'], description: 'پیش‌نمایش و چاپ فوری سند (Print)', category: 'بوم و چاپ' },
  { keys: ['Ctrl', 'N'], description: 'صدور سند جدید با ردیف‌های خالی (New Voucher)', category: 'مدیریت اسناد' },
  { keys: ['Ctrl', 'B'], description: 'ورود به بایگانی اسناد و گزارش‌ها', category: 'مدیریت اسناد' },
  { keys: ['Ctrl', 'T'], description: 'پنجره مدیریت و انتخاب قالب‌ها', category: 'عمومی' },
  { keys: ['Ctrl', 'I'], description: 'تبدیل هوشمند تصویر فرم به قالب (AI OCR)', category: 'عمومی' },
  { keys: ['Ctrl', 'M'], description: 'تغییر بین حالت صدور/تکمیل و حالت ویرایش طراحی', category: 'عمومی' },
  { keys: ['Ctrl', '+'], description: 'بزرگ‌نمایی بوم سند (Zoom In)', category: 'بوم و چاپ' },
  { keys: ['Ctrl', '-'], description: 'کوچک‌نمایی بوم سند (Zoom Out)', category: 'بوم و چاپ' },
  { keys: ['Ctrl', '0'], description: 'بازنشانی بزرگ‌نمایی به ۱۰۰٪', category: 'بوم و چاپ' },
  { keys: ['F1'], description: 'نمایش همین پنجره راهنمای کلیدهای میانبر', category: 'عمومی' },
  { keys: ['Esc'], description: 'بستن پنجره‌ها و تقویم شمسی', category: 'عمومی' },
];

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const categories: Array<'مدیریت اسناد' | 'بوم و چاپ' | 'عمومی'> = [
    'مدیریت اسناد',
    'بوم و چاپ',
    'عمومی',
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#1f2430] w-full max-w-2xl rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-slate-800/80 dark:to-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                کلیدهای میانبر نرم‌افزار
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                تسریع در ثبت اسناد، صدور حواله، پرینت و ناوبری با صفحه‌کلید
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {categories.map((cat) => {
            const items = SHORTCUTS.filter((s) => s.category === cat);
            return (
              <div key={cat} className="space-y-2">
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1.5 pb-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                  {cat}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200/60 dark:border-gray-700/60 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                    >
                      <span className="text-xs text-gray-700 dark:text-gray-300">
                        {item.description}
                      </span>
                      <div className="flex items-center gap-1 ltr" dir="ltr">
                        {item.keys.map((k, kIdx) => (
                          <React.Fragment key={kIdx}>
                            <kbd className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded border border-gray-300 dark:border-gray-600 shadow-sm">
                              {k}
                            </kbd>
                            {kIdx < item.keys.length - 1 && (
                              <span className="text-[10px] text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Quick Tip Banner */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 flex items-start gap-3">
            <span className="text-base text-amber-600 dark:text-amber-400 mt-0.5">💡</span>
            <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <p className="font-semibold mb-0.5">قابلیت ذخیره‌سازی خودکار (Auto-Save):</p>
              <p>
                کلیه داده‌های فرم هر ۱۰ ثانیه به صورت خودکار در حافظه مرورگر ذخیره می‌شوند تا در صورت قطعی برق یا بستن ناگهانی تب، زحمات شما از دست نرود. با انتخاب هر تاریخ در تقویم شمسی نیز ذخیره آنی انجام می‌شود.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            با زدن کلید <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-[10px]">Esc</kbd> می‌توانید پنجره را ببندید
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-medium rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            متوجه شدم
          </button>
        </div>
      </div>
    </div>
  );
};

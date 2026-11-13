import React from 'react';
import {
  Type,
  AlignLeft,
  Hash,
  Coins,
  Calendar,
  ListFilter,
  CheckSquare,
  Table as TableIcon,
  PenTool,
  QrCode,
  Building2,
  Minus,
  Plus,
  X
} from 'lucide-react';
import { FieldType } from '../types/form';

interface ElementToolboxProps {
  onAddField: (type: FieldType) => void;
  disabled?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface ToolItem {
  type: FieldType;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'اقلام و کاردکس انبار' | 'سربرگ و هویت سند' | 'اطلاعات سند و تحویل' | 'تأییدات و رهگیری';
}

export const ElementToolbox: React.FC<ElementToolboxProps> = ({
  onAddField,
  disabled,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const tools: ToolItem[] = [
    {
      type: 'table',
      title: 'جدول اقلام و کالاها',
      description: 'کد کالا، شرح، تعداد، واحد، سریال و محل مصرف',
      icon: <TableIcon className="w-4 h-4 text-blue-700" />,
      category: 'اقلام و کاردکس انبار',
    },
    {
      type: 'header_banner',
      title: 'سربرگ رسمی حواله / رسید',
      description: 'سربرگ سه بخشی با لوگو، کد سند و تاریخ',
      icon: <Building2 className="w-4 h-4 text-blue-800" />,
      category: 'سربرگ و هویت سند',
    },
    {
      type: 'shamsi_date',
      title: 'تاریخ صدور حواله (شمسی)',
      description: 'تاریخ رسمی خروج یا تحویل به انبار',
      icon: <Calendar className="w-4 h-4 text-amber-600" />,
      category: 'اطلاعات سند و تحویل',
    },
    {
      type: 'text',
      title: 'شماره سند / حواله / عطف',
      description: 'شماره ثبت، بارنامه یا نام تحویل‌گیرنده',
      icon: <Type className="w-4 h-4 text-blue-600" />,
      category: 'اطلاعات سند و تحویل',
    },
    {
      type: 'select',
      title: 'واحد درخواست‌کننده / محل مصرف',
      description: 'واحد اداری، تاسیسات، خط تولید، تدارکات',
      icon: <ListFilter className="w-4 h-4 text-purple-600" />,
      category: 'اطلاعات سند و تحویل',
    },
    {
      type: 'number',
      title: 'تعداد و شمارنده اقلام',
      description: 'شمارش دقیق اقلام فیزیکی و کاردکس',
      icon: <Hash className="w-4 h-4 text-cyan-600" />,
      category: 'اطلاعات سند و تحویل',
    },
    {
      type: 'currency',
      title: 'مبلغ ارزش کالا (ریال)',
      description: 'ارزش‌گذاری ریالی اقلام، فی و قیمت کل',
      icon: <Coins className="w-4 h-4 text-emerald-600" />,
      category: 'اطلاعات سند و تحویل',
    },
    {
      type: 'signature',
      title: 'تأییدات و امضاهای انبارداری',
      description: '۵ مرحله: انبار، مالی، کارخانه، نگهبانی، تحویل',
      icon: <PenTool className="w-4 h-4 text-rose-600" />,
      category: 'تأییدات و رهگیری',
    },
    {
      type: 'qrcode',
      title: 'بارکد QR رهگیری انبار',
      description: 'کد اصالت، پلاک کالا و استعلام بارکدخوان',
      icon: <QrCode className="w-4 h-4 text-slate-700" />,
      category: 'تأییدات و رهگیری',
    },
    {
      type: 'textarea',
      title: 'توضیحات انبار و دستور ترخیص',
      description: 'شرح عیوب، شرایط تحویل، آدرس یا ملاحظات',
      icon: <AlignLeft className="w-4 h-4 text-indigo-600" />,
      category: 'تأییدات و رهگیری',
    },
    {
      type: 'checkbox',
      title: 'چک‌باکس کنترل کیفی / بازرسی',
      description: 'تأیید سلامت کالا و تطابق با نمونه',
      icon: <CheckSquare className="w-4 h-4 text-teal-600" />,
      category: 'تأییدات و رهگیری',
    },
    {
      type: 'divider',
      title: 'خط جداکننده بخش‌ها',
      description: 'تفکیک جدول از سربرگ یا بخش امضاها',
      icon: <Minus className="w-4 h-4 text-slate-400" />,
      category: 'سربرگ و هویت سند',
    },
  ];

  const categories = ['اقلام و کاردکس انبار', 'سربرگ و هویت سند', 'اطلاعات سند و تحویل', 'تأییدات و رهگیری'] as const;

  return (
    <aside
      className={`fixed inset-y-0 right-0 z-40 w-72 max-w-[85vw] lg:w-64 lg:static lg:z-auto liquid-glass-elevated border-l border-white/60 dark:border-white/10 flex flex-col shrink-0 select-none overflow-y-auto shadow-2xl lg:shadow-none transition-transform duration-200 lg:translate-x-0 lg:pointer-events-auto ${
        isMobileOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
      }`}
    >
      <div className="p-3.5 border-b border-slate-300/40 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 flex items-center justify-between gap-2 sticky top-0 z-10 backdrop-blur-md">
        <div>
          <h2 className="text-xs font-bold text-slate-900 dark:text-white">
            ابزارهای صفحه
          </h2>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            برای اضافه شدن به برگه کلیک کنید
          </span>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="بستن پنل ابزارها"
            className="lg:hidden p-1.5 rounded-xl text-slate-500 hover:bg-white/75 dark:hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-2.5 space-y-4">
        {categories.map((cat) => {
          const items = tools.filter((t) => t.category === cat);
          return (
            <div key={cat} className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">
                {cat}
              </span>
              <div className="space-y-1.5">
                {items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => onAddField(item.type)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl liquid-glass-well hover:border-sky-400/60 hover:bg-white/85 dark:hover:bg-slate-800/75 text-right transition-all group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    title={`افزودن ${item.title}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-white/10 transition-colors">
                        {item.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-sky-700 dark:group-hover:text-sky-300 truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-sky-700 dark:group-hover:text-sky-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

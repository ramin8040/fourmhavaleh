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
  Plus
} from 'lucide-react';
import { FieldType } from '../types/form';

interface ElementToolboxProps {
  onAddField: (type: FieldType) => void;
  disabled?: boolean;
}

interface ToolItem {
  type: FieldType;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'اقلام و کاردکس انبار' | 'سربرگ و هویت سند' | 'اطلاعات سند و تحویل' | 'تأییدات و رهگیری';
}

export const ElementToolbox: React.FC<ElementToolboxProps> = ({ onAddField, disabled }) => {
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
    <aside className="w-64 bg-[#fbfbfc] dark:bg-[#202020] border-l border-[#d1d5db] dark:border-[#2d2d2d] flex flex-col shrink-0 select-none overflow-y-auto transition-colors">
      <div className="p-3 border-b border-[#e5e7eb] dark:border-[#2d2d2d] bg-[#f3f4f6] dark:bg-[#1a1a1a]">
        <h2 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
          <span>ابزارهای صدور حواله و رسید</span>
          <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">کلیک برای درج</span>
        </h2>
      </div>

      <div className="p-2 space-y-4">
        {categories.map((cat) => {
          const items = tools.filter((t) => t.category === cat);
          return (
            <div key={cat} className="space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-1">{cat}</span>
              <div className="space-y-1">
                {items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => onAddField(item.type)}
                    disabled={disabled}
                    className="w-full flex items-center justify-between p-2 rounded-md bg-white dark:bg-[#282828] border border-slate-200 dark:border-[#383838] hover:border-[#0067C0] dark:hover:border-[#4cc2ff] hover:bg-blue-50/40 dark:hover:bg-[#323232] text-right transition-all group shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
                    title={`افزودن ${item.title}`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 rounded bg-slate-50 dark:bg-[#202020] border border-slate-100 dark:border-[#333333] group-hover:bg-white dark:group-hover:bg-[#2c2c2c] group-hover:border-blue-200 dark:group-hover:border-[#4cc2ff]/40 transition-colors">
                        {item.icon}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200 group-hover:text-[#0067C0] dark:group-hover:text-[#4cc2ff] truncate">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-[#0067C0] dark:group-hover:text-[#4cc2ff] shrink-0" />
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

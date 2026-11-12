import React, { useState } from 'react';
import { 
  FormTemplate, 
  PaperSize, 
  PageOrientation 
} from '../types/form';
import { 
  LayoutDashboard, 
  X, 
  FilePlus, 
  FileSpreadsheet, 
  UserCheck, 
  Receipt, 
  Check, 
  Layers,
  Truck,
  Wrench,
  ClipboardList,
  Edit,
  Trash2,
  Copy,
  Search,
  RotateCcw,
  PlusCircle,
  Eye,
  PenTool,
  Sparkles
} from 'lucide-react';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  templates: FormTemplate[];
  activeTemplateId: string;
  onSelectTemplate: (template: FormTemplate, mode?: 'fill' | 'design') => void;
  onUpdateTemplate: (template: FormTemplate) => void;
  onDeleteTemplate: (templateId: string) => void;
  onDuplicateTemplate: (template: FormTemplate) => void;
  onCreateNewTemplate: () => void;
  onResetDefaults: () => void;
  onOpenImageToForm?: () => void;
}

export const TemplatesModal: React.FC<TemplatesModalProps> = ({
  isOpen,
  onClose,
  templates,
  activeTemplateId,
  onSelectTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onDuplicateTemplate,
  onCreateNewTemplate,
  onResetDefaults,
  onOpenImageToForm,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'همه قالب‌ها' },
    { id: 'انبار و لجستیک', label: 'انبار و لجستیک' },
    { id: 'فنی و مهندسی', label: 'فنی و مهندسی' },
    { id: 'اداری و تدارکات', label: 'اداری و تدارکات' },
    { id: 'مالی و فروش', label: 'مالی و فروش' },
    { id: 'سفارشی', label: 'سفارشی' },
  ];

  const filteredTemplates = templates.filter((tpl) => {
    if (selectedCategory !== 'all' && tpl.category !== selectedCategory) {
      return false;
    }
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tpl.title.toLowerCase().includes(q) ||
      (tpl.description || '').toLowerCase().includes(q) ||
      (tpl.category || '').toLowerCase().includes(q)
    );
  });

  const getTemplateIcon = (cat: string) => {
    switch (cat) {
      case 'انبار و لجستیک':
        return <Truck className="w-4 h-4 text-indigo-700 dark:text-indigo-400" />;
      case 'فنی و مهندسی':
        return <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'اداری و تدارکات':
        return <ClipboardList className="w-4 h-4 text-teal-600 dark:text-teal-400" />;
      case 'مالی و فروش':
        return <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'منابع انسانی':
        return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'مالی و انبار':
        return <Receipt className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      default:
        return <FilePlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const handleSaveMetadata = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;
    onUpdateTemplate(editingTemplate);
    setEditingTemplate(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-[#202020] rounded-lg shadow-2xl border border-slate-300 dark:border-[#383838] w-full max-w-4xl max-h-[90vh] overflow-hidden text-slate-800 dark:text-slate-100 flex flex-col transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#2d2d2d] bg-[#f9fafb] dark:bg-[#1a1a1a]">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-7 h-7 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0067C0] dark:text-[#4cc2ff] flex items-center justify-center border border-blue-200 dark:border-blue-800">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <div>
              <span className="text-slate-900 dark:text-slate-100 font-bold">مدیریت و انتخاب قالب‌های فرم</span>
              <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 mr-2">
                (امکان انتخاب، ویرایش کامل ساختار، تغییر مشخصات و حذف قالب‌ها)
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Toolbar: Search, Category Filters, New Template Button */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#2d2d2d] bg-slate-50 dark:bg-[#1f1f1f] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Search box */}
          <div className="relative min-w-[240px] flex-1 max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام فرم، توضیحات یا دسته‌بندی..."
              className="w-full pr-8 pl-3 py-1.5 bg-white dark:bg-[#2b2b2b] border border-slate-300 dark:border-[#404040] rounded text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-2.5 top-2.5" />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onOpenImageToForm && (
              <button
                onClick={() => {
                  onClose();
                  onOpenImageToForm();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded shadow-xs transition-colors"
                title="بارگذاری تصویر حواله یا رسید و تبدیل خودکار به قالب با هوش مصنوعی"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>تبدیل عکس به قالب (هوش مصنوعی)</span>
              </button>
            )}

            <button
              onClick={() => {
                onCreateNewTemplate();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-[#2b2b2b] hover:bg-slate-100 dark:hover:bg-[#333] text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-[#444] text-xs font-medium rounded shadow-xs transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5 text-blue-600 dark:text-[#4cc2ff]" />
              <span>ایجاد بوم سفید جدید</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 px-5 py-2 border-b border-slate-200 dark:border-[#2d2d2d] bg-white dark:bg-[#202020] overflow-x-auto text-xs">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-md text-[11px] transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-blue-50 dark:bg-blue-950/60 text-[#0067C0] dark:text-[#4cc2ff] font-bold border border-blue-200 dark:border-blue-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Template Cards Grid */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3 bg-[#f8fafc] dark:bg-[#18181a]">
          {filteredTemplates.length === 0 ? (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500">
              <LayoutDashboard className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">قالبی با این مشخصات یافت نشد</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">می‌توانید عبارت جستجو را پاک کنید یا یک قالب جدید بسازید.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredTemplates.map((tpl) => {
                const isSelected = tpl.id === activeTemplateId;

                return (
                  <div
                    key={tpl.id}
                    className={`p-4 rounded-lg border text-right transition-all relative flex flex-col justify-between bg-white dark:bg-[#252525] shadow-2xs ${
                      isSelected
                        ? 'border-[#0067C0] dark:border-[#4cc2ff] ring-2 ring-[#0067C0]/30 dark:ring-[#4cc2ff]/30'
                        : 'border-slate-200 dark:border-[#383838] hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      {/* Top Bar inside card */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded bg-slate-100 dark:bg-[#2d2d2d] border border-slate-200 dark:border-slate-700">
                            {getTemplateIcon(tpl.category)}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                            {tpl.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#2d2d2d] px-2 py-0.5 rounded font-mono border border-slate-200 dark:border-slate-700">
                            {tpl.paperSize} · {tpl.orientation === 'portrait' ? 'عمودی' : 'افقی'}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-semibold text-[#0067C0] dark:text-[#4cc2ff] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              فعال
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-1 flex items-center gap-1.5">
                        <span>{tpl.title}</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {tpl.description || 'بدون توضیحات تکمیلی'}
                      </p>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        شامل {tpl.fields.length} بخش و المان استاندارد
                      </div>
                    </div>

                    {/* Action Buttons for Template */}
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
                      {/* Primary Actions: Fill vs Design */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onSelectTemplate(tpl, 'fill');
                            onClose();
                          }}
                          className="px-2.5 py-1 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          title="باز کردن فرم در حالت ورود اطلاعات و چاپ"
                        >
                          <Eye className="w-3 h-3" />
                          <span>تکمیل و چاپ</span>
                        </button>

                        <button
                          onClick={() => {
                            onSelectTemplate(tpl, 'design');
                            onClose();
                          }}
                          className="px-2 py-1 bg-slate-100 dark:bg-[#333333] hover:bg-slate-200 dark:hover:bg-[#3d3d3d] text-slate-700 dark:text-slate-200 rounded text-[11px] font-medium transition-colors flex items-center gap-1"
                          title="ویرایش ساختار، المان‌ها و جدول این فرم در بوم طراحی"
                        >
                          <PenTool className="w-3 h-3 text-[#0067C0] dark:text-[#4cc2ff]" />
                          <span>ویرایش در بوم</span>
                        </button>
                      </div>

                      {/* Management Actions: Edit Info, Duplicate, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate({ ...tpl });
                          }}
                          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors"
                          title="ویرایش مشخصات، نام و ابعاد قالب"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateTemplate(tpl);
                          }}
                          className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#333333] transition-colors"
                          title="ایجاد نسخه کپی از این قالب"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (templates.length <= 1) {
                              alert('حداقل یک قالب باید در سیستم باقی بماند.');
                              return;
                            }
                            if (confirm(`آیا از حذف قالب «${tpl.title}» اطمینان دارید؟`)) {
                              onDeleteTemplate(tpl.id);
                            }
                          }}
                          className="p-1 rounded text-red-500 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                          title="حذف این قالب از سیستم"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer with Reset to Defaults and Close */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-[#2d2d2d] bg-[#f9fafb] dark:bg-[#1a1a1a] text-xs">
          <button
            onClick={() => {
              if (confirm('آیا مایلید تمام قالب‌ها به فهرست پیش‌فرض اولیه (شامل تمام فرم‌های رسمی آیریا ونداد کسری) بازنشانی شوند؟')) {
                onResetDefaults();
              }
            }}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors px-2 py-1 rounded hover:bg-slate-200/60 dark:hover:bg-[#2b2b2b]"
            title="بازنشانی تمام قالب‌های سیستم به حالت کارخانه"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>بازنشانی به قالب‌های پیش‌فرض کارخانه</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] text-slate-700 dark:text-slate-300 font-medium transition-colors"
          >
            بستن
          </button>
        </div>
      </div>

      {/* Inline Modal: Edit Template Metadata */}
      {editingTemplate && (
        <div className="fixed inset-0 z-60 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#222222] rounded-lg shadow-2xl border border-slate-300 dark:border-[#383838] w-full max-w-md overflow-hidden text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-[#2d2d2d] bg-slate-50 dark:bg-[#1a1a1a]">
              <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5 text-[#0067C0] dark:text-[#4cc2ff]" />
                <span>ویرایش مشخصات و تنظیمات قالب</span>
              </h4>
              <button
                onClick={() => setEditingTemplate(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMetadata} className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  عنوان فرم:
                </label>
                <input
                  type="text"
                  required
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-[#404040] dark:bg-[#2b2b2b] dark:text-slate-100 rounded text-xs outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  دسته‌بندی:
                </label>
                <select
                  value={editingTemplate.category}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-[#404040] dark:bg-[#2b2b2b] dark:text-slate-100 rounded text-xs outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                >
                  <option value="انبار و لجستیک">انبار و لجستیک</option>
                  <option value="فنی و مهندسی">فنی و مهندسی</option>
                  <option value="اداری و تدارکات">اداری و تدارکات</option>
                  <option value="مالی و فروش">مالی و فروش</option>
                  <option value="سفارشی">سفارشی</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  توضیحات فرم:
                </label>
                <textarea
                  rows={2}
                  value={editingTemplate.description}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-[#404040] dark:bg-[#2b2b2b] dark:text-slate-100 rounded text-xs outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    اندازه کاغذ:
                  </label>
                  <select
                    value={editingTemplate.paperSize}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, paperSize: e.target.value as PaperSize })}
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-[#404040] dark:bg-[#2b2b2b] dark:text-slate-100 rounded text-xs outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="Letter">Letter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    جهت صفحه:
                  </label>
                  <select
                    value={editingTemplate.orientation}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, orientation: e.target.value as PageOrientation })}
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-[#404040] dark:bg-[#2b2b2b] dark:text-slate-100 rounded text-xs outline-none focus:border-[#0067C0] dark:focus:border-[#4cc2ff]"
                  >
                    <option value="portrait">عمودی (Portrait)</option>
                    <option value="landscape">افقی (Landscape)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setEditingTemplate(null)}
                  className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#2b2b2b] text-xs"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0067C0] hover:bg-[#005a9e] dark:bg-[#0078D4] dark:hover:bg-[#006cbd] text-white rounded text-xs font-medium shadow-xs"
                >
                  ذخیره تغییرات مشخصات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

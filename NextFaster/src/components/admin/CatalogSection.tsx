'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Tag, Layers } from 'lucide-react';
import { CatalogCategory } from '@/types/store';

interface CatalogSectionProps {
  storeSlug: string;
  catalog: CatalogCategory[];
  onCatalogChange: (updated: CatalogCategory[]) => void;
  locale: string;
  isRTL: boolean;
}

export default function CatalogSection({
  storeSlug,
  catalog,
  onCatalogChange,
  locale,
  isRTL,
}: CatalogSectionProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
  const [showCategoryInput, setShowCategoryInput] = useState(false);

  const [newSubName, setNewSubName] = useState('');
  const [addingSubFor, setAddingSubFor] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const isAr = locale === 'ar';

  const toggleExpand = (id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'category', name: newCategoryName.trim() }),
      });
      if (!res.ok) throw new Error('Failed');
      const { category } = await res.json();
      onCatalogChange([...catalog, { ...category, subcategories: [] }]);
      setNewCategoryName('');
      setShowCategoryInput(false);
    } catch {
      alert(isAr ? 'فشل إضافة الفئة' : 'Failed to add category');
    } finally {
      setAddingCategory(false);
    }
  };

  const addSubcategory = async (parentId: number) => {
    if (!newSubName.trim()) return;
    setAddingSubFor(parentId);
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/catalog`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'subcategory', name: newSubName.trim(), parentId }),
      });
      if (!res.ok) throw new Error('Failed');
      const { subcategory } = await res.json();
      onCatalogChange(
        catalog.map((cat) =>
          cat.id === parentId
            ? { ...cat, subcategories: [...cat.subcategories, subcategory] }
            : cat,
        ),
      );
      setNewSubName('');
      setAddingSubFor(null);
    } catch {
      alert(isAr ? 'فشل إضافة الفئة الفرعية' : 'Failed to add subcategory');
    }
  };

  const deleteCategory = async (id: number) => {
    if (!confirm(isAr ? 'حذف هذه الفئة وكل محتوياتها؟' : 'Delete this category and all its contents?')) return;
    try {
      await fetch(`/api/seller/store/${storeSlug}/catalog?type=category&id=${id}`, { method: 'DELETE' });
      onCatalogChange(catalog.filter((c) => c.id !== id));
    } catch {
      alert(isAr ? 'فشل الحذف' : 'Delete failed');
    }
  };

  const deleteSubcategory = async (categoryId: number, subSlug: string) => {
    try {
      await fetch(`/api/seller/store/${storeSlug}/catalog?type=subcategory&slug=${subSlug}`, { method: 'DELETE' });
      onCatalogChange(
        catalog.map((cat) =>
          cat.id === categoryId
            ? { ...cat, subcategories: cat.subcategories.filter((s) => s.slug !== subSlug) }
            : cat,
        ),
      );
    } catch {
      alert(isAr ? 'فشل الحذف' : 'Delete failed');
    }
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 sm:p-7 shadow-sm">
      {/* Header */}
      <div className={`mb-5 flex flex-wrap items-start justify-between gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className={`min-w-0 ${isRTL ? 'text-right' : ''}`}>
          <h2 className="text-xl font-black text-neutral-900">
            {isAr ? 'الفئات والتصنيفات' : 'Categories & Subcategories'}
          </h2>
          <p className="mt-1 text-sm font-medium text-neutral-500">
            {isAr
              ? 'نظّم منتجاتك في فئات وفئات فرعية'
              : 'Organize your products into categories and subcategories'}
          </p>
          <p className="mt-2 text-xs font-bold text-emerald-600/80 bg-emerald-50 inline-block px-3 py-1.5 rounded-lg">
            {isAr
              ? ' الهيكل: مجموعة ← فئة ← مجموعة فرعية ← فئة فرعية ← منتجات'
              : ' Structure: Collection → Category → Subcollection → Subcategory → Products'}
          </p>
        </div>
        <button
          onClick={() => setShowCategoryInput((v) => !v)}
          className={`shrink-0 flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-md shadow-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <Plus className="h-4 w-4" />
          {isAr ? 'فئة جديدة' : 'New Category'}
        </button>
      </div>

      {/* Examples hint */}
      <div 
        className={`mb-6 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3.5 text-xs font-medium text-neutral-500 shadow-sm ${isRTL ? 'text-right' : ''}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <span className="font-black text-neutral-700">{isAr ? 'مثال: ' : 'Example: '}</span>
        {isAr
          ? 'فئة: "برجر" ← فئة فرعية: "برجر دجاج" أو "برجر لحم"'
          : 'Category: "Burgers" ← Subcategory: "Chicken Burgers" or "Beef Burgers"'}
      </div>

      {/* New category input */}
      {showCategoryInput && (
        <div className={`mb-6 flex flex-col gap-2 sm:flex-row p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 shadow-inner ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
          <input
            autoFocus
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
            placeholder={isAr ? 'مثال: برجر، مشروبات، إلكترونيات...' : 'e.g. Burgers, Drinks, Electronics...'}
            dir={isRTL ? 'rtl' : 'ltr'}
            className="flex-1 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all"
          />
          <div className={`flex gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <button
              onClick={addCategory}
              disabled={addingCategory || !newCategoryName.trim()}
              className="flex-1 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white transition-all hover:bg-emerald-700 disabled:opacity-50 sm:flex-none shadow-md shadow-emerald-600/20 active:scale-[0.98]"
            >
              {addingCategory ? '...' : isAr ? 'إضافة' : 'Add'}
            </button>
            <button
              onClick={() => { setShowCategoryInput(false); setNewCategoryName(''); }}
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-600 transition-all hover:bg-neutral-50 hover:text-red-500"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {catalog.length === 0 && (
        <div className="py-12 text-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50">
          <Layers className="mx-auto h-12 w-12 text-neutral-300/70" />
          <p className="mt-4 text-sm font-black text-neutral-600">
            {isAr ? 'لا توجد فئات بعد' : 'No categories yet'}
          </p>
          <p className="mt-1 text-xs font-medium text-neutral-400">
            {isAr ? 'أضف فئة للبدء في تنظيم منتجاتك' : 'Add a category to start organizing your products'}
          </p>
        </div>
      )}

      {/* Category list */}
      <div className="space-y-4">
        {catalog.map((cat) => {
          const isExpanded = expandedCategories.has(cat.id);
          return (
            <div key={cat.id} className="rounded-2xl border border-neutral-100 bg-white overflow-hidden shadow-sm transition-all hover:border-neutral-200">
              {/* Category row */}
              <div className={`flex items-center justify-between bg-neutral-50/80 px-5 py-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className={`flex flex-1 items-center gap-3 text-left ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  {isExpanded
                    ? <ChevronDown className="h-5 w-5 shrink-0 text-emerald-500 transition-transform" />
                    : <ChevronRight className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${isRTL ? 'rotate-180' : ''}`} />}
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-neutral-100 shadow-sm">
                    <Tag className="h-4 w-4 shrink-0 text-neutral-500" />
                  </span>
                  <span className="font-black text-neutral-900 text-sm">{cat.name}</span>
                  <span className="text-xs font-bold text-neutral-400 bg-white border border-neutral-100 px-2 py-0.5 rounded-full">
                    {cat.subcategories.length}
                  </span>
                </button>
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="ml-2 rounded-xl bg-white border border-neutral-100 p-2 text-neutral-400 transition-all hover:bg-red-50 hover:text-red-500 hover:border-red-100 shadow-sm"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Subcategories */}
              {isExpanded && (
                <div className="px-5 py-4 border-t border-neutral-100 bg-white">
                  {/* Subcategory chips */}
                  <div className="mb-4 flex flex-wrap gap-2.5">
                    {cat.subcategories.map((sub) => (
                      <span
                        key={sub.slug}
                        className="group flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm"
                      >
                        {sub.name}
                        <button
                          onClick={() => deleteSubcategory(cat.id, sub.slug)}
                          className="text-emerald-300 transition-colors hover:text-red-500"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                    {cat.subcategories.length === 0 && (
                      <p className="text-xs font-medium text-neutral-400 italic bg-neutral-50 px-3 py-1.5 rounded-lg border border-neutral-100/50">
                        {isAr ? 'لا توجد فئات فرعية — أضف واحدة أدناه' : 'No subcategories yet — add one below'}
                      </p>
                    )}
                  </div>

                  {/* Add subcategory input */}
                  <div className={`flex flex-col gap-2 sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                    <input
                      type="text"
                      value={addingSubFor === cat.id ? newSubName : ''}
                      onFocus={() => setAddingSubFor(cat.id)}
                      onChange={(e) => setNewSubName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addSubcategory(cat.id)}
                      placeholder={isAr ? 'مثال: برجر دجاج، مشروبات ساخنة...' : 'e.g. Chicken Burgers, Hot Drinks...'}
                      dir={isRTL ? 'rtl' : 'ltr'}
                      className="flex-1 rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:bg-white transition-all"
                    />
                    <button
                      onClick={() => addSubcategory(cat.id)}
                      disabled={!newSubName.trim() || addingSubFor !== cat.id}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 transition-all hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 disabled:opacity-40 shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {isAr ? 'إضافة' : 'Add'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, AlertCircle, ChevronDown, Loader2 } from 'lucide-react';
import { Product, CatalogCategory } from '@/types/store';
import ProductForm from './ProductForm';
import ProductCard from './ProductCard';

interface ProductsSectionProps {
  storeSlug: string;
  storeId: number;
  catalog: CatalogCategory[];
  locale: string;
  isRTL: boolean;
}

export default function ProductsSection({
  storeSlug,
  storeId,
  catalog,
  locale,
  isRTL,
}: ProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [showInactive, setShowInactive] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const isAr = locale === 'ar';

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/seller/store/${storeSlug}/products`);
        if (!res.ok) throw new Error('Failed to load products');
        const { products: prods } = await res.json();
        setProducts(prods || []);
      } catch (err) {
        setError(isAr ? 'فشل تحميل المنتجات' : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [storeSlug, isAr]);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedSubcategory || p.subcategory_slug === selectedSubcategory;
    const matchesActive = showInactive || p.isActive === 1;
    return matchesSearch && matchesCategory && matchesActive;
  });

  // Get all subcategories for filter
  const allSubcategories = catalog.flatMap((cat) =>
    cat.subcategories.map((sub) => ({ ...sub, categoryName: cat.name }))
  );

  const handleAddProduct = async (values: any) => {
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to add product');
      const { product } = await res.json();
      setProducts([...products, product]);
      setShowForm(false);
    } catch (err) {
      alert(isAr ? 'فشل إضافة المنتج' : 'Failed to add product');
    }
  };

  const handleUpdateProduct = async (values: any) => {
    if (!editingProduct) return;
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/products/${editingProduct.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const { product } = await res.json();
      setProducts(products.map((p) => (p.slug === editingProduct.slug ? product : p)));
      setEditingProduct(null);
    } catch (err) {
      alert(isAr ? 'فشل تحديث المنتج' : 'Failed to update product');
    }
  };

  const handleDeleteProduct = async (slug: string) => {
    if (!confirm(isAr ? 'حذف هذا المنتج؟' : 'Delete this product?')) return;
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/products/${slug}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete product');
      setProducts(products.filter((p) => p.slug !== slug));
    } catch (err) {
      alert(isAr ? 'فشل حذف المنتج' : 'Failed to delete product');
    }
  };

  if (showForm || editingProduct) {
    return (
      <ProductForm
        storeSlug={storeSlug}
        storeId={storeId}
        subcategories={allSubcategories}
        product={editingProduct}
        onSave={editingProduct ? handleUpdateProduct : handleAddProduct}
        onCancel={() => {
          setShowForm(false);
          setEditingProduct(null);
        }}
        locale={locale}
        isRTL={isRTL}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm transition-all overflow-hidden hover:border-neutral-200">
      {/* Header with collapse button */}
      <div
        className={`flex items-center justify-between p-5 sm:p-7 cursor-pointer hover:bg-neutral-50/50 transition-colors ${
          isRTL ? 'flex-row-reverse' : ''
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100/80 shadow-inner border border-neutral-200/50">
            <ChevronDown
              className={`h-5 w-5 text-neutral-600 transition-transform ${
                isExpanded ? '' : isRTL ? 'rotate-180' : '-rotate-90'
              }`}
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-neutral-900">
              {isAr ? 'المنتجات' : 'Products'}
            </h2>
            <p className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
              {isAr ? `${filteredProducts.length} منتج` : `${filteredProducts.length} products`}
            </p>
          </div>
        </div>
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowForm(true);
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-md shadow-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'منتج جديد' : 'New Product'}
          </button>
        )}
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="p-5 sm:p-7 border-t border-neutral-100 bg-neutral-50/30">
          {/* Filters */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 ${isRTL ? 'right-4' : 'left-4'}`} />
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
          />
        </div>

        <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {/* Category filter */}
          <CustomSelect
            value={selectedSubcategory}
            onChange={(val) => setSelectedSubcategory(val)}
            options={allSubcategories.map((sub) => ({
              value: sub.slug,
              label: `${sub.categoryName} - ${sub.name}`
            }))}
            placeholder={isAr ? 'جميع الفئات' : 'All Categories'}
            isRTL={isRTL}
          />

            {/* Show inactive toggle */}
            <label className="flex shrink-0 items-center gap-2 text-sm font-bold text-neutral-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-emerald-500 focus:ring-emerald-500"
              />
              {isAr ? 'عرض المخفي' : 'Inactive'}
            </label>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-bold text-red-700">{error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
          </div>
        )}

        {/* Empty state */}
        {!loading && filteredProducts.length === 0 && (
          <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-200 bg-white">
            <ImageIcon className="mx-auto h-12 w-12 text-neutral-200" />
            <p className="mt-4 text-sm font-black text-neutral-600">
              {isAr ? 'لا توجد منتجات' : 'No products'}
            </p>
            <p className="mt-1 text-xs font-medium text-neutral-400">
              {isAr ? 'قم بإضافة منتجات لعرضها هنا' : 'Products you add will appear here'}
            </p>
          </div>
        )}

        {/* Products grid */}
        {!loading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => handleDeleteProduct(product.slug)}
                locale={locale}
                isRTL={isRTL}
                storeSlug={storeSlug}
              />
            ))}
          </div>
        )}
        </div>
      )}
    </div>
  );
}

// ── Custom Dropdown Component ─────────────────────────────────────
function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  isRTL
}: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  isRTL: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className={`relative flex-1 sm:flex-none min-w-[200px] ${isRTL ? 'text-right' : 'text-left'}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-700 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all hover:bg-neutral-50 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 z-50 mt-2 w-full rounded-xl border border-neutral-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2">
            <button
              onClick={() => { onChange(''); setIsOpen(false); }}
              className={`w-full block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === '' ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
            >
              {placeholder}
            </button>
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full block px-4 py-2.5 text-sm font-bold transition-colors hover:bg-emerald-50 hover:text-emerald-700 ${value === opt.value ? 'bg-emerald-50 text-emerald-700' : 'text-neutral-700'} ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

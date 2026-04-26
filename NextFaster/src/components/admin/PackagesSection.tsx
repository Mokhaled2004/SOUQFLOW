'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Save, X, ChevronDown, Search, Upload } from 'lucide-react';

interface Product {
  slug: string;
  name: string;
  price: string;
  image_url: string | null;
}

interface PackageItem {
  id?: number;
  productSlug: string;
  quantity: number;
  product?: Product;
}

interface Package {
  id: number;
  storeId: number;
  name: string;
  description: string | null;
  realPrice: string;
  offerPrice: string;
  imageUrl: string | null;
  isActive: number;
  items?: PackageItem[];
}

interface Props {
  storeSlug: string;
  storeId: number;
  locale: string;
  isRTL: boolean;
}

export default function PackagesSection({ storeSlug, storeId: initialStoreId, locale, isRTL }: Props) {
  const isAr = locale === 'ar';
  const [packages, setPackages] = useState<Package[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    realPrice: '',
    offerPrice: '',
    imageUrl: '',
    items: [] as PackageItem[],
  });

  useEffect(() => {
    fetchData();
  }, [storeSlug]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [packagesRes, productsRes] = await Promise.all([
        fetch(`/api/seller/store/${storeSlug}/packages`),
        fetch(`/api/seller/store/${storeSlug}/products`),
      ]);

      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(data.packages || []);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setAllProducts(data.products || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const calculateRealPrice = (items: PackageItem[]) => {
    return items.reduce((sum, item) => {
      const product = allProducts.find((p) => p.slug === item.productSlug);
      if (product) {
        return sum + parseFloat(product.price) * item.quantity;
      }
      return sum;
    }, 0);
  };

  const handleAddProduct = (product: Product) => {
    const existingItem = formData.items.find((i) => i.productSlug === product.slug);
    if (existingItem) {
      setFormData({
        ...formData,
        items: formData.items.map((i) =>
          i.productSlug === product.slug ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      });
    } else {
      setFormData({
        ...formData,
        items: [...formData.items, { productSlug: product.slug, quantity: 1, product }],
      });
    }
    setSearchTerm('');
    setShowProductSearch(false);
  };

  const handleRemoveProduct = (productSlug: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((i) => i.productSlug !== productSlug),
    });
  };

  const handleUpdateQuantity = (productSlug: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productSlug);
    } else {
      setFormData({
        ...formData,
        items: formData.items.map((i) =>
          i.productSlug === productSlug ? { ...i, quantity } : i,
        ),
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('imageType', 'package');
      formDataUpload.append('storeId', initialStoreId.toString());

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setFormData({ ...formData, imageUrl: data.url });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const realPrice = calculateRealPrice(formData.items);

      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `/api/seller/store/${storeSlug}/packages/${editingId}`
        : `/api/seller/store/${storeSlug}/packages`;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          realPrice: realPrice.toString(),
          items: formData.items.map((i) => ({
            productSlug: i.productSlug,
            quantity: i.quantity,
          })),
        }),
      });

      if (!res.ok) throw new Error('Failed to save package');

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', realPrice: '', offerPrice: '', imageUrl: '', items: [] });
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving package');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isAr ? 'هل أنت متأكد؟' : 'Are you sure?')) return;
    try {
      const res = await fetch(`/api/seller/store/${storeSlug}/packages/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete package');
      await fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting package');
    }
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      realPrice: pkg.realPrice,
      offerPrice: pkg.offerPrice,
      imageUrl: pkg.imageUrl || '',
      items: pkg.items || [],
    });
    setEditingId(pkg.id);
    setShowForm(true);
  };

  const filteredProducts = allProducts.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Package search filter
  const [packageSearch, setPackageSearch] = useState('');
  const filteredPackages = packages.filter((pkg) =>
    pkg.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
    (pkg.description ?? '').toLowerCase().includes(packageSearch.toLowerCase()),
  );

  const currentRealPrice = calculateRealPrice(formData.items);

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
              {isAr ? 'الحزم' : 'Packages'}
            </h2>
            <p className="mt-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block">
              {isAr ? `${filteredPackages.length} حزمة` : `${filteredPackages.length} packages`}
            </p>
          </div>
        </div>
        {isExpanded && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowForm(true);
              setEditingId(null);
              setFormData({ name: '', description: '', realPrice: '', offerPrice: '', imageUrl: '', items: [] });
            }}
            className={`flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.98] shadow-md shadow-neutral-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <Plus className="h-4 w-4" />
            {isAr ? 'حزمة جديدة' : 'New Package'}
          </button>
        )}
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <>
          {error && (
            <div
              className={`mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 ${
                isRTL ? 'flex-row-reverse' : ''
              }`}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {showForm && (
            <div className={`mx-6 mb-6 p-6 bg-emerald-50/30 rounded-2xl border border-emerald-100 ${isRTL ? 'direction-rtl' : ''}`}>
              <h3 className={`text-xl font-black mb-5 text-neutral-900 ${isRTL ? 'text-right' : ''}`}>
                {editingId ? (isAr ? 'تعديل الحزمة' : 'Edit Package') : (isAr ? 'إنشاء حزمة جديدة' : 'Create Package')}
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <input
                  type="text"
                  placeholder={isAr ? 'اسم الحزمة' : 'Package name'}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                    isRTL ? 'text-right' : ''
                  }`}
                />

                {/* Description */}
                <textarea
                  placeholder={isAr ? 'الوصف' : 'Description'}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                    isRTL ? 'text-right' : ''
                  }`}
                />

                {/* Products Section */}
                <div className="border-t pt-4">
                  <label className={`block text-sm font-semibold text-neutral-900 mb-2 ${isRTL ? 'text-right' : ''}`}>
                    {isAr ? 'المنتجات' : 'Products'}
                  </label>

                  {/* Product Search */}
                  <div className="relative mb-4">
                    <div className={`flex items-center gap-2 px-3 py-2 border border-neutral-300 rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
                      <Search className="h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder={isAr ? 'ابحث عن منتج...' : 'Search products...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setShowProductSearch(true)}
                        className={`flex-1 outline-none bg-transparent ${isRTL ? 'text-right' : ''}`}
                      />
                    </div>

                    {/* Product dropdown */}
                    {showProductSearch && searchTerm && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-300 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((product) => (
                            <button
                              key={product.slug}
                              onClick={() => handleAddProduct(product)}
                              className={`w-full px-4 py-2 text-left hover:bg-neutral-100 transition flex items-center gap-2 ${
                                isRTL ? 'flex-row-reverse text-right' : ''
                              }`}
                            >
                              <span className="font-medium">{product.name}</span>
                              <span className="text-xs text-neutral-500">{parseFloat(product.price).toFixed(2)} EGP</span>
                            </button>
                          ))
                        ) : (
                          <div className={`px-4 py-2 text-neutral-500 ${isRTL ? 'text-right' : ''}`}>
                            {isAr ? 'لا توجد منتجات' : 'No products found'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Products */}
                  {formData.items.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.items.map((item) => {
                        const product = allProducts.find((p) => p.slug === item.productSlug);
                        return (
                          <div
                            key={item.productSlug}
                            className={`flex items-center gap-3 p-3 bg-white border border-neutral-200 rounded-lg ${
                              isRTL ? 'flex-row-reverse' : ''
                            }`}
                          >
                            <div className="flex-1">
                              <p className="font-medium text-neutral-900">{product?.name}</p>
                              <p className="text-xs text-neutral-500">
                                {parseFloat(product?.price || '0').toFixed(2)} EGP × {item.quantity}
                              </p>
                            </div>
                            <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleUpdateQuantity(item.productSlug, parseInt(e.target.value))}
                                className="w-12 px-2 py-1 border border-neutral-300 rounded text-center"
                              />
                              <button
                                onClick={() => handleRemoveProduct(item.productSlug)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Prices */}
                <div className={`grid grid-cols-2 gap-4 border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <label className={`block text-xs font-semibold text-neutral-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {isAr ? 'السعر الفعلي' : 'Real Price'}
                    </label>
                    <input
                      type="number"
                      value={currentRealPrice.toFixed(2)}
                      disabled
                      className={`w-full px-3 py-2 border border-neutral-300 rounded-lg bg-neutral-100 text-neutral-600 ${
                        isRTL ? 'text-right' : ''
                      }`}
                    />
                    <p className="text-xs text-neutral-500 mt-1">
                      {isAr ? 'محسوب تلقائياً' : 'Auto-calculated'}
                    </p>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold text-neutral-700 mb-1 ${isRTL ? 'text-right' : ''}`}>
                      {isAr ? 'سعر العرض' : 'Offer Price'}
                    </label>
                    <input
                      type="number"
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                      className={`w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-bold text-neutral-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${
                        isRTL ? 'text-right' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className={`border-t pt-4 ${isRTL ? 'text-right' : ''}`}>
                  <label className="block text-xs font-semibold text-neutral-700 mb-2">
                    {isAr ? 'صورة الحزمة' : 'Package Image'}
                  </label>
                  <div className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <label className="flex items-center gap-2 px-4 py-2 bg-neutral-100 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-200 transition">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm">{isAr ? 'رفع صورة' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="hidden"
                      />
                    </label>
                    {uploadingImage && <span className="text-sm text-neutral-500">{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>}
                    {formData.imageUrl && (
                      <span className="text-sm text-green-600">{isAr ? 'تم الرفع' : 'Uploaded'}</span>
                    )}
                  </div>
                </div>

                {/* Buttons */}
                <div className={`flex gap-2 border-t pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <button
                    onClick={handleSave}
                    disabled={saving || formData.items.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                  >
                    <Save className="h-4 w-4" />
                    {isAr ? 'حفظ' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-400 transition"
                  >
                    <X className="h-4 w-4" />
                    {isAr ? 'إلغاء' : 'Cancel'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Packages Table */}
          <div className="px-6 pb-6">
            {/* Search bar */}
            <div className="mb-4 relative">
              <Search className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400 ${isRTL ? 'right-4' : 'left-4'}`} />
              <input
                type="text"
                placeholder={isAr ? 'ابحث عن حزمة...' : 'Search packages...'}
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                className={`w-full rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-bold text-neutral-900 placeholder-neutral-400 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all ${isRTL ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
              />
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto" dir={isRTL ? 'rtl' : 'ltr'}>
                <table className="w-full text-sm">
                  <thead className="bg-neutral-100 border-b">
                    <tr>
                      <th className={`px-4 py-3 font-semibold text-neutral-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'الحزمة' : 'Package'}
                      </th>
                      <th className={`px-4 py-3 font-semibold text-neutral-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'السعر الفعلي' : 'Real Price'}
                      </th>
                      <th className={`px-4 py-3 font-semibold text-neutral-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'سعر العرض' : 'Offer Price'}
                      </th>
                      <th className={`px-4 py-3 font-semibold text-neutral-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'التوفير' : 'Savings'}
                      </th>
                      <th className={`px-4 py-3 font-semibold text-neutral-900 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {isAr ? 'الإجراءات' : 'Actions'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPackages.map((pkg) => {
                      const realPrice = parseFloat(pkg.realPrice);
                      const offerPrice = parseFloat(pkg.offerPrice);
                      const savings = realPrice - offerPrice;
                      const savingsPercent = ((savings / realPrice) * 100).toFixed(0);

                      return (
                        <tr key={pkg.id} className="border-b hover:bg-neutral-50">
                          <td className={`px-4 py-3 text-neutral-900 font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{pkg.name}</td>
                          <td className={`px-4 py-3 text-neutral-600 ${isRTL ? 'text-right' : 'text-left'}`}>{realPrice.toFixed(2)} EGP</td>
                          <td className={`px-4 py-3 font-bold text-red-600 ${isRTL ? 'text-right' : 'text-left'}`}>{offerPrice.toFixed(2)} EGP</td>
                          <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <span className="rounded-full bg-green-100 px-2 py-1 text-green-700 font-semibold text-xs inline-block">
                              {savings.toFixed(2)} ({savingsPercent}%)
                            </span>
                          </td>
                          <td className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(pkg)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 transition border border-emerald-100"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                {isAr ? 'تعديل' : 'Edit'}
                              </button>
                              <button
                                onClick={() => handleDelete(pkg.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 transition border border-red-100"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                {isAr ? 'حذف' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {filteredPackages.length === 0 && !showForm && !loading && (
              <div className={`text-center py-8 text-neutral-500 ${isRTL ? 'text-right' : ''}`}>
                {packageSearch
                  ? (isAr ? 'لا توجد نتائج' : 'No results found')
                  : (isAr ? 'لا توجد حزم حتى الآن' : 'No packages yet')}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

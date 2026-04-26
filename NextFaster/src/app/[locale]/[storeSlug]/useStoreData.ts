'use client';

import { useEffect, useState, useCallback } from 'react';
import { StoreInfo, CatalogCategory, StoreProduct, StorePackage, ShippingRate } from './types';

export function useStoreData(storeSlug: string) {
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [catalog, setCatalog] = useState<CatalogCategory[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [packages, setPackages] = useState<StorePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/store/${storeSlug}`)
      .then((r) => { if (!r.ok) { setNotFound(true); setLoading(false); return null; } return r.json(); })
      .then((data) => { 
        if (!data) return; 
        setStore({ ...data.store, shippingRates: data.shippingRates || [] }); 
        setCatalog(data.catalog); 
        setLoading(false); 
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [storeSlug]);

  useEffect(() => {
    if (!store) return;
    fetch(`/api/store/${storeSlug}/packages`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setPackages(data?.packages || []))
      .catch(() => setPackages([]));
  }, [store, storeSlug]);

  const loadProducts = useCallback((subcatSlug: string) => {
    setProductsLoading(true);
    const url = subcatSlug
      ? `/api/store/${storeSlug}/products?subcategory=${subcatSlug}`
      : `/api/store/${storeSlug}/products`;
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setProducts(data.products ?? []))
      .catch((err) => { console.error('[useStoreData] loadProducts:', err); setProducts([]); })
      .finally(() => setProductsLoading(false));
  }, [storeSlug]);

  useEffect(() => { if (store) loadProducts(''); }, [store, loadProducts]);

  return { store, catalog, products, packages, loading, productsLoading, notFound, loadProducts };
}

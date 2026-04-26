export interface Store {
  id: number;
  storeName: string;
  storeDescription: string | null;
  whatsappNumber: string;
  email: string | null;
  phone: string | null;
  primaryLocation: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  businessType: string | null;
  taxId: string | null;
  isActive: number;
}

export interface ShippingRate {
  governorate: string;
  price: number;
}

export interface StoreInfoFormValues {
  storeDescription: string;
  whatsappNumber: string;
  email: string;
  primaryLocation: string;
  businessType: string;
  taxId: string;
  storeLogo: string;
  storeBanner: string;
}

export interface CatalogSubcategory {
  slug: string;
  name: string;
  subcollectionId: number;
}

export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  subcategories: CatalogSubcategory[];
}

export interface Product {
  slug: string;
  name: string;
  description: string;
  price: string;
  subcategory_slug: string;
  storeId: number;
  imageUrl: string | null;
  isActive: number;
  offerPercentage?: number;
  isOutOfStock?: number;
}

export interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  subcategorySlug: string;
  imageUrl: string;
}

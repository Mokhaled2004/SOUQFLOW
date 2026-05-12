export interface ShippingRate {
  governorate: string;
  price: string;
}

export interface StoreInfo {
  id: number;
  storeName: string;
  storeDescription: string | null;
  storeLogo: string | null;
  storeBanner: string | null;
  whatsappNumber: string;
  phone?: string;
  primaryLocation: string | null;
  shippingRates?: ShippingRate[];
}

export interface SubcategoryItem {
  slug: string;
  name: string;
  image_url: string | null;
}

export interface CatalogCategory {
  id: number;
  name: string;
  slug: string;
  subcategories: SubcategoryItem[];
}

export interface StoreProduct {
  slug: string;
  name: string;
  description: string;
  price: string;
  image_url: string | null;
  subcategory_slug: string | null;
  category_slug?: string | null;
  isActive: number;
  offerPercentage: number;
  isOutOfStock: number;
}

export interface StorePackage {
  id: number;
  name: string;
  description: string | null;
  realPrice: string;
  offerPrice: string;
  imageUrl: string | null;
  isActive: number;
  items?: {
    product: StoreProduct;
    quantity: number;
  }[];
}

// A package represented as a cart-compatible product
export function packageToCartProduct(pkg: StorePackage): StoreProduct {
  return {
    slug: `pkg_${pkg.id}`,
    name: pkg.name,
    description: pkg.description || '',
    price: pkg.offerPrice,
    image_url: pkg.imageUrl,
    subcategory_slug: null,
    category_slug: null,
    isActive: pkg.isActive,
    offerPercentage: 0, // already discounted — offer price IS the price
    isOutOfStock: 0,
  };
}

export interface CartItem {
  product: StoreProduct;
  quantity: number;
}

export type View = 'list' | 'detail' | 'cart' | 'history';

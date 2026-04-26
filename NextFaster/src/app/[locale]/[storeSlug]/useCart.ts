'use client';

import { useState, useEffect } from 'react';
import { CartItem, StoreProduct } from './types';
import { calculateDiscountedPrice } from '@/lib/pricing';

const CART_KEY = (storeSlug: string) => `cart_${storeSlug}`;

export function useCart(storeSlug: string) {
  const [cart, setCart] = useState<CartItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY(storeSlug));
      if (raw) setCart(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [storeSlug]);

  const persist = (items: CartItem[]) => {
    setCart(items);
    localStorage.setItem(CART_KEY(storeSlug), JSON.stringify(items));
  };

  const addToCart = (product: StoreProduct) => {
    const existing = cart.find((i) => i.product.slug === product.slug);
    if (existing) {
      persist(cart.map((i) => i.product.slug === product.slug ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      persist([...cart, { product, quantity: 1 }]);
    }
  };

  const removeFromCart = (slug: string) => {
    persist(cart.filter((i) => i.product.slug !== slug));
  };

  const updateQuantity = (slug: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(slug);
    } else {
      persist(cart.map((i) => i.product.slug === slug ? { ...i, quantity } : i));
    }
  };

  const incrementQuantity = (slug: string) => {
    const item = cart.find((i) => i.product.slug === slug);
    if (item) updateQuantity(slug, item.quantity + 1);
  };

  const decrementQuantity = (slug: string) => {
    const item = cart.find((i) => i.product.slug === slug);
    if (item) updateQuantity(slug, item.quantity - 1);
  };

  const clearCart = () => persist([]);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => {
    const discountedPrice = calculateDiscountedPrice(i.product.price, i.product.offerPercentage);
    return sum + i.quantity * discountedPrice;
  }, 0);

  return { cart, addToCart, removeFromCart, updateQuantity, incrementQuantity, decrementQuantity, clearCart, totalItems, totalPrice };
}

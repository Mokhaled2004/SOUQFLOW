/**
 * Storage abstraction layer
 * Uses Vercel Blob in production, local filesystem in development.
 */

import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
}

export async function uploadImage(
  file: File,
  folder: string = 'stores',
  storeId?: string | number,
  imageType?: 'logo' | 'banner' | 'product' | 'package',
): Promise<UploadResult> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();

  // ─── VERCEL BLOB (production) ─────────────────────────────────────────────
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const prefix = storeId ? `store_${storeId}` : 'store';
    const type = imageType || 'image';
    const filename = `${folder}/${prefix}_${type}_${timestamp}.${ext}`;

    const blob = await put(filename, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: blob.url,
      filename: blob.pathname,
    };
  }

  // ─── LOCAL STORAGE (development fallback) ─────────────────────────────────
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  let subDir: string;
  let filename: string;

  if (storeId) {
    if (imageType === 'product') {
      subDir = path.join('stores', String(storeId), 'products');
      filename = `${timestamp}.${ext}`;
    } else if (imageType === 'package') {
      subDir = path.join('stores', String(storeId), 'packages');
      filename = `${timestamp}.${ext}`;
    } else if (imageType === 'logo') {
      subDir = path.join('stores', String(storeId));
      filename = `store_${storeId}_logo_${timestamp}.${ext}`;
    } else if (imageType === 'banner') {
      subDir = path.join('stores', String(storeId));
      filename = `store_${storeId}_banner_${timestamp}.${ext}`;
    } else {
      subDir = path.join('stores', String(storeId));
      filename = `${timestamp}.${ext}`;
    }
  } else {
    subDir = folder;
    filename = `store_image_${timestamp}.${ext}`;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads', subDir);
  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, filename), buffer);

  return {
    url: `/uploads/${subDir.replace(/\\/g, '/')}/${filename}`,
    filename,
  };
}

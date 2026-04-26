/**
 * Storage abstraction layer
 *
 * LOCAL (development):  saves files to /public/uploads/stores/
 * VERCEL BLOB (production): uncomment the blob section below
 *
 * To switch to Vercel Blob:
 *  1. Run: npm install @vercel/blob
 *  2. Add BLOB_READ_WRITE_TOKEN to .env.local (get from Vercel dashboard)
 *  3. Comment out the LOCAL section and uncomment the VERCEL BLOB section
 */

import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export interface UploadResult {
  url: string;
  filename: string;
}

// ─── LOCAL STORAGE (development) ───────────────────────────────────────────
export async function uploadImage(
  file: File,
  folder: string = 'stores',
  storeId?: string | number,
  imageType?: 'logo' | 'banner' | 'product' | 'package',
): Promise<UploadResult> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const timestamp = Date.now();

  let subDir: string;
  let filename: string;

  if (storeId) {
    if (imageType === 'product') {
      // stores/{storeId}/products/{timestamp}.{ext}
      subDir = path.join('stores', String(storeId), 'products');
      filename = `${timestamp}.${ext}`;
    } else if (imageType === 'package') {
      // stores/{storeId}/packages/{timestamp}.{ext}
      subDir = path.join('stores', String(storeId), 'packages');
      filename = `${timestamp}.${ext}`;
    } else if (imageType === 'logo') {
      // stores/{storeId}/store_{storeId}_logo_{timestamp}.{ext}
      subDir = path.join('stores', String(storeId));
      filename = `store_${storeId}_logo_${timestamp}.${ext}`;
    } else if (imageType === 'banner') {
      // stores/{storeId}/store_{storeId}_banner_{timestamp}.{ext}
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
// ─── END LOCAL STORAGE ──────────────────────────────────────────────────────


// ─── VERCEL BLOB (production) ───────────────────────────────────────────────
// Uncomment this block and comment out the LOCAL section above when deploying
//
// import { put } from '@vercel/blob';
//
// export async function uploadImage(
//   file: File,
//   folder: string = 'stores',
//   storeId?: string | number,
//   imageType?: 'logo' | 'banner' | 'product',
// ): Promise<UploadResult> {
//   const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
//   const prefix = storeId ? `store_${storeId}` : 'store';
//   const type = imageType || 'image';
//   const filename = `${folder}/${prefix}_${type}_${Date.now()}.${ext}`;
//
//   const blob = await put(filename, file, {
//     access: 'public',
//     token: process.env.BLOB_READ_WRITE_TOKEN,
//   });
//
//   return {
//     url: blob.url,
//     filename: blob.pathname,
//   };
// }
// ─── END VERCEL BLOB ────────────────────────────────────────────────────────

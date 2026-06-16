import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { uploadImage } from '@/lib/storage';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
);

// Extended list to handle MIME type variations
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/tiff',
  'image/tif',
  'image/x-tiff',
];
const MAX_SIZE_MB = 5;

export async function POST(request: NextRequest) {
  try {
    // Auth check - allow package uploads with or without auth
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    // Parse form data first to check type
    const formData = await request.formData();
    const imageType = (formData.get('imageType') as string) || (formData.get('type') as string);
    
    // For package uploads, auth is optional (can be done from admin)
    // For other uploads, auth is required
    if (imageType !== 'package' && !token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (token) {
      try {
        await jwtVerify(token, JWT_SECRET);
      } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
    }

    // Parse form data
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'stores';
    const storeId = formData.get('storeId') as string | null;

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    // Validate MIME type - be flexible with MIME type detection
    const mimeType = file.type.toLowerCase();
    
    // Check if it's a valid image type
    const isValidImage = ALLOWED_TYPES.includes(mimeType) || mimeType.startsWith('image/');
    
    if (!isValidImage) {
      console.error('[upload] Invalid file type:', {
        fileName: file.name,
        mimeType: file.type,
        size: file.size,
      });
      return NextResponse.json(
        { error: `Invalid file type: ${file.type || 'unknown'}. Only JPEG, PNG, WebP, GIF, TIFF allowed.` },
        { status: 400 },
      );
    }

    // Validate size
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_SIZE_MB}MB.` },
        { status: 400 },
      );
    }

    const result = await uploadImage(file, folder, storeId ?? undefined, imageType ?? undefined);

    return NextResponse.json({ url: result.url }, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 },
    );
  }
}

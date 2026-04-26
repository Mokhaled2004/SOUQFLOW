import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { uploadImage } from '@/lib/storage';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long',
);

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
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

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, GIF allowed.' },
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
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

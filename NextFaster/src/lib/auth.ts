import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export interface JWTPayload {
  userId: number;
  email: string;
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long');

/**
 * Get the current user ID from the JWT token
 */
export async function getCurrentUserId(): Promise<number | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    return (verified.payload as JWTPayload).userId;
  } catch (err) {
    return null;
  }
}

/**
 * Get the current user's email from the JWT token
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return null;
    }

    const verified = await jwtVerify(token, JWT_SECRET);
    return (verified.payload as JWTPayload).email;
  } catch (err) {
    return null;
  }
}

/**
 * Verify JWT token and return payload
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as JWTPayload;
  } catch (err) {
    return null;
  }
}

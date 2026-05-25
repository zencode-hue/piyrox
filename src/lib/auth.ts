
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface DecodedUser {
  userId: string;
  name: string;
  email: string;
  plan: string;
}

export async function getAuthenticatedUser(): Promise<DecodedUser | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(token, secret) as DecodedUser;
    return decoded;
  } catch (error) {
    // Token verification failed (invalid signature, expired, etc.)
    return null;
  }
}

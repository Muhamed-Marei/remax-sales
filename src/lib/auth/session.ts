import { adminAuth } from '@/lib/firebase/admin';
import { cookies } from 'next/headers';

export const SESSION_COOKIE_NAME = 'session';

export async function verifySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value || '';

  if (!sessionCookie) {
    return null;
  }

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error: any) {
    if (error.code === 'auth/session-cookie-revoked' || error.message?.includes('revoked')) {
      console.warn('Session cookie has been revoked. User needs to re-authenticate.');
    } else {
      console.warn('Session verification failed:', error?.message || error);
    }
    return null;
  }
}

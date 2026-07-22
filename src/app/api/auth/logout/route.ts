import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value || '';
    
    if (sessionCookie) {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie).catch(() => null);
      if (decodedClaims) {
        // Revoke all sessions for the user
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      }
    }

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    
    // Clear the session cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: '',
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

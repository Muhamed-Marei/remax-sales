import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is missing' }, { status: 400 });
    }

    // 1. Verify the ID token first to get UID and current claims
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // 2. Fetch the user's current role from the root 'users' collection
    const userDoc = await adminDb.collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentRole = decodedToken.role;
      
      // If claims are missing or mismatched, update them and request client to refresh token
      if (currentRole !== userData?.role) {
        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          role: userData?.role || 'salesperson',
          admin: userData?.role === 'admin'
        });
        
        // Return a 202 to signal the client to refresh the ID token and retry
        return NextResponse.json(
          { status: 'claims_updated', message: 'Claims updated, please refresh token' }, 
          { status: 202 }
        );
      }
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const options = {
      name: SESSION_COOKIE_NAME,
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    const response = NextResponse.json({ status: 'success' }, { status: 200 });
    response.cookies.set(options);

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

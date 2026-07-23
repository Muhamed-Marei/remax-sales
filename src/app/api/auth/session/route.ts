import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { COLLECTIONS } from '@/lib/constants/collections';

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
    const userDoc = await adminDb.collection(COLLECTIONS.USERS).doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const currentRole = decodedToken.role;
      const currentOrgId = decodedToken.orgId;

      const targetRole = userData?.role || 'salesperson';
      const targetOrgId = userData?.orgId || currentOrgId || 'default';
      
      // Auto-heal user document in Firestore if orgId is missing
      if (!userData?.orgId || !userData?.id) {
        await adminDb.collection(COLLECTIONS.USERS).doc(decodedToken.uid).set({
          id: decodedToken.uid,
          orgId: targetOrgId,
          updatedAt: new Date(),
        }, { merge: true });
      }

      // If claims are missing or mismatched, update them and request client to refresh token
      if (currentRole !== targetRole || !currentOrgId) {
        const userRecord = await adminAuth.getUser(decodedToken.uid);
        const existingClaims = userRecord.customClaims || {};

        await adminAuth.setCustomUserClaims(decodedToken.uid, {
          ...existingClaims,
          role: targetRole,
          admin: targetRole === 'admin',
          orgId: targetOrgId,
        });
        
        // Return a 202 to signal the client to refresh the ID token and retry
        return NextResponse.json(
          { status: 'claims_updated', message: 'Claims updated, please refresh token', role: targetRole }, 
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
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    const userRecord = await adminAuth.getUser(decodedToken.uid);
    const role = (userRecord.customClaims?.role as string) || decodedToken.role || 'salesperson';

    const response = NextResponse.json({ status: 'success', role }, { status: 200 });
    response.cookies.set(options);

    return response;
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

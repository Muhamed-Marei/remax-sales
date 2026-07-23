/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Verify the requester is an admin
    const claims = await verifySession();
    
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (claims.role !== 'admin' && claims.admin !== true) {
      // NOTE: Temporarily comment out for local development without admin claim set.
      // return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, displayName } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // 2. Create the user in Firebase Auth without a password
    const userRecord = await adminAuth.createUser({
      email,
      displayName,
      emailVerified: false,
    });

    // 3. Assign the 'salesperson' role (custom claim)
    await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'salesperson' });

    // 4. Mirror the user in Firestore (organizations/default/users)
    const orgId = 'default'; // Hardcoded for MVP
    const now = new Date();
    await adminDb.collection('organizations').doc(orgId).collection('users').doc(userRecord.uid).set({
      id: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName || '',
      role: 'salesperson',
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    // 5. Generate a password setup/reset link
    const actionCodeSettings = {
      url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/login',
      handleCodeInApp: true,
    };
    
    const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);

    // 6. Audit Log
    await writeAuditLog({
      orgId,
      actorUid: claims.uid || 'system',
      action: 'USER_INVITED',
      resource: `users/${userRecord.uid}`,
      timestamp: now,
      details: { email }
    });

    logger.info(`[ADMIN_INVITE] Send this secure setup link to ${email}:\n${link}`);

    return NextResponse.json({ 
      status: 'success', 
      message: 'Invitation generated successfully.',
      uid: userRecord.uid,
    }, { status: 201 });
    
  } catch (error: any) {
    logger.error({ message: 'Error in admin invite', error: error.message });
    // Handle "email already exists" gracefully
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

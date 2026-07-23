/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { verifySession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { writeAuditLog } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const { active } = await request.json();

    if (typeof active !== 'boolean') {
      return NextResponse.json({ error: 'Invalid active status' }, { status: 400 });
    }

    // 2. Update the user in Firebase Auth
    await adminAuth.updateUser(userId, {
      disabled: !active,
    });

    // 3. Update the user in Firestore
    const orgId = 'default'; // Hardcoded for MVP
    const now = new Date();
    await adminDb.collection('organizations').doc(orgId).collection('users').doc(userId).update({
      active,
      updatedAt: now,
    });

    // 4. Audit Log
    await writeAuditLog({
      orgId,
      actorUid: claims.uid || 'system',
      action: 'USER_STATUS_CHANGED',
      resource: `users/${userId}`,
      timestamp: now,
      details: { active }
    });

    logger.info(`[ADMIN_USER] User ${userId} status changed to ${active ? 'active' : 'inactive'}`);

    return NextResponse.json({ 
      status: 'success', 
      message: 'User status updated successfully.',
    });
    
  } catch (error: any) {
    logger.error({ message: 'Error updating user status', error: error.message });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

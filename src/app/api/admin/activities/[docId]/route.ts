import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';
import { adminEditActivity } from '@/lib/repositories/activity';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ docId: string }> }
) {
  try {
    const claims = await verifySession();
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    if (claims.role !== 'admin' && claims.admin !== true) {
      // NOTE: Temporarily comment out for local development without admin claim set if needed
      // return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { docId } = await params;
    const body = await request.json();
    const orgId = 'default';

    await adminEditActivity(orgId, docId, body, claims.uid);

    return NextResponse.json({ status: 'success' });
    
  } catch (error: any) {
    logger.error({ message: 'Error editing activity by admin', error: error.message });
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

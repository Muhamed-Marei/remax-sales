import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveActivity } from '@/lib/repositories/activity';
import { dailyActivitySchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const claims = await verifySession();
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (claims.role !== 'salesperson' && claims.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Server-side validation
    const validationResult = dailyActivitySchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    // MVP hardcodes organization ID
    const orgId = 'default';
    
    const docId = await saveActivity(
      orgId, 
      claims.uid, 
      validationResult.data, 
      claims.uid
    );

    return NextResponse.json({ 
      status: 'success',
      id: docId
    }, { status: 201 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error saving activity', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  // Save activity creates or updates deterministically based on date, 
  // so PUT can use the same logic as POST for MVP.
  return POST(request);
}

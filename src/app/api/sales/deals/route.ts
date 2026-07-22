import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveDeal, getDeals } from '@/lib/repositories/deal';
import { dealSchema } from '@/lib/schemas';
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
    const validationResult = dealSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const orgId = 'default';
    
    const docId = await saveDeal(
      orgId, 
      validationResult.data, 
      claims.uid
    );

    return NextResponse.json({ 
      status: 'success',
      id: docId
    }, { status: 201 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error saving deal', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const claims = await verifySession();
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = 'default';
    const { searchParams } = new URL(request.url);
    const state = searchParams.get('state') || undefined;

    let salesId;
    if (claims.role === 'admin') {
      // Admins can see all deals, or filter by specific salesId if provided
      salesId = searchParams.get('salesId') || undefined;
    } else {
      // Salespeople can only see their own assigned deals
      salesId = claims.uid;
    }

    const deals = await getDeals(orgId, salesId, state);

    return NextResponse.json({ deals }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error fetching deals', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

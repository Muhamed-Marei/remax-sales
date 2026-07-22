import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveLead, getLeads } from '@/lib/repositories/lead';
import { leadSchema } from '@/lib/schemas';
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
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const orgId = 'default';
    
    const docId = await saveLead(
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
    logger.error({ message: 'Error saving lead', error: errorMessage });
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
    const status = searchParams.get('status') || undefined;

    let salesId;
    if (claims.role === 'admin') {
      salesId = searchParams.get('salesId') || undefined;
    } else {
      salesId = claims.uid;
    }

    const leads = await getLeads(orgId, salesId, status);

    return NextResponse.json({ leads }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error fetching leads', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveLead, getLeadById } from '@/lib/repositories/lead';
import { leadSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const claims = await verifySession();
    const { leadId } = await params;
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = 'default';
    const lead = await getLeadById(orgId, leadId);

    if (!lead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (claims.role !== 'admin' && lead.assignedSalesId !== claims.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ lead }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error fetching lead', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> }
) {
  try {
    const claims = await verifySession();
    const { leadId } = await params;
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = 'default';
    const existingLead = await getLeadById(orgId, leadId);

    if (!existingLead) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (claims.role !== 'admin' && existingLead.assignedSalesId !== claims.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    const validationResult = leadSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }
    
    await saveLead(
      orgId, 
      validationResult.data, 
      claims.uid,
      leadId
    );

    return NextResponse.json({ status: 'success' }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error updating lead', error: errorMessage });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

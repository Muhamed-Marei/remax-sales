import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { saveDeal, getDealById } from '@/lib/repositories/deal';
import { dealSchema } from '@/lib/schemas';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  let dealId = '';
  try {
    const resolvedParams = await params;
    dealId = resolvedParams.dealId;

    const claims = await verifySession();
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (claims.role !== 'salesperson' && claims.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    const validationResult = dealSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json({ 
        error: 'Validation failed', 
        details: validationResult.error.format() 
      }, { status: 400 });
    }

    const orgId = 'default';

    // Verify ownership if not admin
    if (claims.role === 'salesperson') {
      const existingDeal = await getDealById(orgId, dealId);
      if (!existingDeal) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      if (existingDeal.assignedSalesId !== claims.uid) {
        return NextResponse.json({ error: 'Forbidden: You can only edit your assigned deals' }, { status: 403 });
      }
      
      // Salesperson cannot reassign to someone else
      if (validationResult.data.assignedSalesId !== claims.uid) {
        return NextResponse.json({ error: 'Forbidden: You cannot reassign deals' }, { status: 403 });
      }
    }
    
    await saveDeal(
      orgId, 
      validationResult.data, 
      claims.uid,
      dealId
    );

    return NextResponse.json({ 
      status: 'success',
      id: dealId
    }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error updating deal', error: errorMessage, dealId });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ dealId: string }> }
) {
  let dealId = '';
  try {
    const resolvedParams = await params;
    dealId = resolvedParams.dealId;
    
    const claims = await verifySession();
    
    if (!claims || !claims.uid) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const orgId = 'default';

    const deal = await getDealById(orgId, dealId);

    if (!deal) {
      return NextResponse.json({ error: 'Deal not found' }, { status: 404 });
    }

    if (claims.role === 'salesperson' && deal.assignedSalesId !== claims.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ deal }, { status: 200 });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error({ message: 'Error fetching deal', error: errorMessage, dealId });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

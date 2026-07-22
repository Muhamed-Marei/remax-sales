import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { SESSION_COOKIE_NAME } from '@/lib/auth/session';
import Papa from 'papaparse';
import { DailyActivitySchema } from '@/lib/schema/activity';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Fetch user to verify admin role
    const userDoc = await adminDb.collection('organizations').doc(decodedClaims.orgId || 'org-1').collection('users').doc(decodedClaims.uid).get();
    const userData = userDoc.data();
    
    if (!userData || userData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const dryRun = formData.get('dryRun') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const text = await file.text();
    
    // 3. Parse CSV
    const parseResult = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true, // converts numbers automatically
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'CSV Parse Error', 
        details: parseResult.errors 
      }, { status: 400 });
    }

    const rows = parseResult.data as any[];
    
    // 4. Validate and Process Rows
    const errors: any[] = [];
    let successCount = 0;
    const orgId = decodedClaims.orgId || 'org-1';
    
    const batch = adminDb.batch();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      
      try {
        // Attempt to parse as Activity first
        // In a real scenario, you'd inspect headers to decide schema (activity vs deal)
        // Here we assume it's Activity data for MVP
        const validatedData = DailyActivitySchema.parse(row);
        
        if (!dryRun) {
          const docId = `${validatedData.salespersonId}_${validatedData.date}`;
          const docRef = adminDb.collection('organizations').doc(orgId).collection('activities').doc(docId);
          batch.set(docRef, {
            ...validatedData,
            orgId,
            createdAt: new Date(),
            updatedAt: new Date(),
            updatedBy: decodedClaims.uid,
          }, { merge: true });
        }
        
        successCount++;
      } catch (err: any) {
        if (err instanceof ZodError) {
          errors.push({
            row: i + 2, // 1-indexed plus header
            message: (err as any).errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', '),
            data: row
          });
        } else {
          errors.push({
            row: i + 2,
            message: err.message,
            data: row
          });
        }
      }
    }

    // 5. Commit if not dry run
    if (!dryRun && successCount > 0) {
      // Note: Firestore batch has a limit of 500 operations. 
      // For large CSVs, we should chunk the batch.
      // Keeping it simple for MVP script
      if (successCount <= 500) {
         await batch.commit();
      } else {
         return NextResponse.json({ error: 'CSV too large. Batch limit is 500 for MVP.' }, { status: 400 });
      }
    }

    return NextResponse.json({
      message: dryRun ? 'Dry run completed successfully.' : 'Migration completed successfully.',
      successCount,
      errorCount: errors.length,
      errors
    });

  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Internal server error: ' + error.message }, { status: 500 });
  }
}

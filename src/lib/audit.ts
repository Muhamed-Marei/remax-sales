/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminDb } from './firebase/admin';
import { logger } from './logger';

export interface AuditLogEntry {
  orgId?: string;
  actorUid: string; // The user making the change (e.g. admin uid)
  action: string; // e.g., 'USER_INVITED', 'DEAL_UPDATED'
  resource: string; // e.g., 'users/123'
  timestamp: Date;
  details?: Record<string, any>; // Safe before/after summary, no PII
}

export async function writeAuditLog(entry: AuditLogEntry) {
  try {
    const auditCollection = adminDb.collection('auditLogs');
      
    await auditCollection.add({
      ...entry,
    });
  } catch (error) {
    // If audit logging fails, we log it securely but don't usually throw
    // to avoid breaking the main user flow.
    logger.error({
      message: 'Failed to write audit log',
      action: entry.action,
      resource: entry.resource,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

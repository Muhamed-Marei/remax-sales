// User Types
export type UserRole = 'admin' | 'salesperson';
export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string; // from Firebase Auth
  orgId: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date | string;
  lastLoginAt?: Date | string;
}

// Activity Types
export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave' | 'remote';

export interface DailyActivity {
  id: string; // salesId_YYYY-MM-DD
  orgId: string;
  salesId: string;
  activityDate: string; // YYYY-MM-DD
  primarySource: string;
  leads: number;
  followUps: number;
  responses: number;
  calls: number;
  siteVisits: number;
  viewings: number;
  meetings: number;
  dealsCount: number;
  newUnits: number;
  portfolioCount: number;
  facebookCount: number;
  marketplaceCount: number;
  mohamedCount: number;
  attendance: AttendanceStatus;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  updatedBy: string;
}

// Lead Types
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'disqualified' | 'won' | 'lost';

export interface Lead {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  status: LeadStatus;
  budget?: number;
  preferences?: string;
  assignedSalesId: string;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
}

// Deal Types
export type OwnerCooperative = 'cooperative' | 'not_cooperative' | 'unknown';
export type DealType = 'easy_to_pay' | 'needs_time';
export type DealState = 'draft' | 'active' | 'contacted' | 'viewing_scheduled' | 'viewed' | 'meeting_scheduled' | 'negotiating' | 'reserved' | 'won' | 'lost' | 'archived';

export interface Deal {
  id: string;
  orgId: string;
  unitType: string;
  specifications: string;
  location: string;
  ownerCooperative: OwnerCooperative;
  photos?: string[]; // Storage paths
  commissionRate?: number;
  askingPrice: number;
  notes?: string;
  dealType: DealType;
  dealState: DealState;
  assignedSalesId: string;
  leadId?: string;
  createdAt: Date | string;
  createdBy: string;
  updatedAt: Date | string;
  closedAt?: Date | string;
  lostReason?: string;
}

export interface DealStateHistory {
  id: string;
  dealId: string;
  fromState: DealState;
  toState: DealState;
  changedBy: string;
  changedAt: Date | string;
  note?: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: 'create' | 'update' | 'delete' | 'status_change';
  resource: 'user' | 'activity' | 'deal' | 'settings' | 'lead';
  resourceId: string;
  timestamp: Date | string;
  changes?: Record<string, unknown>;
}

// Analytics Types
export interface DashboardFilter {
  orgId: string;
  salesId?: string; // If undefined, applies to all salespeople (admin view)
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  source?: string;
  attendance?: AttendanceStatus;
  dealState?: DealState;
  dealType?: DealType;
  location?: string;
}

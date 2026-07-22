import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'salesperson']);
export const userStatusSchema = z.enum(['active', 'inactive']);

export const attendanceStatusSchema = z.enum(['present', 'late', 'absent', 'leave', 'remote']);

export const dailyActivitySchema = z.object({
  activityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  primarySource: z.string().min(1, 'Source is required'),
  leads: z.number().int().nonnegative().default(0),
  followUps: z.number().int().nonnegative().default(0),
  responses: z.number().int().nonnegative().default(0),
  calls: z.number().int().nonnegative().default(0),
  siteVisits: z.number().int().nonnegative().default(0),
  viewings: z.number().int().nonnegative().default(0),
  meetings: z.number().int().nonnegative().default(0),
  dealsCount: z.number().int().nonnegative().default(0),
  newUnits: z.number().int().nonnegative().default(0),
  portfolioCount: z.number().int().nonnegative().default(0),
  facebookCount: z.number().int().nonnegative().default(0),
  marketplaceCount: z.number().int().nonnegative().default(0),
  mohamedCount: z.number().int().nonnegative().default(0),
  attendance: attendanceStatusSchema,
  notes: z.string().optional(),
});

export const ownerCooperativeSchema = z.enum(['cooperative', 'not_cooperative', 'unknown']);
export const dealTypeSchema = z.enum(['easy_to_pay', 'needs_time']);
export const dealStateSchema = z.enum([
  'draft', 'active', 'contacted', 'viewing_scheduled', 'viewed', 
  'meeting_scheduled', 'negotiating', 'reserved', 'won', 'lost', 'archived'
]);

export const leadStatusSchema = z.enum([
  'new', 'contacted', 'qualified', 'disqualified', 'won', 'lost'
]);

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  source: z.string().optional(),
  status: leadStatusSchema.default('new'),
  budget: z.number().nonnegative('Budget cannot be negative').optional(),
  preferences: z.string().optional(),
  assignedSalesId: z.string().min(1, 'Salesperson assignment is required'),
});

export const dealSchema = z.object({
  unitType: z.string().min(1, 'Unit type is required'),
  specifications: z.string().min(1, 'Specifications are required'),
  location: z.string().min(1, 'Location is required'),
  ownerCooperative: ownerCooperativeSchema,
  commissionRate: z.number().min(0).max(1).optional(),
  askingPrice: z.number().nonnegative('Price cannot be negative'),
  notes: z.string().optional(),
  dealType: dealTypeSchema,
  dealState: dealStateSchema,
  assignedSalesId: z.string().min(1, 'Salesperson assignment is required'),
  leadId: z.string().optional(),
  lostReason: z.string().optional(),
  photoUrls: z.array(z.string().url()).optional(),
}).refine((data) => {
  if (data.dealState === 'lost' && !data.lostReason) {
    return false;
  }
  return true;
}, {
  message: "Lost reason is required when state is 'lost'",
  path: ["lostReason"]
});

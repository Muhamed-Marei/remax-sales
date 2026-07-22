import { z } from 'zod';

export const AttendanceSchema = z.enum(['present', 'absent', 'leave', 'sick']);
export type Attendance = z.infer<typeof AttendanceSchema>;

export const LeadSourceSchema = z.enum(['organic', 'referral', 'marketing', 'other']);
export type LeadSource = z.infer<typeof LeadSourceSchema>;

export const DailyActivitySchema = z.object({
  id: z.string(), // Format: salesId_YYYY-MM-DD
  salespersonId: z.string(),
  date: z.string(), // YYYY-MM-DD
  attendance: AttendanceSchema,
  callsMade: z.number().int().min(0),
  meetingsHeld: z.number().int().min(0),
  leadsGenerated: z.number().int().min(0),
  leadSource: LeadSourceSchema.optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type DailyActivity = z.infer<typeof DailyActivitySchema>;

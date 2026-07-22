import { z } from 'zod';

export const DealStateSchema = z.enum(['lead', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']);
export type DealState = z.infer<typeof DealStateSchema>;

export const DealTypeSchema = z.enum(['residential', 'commercial', 'land']);
export type DealType = z.infer<typeof DealTypeSchema>;

export const DealSchema = z.object({
  id: z.string(),
  salespersonId: z.string(),
  title: z.string().min(1),
  customerName: z.string().min(1),
  customerPhone: z.string().optional(),
  state: DealStateSchema,
  type: DealTypeSchema,
  valueEGP: z.number().min(0),
  expectedCloseDate: z.date().optional(),
  lostReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Deal = z.infer<typeof DealSchema>;

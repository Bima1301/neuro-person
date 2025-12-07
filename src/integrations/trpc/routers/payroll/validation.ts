import { z } from "zod";
import { requiredStringFor } from '@/lib/utils'

export const payrollListInput = z
	.object({
		employeeId: z.string().optional(),
		period: z.string().optional(),
		status: z.enum(["PENDING", "PROCESSING", "PAID", "CANCELLED"]).optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const payrollGetInput = z.object({
  id: requiredStringFor('ID payroll'),
})

export const payrollGenerateInput = z.object({
  period: requiredStringFor('Periode wajib dipilih'),
})

export const payrollUpdateStatusInput = z.object({
  id: requiredStringFor('ID payroll'),
  status: z.enum(['PENDING', 'PROCESSING', 'PAID', 'CANCELLED']),
})

export const payrollSummaryInput = z
	.object({ period: z.string().optional() })
	.optional();

// Inferred types
export type PayrollListInput = z.infer<typeof payrollListInput>;
export type PayrollGetInput = z.infer<typeof payrollGetInput>;
export type PayrollGenerateInput = z.infer<typeof payrollGenerateInput>;
export type PayrollUpdateStatusInput = z.infer<typeof payrollUpdateStatusInput>;
export type PayrollSummaryInput = z.infer<typeof payrollSummaryInput>;

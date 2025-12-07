import { z } from "zod";
import { requiredStringFor } from '@/lib/utils'

export const leaveListInput = z
	.object({
		employeeId: z.string().optional(),
		status: z.enum(["PENDING", "APPROVED", "REJECTED", "CANCELLED"]).optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const leaveGetInput = z.object({
  id: requiredStringFor('ID cuti'),
})

export const leaveCreateInput = z.object({
  employeeId: requiredStringFor('Karyawan wajib dipilih'),
  leaveTypeId: requiredStringFor('Jenis cuti wajib dipilih'),
  startDate: requiredStringFor('Tanggal mulai wajib diisi'),
  endDate: requiredStringFor('Tanggal selesai wajib diisi'),
  reason: z.string().optional(),
})

export const leaveApproveInput = z.object({
  id: requiredStringFor('ID cuti'),
  approvedById: requiredStringFor('ID approver'),
})

export const leaveRejectInput = z.object({
  id: z.string(),
  reason: z.string().optional(),
})

// Inferred types
export type LeaveListInput = z.infer<typeof leaveListInput>;
export type LeaveGetInput = z.infer<typeof leaveGetInput>;
export type LeaveCreateInput = z.infer<typeof leaveCreateInput>;
export type LeaveApproveInput = z.infer<typeof leaveApproveInput>;
export type LeaveRejectInput = z.infer<typeof leaveRejectInput>;

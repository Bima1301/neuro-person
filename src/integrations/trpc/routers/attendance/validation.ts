import { z } from "zod";
import { AttendanceStatus } from "@/generated/prisma/enums";
import { requiredStringFor } from '@/lib/utils'

export const attendanceListInput = z
	.object({
		employeeId: z.string().optional(),
		startDate: z.string().optional(),
		endDate: z.string().optional(),
		date: z.string().optional(),
		status: z.nativeEnum(AttendanceStatus).optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const attendanceCheckInput = z.object({
  employeeId: requiredStringFor('Karyawan wajib dipilih'),
  photo: requiredStringFor('Foto wajib diambil'),
  notes: z.string().optional(),
  type: z.enum(['CHECK_IN', 'CHECK_OUT']),
  targetDate: z.string().optional(), // ISO date string for check-out yesterday
  latitude: z.number().min(-90).max(90).optional(), // GPS latitude
  longitude: z.number().min(-180).max(180).optional(), // GPS longitude
})

export const attendanceInfiniteInput = z
  .object({
    employeeId: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    date: z.string().optional(),
    status: z.nativeEnum(AttendanceStatus).optional(),
    limit: z.number().min(1).max(50).default(10),
    cursor: z.string().optional(),
  })
  .optional()

export const attendanceDeleteInput = z.object({
  id: requiredStringFor('ID absensi'),
})

// Inferred types
export type AttendanceListInput = z.infer<typeof attendanceListInput>;
export type AttendanceInfiniteInput = z.infer<typeof attendanceInfiniteInput>;
export type AttendanceCheckInput = z.infer<typeof attendanceCheckInput>;
export type AttendanceDeleteInput = z.infer<typeof attendanceDeleteInput>;

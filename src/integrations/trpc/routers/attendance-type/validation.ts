import { z } from "zod";

export const attendanceTypeListInput = z
	.object({
		search: z.string().optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const attendanceTypeGetInput = z.object({ id: z.string() });

export const attendanceTypeCreateInput = z.object({
	name: z.string().min(1, "Nama tipe kehadiran wajib diisi"),
	code: z.string().optional(),
	isMustPresence: z.boolean().default(true),
});

export const attendanceTypeUpdateInput = z.object({
	id: z.string(),
	name: z.string().optional(),
	code: z.string().optional(),
	isMustPresence: z.boolean().optional(),
});

export const attendanceTypeDeleteInput = z.object({ id: z.string() });

// Inferred types
export type AttendanceTypeListInput = z.infer<typeof attendanceTypeListInput>;
export type AttendanceTypeGetInput = z.infer<typeof attendanceTypeGetInput>;
export type AttendanceTypeCreateInput = z.infer<typeof attendanceTypeCreateInput>;
export type AttendanceTypeUpdateInput = z.infer<typeof attendanceTypeUpdateInput>;
export type AttendanceTypeDeleteInput = z.infer<typeof attendanceTypeDeleteInput>;


import { z } from "zod";

export const shiftListInput = z
	.object({
		search: z.string().optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const shiftCreateInput = z.object({
	name: z.string().min(1, "Nama shift wajib diisi"),
	startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
	endTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu harus HH:MM"),
});

export const shiftUpdateInput = z.object({
	id: z.string(),
	name: z.string().min(1).optional(),
	startTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
	endTime: z
		.string()
		.regex(/^\d{2}:\d{2}$/)
		.optional(),
});

export const shiftDeleteInput = z.object({
	id: z.string(),
});

export type ShiftCreateInput = z.infer<typeof shiftCreateInput>;
export type ShiftUpdateInput = z.infer<typeof shiftUpdateInput>;

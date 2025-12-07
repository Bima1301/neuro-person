import { z } from "zod";

export const departmentListInput = z
	.object({
		search: z.string().optional(),
		page: z.number().min(1).default(1),
		perPage: z.number().min(1).max(100).default(10),
	})
	.optional();

export const departmentGetInput = z.object({ id: z.string() });

export const departmentCreateInput = z.object({
	name: z.string().min(1, "Nama departemen wajib diisi"),
	description: z.string().optional(),
});

export const departmentUpdateInput = z.object({
	id: z.string(),
	name: z.string().optional(),
	description: z.string().optional(),
});

export const departmentDeleteInput = z.object({ id: z.string() });

// Inferred types
export type DepartmentListInput = z.infer<typeof departmentListInput>;
export type DepartmentGetInput = z.infer<typeof departmentGetInput>;
export type DepartmentCreateInput = z.infer<typeof departmentCreateInput>;
export type DepartmentUpdateInput = z.infer<typeof departmentUpdateInput>;
export type DepartmentDeleteInput = z.infer<typeof departmentDeleteInput>;

import type { TRPCRouterRecord } from "@trpc/server";
import { prisma } from "@/db";
import { protectedProcedure } from "../../init";
import {
	departmentCreateInput,
	departmentDeleteInput,
	departmentGetInput,
	departmentListInput,
	departmentUpdateInput,
} from "./validation";

export const departmentRouter = {
	list: protectedProcedure
		.input(departmentListInput)
		.query(async ({ input, ctx }) => {
			const page = input?.page ?? 1;
			const perPage = input?.perPage ?? 10;
			const skip = (page - 1) * perPage;

			const where = {
				organizationId: ctx.organizationId,
				...(input?.search && {
					name: { contains: input.search, mode: "insensitive" as const },
				}),
			};

			const [items, total] = await Promise.all([
				prisma.department.findMany({
					where,
					include: { _count: { select: { employees: true } } },
					orderBy: { name: "asc" },
					skip,
					take: perPage,
				}),
				prisma.department.count({ where }),
			]);

			return {
				items,
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage),
			};
		}),

	get: protectedProcedure.input(departmentGetInput).query(async ({ input, ctx }) => {
		return await prisma.department.findFirst({
			where: { 
				id: input.id,
				organizationId: ctx.organizationId,
			},
			include: {
				employees: true,
				positions: true,
			},
		});
	}),

	create: protectedProcedure
		.input(departmentCreateInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.department.create({ 
				data: {
					...input,
					organizationId: ctx.organizationId,
				}
			});
		}),

	update: protectedProcedure
		.input(departmentUpdateInput)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			return await prisma.department.update({
				where: { 
					id,
					organizationId: ctx.organizationId,
				},
				data,
			});
		}),

	delete: protectedProcedure
		.input(departmentDeleteInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.department.delete({ 
				where: { 
					id: input.id,
					organizationId: ctx.organizationId,
				} 
			});
		}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";

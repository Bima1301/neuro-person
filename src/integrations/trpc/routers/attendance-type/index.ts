import type { TRPCRouterRecord } from "@trpc/server";
import { prisma } from "@/db";
import { protectedProcedure } from "../../init";
import {
	attendanceTypeCreateInput,
	attendanceTypeDeleteInput,
	attendanceTypeGetInput,
	attendanceTypeListInput,
	attendanceTypeUpdateInput,
} from "./validation";

export const attendanceTypeRouter = {
	list: protectedProcedure
		.input(attendanceTypeListInput)
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
				prisma.attendanceType.findMany({
					where,
					orderBy: { name: "asc" },
					skip,
					take: perPage,
				}),
				prisma.attendanceType.count({ where }),
			]);

			return {
				items,
				total,
				page,
				perPage,
				totalPages: Math.ceil(total / perPage),
			};
		}),

	get: protectedProcedure
		.input(attendanceTypeGetInput)
		.query(async ({ input, ctx }) => {
			return await prisma.attendanceType.findFirst({
				where: {
					id: input.id,
					organizationId: ctx.organizationId,
				},
			});
		}),

	create: protectedProcedure
		.input(attendanceTypeCreateInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.attendanceType.create({
				data: {
					...input,
					organizationId: ctx.organizationId,
				},
			});
		}),

	update: protectedProcedure
		.input(attendanceTypeUpdateInput)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			return await prisma.attendanceType.update({
				where: {
					id,
					organizationId: ctx.organizationId,
				},
				data,
			});
		}),

	delete: protectedProcedure
		.input(attendanceTypeDeleteInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.attendanceType.delete({
				where: {
					id: input.id,
					organizationId: ctx.organizationId,
				},
			});
		}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";

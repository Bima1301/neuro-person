import type { TRPCRouterRecord } from "@trpc/server";
import { z } from "zod";
import { prisma } from "@/db";
import {
	normalizeDateRangeToUTC,
} from "@/lib/date-utils";
import { protectedProcedure } from "../../init";
import {
	shiftCreateInput,
	shiftDeleteInput,
	shiftListInput,
	shiftUpdateInput,
} from "./validation";

export const shiftRouter = {
	list: protectedProcedure
		.input(shiftListInput)
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
				prisma.shift.findMany({
					where,
					orderBy: { name: "asc" },
					include: {
						_count: { select: { employeeShifts: true } },
					},
					skip,
					take: perPage,
				}),
				prisma.shift.count({ where }),
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
		.input(z.object({ id: z.string() }))
		.query(async ({ input, ctx }) => {
			return await prisma.shift.findFirst({
				where: { id: input.id, organizationId: ctx.organizationId },
			});
		}),

	create: protectedProcedure
		.input(shiftCreateInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.shift.create({
				data: {
					...input,
					organization: { connect: { id: ctx.organizationId } },
				},
			});
		}),

	update: protectedProcedure
		.input(shiftUpdateInput)
		.mutation(async ({ input, ctx }) => {
			const { id, ...data } = input;
			return await prisma.shift.update({
				where: { id, organizationId: ctx.organizationId },
				data,
			});
		}),

	delete: protectedProcedure
		.input(shiftDeleteInput)
		.mutation(async ({ input, ctx }) => {
			return await prisma.shift.delete({
				where: { id: input.id, organizationId: ctx.organizationId },
			});
		}),

	getEmployeeShifts: protectedProcedure
		.input(
			z.object({
				employeeId: z.string().optional(),
				startDate: z.string(),
				endDate: z.string(),
			}),
		)
		.query(async ({ input, ctx }) => {
			const { start, end } = normalizeDateRangeToUTC(
				input.startDate,
				input.endDate,
			);
			return await prisma.employeeShift.findMany({
				where: {
					...(input.employeeId && { employeeId: input.employeeId }),
					employee: { organizationId: ctx.organizationId },
					date: {
						gte: start,
						lte: end,
					},
				},
				include: {
					employee: {
						select: { firstName: true, lastName: true, employeeId: true },
					},
					shift: true,
				},
				orderBy: { date: "asc" },
			});
		}),
} satisfies TRPCRouterRecord;

export * from "./validation";
export * from "./types";


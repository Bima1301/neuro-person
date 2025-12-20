import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../init'
import {
	chatClearHistoryInput,
	chatDeleteInput,
	chatGetInput,
	chatHistoryListInput,
} from '../validation'
import { prisma } from '@/db'

export const historyHandler = protectedProcedure
	.input(chatHistoryListInput)
	.query(async ({ input, ctx }) => {
		const { page, limit, search } = input
		const skip = (page - 1) * limit

		const where = {
			userId: ctx.userId || undefined,
			organizationId: ctx.organizationId,
			...(search && {
				OR: [
					{ question: { contains: search, mode: 'insensitive' as const } },
					{ answer: { contains: search, mode: 'insensitive' as const } },
				],
			}),
		}

		const [items, total] = await Promise.all([
			prisma.chatHistory.findMany({
				where,
				include: {
					user: {
						select: {
							id: true,
							name: true,
							email: true,
						},
					},
				},
				orderBy: {
					createdAt: 'desc',
				},
				skip,
				take: limit,
			}),
			prisma.chatHistory.count({ where }),
		])

		return {
			items,
			total,
			page,
			perPage: limit,
			totalPages: Math.ceil(total / limit),
		}
	})

export const getHandler = protectedProcedure
	.input(chatGetInput)
	.query(async ({ input, ctx }) => {
		const chat = await prisma.chatHistory.findFirst({
			where: {
				id: input.id,
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
			},
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		})

		if (!chat) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Chat history tidak ditemukan',
			})
		}

		return chat
	})

export const deleteHandler = protectedProcedure
	.input(chatDeleteInput)
	.mutation(async ({ input, ctx }) => {
		const chat = await prisma.chatHistory.findFirst({
			where: {
				id: input.id,
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
			},
		})

		if (!chat) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'Chat history tidak ditemukan',
			})
		}

		await prisma.chatHistory.delete({
			where: { id: input.id },
		})

		return { success: true }
	})

export const clearHistoryHandler = protectedProcedure
	.input(chatClearHistoryInput)
	.mutation(async ({ ctx }) => {
		const deleted = await prisma.chatHistory.deleteMany({
			where: {
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
			},
		})

		return {
			success: true,
			deletedCount: deleted.count,
		}
	})

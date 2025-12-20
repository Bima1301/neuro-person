import { protectedProcedure } from '../../../init'
import { chatEmbeddingStatsInput } from '../validation'
import type { EmbeddingStats } from '../types'
import { prisma } from '@/db'
import { normalizeTodayLocalToUTC } from '@/lib/date-utils'

export const embeddingStatsHandler = protectedProcedure
	.input(chatEmbeddingStatsInput)
	.query(async ({ input, ctx }): Promise<EmbeddingStats> => {
		const { DocumentType } = await import('@/lib/embedding-service/types')
		const { documentType = DocumentType.EMPLOYEE } = input

		let totalDocuments = 0

		if (documentType === DocumentType.EMPLOYEE) {
			totalDocuments = await prisma.employee.count({
				where: { organizationId: ctx.organizationId },
			})
		} else if (documentType === DocumentType.ATTENDANCE) {
			totalDocuments = await prisma.attendance.count({
				where: { organizationId: ctx.organizationId },
			})
		} else if (documentType === DocumentType.SHIFT) {
			totalDocuments = await prisma.employeeShift.count({
				where: { employee: { organizationId: ctx.organizationId } },
			})
		}

		const [totalEmbeddings, latestEmbedding] = await Promise.all([
			prisma.documentEmbedding.count({
				where: {
					organizationId: ctx.organizationId,
					metadata: {
						path: ['type'],
						equals: documentType,
					},
				},
			}),
			prisma.documentEmbedding.findFirst({
				where: {
					organizationId: ctx.organizationId,
					metadata: {
						path: ['type'],
						equals: documentType,
					},
				},
				orderBy: {
					updatedAt: 'desc',
				},
				select: {
					updatedAt: true,
				},
			}),
		])

		const coverage =
			totalDocuments > 0
				? Math.round((totalEmbeddings / totalDocuments) * 100)
				: 0

		return {
			documentType,
			totalDocuments,
			totalEmbeddings,
			coverage,
			needsIndexing: totalDocuments - totalEmbeddings,
			lastUpdated: latestEmbedding?.updatedAt,
		}
	})

export const statsHandler = protectedProcedure.query(async ({ ctx }) => {
	const [totalChats, chatsToday, chatsThisWeek] = await Promise.all([
		prisma.chatHistory.count({
			where: {
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
			},
		}),
		prisma.chatHistory.count({
			where: {
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
				createdAt: {
					gte: normalizeTodayLocalToUTC(),
				},
			},
		}),
		prisma.chatHistory.count({
			where: {
				userId: ctx.userId || undefined,
				organizationId: ctx.organizationId,
				createdAt: {
					gte: new Date(new Date().setDate(new Date().getDate() - 7)),
				},
			},
		}),
	])

	return {
		totalChats,
		chatsToday,
		chatsThisWeek,
	}
})

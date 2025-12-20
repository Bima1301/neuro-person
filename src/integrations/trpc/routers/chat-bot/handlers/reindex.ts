import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../init'
import { chatReindexInput } from '../validation'
import type { ReindexResult } from '../types'
import { prisma } from '@/db'
import { getMonthStartUTC } from '@/lib/date-utils'
import { DocumentType } from '@/lib/embedding-service/types'
import { embeddingService } from '@/lib/embedding-service/index'

export const reindexHandler = protectedProcedure
	.input(chatReindexInput)
	.mutation(async ({ input, ctx }): Promise<ReindexResult> => {
		if (!ctx.userId) {
			throw new TRPCError({
				code: 'UNAUTHORIZED',
				message: 'User tidak terautentikasi',
			})
		}

		const user = await prisma.user.findUnique({
			where: { id: ctx.userId },
			select: { role: true },
		})

		if (!user || !['ADMIN', 'HR_MANAGER'].includes(user.role)) {
			throw new TRPCError({
				code: 'FORBIDDEN',
				message:
					'Hanya Admin atau HR Manager yang dapat melakukan re-indexing',
			})
		}

		try {
			const { documentType, documentIds, reindexAll, startDate, endDate } =
				input

			// Clean up duplicate embeddings before re-indexing
			console.log(
				`🧹 [Chat] Cleaning up duplicate embeddings before re-index...`,
			)
			try {
				if (documentType) {
					await embeddingService.cleanupDuplicates(
						ctx.organizationId,
						documentType,
					)
				} else {
					await embeddingService.cleanupDuplicates(ctx.organizationId)
				}
			} catch (cleanupError) {
				console.warn(
					'⚠️  Warning: Failed to cleanup duplicates, continuing with re-index:',
					cleanupError,
				)
			}

			if (reindexAll) {
				console.log(
					`🔄 [Chat] Starting full re-index for org: ${ctx.organizationId}`,
				)

				const results = {
					success: 0,
					failed: 0,
					errors: [] as Array<string>,
					total: 0,
				}

				// Re-index based on document type
				if (!documentType || documentType === DocumentType.EMPLOYEE) {
					const empResults =
						await embeddingService.employee.embedAllEmployees(
							ctx.organizationId,
						)
					results.success += empResults.success
					results.failed += empResults.failed
					results.errors.push(...empResults.errors)
				}

				if (!documentType || documentType === DocumentType.ATTENDANCE) {
					const now = new Date()
					const start = startDate
						? new Date(startDate)
						: getMonthStartUTC(now.getFullYear(), 1)
					const end = endDate ? new Date(endDate) : new Date()
					const attResults =
						await embeddingService.attendance.embedAttendancesByDateRange(
							ctx.organizationId,
							start,
							end,
						)
					results.success += attResults.success
					results.failed += attResults.failed
					results.errors.push(...attResults.errors)
				}

				if (!documentType || documentType === DocumentType.SHIFT) {
					const now = new Date()
					const start = startDate
						? new Date(startDate)
						: getMonthStartUTC(now.getFullYear(), 1)
					const end = endDate ? new Date(endDate) : new Date()
					const shiftResults =
						await embeddingService.shiftAllocation.embedShiftAllocationsByDateRange(
							ctx.organizationId,
							start,
							end,
						)
					results.success += shiftResults.success
					results.failed += shiftResults.failed
					results.errors.push(...shiftResults.errors)
				}

				results.total = results.success + results.failed

				return {
					message: 'Re-indexing selesai',
					...results,
				}
			}

			if (documentIds && documentIds.length > 0) {
				console.log(`🔄 [Chat] Re-indexing ${documentIds.length} documents`)

				const embedFn =
					documentType === DocumentType.ATTENDANCE
						? embeddingService.attendance.embedAttendance
						: documentType === DocumentType.SHIFT
							? embeddingService.shiftAllocation.embedShiftAllocation
							: embeddingService.employee.embedEmployee

				const results = await Promise.allSettled(
					documentIds.map((id) => embedFn(id)),
				)

				const success = results.filter((r) => r.status === 'fulfilled').length
				const failed = results.filter((r) => r.status === 'rejected').length
				const errors = results
					.filter((r) => r.status === 'rejected')
					.map(
						(r) =>
							(r as PromiseRejectedResult).reason?.message || 'Unknown error',
					)

				return {
					message: 'Re-indexing dokumen terpilih selesai',
					success,
					failed,
					total: documentIds.length,
					errors: errors.length > 0 ? errors : undefined,
				}
			}

			throw new TRPCError({
				code: 'BAD_REQUEST',
				message: 'Pilih documentIds atau set reindexAll: true',
			})
		} catch (error) {
			console.error('❌ [Chat] Error during re-indexing:', error)

			if (error instanceof TRPCError) {
				throw error
			}

			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Gagal melakukan re-indexing',
			})
		}
	})

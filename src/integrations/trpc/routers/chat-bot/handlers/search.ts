import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../init'
import { chatSearchInput } from '../validation'
import { DocumentType, vectorSearch } from '@/lib/embedding-service/utils'

export const searchHandler = protectedProcedure
	.input(chatSearchInput)
	.query(async ({ input, ctx }) => {
		const { query, documentType, limit, minSimilarity = 0 } = input

		try {
			const results = await vectorSearch(query, ctx.organizationId, {
				limit,
				documentType: documentType as DocumentType,
				minSimilarity,
			})

			return {
				results: results.map((doc) => ({
					id: doc.id,
					metadata: doc.metadata,
					similarity: Math.round(doc.similarity * 100),
					preview: doc.content.substring(0, 200) + '...',
				})),
				total: results.length,
			}
		} catch (error) {
			console.error('❌ [Chat] Error in search:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message: 'Gagal melakukan pencarian',
			})
		}
	})

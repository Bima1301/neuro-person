import { TRPCError } from '@trpc/server'
import { protectedProcedure } from '../../../init'
import { chatQueryInput } from '../validation'
import { detectQueryIntent } from '../utils/query-intent'
import { buildStatsContext } from '../utils/stats'
import {
	buildConversationContext,
	buildDocumentContext,
	buildSources,
	filterDocumentsByDate,
} from '../utils/context-builder'
import type { ChatQueryResponse, ChatSource } from '../types'
import { prisma } from '@/db'
import { generateResponse } from '@/lib/gemini'
import { DocumentType } from '@/lib/embedding-service/utils'
import { embeddingService } from '@/lib/embedding-service/index'

export const queryHandler = protectedProcedure
	.input(chatQueryInput)
	.mutation(async ({ input, ctx }): Promise<ChatQueryResponse> => {
		const { question, contextLimit = 5, conversationHistory = [] } = input
		const { userId, organizationId } = ctx

		const startTime = Date.now()

		try {
			// Build conversation context
			const conversationContext = buildConversationContext(conversationHistory)

			// Detect query intent
			const { types, isStats } = detectQueryIntent(question)
			console.log(
				`🔍 [Chat] Query intent: types=${types.join(',')}, isStats=${isStats}`,
			)

			// Get aggregate statistics if needed
			const statsContext = isStats
				? await buildStatsContext(organizationId, types)
				: ''

			// SEMANTIC SEARCH across detected document types
			console.log(`🔍 [Chat] Searching across: ${types.join(', ')}`)

			const searchPromises = types.map((type) => {
				switch (type) {
					case DocumentType.EMPLOYEE:
						return embeddingService.employee.searchEmployees(
							question,
							organizationId,
							contextLimit,
						)
					case DocumentType.ATTENDANCE:
						return embeddingService.attendance.searchAttendances(
							question,
							organizationId,
							contextLimit,
						)
					case DocumentType.SHIFT:
						return embeddingService.shiftAllocation.searchShiftAllocations(
							question,
							organizationId,
							contextLimit,
						)
					default:
						return Promise.resolve([])
				}
			})

			const searchResults = await Promise.all(searchPromises)
			const allDocs = searchResults
				.flat()
				.sort((a, b) => b.similarity - a.similarity)
			const relevantDocs = allDocs.slice(0, contextLimit)

			const searchTime = Date.now() - startTime
			console.log(
				`✅ [Chat] Found ${relevantDocs.length} relevant documents in ${searchTime}ms`,
			)

			// BUILD RAG CONTEXT
			const contextParts: Array<string> = []

			if (statsContext) {
				contextParts.push(statsContext)
			}

			let sources: Array<ChatSource> = []

			if (relevantDocs.length > 0) {
				// Filter documents by date if query mentions time period
				const filteredDocs = filterDocumentsByDate(relevantDocs, question)

				// Build document context
				const docContext = buildDocumentContext(relevantDocs, filteredDocs)
				if (docContext) {
					contextParts.push(docContext)
				}

				// Build sources
				sources = buildSources(relevantDocs, filteredDocs)
			}

			const context = contextParts.join('\n\n---\n\n') ||
				'Tidak ada data yang relevan ditemukan dalam database.'

			// GENERATE AI RESPONSE
			console.log(`🤖 [Chat] Generating AI response...`)
			const answer = await generateResponse({
				question,
				context,
				conversationHistory: conversationContext,
			})
			const totalTime = Date.now() - startTime
			console.log(`✅ [Chat] Response generated in ${totalTime}ms`)

			// SAVE CHAT HISTORY
			if (userId) {
				await prisma.chatHistory.create({
					data: {
						userId,
						organizationId,
						question,
						answer: answer || '',
						context: {
							sources: sources.map((s) => ({
								type: s.type,
								employeeId: s.employeeId,
								name: s.name,
								department: s.department,
								position: s.position,
								similarity: s.similarity,
								additionalInfo: s.additionalInfo,
							})),
							totalSources: relevantDocs.length,
							searchTime,
							totalTime,
							documentTypes: types,
						},
					},
				})
			}

			return {
				answer,
				sources,
				metadata: {
					totalSources: relevantDocs.length,
					searchTime,
					totalTime,
					documentTypes: types,
				},
			}
		} catch (error) {
			console.error('❌ [Chat] Error processing query:', error)
			throw new TRPCError({
				code: 'INTERNAL_SERVER_ERROR',
				message:
					error instanceof Error
						? error.message
						: 'Gagal memproses pertanyaan. Silakan coba lagi.',
			})
		}
	})

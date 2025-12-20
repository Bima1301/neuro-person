import type { ChatSource } from '../types'
import { normalizeTodayLocalToUTC } from '@/lib/date-utils'
import { DocumentType } from '@/lib/embedding-service/utils'

type SearchResult = {
	content: string
	similarity: number
	metadata: Record<string, unknown>
}

export function buildConversationContext(
	conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
): string {
	return conversationHistory.length > 0
		? conversationHistory
			.slice(-6)
			.map(
				(msg) =>
					`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`,
			)
			.join('\n\n')
		: ''
}

export function filterDocumentsByDate(
	docs: Array<SearchResult>,
	question: string,
): Array<SearchResult> {
	const questionLower = question.toLowerCase()
	const now = new Date()
	const currentMonth = now.getMonth()
	const currentYear = now.getFullYear()

	let filteredDocs = docs

	// Filter by "bulan ini" / "this month"
	if (
		questionLower.includes('bulan ini') ||
		questionLower.includes('this month')
	) {
		filteredDocs = docs.filter((doc) => {
			const meta = doc.metadata as { date?: string }
			if (meta.date) {
				try {
					const docDate = new Date(meta.date)
					if (!isNaN(docDate.getTime())) {
						return (
							docDate.getMonth() === currentMonth &&
							docDate.getFullYear() === currentYear
						)
					}
				} catch (e) {
					console.error('Error parsing date:', e)
				}
			}
			return true
		})
	}

	// Filter by "hari ini" / "today"
	if (questionLower.includes('hari ini') || questionLower.includes('today')) {
		const today = normalizeTodayLocalToUTC()
		const todayStr = today.toISOString().split('T')[0]
		filteredDocs = filteredDocs.filter((doc) => {
			const meta = doc.metadata as { date?: string }
			if (meta.date) {
				try {
					const docDate = new Date(meta.date)
					if (!isNaN(docDate.getTime())) {
						const docDateStr = docDate.toISOString().split('T')[0]
						return docDateStr === todayStr
					}
				} catch (e) {
					console.error('Error parsing date:', e)
				}
			}
			return true
		})
	}

	return filteredDocs
}

export function buildDocumentContext(
	docs: Array<SearchResult>,
	filteredDocs: Array<SearchResult>,
): string {
	const docsToUse = filteredDocs.length > 0 ? filteredDocs : docs

	return docsToUse.length > 0
		? docsToUse
			.map(
				(doc, idx) =>
					`[Dokumen ${idx + 1}]\nTipe: ${doc.metadata.type}\n${doc.content}`,
			)
			.join('\n\n---\n\n')
		: ''
}

export function buildSources(
	docs: Array<SearchResult>,
	filteredDocs: Array<SearchResult>,
): Array<ChatSource> {
	const docsForSources = filteredDocs.length > 0 ? filteredDocs : docs

	return docsForSources.map((doc) => {
		const meta = doc.metadata as {
			type: string
			employeeId?: string
			employeeName?: string
			name?: string
			departmentName?: string
			positionName?: string
			date?: string
			status?: string
			shiftName?: string
		}

		return {
			type: meta.type,
			employeeId: meta.employeeId,
			name: meta.employeeName || meta.name,
			department: meta.departmentName,
			position: meta.positionName,
			similarity: Math.round(doc.similarity * 100),
			preview: doc.content.substring(0, 150) + '...',
			additionalInfo:
				meta.type === DocumentType.ATTENDANCE
					? { date: meta.date, status: meta.status }
					: meta.type === DocumentType.SHIFT
						? { date: meta.date, shift: meta.shiftName }
						: undefined,
		}
	})
}

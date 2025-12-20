import { queryHandler } from './handlers/query'
import {
	clearHistoryHandler,
	deleteHandler,
	getHandler,
	historyHandler,
} from './handlers/history'
import { reindexHandler } from './handlers/reindex'
import { embeddingStatsHandler, statsHandler } from './handlers/stats'
import { searchHandler } from './handlers/search'
import type { TRPCRouterRecord } from '@trpc/server'

export const chatRouter = {
	query: queryHandler,
	history: historyHandler,
	get: getHandler,
	delete: deleteHandler,
	clearHistory: clearHistoryHandler,
	reindex: reindexHandler,
	embeddingStats: embeddingStatsHandler,
	search: searchHandler,
	stats: statsHandler,
} satisfies TRPCRouterRecord

export * from './validation'
export * from './types'

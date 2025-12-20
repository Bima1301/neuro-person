
import type { PaginatedResponse } from "@/lib/types";
import type { Prisma } from "@/generated/prisma/client";
import type { DocumentType } from "@/lib/embedding-service/utils";

/**
 * Chat history item dari database
 */
export type ChatHistoryItem = Prisma.ChatHistoryGetPayload<{
	include: {
		user: {
			select: {
				id: true;
				name: true;
				email: true;
			};
		};
	};
}>;

/**
 * Chat history tanpa include
 */
export type ChatHistoryBasic = Prisma.ChatHistoryGetPayload<{}>;

/**
 * Paginated chat history response
 */
export type ChatHistoryListResponse = PaginatedResponse<ChatHistoryItem>;

/**
 * Source document yang digunakan dalam RAG
 */
export interface ChatSource {
	type?: DocumentType
	employeeId?: string;
	name?: string;
	department?: string;
	position?: string;
	similarity: number; // Percentage 0-100
	preview?: string; // Preview content
	additionalInfo?: {
		date?: string;
		status?: string;
		shift?: string;
		[key: string]: any;
	};
}

/**
 * Metadata untuk chat context
 */
export interface ChatContextMetadata {
	sources: Array<ChatSource>;
	totalSources: number;
	searchTime: number; // milliseconds
	totalTime: number; // milliseconds
}

/**
 * Response dari chat query
 */
export interface ChatQueryResponse {
	answer: string;
	sources: Array<ChatSource>;
	metadata: {
		totalSources: number;
		searchTime: number;
		totalTime: number;
		documentTypes: Array<DocumentType>;
	};
}

/**
 * Embedding statistics
 */
export interface EmbeddingStats {
	documentType?: string;
	totalDocuments: number; // Total dokumen yang seharusnya ada
	totalEmbeddings: number; // Total embeddings yang sudah dibuat
	coverage: number; // Percentage
	needsIndexing: number; // Jumlah dokumen yang belum di-embed
	lastUpdated?: Date;
}

/**
 * Re-index result
 */
export interface ReindexResult {
	message: string;
	success: number;
	failed: number;
	total: number;
	errors?: Array<string>;
}

/**
 * Vector search result (raw)
 */
export interface VectorSearchResult<T = any> {
	id: string;
	content: string;
	metadata: T;
	similarity: number;
}

/**
 * Employee metadata dalam embedding
 */
export interface EmployeeEmbeddingMetadata {
	type: "employee";
	id: string;
	organizationId: string;
	employeeId: string;
	name: string;
	departmentId?: string;
	departmentName?: string;
	positionId?: string;
	positionName?: string;
	status: string;
	employmentType: string;
}


// src/server/routers/chat/validation.ts
import { DocumentType } from "@/lib/embedding-service/utils";
import { z } from "zod";
import { requiredStringFor } from '@/lib/utils'

export const chatQueryInput = z.object({
  question: requiredStringFor('Pertanyaan tidak boleh kosong').max(
    500,
    'Pertanyaan terlalu panjang (maksimal 500 karakter)',
  ),
  contextLimit: z.number().min(1).max(10).default(5).optional(), // Jumlah dokumen relevan
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: requiredStringFor('Konten pesan'),
      }),
    )
    .optional()
    .default([]),
})

export const chatHistoryListInput = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  search: z.string().optional(),
});

export const chatGetInput = z.object({
  id: requiredStringFor('ID chat'),
})

export const chatDeleteInput = z.object({
  id: requiredStringFor('ID chat'),
})

export const chatClearHistoryInput = z.object({
  confirm: z.literal(true),
});

export const chatReindexInput = z.object({
  documentType: z.enum(Object.values(DocumentType)).optional(),
  documentIds: z.array(z.string()).optional(),
  reindexAll: z.boolean().default(false),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const chatEmbeddingStatsInput = z.object({
  documentType: z.enum(Object.values(DocumentType)).optional(),
});

export const chatSearchInput = z.object({
  query: requiredStringFor('Query pencarian'),
  documentType: z.enum(Object.values(DocumentType)).optional(),
  limit: z.number().min(1).max(20).default(5),
  minSimilarity: z.number().min(0).max(1).default(0).optional(),
})

export type ChatQueryInput = z.infer<typeof chatQueryInput>;
export type ChatHistoryListInput = z.infer<typeof chatHistoryListInput>;
export type ChatGetInput = z.infer<typeof chatGetInput>;
export type ChatDeleteInput = z.infer<typeof chatDeleteInput>;
export type ChatClearHistoryInput = z.infer<typeof chatClearHistoryInput>;
export type ChatReindexInput = z.infer<typeof chatReindexInput>;
export type ChatEmbeddingStatsInput = z.infer<typeof chatEmbeddingStatsInput>;
export type ChatSearchInput = z.infer<typeof chatSearchInput>;
import { generateEmbedding } from '../local-embedding'
import { prisma } from '@/db'

export enum DocumentType {
  EMPLOYEE = 'employee',
  ATTENDANCE = 'attendance',
  SHIFT = 'shift',
  PERMISSION = 'permission',
}

export interface DocumentMetadata {
  type: DocumentType
  id: string
  organizationId: string
  [key: string]: any
}

/**
 * Upsert embedding to database
 */
export async function upsertEmbedding(
  organizationId: string,
  content: string,
  embeddingVector: Array<number>,
  metadata: DocumentMetadata,
): Promise<void> {
  const existing = await prisma.documentEmbedding.findFirst({
    where: {
      organizationId,
      metadata: {
        path: ['type', 'id'],
        equals: [metadata.type, metadata.id],
      },
    },
  })

  if (existing) {
    await prisma.$executeRaw`
      UPDATE "DocumentEmbedding"
      SET 
        content = ${content},
        embedding = ${JSON.stringify(embeddingVector)}::vector,
        metadata = ${JSON.stringify(metadata)}::jsonb,
        "updatedAt" = NOW()
      WHERE id = ${existing.id}
    `
  } else {
    await prisma.$executeRaw`
      INSERT INTO "DocumentEmbedding" (
        id, 
        content, 
        embedding, 
        metadata,
        "organizationId", 
        "createdAt", 
        "updatedAt"
      )
      VALUES (
        gen_random_uuid()::text,
        ${content},
        ${JSON.stringify(embeddingVector)}::vector,
        ${JSON.stringify(metadata)}::jsonb,
        ${organizationId},
        NOW(),
        NOW()
      )
    `
  }
}

/**
 * Delete embedding by document type and ID
 */
export async function deleteEmbedding(
  documentId: string,
  documentType: DocumentType,
  organizationId: string,
): Promise<void> {
  try {
    await prisma.documentEmbedding.deleteMany({
      where: {
        organizationId,
        metadata: {
          path: ['type', 'id'],
          equals: [documentType, documentId],
        },
      },
    })
    console.log(`✅ Deleted embedding for ${documentType}: ${documentId}`)
  } catch (error) {
    console.error(
      `❌ Error deleting ${documentType} embedding ${documentId}:`,
      error,
    )
    throw error
  }
}

/**
 * Vector search for documents
 */
export async function vectorSearch<T = any>(
  query: string,
  organizationId: string,
  options: {
    limit?: number
    documentType?: DocumentType
    minSimilarity?: number
  } = {},
): Promise<
  Array<{
    id: string
    content: string
    metadata: T
    similarity: number
  }>
> {
  try {
    const { limit = 5, documentType, minSimilarity = 0 } = options
    const queryEmbedding = await generateEmbedding(query)

    let whereClause = `WHERE "organizationId" = $1`
    const params: Array<any> = [organizationId]
    let paramIndex = 2

    if (documentType) {
      whereClause += ` AND metadata->>'type' = $${paramIndex}`
      params.push(documentType)
      paramIndex++
    }

    if (minSimilarity > 0) {
      whereClause += ` AND (1 - (embedding <=> $${paramIndex}::vector)) >= $${paramIndex + 1}`
      params.push(JSON.stringify(queryEmbedding), minSimilarity)
      paramIndex += 2
    } else {
      params.push(JSON.stringify(queryEmbedding))
    }

    const results = await prisma.$queryRawUnsafe<
      Array<{
        id: string
        content: string
        metadata: T
        similarity: number
      }>
    >(
      `
      SELECT 
        id,
        content,
        metadata,
        1 - (embedding <=> $${paramIndex}::vector) as similarity
      FROM "DocumentEmbedding"
      ${whereClause}
      ORDER BY embedding <=> $${paramIndex}::vector
      LIMIT $${paramIndex + 1}
      `,
      ...params,
      limit,
    )

    return results
  } catch (error) {
    console.error('Error in vector search:', error)
    throw error
  }
}

/**
 * Get embedding statistics for a document type
 */
export async function getEmbeddingStats(
  organizationId: string,
  documentType: DocumentType,
): Promise<{
  totalDocuments: number
  totalEmbeddings: number
  coverage: number
  needsIndexing: number
  lastUpdated?: Date
}> {
  let totalDocuments = 0

  // Count total documents based on type
  if (documentType === DocumentType.EMPLOYEE) {
    totalDocuments = await prisma.employee.count({
      where: { organizationId },
    })
  } else if (documentType === DocumentType.ATTENDANCE) {
    totalDocuments = await prisma.attendance.count({
      where: { organizationId },
    })
  } else if (documentType === DocumentType.SHIFT) {
    totalDocuments = await prisma.employeeShift.count({
      where: { employee: { organizationId } },
    })
  }

  // Count total embeddings
  const [totalEmbeddings, latestEmbedding] = await Promise.all([
    prisma.documentEmbedding.count({
      where: {
        organizationId,
        metadata: {
          path: ['type'],
          equals: documentType,
        },
      },
    }),
    prisma.documentEmbedding.findFirst({
      where: {
        organizationId,
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
    totalDocuments,
    totalEmbeddings,
    coverage,
    needsIndexing: totalDocuments - totalEmbeddings,
    lastUpdated: latestEmbedding?.updatedAt,
  }
}

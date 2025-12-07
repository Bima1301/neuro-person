import type { PaginatedResponse } from '@/lib/types'
import type { Prisma } from '@/generated/prisma/client'

export type PositionListItem = Prisma.PositionGetPayload<{
  include: {
    department: true
    _count: { select: { employees: true } }
  }
}>

export type PositionDetail = Prisma.PositionGetPayload<{
  include: { department: true; employees: true }
}>

export type PositionListResponse = PaginatedResponse<PositionListItem>

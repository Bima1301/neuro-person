import type { PaginatedResponse } from '@/lib/types'
import type { Prisma } from '@/generated/prisma/client'

export type DepartmentListItem = Prisma.DepartmentGetPayload<{
  include: { _count: { select: { employees: true } } }
}>

export type DepartmentDetail = Prisma.DepartmentGetPayload<{
  include: {
    employees: true
    positions: true
  }
}>

export type DepartmentListResponse = PaginatedResponse<DepartmentListItem>

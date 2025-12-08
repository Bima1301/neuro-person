import type { InfiniteResult, PaginatedResponse } from '@/lib/types'
import type { Prisma } from '@/generated/prisma/client'

export type EmployeeListItem = Prisma.EmployeeGetPayload<{
  include: {
    department: true
    position: true
    user: { select: { role: true } }
  }
}>

export type EmployeeDetail = Prisma.EmployeeGetPayload<{
  include: {
    department: true
    position: true
    user: { select: { email: true; role: true } }
    organization: { select: { name: true } }
    allowances: { include: { allowanceType: true } }
  }
}>

export type EmployeeListResponse = PaginatedResponse<EmployeeListItem>

export type EmployeeInfiniteResult = InfiniteResult<
  Prisma.EmployeeGetPayload<{
    include: {
      department: true
      position: true
    }
  }>
>

export type EmployeePaginatedResult = PaginatedResponse<
  Prisma.EmployeeGetPayload<{
    include: {
      department: true
      position: true
    }
  }>
>

export type EmployeeEmbeddingFormat = Prisma.EmployeeGetPayload<{
  include: {
    department: true,
    position: true,
    user: { select: { email: true, role: true } },
    allowances: { include: { allowanceType: true } },
  },
}>
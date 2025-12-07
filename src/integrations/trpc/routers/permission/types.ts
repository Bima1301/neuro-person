import type { PaginatedResponse } from '@/lib/types'
import type { Prisma } from '@/generated/prisma/client'

export type PermissionListItem = Prisma.PermissionRequestGetPayload<{
  include: {
    employee: {
      select: { firstName: true; lastName: true; employeeId: true }
    }
    attendanceType: true
  }
}>

export type PermissionDetail = Prisma.PermissionRequestGetPayload<{
  include: {
    employee: true
    attendanceType: true
  }
}>

export type PermissionListResponse = PaginatedResponse<PermissionListItem>

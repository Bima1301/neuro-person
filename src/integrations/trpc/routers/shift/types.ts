import type { PaginatedResponse } from '@/lib/types'
import type { Prisma } from '@/generated/prisma/client'

export type ShiftListItem = Prisma.ShiftGetPayload<{
  include: {
    _count: { select: { employeeShifts: true } }
  }
}>

export type ShiftDetail = Prisma.ShiftGetPayload<{}>

export type ShiftListResponse = PaginatedResponse<ShiftListItem>

export type EmployeeShiftItem = Prisma.EmployeeShiftGetPayload<{
  include: {
    employee: {
      select: { firstName: true; lastName: true; employeeId: true }
    }
    shift: true
  }
}>

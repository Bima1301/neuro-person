import type { Prisma } from '@/generated/prisma/client'

export type ShiftAllocationListItem = Prisma.EmployeeShiftGetPayload<{
  include: {
    employee: {
      select: {
        id: true
        employeeId: true
        firstName: true
        lastName: true
      }
    }
    attendanceType: {
      select: {
        id: true
        name: true
        code: true
        isMustPresence: true
      }
    }
    shift: {
      select: {
        id: true
        name: true
        startTime: true
        endTime: true
      }
    }
  }
}>

export type ShiftAllocationToday = Prisma.EmployeeShiftGetPayload<{
  include: {
    attendanceType: {
      select: {
        id: true
        name: true
        code: true
        isMustPresence: true
      }
    }
    shift: {
      select: {
        id: true
        name: true
        startTime: true
        endTime: true
      }
    }
  }
}>

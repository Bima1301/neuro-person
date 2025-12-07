import { protectedProcedure } from '../../init'
import {
  shiftAllocationAssignInput,
  shiftAllocationDeleteInput,
  shiftAllocationEmployeeScheduleInput,
  shiftAllocationGetTodayInput,
  shiftAllocationListInput,
  shiftAllocationMassAssignInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import type { EmployeeShift } from '@/generated/prisma/client'
import { prisma } from '@/db'
import {
  getMonthEndUTC,
  getMonthStartUTC,
  iterateDateRange,
  normalizeDateToUTC,
  normalizeTodayLocalToUTC,
} from '@/lib/date-utils'
import { embeddingService } from '@/lib/embedding-service'

export const shiftAllocationRouter = {
  list: protectedProcedure
    .input(shiftAllocationListInput)
    .query(async ({ input, ctx }) => {
      const startDate = getMonthStartUTC(input.year, input.month)
      const endDate = getMonthEndUTC(input.year, input.month)

      return await prisma.employeeShift.findMany({
        where: {
          employee: { organizationId: ctx.organizationId },
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeId: true,
              firstName: true,
              lastName: true,
            },
          },
          attendanceType: {
            select: {
              id: true,
              name: true,
              code: true,
              isMustPresence: true,
            },
          },
          shift: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: { date: 'asc' },
      })
    }),

  assign: protectedProcedure
    .input(shiftAllocationAssignInput)
    .mutation(async ({ input }) => {
      const date = normalizeDateToUTC(input.date)
      const employeeShift = await prisma.employeeShift.upsert({
        where: {
          employeeId_date: {
            employeeId: input.employeeId,
            date,
          },
        },
        update: {
          attendanceTypeId: input.attendanceTypeId,
          shiftId: input.shiftId ?? null,
        },
        create: {
          employeeId: input.employeeId,
          attendanceTypeId: input.attendanceTypeId,
          shiftId: input.shiftId ?? null,
          date,
        },
      })

      embeddingService.shiftAllocation.embedShiftAllocation(employeeShift.id)
      return employeeShift
    }),

  massAssign: protectedProcedure
    .input(shiftAllocationMassAssignInput)
    .mutation(async ({ input }) => {
      const operations: Array<Promise<EmployeeShift>> = []

      iterateDateRange(input.startDate, input.endDate, (date) => {
        const dayOfWeek = date.getUTCDay()
        if (input.days.includes(dayOfWeek)) {
          for (const assignment of input.assignments) {
            const employeeShift = prisma.employeeShift.upsert({
              where: {
                employeeId_date: {
                  employeeId: assignment.employeeId,
                  date,
                },
              },
              update: {
                attendanceTypeId: assignment.attendanceTypeId,
                shiftId: assignment.shiftId ?? null,
              },
              create: {
                employeeId: assignment.employeeId,
                attendanceTypeId: assignment.attendanceTypeId,
                shiftId: assignment.shiftId ?? null,
                date,
              },
            })
            operations.push(employeeShift)
          }
        }
      })

      const result = await Promise.all(operations)

      embeddingService.shiftAllocation.bulkEmbedShiftAllocations(
        result.map((e) => e.id),
      )

      return { success: true, count: operations.length }
    }),

  delete: protectedProcedure
    .input(shiftAllocationDeleteInput)
    .mutation(async ({ input, ctx }) => {
      const employeeShift = await prisma.employeeShift.delete({
        where: {
          id: input.id,
          employee: { organizationId: ctx.organizationId },
        },
      })

      embeddingService.shiftAllocation.deleteShiftAllocationEmbedding(
        employeeShift.id,
        ctx.organizationId,
      )

      return employeeShift
    }),

  employeeSchedule: protectedProcedure
    .input(shiftAllocationEmployeeScheduleInput)
    .mutation(async ({ input }) => {
      const { employeeId, month, year, schedules } = input
      const startDate = getMonthStartUTC(year, month)
      const endDate = getMonthEndUTC(year, month)
      const operations: Array<Promise<EmployeeShift>> = []

      iterateDateRange(startDate, endDate, (date) => {
        const dayOfWeek = date.getUTCDay()
        const schedule = schedules.find((s) => s.day === dayOfWeek)
        if (schedule) {
          operations.push(
            prisma.employeeShift.upsert({
              where: {
                employeeId_date: {
                  employeeId,
                  date,
                },
              },
              update: {
                attendanceTypeId: schedule.attendanceTypeId,
                shiftId: schedule.shiftId ?? null,
              },
              create: {
                employeeId,
                attendanceTypeId: schedule.attendanceTypeId,
                shiftId: schedule.shiftId ?? null,
                date,
              },
            }),
          )
        }
      })

      const result = await Promise.all(operations)

      embeddingService.shiftAllocation.bulkEmbedShiftAllocations(
        result.map((e) => e.id),
      )

      return { success: true, count: operations.length }
    }),

  getToday: protectedProcedure
    .input(shiftAllocationGetTodayInput)
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) {
        return null
      }

      // Get employee from user
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        include: { employee: true },
      })

      if (!user?.employee) {
        return null
      }

      // Use local timezone to determine "today" so it matches user's perception
      const date = input.date
        ? normalizeDateToUTC(input.date)
        : normalizeTodayLocalToUTC()

      return await prisma.employeeShift.findFirst({
        where: {
          employeeId: user.employee.id,
          date,
        },
        include: {
          attendanceType: {
            select: {
              id: true,
              name: true,
              code: true,
              isMustPresence: true,
            },
          },
          shift: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
            },
          },
        },
      })
    }),
} satisfies TRPCRouterRecord

export * from './validation'
export * from './types'

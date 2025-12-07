import { protectedProcedure } from '../../init'
import {
  leaveApproveInput,
  leaveCreateInput,
  leaveGetInput,
  leaveListInput,
  leaveRejectInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'

export const leaveRouter = {
  types: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.leaveType.findMany({
      where: { organizationId: ctx.organizationId },
      orderBy: { name: 'asc' },
    })
  }),

  list: protectedProcedure
    .input(leaveListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        employeeId: input?.employeeId,
        status: input?.status,
      }

      const [items, total] = await Promise.all([
        prisma.leaveRequest.findMany({
          where,
          include: {
            employee: {
              select: { firstName: true, lastName: true, employeeId: true },
            },
            leaveType: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.leaveRequest.count({ where }),
      ])

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  get: protectedProcedure.input(leaveGetInput).query(async ({ input, ctx }) => {
    return await prisma.leaveRequest.findFirst({
      where: {
        id: input.id,
        organizationId: ctx.organizationId,
      },
      include: {
        employee: true,
        leaveType: true,
      },
    })
  }),

  create: protectedProcedure
    .input(leaveCreateInput)
    .mutation(async ({ input, ctx }) => {
      const start = new Date(input.startDate)
      const end = new Date(input.endDate)
      const totalDays =
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

      return await prisma.leaveRequest.create({
        data: {
          organizationId: ctx.organizationId,
          employeeId: input.employeeId,
          leaveTypeId: input.leaveTypeId,
          startDate: start,
          endDate: end,
          totalDays,
          reason: input.reason,
        },
      })
    }),

  approve: protectedProcedure
    .input(leaveApproveInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.leaveRequest.update({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        data: {
          status: 'APPROVED',
          approvedById: input.approvedById,
          approvedAt: new Date(),
        },
      })
    }),

  reject: protectedProcedure
    .input(leaveRejectInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.leaveRequest.update({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        data: {
          status: 'REJECTED',
          rejectedReason: input.reason,
        },
      })
    }),

  pendingCount: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.leaveRequest.count({
      where: {
        organizationId: ctx.organizationId,
        status: 'PENDING',
      },
    })
  }),
} satisfies TRPCRouterRecord

export * from './validation'

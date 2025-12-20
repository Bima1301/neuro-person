import { protectedProcedure } from '../../init'
import {
  permissionApproveInput,
  permissionCreateInput,
  permissionGetInput,
  permissionInfiniteInput,
  permissionListInput,
  permissionRejectInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import type { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/db'
import { iterateDateRange, normalizeDateToUTC } from '@/lib/date-utils'

export const permissionRouter = {
  types: protectedProcedure.query(async ({ ctx }) => {
    return await prisma.attendanceType.findMany({
      where: {
        organizationId: ctx.organizationId,
        isMustPresence: false,
      },
      orderBy: { name: 'asc' },
    })
  }),

  list: protectedProcedure
    .input(permissionListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where: Prisma.PermissionRequestWhereInput = {
        organizationId: ctx.organizationId,
        ...(input?.employeeId && { employeeId: input.employeeId }),
        ...(input?.status && { status: input.status }),
        ...(input?.month &&
          input.year && {
          startDate: {
            gte: new Date(Number(input.year), Number(input.month), 1),
            lte: new Date(Number(input.year), Number(input.month) + 1, 0),
          },
        }),
      }

      // Add search filter if provided
      if (input?.search) {
        where.OR = [
          {
            employee: {
              OR: [
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
                { employeeId: { contains: input.search, mode: 'insensitive' } },
              ],
            },
          },
          {
            attendanceType: {
              name: { contains: input.search, mode: 'insensitive' },
            },
          },
          {
            reason: { contains: input.search, mode: 'insensitive' },
          },
        ]
      }

      const [items, total] = await Promise.all([
        prisma.permissionRequest.findMany({
          where,
          include: {
            employee: {
              select: { firstName: true, lastName: true, employeeId: true },
            },
            attendanceType: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.permissionRequest.count({ where }),
      ])

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  infinite: protectedProcedure
    .input(permissionInfiniteInput)
    .query(async ({ input, ctx }) => {
      const limit = input?.limit ?? 10

      const where: Prisma.PermissionRequestWhereInput = {
        organizationId: ctx.organizationId,
        ...(input?.employeeId && { employeeId: input.employeeId }),
        ...(input?.status && { status: input.status }),
        ...(input?.month &&
          input.year && {
          startDate: {
            gte: new Date(Number(input.year), Number(input.month) - 1, 1),
            lte: new Date(Number(input.year), Number(input.month), 0),
          },
        }),
        ...(input?.cursor && {
          id: {
            lt: input.cursor,
          },
        }),
      }

      if (input?.search) {
        where.OR = [
          {
            employee: {
              OR: [
                { firstName: { contains: input.search, mode: 'insensitive' } },
                { lastName: { contains: input.search, mode: 'insensitive' } },
                { employeeId: { contains: input.search, mode: 'insensitive' } },
              ],
            },
          },
          {
            attendanceType: {
              name: { contains: input.search, mode: 'insensitive' },
            },
          },
          {
            reason: { contains: input.search, mode: 'insensitive' },
          },
        ]
      }

      const items = await prisma.permissionRequest.findMany({
        where,
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeId: true },
          },
          attendanceType: true,
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: limit + 1,
      })

      let nextCursor: string | undefined
      if (items.length > limit) {
        const nextItem = items.pop()
        nextCursor = nextItem?.id
      }

      return {
        items,
        nextCursor,
      }
    }),

  get: protectedProcedure
    .input(permissionGetInput)
    .query(async ({ input, ctx }) => {
      return await prisma.permissionRequest.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          employee: true,
          attendanceType: true,
        },
      })
    }),

  create: protectedProcedure
    .input(permissionCreateInput)
    .mutation(async ({ input, ctx }) => {
      const start = new Date(input.startDate)
      const end = new Date(input.endDate)

      const permissionByDate = await prisma.permissionRequest.findFirst({
        where: {
          employeeId: input.employeeId,
          startDate: {
            gte: start,
            lte: end,
          },
        },
      })

      if (permissionByDate && permissionByDate.status !== 'PENDING') {
        throw new Error('Karyawan sudah memiliki perizinan pada tanggal tersebut')
      }

      return await prisma.permissionRequest.create({
        data: {
          organizationId: ctx.organizationId,
          employeeId: input.employeeId,
          attendanceTypeId: input.attendanceTypeId,
          startDate: start,
          endDate: end,
          reason: input.reason,
        },
      })
    }),

  approve: protectedProcedure
    .input(permissionApproveInput)
    .mutation(async ({ input, ctx }) => {
      const permissionRequest = await prisma.permissionRequest.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })

      if (!permissionRequest) {
        throw new Error('Permission request not found')
      }

      return await prisma.$transaction(async (tx) => {
        const updatedPermission = await tx.permissionRequest.update({
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

        const startDate = normalizeDateToUTC(permissionRequest.startDate)
        const endDate = normalizeDateToUTC(permissionRequest.endDate)

        const dates: Array<Date> = []
        iterateDateRange(startDate, endDate, (date) => {
          dates.push(date)
        })

        await Promise.all(
          dates.map((date) =>
            tx.employeeShift.upsert({
              where: {
                employeeId_date: {
                  employeeId: permissionRequest.employeeId,
                  date: date,
                },
              },
              update: {
                attendanceTypeId: permissionRequest.attendanceTypeId,
                shiftId: null, // Set shift to null for permission days
              },
              create: {
                employeeId: permissionRequest.employeeId,
                attendanceTypeId: permissionRequest.attendanceTypeId,
                shiftId: null, // Set shift to null for permission days
                date: date,
              },
            }),
          ),
        )

        return updatedPermission
      })
    }),

  reject: protectedProcedure
    .input(permissionRejectInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.permissionRequest.update({
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
    return await prisma.permissionRequest.count({
      where: {
        organizationId: ctx.organizationId,
        status: 'PENDING',
      },
    })
  }),
} satisfies TRPCRouterRecord

export * from './validation'
export * from './types'

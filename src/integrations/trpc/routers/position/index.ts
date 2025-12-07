import { protectedProcedure } from '../../init'
import {
  positionCreateInput,
  positionDeleteInput,
  positionGetInput,
  positionListInput,
  positionUpdateInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'

export const positionRouter = {
  list: protectedProcedure
    .input(positionListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        ...(input?.departmentId && { departmentId: input.departmentId }),
        ...(input?.search && {
          name: { contains: input.search, mode: 'insensitive' as const },
        }),
      }

      const [items, total] = await Promise.all([
        prisma.position.findMany({
          where,
          include: {
            department: true,
            _count: { select: { employees: true } },
          },
          orderBy: { name: 'asc' },
          skip,
          take: perPage,
        }),
        prisma.position.count({ where }),
      ])

      return {
        items,
        total,
        page,
        perPage,
        totalPages: Math.ceil(total / perPage),
      }
    }),

  get: protectedProcedure
    .input(positionGetInput)
    .query(async ({ input, ctx }) => {
      return await prisma.position.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: { department: true, employees: true },
      })
    }),

  create: protectedProcedure
    .input(positionCreateInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.position.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
        },
      })
    }),

  update: protectedProcedure
    .input(positionUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      return await prisma.position.update({
        where: {
          id,
          organizationId: ctx.organizationId,
        },
        data,
      })
    }),

  delete: protectedProcedure
    .input(positionDeleteInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.position.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })
    }),
} satisfies TRPCRouterRecord

export * from './validation'
export * from './types'

import { protectedProcedure } from '../../init'
import {
  salaryComponentCreateInput,
  salaryComponentDeleteInput,
  salaryComponentGetInput,
  salaryComponentListInput,
  salaryComponentUpdateInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'

export const salaryComponentRouter = {
  list: protectedProcedure
    .input(salaryComponentListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        ...(input?.search && {
          name: { contains: input.search, mode: 'insensitive' as const },
        }),
        ...(input?.type && { type: input.type }),
      }

      const [items, total] = await Promise.all([
        prisma.salaryComponent.findMany({
          where,
          orderBy: { name: 'asc' },
          skip,
          take: perPage,
        }),
        prisma.salaryComponent.count({ where }),
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
    .input(salaryComponentGetInput)
    .query(async ({ input, ctx }) => {
      return await prisma.salaryComponent.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })
    }),

  create: protectedProcedure
    .input(salaryComponentCreateInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.salaryComponent.create({
        data: {
          ...input,
          organizationId: ctx.organizationId,
        },
      })
    }),

  update: protectedProcedure
    .input(salaryComponentUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input
      return await prisma.salaryComponent.update({
        where: {
          id,
          organizationId: ctx.organizationId,
        },
        data,
      })
    }),

  delete: protectedProcedure
    .input(salaryComponentDeleteInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.salaryComponent.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })
    }),
} satisfies TRPCRouterRecord

export * from './validation'

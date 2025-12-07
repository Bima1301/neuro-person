import { protectedProcedure } from '../../init'
import {
  payrollGenerateInput,
  payrollGetInput,
  payrollListInput,
  payrollSummaryInput,
  payrollUpdateStatusInput,
} from './validation'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'

export const payrollRouter = {
  list: protectedProcedure
    .input(payrollListInput)
    .query(async ({ input, ctx }) => {
      const page = input?.page ?? 1
      const perPage = input?.perPage ?? 10
      const skip = (page - 1) * perPage

      const where = {
        organizationId: ctx.organizationId,
        employeeId: input?.employeeId,
        status: input?.status,
        ...(input?.period && { period: new Date(input.period) }),
      }

      const [items, total] = await Promise.all([
        prisma.payroll.findMany({
          where,
          include: {
            employee: {
              select: { firstName: true, lastName: true, employeeId: true },
            },
          },
          orderBy: { period: 'desc' },
          skip,
          take: perPage,
        }),
        prisma.payroll.count({ where }),
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
    .input(payrollGetInput)
    .query(async ({ input, ctx }) => {
      return await prisma.payroll.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          employee: {
            include: {
              department: true,
              position: true,
              allowances: { include: { allowanceType: true } },
            },
          },
        },
      })
    }),

  generate: protectedProcedure
    .input(payrollGenerateInput)
    .mutation(async ({ input, ctx }) => {
      const period = new Date(input.period)
      const employees = await prisma.employee.findMany({
        where: {
          organizationId: ctx.organizationId,
          status: 'ACTIVE',
        },
        include: { allowances: true },
      })

      const payrolls = await Promise.all(
        employees.map(async (emp) => {
          const totalAllowance = emp.allowances.reduce(
            (sum, a) => sum + a.amount,
            0,
          )
          const netSalary = emp.baseSalary + totalAllowance

          return prisma.payroll.upsert({
            where: { employeeId_period: { employeeId: emp.id, period } },
            update: { baseSalary: emp.baseSalary, totalAllowance, netSalary },
            create: {
              organizationId: ctx.organizationId,
              employeeId: emp.id,
              period,
              baseSalary: emp.baseSalary,
              totalAllowance,
              netSalary,
            },
          })
        }),
      )

      return payrolls
    }),

  updateStatus: protectedProcedure
    .input(payrollUpdateStatusInput)
    .mutation(async ({ input, ctx }) => {
      return await prisma.payroll.update({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        data: {
          status: input.status,
          paidAt: input.status === 'PAID' ? new Date() : null,
        },
      })
    }),

  summary: protectedProcedure
    .input(payrollSummaryInput)
    .query(async ({ input, ctx }) => {
      const where = {
        organizationId: ctx.organizationId,
        ...(input?.period && { period: new Date(input.period) }),
      }

      const [total, paid, pending] = await Promise.all([
        prisma.payroll.aggregate({ where, _sum: { netSalary: true } }),
        prisma.payroll.aggregate({
          where: { ...where, status: 'PAID' },
          _sum: { netSalary: true },
        }),
        prisma.payroll.count({ where: { ...where, status: 'PENDING' } }),
      ])

      return {
        totalAmount: total._sum.netSalary || 0,
        paidAmount: paid._sum.netSalary || 0,
        pendingCount: pending,
      }
    }),
} satisfies TRPCRouterRecord

export * from './validation'

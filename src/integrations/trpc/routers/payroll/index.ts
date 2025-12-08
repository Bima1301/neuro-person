import { protectedProcedure } from '../../init'
import {
  payrollDeleteInput,
  payrollGenerateInput,
  payrollGetInput,
  payrollListInput,
  payrollSummaryInput,
  payrollUpdateInput,
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
          payrollComponents: true,
        },
      })
    }),

  generate: protectedProcedure
    .input(payrollGenerateInput)
    .mutation(async ({ input, ctx }) => {
      const period = new Date(input.period)
      
      // Verify employee belongs to organization
      const employee = await prisma.employee.findFirst({
        where: {
          id: input.employeeId,
          organizationId: ctx.organizationId,
          status: 'ACTIVE',
        },
      })

      if (!employee) {
        throw new Error('Karyawan tidak ditemukan')
      }

      // Get all salary components from master data
      const salaryComponents = await prisma.salaryComponent.findMany({
        where: {
          organizationId: ctx.organizationId,
        },
      })

      // Calculate totals from master data components
      let totalAllowance = 0
      let totalDeduction = 0

      salaryComponents.forEach((sc) => {
        const amount = sc.amount ?? 0
        if (sc.type === 'ADDITION') {
          totalAllowance += amount
        } else {
          totalDeduction += amount
        }
      })

      const grossSalary = employee.baseSalary + totalAllowance
      const netSalary = grossSalary - totalDeduction

      const payroll = await prisma.payroll.upsert({
        where: { employeeId_period: { employeeId: employee.id, period } },
        update: {
          baseSalary: employee.baseSalary,
          grossSalary,
          totalAllowance,
          totalDeduction,
          netSalary,
        },
        create: {
          organizationId: ctx.organizationId,
          employeeId: employee.id,
          period,
          baseSalary: employee.baseSalary,
          grossSalary,
          totalAllowance,
          totalDeduction,
          netSalary,
        },
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeId: true },
          },
        },
      })

      // Delete existing payroll components
      await prisma.payrollComponent.deleteMany({
        where: { payrollId: payroll.id },
      })

      // Create payroll components from master data
      if (salaryComponents.length > 0) {
        await prisma.payrollComponent.createMany({
          data: salaryComponents.map((sc) => ({
            payrollId: payroll.id,
            name: sc.name,
            type: sc.type,
            amount: sc.amount ?? 0,
            sourceId: sc.id, // Link to master data
          })),
        })
      }

      return await prisma.payroll.findFirst({
        where: { id: payroll.id },
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeId: true },
          },
          payrollComponents: true,
        },
      })
    }),

  update: protectedProcedure
    .input(payrollUpdateInput)
    .mutation(async ({ input, ctx }) => {
      const payroll = await prisma.payroll.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
        include: {
          payrollComponents: true,
        },
      })

      if (!payroll) {
        throw new Error('Payroll tidak ditemukan')
      }

      // Update base salary if provided
      const baseSalary = input.baseSalary ?? payroll.baseSalary

      // Handle components
      if (input.components !== undefined) {
        // Delete existing components
        await prisma.payrollComponent.deleteMany({
          where: { payrollId: payroll.id },
        })

        // Create new components
        if (input.components.length > 0) {
          await prisma.payrollComponent.createMany({
            data: input.components.map((comp) => ({
              payrollId: payroll.id,
              name: comp.name,
              type: comp.type,
              amount: comp.amount,
              sourceId: comp.sourceId ?? null,
            })),
          })
        }

        // Recalculate totals
        const updatedComponents = await prisma.payrollComponent.findMany({
          where: { payrollId: payroll.id },
        })

        const totalAllowance = updatedComponents
          .filter((pc) => pc.type === 'ADDITION')
          .reduce((sum, pc) => sum + pc.amount, 0)

        const totalDeduction = updatedComponents
          .filter((pc) => pc.type === 'DEDUCTION')
          .reduce((sum, pc) => sum + pc.amount, 0)

        const grossSalary = baseSalary + totalAllowance
        const netSalary = grossSalary - totalDeduction

        return await prisma.payroll.update({
          where: { id: payroll.id },
          data: {
            baseSalary,
            grossSalary,
            totalAllowance,
            totalDeduction,
            netSalary,
          },
          include: {
            employee: {
              select: { firstName: true, lastName: true, employeeId: true },
            },
            payrollComponents: true,
          },
        })
      }

      // If no components update, just update base salary
      return await prisma.payroll.update({
        where: { id: payroll.id },
        data: { baseSalary },
        include: {
          employee: {
            select: { firstName: true, lastName: true, employeeId: true },
          },
          payrollComponents: true,
        },
      })
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

  delete: protectedProcedure
    .input(payrollDeleteInput)
    .mutation(async ({ input, ctx }) => {
      const payroll = await prisma.payroll.findFirst({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
        },
      })

      if (!payroll) {
        throw new Error('Payroll tidak ditemukan')
      }

      if (payroll.status === 'PAID') {
        throw new Error('Payroll yang sudah dibayar tidak bisa dihapus')
      }

      // Delete payroll components first (cascade)
      await prisma.payrollComponent.deleteMany({
        where: { payrollId: payroll.id },
      })

      // Delete payroll
      return await prisma.payroll.delete({
        where: {
          id: input.id,
          organizationId: ctx.organizationId,
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

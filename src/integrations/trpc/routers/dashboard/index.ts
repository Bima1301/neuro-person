import { protectedProcedure } from '../../init'
import type { TRPCRouterRecord } from '@trpc/server'
import { prisma } from '@/db'
import {
  getMonthStartUTC,
  normalizeTodayLocalToUTC,
  normalizeTodayToUTC,
} from '@/lib/date-utils'

export const dashboardRouter = {
  stats: protectedProcedure.query(async ({ ctx }) => {
    const today = normalizeTodayToUTC()

    const [
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      todayAttendance,
      pendingPermissionRequests,
      thisMonthPayroll,
    ] = await Promise.all([
      prisma.employee.count({ where: { organizationId: ctx.organizationId } }),
      prisma.employee.count({
        where: { organizationId: ctx.organizationId, status: 'ACTIVE' },
      }),
      prisma.employee.count({
        where: { organizationId: ctx.organizationId, status: 'INACTIVE' },
      }),
      prisma.department.count({
        where: { organizationId: ctx.organizationId },
      }),
      prisma.attendance.count({
        where: { organizationId: ctx.organizationId, date: today },
      }),
      prisma.permissionRequest.count({
        where: { organizationId: ctx.organizationId, status: 'PENDING' },
      }),
      prisma.payroll.aggregate({
        where: {
          organizationId: ctx.organizationId,
          period: {
            gte: getMonthStartUTC(
              today.getUTCFullYear(),
              today.getUTCMonth() + 1,
            ),
            lt: getMonthStartUTC(
              today.getUTCFullYear(),
              today.getUTCMonth() + 2,
            ),
          },
          status: 'PAID',
        },
        _sum: { netSalary: true },
      }),
    ])

    return {
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      totalDepartments,
      todayAttendance,
      pendingPermissionRequests,
      totalPayroll: thisMonthPayroll._sum.netSalary || 0,
    }
  }),

  recentActivities: protectedProcedure.query(async ({ ctx }) => {
    const [recentPermissions, recentAttendance] = await Promise.all([
      prisma.permissionRequest.findMany({
        where: { organizationId: ctx.organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { firstName: true, lastName: true } },
          attendanceType: { select: { name: true } },
        },
      }),
      prisma.attendance.findMany({
        where: { organizationId: ctx.organizationId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          employee: { select: { firstName: true, lastName: true } },
        },
      }),
    ])

    return { recentPermissions, recentAttendance }
  }),

  attendanceToday: protectedProcedure.query(async ({ ctx }) => {
    const today = normalizeTodayLocalToUTC()

    const [present, late, absent, permission] = await Promise.all([
      prisma.attendance.count({
        where: {
          organizationId: ctx.organizationId,
          date: today,
          status: 'PRESENT',
        },
      }),
      prisma.attendance.count({
        where: {
          organizationId: ctx.organizationId,
          date: today,
          status: 'LATE',
        },
      }),
      prisma.attendance.count({
        where: {
          organizationId: ctx.organizationId,
          date: today,
          status: 'ABSENT',
        },
      }),
      prisma.permissionRequest.count({
        where: {
          organizationId: ctx.organizationId,
          status: 'APPROVED',
          startDate: { lte: today },
          endDate: { gte: today },
        },
      }),
    ])

    return { present, late, absent, permission }
  }),
} satisfies TRPCRouterRecord

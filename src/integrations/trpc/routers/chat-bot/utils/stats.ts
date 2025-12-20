import { prisma } from '@/db'
import { getMonthStartUTC, normalizeTodayLocalToUTC } from '@/lib/date-utils'
import { DocumentType } from '@/lib/embedding-service/utils'

export async function getEmployeeStats(organizationId: string) {
	const [totalEmployees, activeEmployees, employeesByDept] =
		await Promise.all([
			prisma.employee.count({ where: { organizationId } }),
			prisma.employee.count({
				where: { organizationId, status: 'ACTIVE' },
			}),
			prisma.employee.groupBy({
				by: ['departmentId'],
				where: { organizationId },
				_count: true,
			}),
		])

	const deptIds = employeesByDept
		.map((e) => e.departmentId)
		.filter((id): id is string => id !== null)
	const departments = await prisma.department.findMany({
		where: { id: { in: deptIds } },
		select: { id: true, name: true },
	})
	const deptMap = new Map(departments.map((d) => [d.id, d.name]))

	return {
		total: totalEmployees,
		active: activeEmployees,
		byDepartment: employeesByDept.map((e) => ({
			dept: deptMap.get(e.departmentId || '') || 'Tidak ada',
			count: e._count,
		})),
	}
}

export async function getAttendanceStats(organizationId: string) {
	const today = normalizeTodayLocalToUTC()
	const now = new Date()
	const startOfMonth = getMonthStartUTC(
		now.getFullYear(),
		now.getMonth() + 1,
	)

	const [todayAttendances, monthAttendances, attendancesByStatus] =
		await Promise.all([
			prisma.attendance.count({
				where: {
					organizationId,
					date: today,
				},
			}),
			prisma.attendance.count({
				where: {
					organizationId,
					date: { gte: startOfMonth },
				},
			}),
			prisma.attendance.groupBy({
				by: ['status'],
				where: {
					organizationId,
					date: { gte: startOfMonth },
				},
				_count: true,
			}),
		])

	return {
		today: todayAttendances,
		thisMonth: monthAttendances,
		byStatus: attendancesByStatus.map((a) => ({
			status: a.status,
			count: a._count,
		})),
	}
}

export async function getShiftStats(organizationId: string) {
	const today = normalizeTodayLocalToUTC()
	const [totalShifts, todayAllocations] = await Promise.all([
		prisma.shift.count({ where: { organizationId } }),
		prisma.employeeShift.count({
			where: {
				employee: { organizationId },
				date: today,
			},
		}),
	])

	return {
		totalShiftTypes: totalShifts,
		todayAllocations: todayAllocations,
	}
}

export async function buildStatsContext(
	organizationId: string,
	types: Array<DocumentType>,
): Promise<string> {
	const statsData: Record<string, unknown> = {}

	// Employee stats
	if (types.includes(DocumentType.EMPLOYEE)) {
		statsData.employees = await getEmployeeStats(organizationId)
	}

	// Attendance stats
	if (types.includes(DocumentType.ATTENDANCE)) {
		statsData.attendance = await getAttendanceStats(organizationId)
	}

	// Shift stats
	if (types.includes(DocumentType.SHIFT)) {
		statsData.shifts = await getShiftStats(organizationId)
	}

	// Format stats context
	const statsParts: Array<string> = ['STATISTIK:']
	if (statsData.employees) {
		const emp = statsData.employees as {
			total: number
			active: number
			byDepartment: Array<{ dept: string; count: number }>
		}
		statsParts.push(`\nKARYAWAN:
- Total: ${emp.total}
- Aktif: ${emp.active}
- Per Department: ${emp.byDepartment.map((d) => `${d.dept} (${d.count})`).join(', ')}`)
	}
	if (statsData.attendance) {
		const att = statsData.attendance as {
			today: number
			thisMonth: number
			byStatus: Array<{ status: string; count: number }>
		}
		statsParts.push(`\nKEHADIRAN:
- Hari ini: ${att.today}
- Bulan ini: ${att.thisMonth}
- Per Status: ${att.byStatus.map((s) => `${s.status} (${s.count})`).join(', ')}`)
	}
	if (statsData.shifts) {
		const shift = statsData.shifts as {
			totalShiftTypes: number
			todayAllocations: number
		}
		statsParts.push(`\nSHIFT:
- Total Tipe Shift: ${shift.totalShiftTypes}
- Alokasi Hari Ini: ${shift.todayAllocations}`)
	}

	return statsParts.join('\n')
}

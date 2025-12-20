import type { PrismaClient } from '../../src/generated/prisma/client.js'

type Employee = { id: string }
type AttendanceType = { id: string; name: string; code: string | null; isMustPresence: boolean }
type Shift = { id: string; name: string; startTime: string; endTime: string }

export async function createEmployeeShifts(
	prisma: PrismaClient,
	employees: Array<Employee>,
	attendanceTypes: Array<AttendanceType>,
	shifts: Array<Shift>,
) {
	console.log('📅 Creating employee shifts...')

	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const shiftAllocations = []
	for (let dayOffset = -30; dayOffset <= 7; dayOffset++) {
		const date = new Date(today)
		date.setDate(date.getDate() + dayOffset)

		// Skip weekends for work days
		const dayOfWeek = date.getDay()
		if (dayOfWeek === 0 || dayOfWeek === 6) {
			// Weekend - create as holiday or leave
			for (const employee of employees) {
				const holidayType = attendanceTypes.find(
					(t) => t.code === 'NATIONAL_HOLIDAY',
				)
				if (holidayType) {
					shiftAllocations.push({
						employeeId: employee.id,
						attendanceTypeId: holidayType.id,
						shiftId: null,
						date: new Date(date),
					})
				}
			}
		} else {
			// Weekday - assign shifts
			for (let i = 0; i < employees.length; i++) {
				const employee = employees[i]!
				const shift =
					i % 3 === 0
						? shifts[0] // Pagi
						: i % 3 === 1
							? shifts[1] // Siang
							: shifts[0] // Mostly pagi

				const workDayType = attendanceTypes.find(
					(t) => t.code === 'WORK_DAY',
				)
				if (workDayType && shift) {
					shiftAllocations.push({
						employeeId: employee.id,
						attendanceTypeId: workDayType.id,
						shiftId: shift.id,
						date: new Date(date),
					})
				}
			}
		}
	}

	for (const allocationData of shiftAllocations) {
		await prisma.employeeShift.create({
			data: allocationData,
		})
	}
	console.log(`✅ Created ${shiftAllocations.length} shift allocations`)

	return shiftAllocations
}

export async function createAttendances(
	prisma: PrismaClient,
	organizationId: string,
	employees: Array<Employee>,
	shifts: Array<Shift>,
	shiftAllocations: Array<{
		employeeId: string
		attendanceTypeId: string
		shiftId: string | null
		date: Date
	}>,
	attendanceTypes: Array<AttendanceType>,
) {
	console.log('⏰ Creating attendance records...')

	const attendances = []
	const workDayShifts = shiftAllocations.filter(
		(s) => {
			const workDayType = attendanceTypes.find((t) => t.code === 'WORK_DAY')
			return workDayType && s.attendanceTypeId === workDayType.id && s.shiftId !== null
		},
	)

	for (const shiftAlloc of workDayShifts.slice(0, 120)) {
		// Limit to 120 records (about 15 per employee)
		const shift = shifts.find((s) => s.id === shiftAlloc.shiftId)
		if (!shift) continue

		const [startHour, startMin] = shift.startTime.split(':').map(Number)
		const [endHour, endMin] = shift.endTime.split(':').map(Number)

		const checkInTime = new Date(shiftAlloc.date)
		checkInTime.setHours(startHour + Math.floor(Math.random() * 30) / 60, startMin, 0, 0) // Random 0-30 min after start

		const checkOutTime = new Date(shiftAlloc.date)
		checkOutTime.setHours(endHour, endMin - Math.floor(Math.random() * 30), 0, 0) // Random 0-30 min before end

		// Some random statuses
		let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT'
		if (Math.random() < 0.1) status = 'LATE'
		if (Math.random() < 0.05) status = 'ABSENT'

		const employee = employees.find((e) => e.id === shiftAlloc.employeeId)
		if (!employee) continue

		attendances.push({
			organizationId,
			employeeId: employee.id,
			date: new Date(shiftAlloc.date),
			checkIn: status !== 'ABSENT' ? checkInTime : null,
			checkOut: status !== 'ABSENT' ? checkOutTime : null,
			checkInLat: status !== 'ABSENT' ? -6.2088 + (Math.random() - 0.5) * 0.001 : null,
			checkInLng: status !== 'ABSENT' ? 106.8456 + (Math.random() - 0.5) * 0.001 : null,
			checkOutLat: status !== 'ABSENT' ? -6.2088 + (Math.random() - 0.5) * 0.001 : null,
			checkOutLng: status !== 'ABSENT' ? 106.8456 + (Math.random() - 0.5) * 0.001 : null,
			status: status,
			notes: status === 'LATE' ? 'Terlambat karena macet' : null,
		})
	}

	for (const attData of attendances) {
		await prisma.attendance.create({
			data: attData,
		})
	}
	console.log(`✅ Created ${attendances.length} attendance records`)
}

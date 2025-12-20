import { DEMO_ATTENDANCE_TYPES, DEMO_SHIFTS } from './data.js'
import type { PrismaClient } from '../../src/generated/prisma/client.js'

export async function createShifts(
	prisma: PrismaClient,
	organizationId: string,
) {
	console.log('🕐 Creating shifts...')

	const createdShifts = []
	for (const shiftData of DEMO_SHIFTS) {
		const shift = await prisma.shift.create({
			data: {
				...shiftData,
				organizationId,
			},
		})
		createdShifts.push(shift)
		console.log(`✅ Shift created: ${shift.name}`)
	}

	return createdShifts
}

export async function createAttendanceTypes(
	prisma: PrismaClient,
	organizationId: string,
) {
	console.log('📋 Creating attendance types...')

	const createdAttendanceTypes: Array<{
		id: string
		name: string
		code: string | null
		isMustPresence: boolean
	}> = []

	for (const attTypeData of DEMO_ATTENDANCE_TYPES) {
		const attType = await prisma.attendanceType.create({
			data: {
				...attTypeData,
				organizationId,
			},
			select: {
				id: true,
				name: true,
				code: true,
				isMustPresence: true,
			},
		})
		createdAttendanceTypes.push(attType)
		console.log(`✅ Attendance type created: ${attType.name}`)
	}

	return createdAttendanceTypes
}

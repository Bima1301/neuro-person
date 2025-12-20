import { DEMO_DEPARTMENTS, DEMO_POSITIONS } from './data.js'
import type { PrismaClient } from '../../src/generated/prisma/client.js'

export async function createDepartments(
	prisma: PrismaClient,
	organizationId: string,
) {
	console.log('🏢 Creating departments...')

	const createdDepartments = []
	for (const deptData of DEMO_DEPARTMENTS) {
		const dept = await prisma.department.create({
			data: {
				name: deptData.name,
				description: deptData.description,
				organizationId,
			},
		})
		createdDepartments.push(dept)
		console.log(`✅ Department created: ${dept.name}`)
	}

	return createdDepartments
}

export async function createPositions(
	prisma: PrismaClient,
	organizationId: string,
	departments: Array<{ id: string }>,
) {
	console.log('💼 Creating positions...')

	const createdPositions = []
	for (const posData of DEMO_POSITIONS) {
		const department = departments[posData.departmentIndex]
		if (!department) {
			throw new Error(
				`Department index ${posData.departmentIndex} not found`,
			)
		}

		const pos = await prisma.position.create({
			data: {
				name: posData.name,
				description: posData.description,
				departmentId: department.id,
				baseSalary: posData.baseSalary,
				shiftPresenceType: posData.shiftPresenceType,
				locationPresenceType: posData.locationPresenceType,
				organizationId,
			},
		})
		createdPositions.push(pos)
		console.log(`✅ Position created: ${pos.name}`)
	}

	return createdPositions
}

import { createPrismaClient } from './utils.js'
import { createOrganization } from './organization.js'
import { createUsers } from './users.js'
import {
	createDepartments,
	createPositions,
} from './departments.js'
import { createAttendanceTypes, createShifts } from './shifts.js'
import {
	createAllowanceTypes,
	createEmployeeAllowances,
	createEmployees,
} from './employees.js'
import {
	createAttendances,
	createEmployeeShifts,
} from './attendance.js'
import { generateEmbeddings } from './embeddings.js'

export async function seed() {
	console.log('🌱 Starting seed for demo account...')

	const prisma = createPrismaClient()

	try {
		// 1. Create Organization
		const organization = await createOrganization(prisma)

		// 2. Create Users
		const users = await createUsers(prisma, organization.id)

		// 3. Create Departments
		const departments = await createDepartments(prisma, organization.id)

		// 4. Create Positions
		const positions = await createPositions(
			prisma,
			organization.id,
			departments,
		)

		// 5. Create Shifts
		const shifts = await createShifts(prisma, organization.id)

		// 6. Create Attendance Types
		const attendanceTypes = await createAttendanceTypes(
			prisma,
			organization.id,
		)

		// 7. Create Employees
		const employees = await createEmployees(
			prisma,
			organization.id,
			users,
			departments,
			positions,
		)

		// 8. Create Allowance Types
		const allowanceTypes = await createAllowanceTypes(
			prisma,
			organization.id,
		)

		// 9. Create Employee Allowances
		await createEmployeeAllowances(prisma, employees, allowanceTypes)

		// 10. Create Employee Shifts
		const shiftAllocations = await createEmployeeShifts(
			prisma,
			employees,
			attendanceTypes,
			shifts,
		)

		// 11. Create Attendances
		await createAttendances(
			prisma,
			organization.id,
			employees,
			shifts,
			shiftAllocations,
			attendanceTypes,
		)

		// 12. Generate Embeddings
		await generateEmbeddings(organization.id)

		// Summary
		console.log('')
		console.log('✅ Seed completed successfully!')
		console.log('')
		console.log('📝 Demo Account Credentials:')
		console.log('   All users use password: 123123123')
		console.log('')
		console.log('👤 Available Users:')
		console.log('   - admin@demo.com (ADMIN)')
		console.log('   - hr@demo.com (HR_MANAGER)')
		console.log('   - manager@demo.com (MANAGER)')
		console.log('   - employee1@demo.com (EMPLOYEE - Budi Santoso)')
		console.log('   - employee2@demo.com (EMPLOYEE - Siti Nurhaliza)')
		console.log('   - employee3@demo.com (EMPLOYEE - Ahmad Fauzi)')
		console.log('   - employee4@demo.com (EMPLOYEE - Dewi Sartika)')
		console.log('   - employee5@demo.com (EMPLOYEE - Rizki Ramadhan)')
		console.log('')
		console.log('🎉 Chatbot is ready to use with the seeded data!')
	} finally {
		await prisma.$disconnect()
	}
}

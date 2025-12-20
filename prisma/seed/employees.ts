import { DEMO_ALLOWANCE_TYPES } from './data.js'
import type { PrismaClient } from '../../src/generated/prisma/client.js'

type User = { id: string; employeeId: string; email: string }
type Department = { id: string }
type Position = { id: string }

const EMPLOYEE_DATA = [
	{
		firstName: 'Admin',
		lastName: 'Demo',
		phone: '+6281234567890',
		address: 'Jl. Admin No. 1',
		city: 'Jakarta',
		dateOfBirth: '1990-01-15',
		gender: 'MALE' as const,
		maritalStatus: 'SINGLE' as const,
		departmentIndex: 0,
		positionIndex: 0,
		hireDate: '2020-01-01',
		baseSalary: 25000000,
	},
	{
		firstName: 'HR',
		lastName: 'Manager',
		phone: '+6281234567891',
		address: 'Jl. HR No. 2',
		city: 'Jakarta',
		dateOfBirth: '1988-05-20',
		gender: 'FEMALE' as const,
		maritalStatus: 'MARRIED' as const,
		departmentIndex: 1,
		positionIndex: 1,
		hireDate: '2020-02-01',
		baseSalary: 15000000,
	},
	{
		firstName: 'Manager',
		lastName: 'Demo',
		phone: '+6281234567892',
		address: 'Jl. Manager No. 3',
		city: 'Jakarta',
		dateOfBirth: '1987-08-10',
		gender: 'MALE' as const,
		maritalStatus: 'MARRIED' as const,
		departmentIndex: 2,
		positionIndex: 2,
		hireDate: '2020-03-01',
		baseSalary: 12000000,
	},
	{
		firstName: 'Budi',
		lastName: 'Santoso',
		phone: '+6281234567893',
		address: 'Jl. Budi No. 4',
		city: 'Jakarta',
		dateOfBirth: '1995-03-25',
		gender: 'MALE' as const,
		maritalStatus: 'SINGLE' as const,
		departmentIndex: 0,
		positionIndex: 3,
		hireDate: '2021-06-01',
		baseSalary: 12000000,
	},
	{
		firstName: 'Siti',
		lastName: 'Nurhaliza',
		phone: '+6281234567894',
		address: 'Jl. Siti No. 5',
		city: 'Jakarta',
		dateOfBirth: '1996-07-12',
		gender: 'FEMALE' as const,
		maritalStatus: 'SINGLE' as const,
		departmentIndex: 0,
		positionIndex: 4,
		hireDate: '2022-01-15',
		baseSalary: 8000000,
	},
	{
		firstName: 'Ahmad',
		lastName: 'Fauzi',
		phone: '+6281234567895',
		address: 'Jl. Ahmad No. 6',
		city: 'Jakarta',
		dateOfBirth: '1994-11-30',
		gender: 'MALE' as const,
		maritalStatus: 'MARRIED' as const,
		departmentIndex: 0,
		positionIndex: 5,
		hireDate: '2021-09-01',
		baseSalary: 8500000,
	},
	{
		firstName: 'Dewi',
		lastName: 'Sartika',
		phone: '+6281234567896',
		address: 'Jl. Dewi No. 7',
		city: 'Jakarta',
		dateOfBirth: '1997-04-18',
		gender: 'FEMALE' as const,
		maritalStatus: 'SINGLE' as const,
		departmentIndex: 1,
		positionIndex: 6,
		hireDate: '2022-03-01',
		baseSalary: 7000000,
	},
	{
		firstName: 'Rizki',
		lastName: 'Ramadhan',
		phone: '+6281234567897',
		address: 'Jl. Rizki No. 8',
		city: 'Jakarta',
		dateOfBirth: '1998-09-05',
		gender: 'MALE' as const,
		maritalStatus: 'SINGLE' as const,
		departmentIndex: 3,
		positionIndex: 7,
		hireDate: '2023-01-01',
		baseSalary: 6500000,
	},
] as const

export async function createEmployees(
	prisma: PrismaClient,
	organizationId: string,
	users: Array<User>,
	departments: Array<Department>,
	positions: Array<Position>,
) {
	console.log('👔 Creating employees...')

	const createdEmployees = []
	for (let i = 0; i < users.length; i++) {
		const user = users[i]
		const empData = EMPLOYEE_DATA[i]
		if (!empData) continue

		const department = departments[empData.departmentIndex]
		const position = positions[empData.positionIndex]

		if (!department || !position) {
			throw new Error(`Department or position not found for employee ${i}`)
		}

		const employee = await prisma.employee.create({
			data: {
				userId: user.id,
				employeeId: user.employeeId,
				firstName: empData.firstName,
				lastName: empData.lastName,
				email: user.email,
				phone: empData.phone,
				address: empData.address,
				city: empData.city,
				dateOfBirth: new Date(empData.dateOfBirth),
				gender: empData.gender,
				maritalStatus: empData.maritalStatus,
				departmentId: department.id,
				positionId: position.id,
				organizationId,
				username: user.email.split('@')[0],
				hireDate: new Date(empData.hireDate),
				employmentType: 'FULL_TIME',
				status: 'ACTIVE',
				baseSalary: empData.baseSalary,
			},
		})
		createdEmployees.push(employee)
		console.log(`✅ Employee created: ${employee.firstName} ${employee.lastName}`)
	}

	return createdEmployees
}

export async function createAllowanceTypes(
	prisma: PrismaClient,
	organizationId: string,
) {
	console.log('💰 Creating allowance types...')

	const createdAllowanceTypes: Array<{
		id: string
		name: string
		description: string | null
		amount: number
		isFixed: boolean
	}> = []

	for (const allowanceData of DEMO_ALLOWANCE_TYPES) {
		const allowance = await prisma.allowanceType.create({
			data: {
				...allowanceData,
				organizationId,
			},
			select: {
				id: true,
				name: true,
				description: true,
				amount: true,
				isFixed: true,
			},
		})
		createdAllowanceTypes.push(allowance)
		console.log(`✅ Allowance type created: ${allowance.name}`)
	}

	return createdAllowanceTypes
}

export async function createEmployeeAllowances(
	prisma: PrismaClient,
	employees: Array<{ id: string }>,
	allowanceTypes: Array<{ id: string }>,
) {
	console.log('💵 Assigning allowances to employees...')

	const employeeAllowances = [
		// Employee 1 (Admin) - All allowances
		{
			employeeId: employees[0]!.id,
			allowanceTypeId: allowanceTypes[0]!.id,
			amount: 500000,
		},
		{
			employeeId: employees[0]!.id,
			allowanceTypeId: allowanceTypes[1]!.id,
			amount: 1000000,
		},
		{
			employeeId: employees[0]!.id,
			allowanceTypeId: allowanceTypes[2]!.id,
			amount: 750000,
		},
		// Employee 2 (HR Manager) - All allowances
		{
			employeeId: employees[1]!.id,
			allowanceTypeId: allowanceTypes[0]!.id,
			amount: 500000,
		},
		{
			employeeId: employees[1]!.id,
			allowanceTypeId: allowanceTypes[1]!.id,
			amount: 1000000,
		},
		{
			employeeId: employees[1]!.id,
			allowanceTypeId: allowanceTypes[2]!.id,
			amount: 750000,
		},
		// Employee 3-8 - Standard allowances (transport + makan)
		...employees.slice(2).flatMap((emp) => [
			{
				employeeId: emp.id,
				allowanceTypeId: allowanceTypes[0]!.id,
				amount: 500000,
			},
			{
				employeeId: emp.id,
				allowanceTypeId: allowanceTypes[1]!.id,
				amount: 1000000,
			},
		]),
	]

	for (const allowanceData of employeeAllowances) {
		await prisma.employeeAllowance.create({
			data: allowanceData,
		})
	}
	console.log(`✅ Created ${employeeAllowances.length} employee allowances`)
}

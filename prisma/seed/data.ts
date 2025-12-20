export const DEMO_ORGANIZATION = {
	name: 'PT Demo Company',
	slug: 'demo-company',
	address: 'Jl. Demo Raya No. 123, Jakarta',
	phone: '+62-21-12345678',
	email: 'info@demo-company.com',
	website: 'https://demo-company.com',
	geoCenter: {
		lat: -6.2088,
		lng: 106.8456,
	},
	geoRadius: 100,
	geoPolygon: [
		[-6.2098, 106.8446],
		[-6.2078, 106.8446],
		[-6.2078, 106.8466],
		[-6.2098, 106.8466],
	],
} as const

export const DEMO_USERS = [
	{
		email: 'admin@demo.com',
		name: 'Admin Demo',
		role: 'ADMIN' as const,
		employeeId: 'EMP001',
	},
	{
		email: 'hr@demo.com',
		name: 'HR Manager Demo',
		role: 'HR_MANAGER' as const,
		employeeId: 'EMP002',
	},
	{
		email: 'manager@demo.com',
		name: 'Manager Demo',
		role: 'MANAGER' as const,
		employeeId: 'EMP003',
	},
	{
		email: 'employee1@demo.com',
		name: 'Budi Santoso',
		role: 'EMPLOYEE' as const,
		employeeId: 'EMP004',
	},
	{
		email: 'employee2@demo.com',
		name: 'Siti Nurhaliza',
		role: 'EMPLOYEE' as const,
		employeeId: 'EMP005',
	},
	{
		email: 'employee3@demo.com',
		name: 'Ahmad Fauzi',
		role: 'EMPLOYEE' as const,
		employeeId: 'EMP006',
	},
	{
		email: 'employee4@demo.com',
		name: 'Dewi Sartika',
		role: 'EMPLOYEE' as const,
		employeeId: 'EMP007',
	},
	{
		email: 'employee5@demo.com',
		name: 'Rizki Ramadhan',
		role: 'EMPLOYEE' as const,
		employeeId: 'EMP008',
	},
] as const

export const DEMO_DEPARTMENTS = [
	{
		name: 'Teknologi Informasi',
		description: 'Department untuk pengembangan dan maintenance sistem IT',
	},
	{
		name: 'Human Resources',
		description: 'Department untuk manajemen sumber daya manusia',
	},
	{
		name: 'Operasional',
		description: 'Department untuk operasional bisnis harian',
	},
	{
		name: 'Marketing',
		description: 'Department untuk pemasaran dan promosi',
	},
	{
		name: 'Keuangan',
		description: 'Department untuk manajemen keuangan',
	},
] as const

export const DEMO_POSITIONS = [
	{
		name: 'Chief Technology Officer',
		description: 'Kepala divisi teknologi',
		departmentIndex: 0, // IT
		baseSalary: 25000000,
		shiftPresenceType: 'FLEXIBLE' as const,
		locationPresenceType: 'FLEXIBLE' as const,
	},
	{
		name: 'HR Manager',
		description: 'Manajer sumber daya manusia',
		departmentIndex: 1, // HR
		baseSalary: 15000000,
		shiftPresenceType: 'FIXED' as const,
		locationPresenceType: 'FIXED' as const,
	},
	{
		name: 'Operations Manager',
		description: 'Manajer operasional',
		departmentIndex: 2, // Operasional
		baseSalary: 12000000,
		shiftPresenceType: 'FIXED' as const,
		locationPresenceType: 'FIXED' as const,
	},
	{
		name: 'Senior Developer',
		description: 'Pengembang senior',
		departmentIndex: 0, // IT
		baseSalary: 12000000,
		shiftPresenceType: 'FLEXIBLE' as const,
		locationPresenceType: 'FLEXIBLE' as const,
	},
	{
		name: 'Frontend Developer',
		description: 'Pengembang frontend',
		departmentIndex: 0, // IT
		baseSalary: 8000000,
		shiftPresenceType: 'FLEXIBLE' as const,
		locationPresenceType: 'FLEXIBLE' as const,
	},
	{
		name: 'Backend Developer',
		description: 'Pengembang backend',
		departmentIndex: 0, // IT
		baseSalary: 8500000,
		shiftPresenceType: 'FLEXIBLE' as const,
		locationPresenceType: 'FLEXIBLE' as const,
	},
	{
		name: 'HR Specialist',
		description: 'Spesialis HR',
		departmentIndex: 1, // HR
		baseSalary: 7000000,
		shiftPresenceType: 'FIXED' as const,
		locationPresenceType: 'FIXED' as const,
	},
	{
		name: 'Marketing Specialist',
		description: 'Spesialis pemasaran',
		departmentIndex: 3, // Marketing
		baseSalary: 6500000,
		shiftPresenceType: 'FIXED' as const,
		locationPresenceType: 'FIXED' as const,
	},
] as const

export const DEMO_SHIFTS = [
	{
		name: 'Shift Pagi',
		startTime: '08:00',
		endTime: '17:00',
	},
	{
		name: 'Shift Siang',
		startTime: '13:00',
		endTime: '22:00',
	},
	{
		name: 'Shift Malam',
		startTime: '22:00',
		endTime: '06:00',
	},
] as const

export const DEMO_ATTENDANCE_TYPES = [
	{
		name: 'Hari Kerja',
		code: 'WORK_DAY',
		isMustPresence: true,
	},
	{
		name: 'Cuti Tahunan',
		code: 'ANNUAL_LEAVE',
		isMustPresence: false,
	},
	{
		name: 'Cuti Sakit',
		code: 'SICK_LEAVE',
		isMustPresence: false,
	},
	{
		name: 'Izin',
		code: 'PERMISSION',
		isMustPresence: false,
	},
	{
		name: 'Libur Nasional',
		code: 'NATIONAL_HOLIDAY',
		isMustPresence: false,
	},
] as const

export const DEMO_ALLOWANCE_TYPES = [
	{
		name: 'Tunjangan Transport',
		description: 'Tunjangan untuk transportasi',
		amount: 500000,
		isFixed: true,
	},
	{
		name: 'Tunjangan Makan',
		description: 'Tunjangan makan siang',
		amount: 1000000,
		isFixed: true,
	},
	{
		name: 'Tunjangan Kesehatan',
		description: 'Tunjangan untuk kesehatan',
		amount: 750000,
		isFixed: true,
	},
	{
		name: 'Bonus Performance',
		description: 'Bonus berdasarkan performa',
		amount: 0,
		isFixed: false,
	},
] as const

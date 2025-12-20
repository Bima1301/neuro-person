import { DocumentType } from '@/lib/embedding-service/utils'

export function detectQueryIntent(question: string): {
	types: Array<DocumentType>
	isStats: boolean
} {
	const questionLower = question.toLowerCase()

	const isStats =
		questionLower.includes('berapa') ||
		questionLower.includes('total') ||
		questionLower.includes('jumlah') ||
		questionLower.includes('banyak') ||
		questionLower.includes('statistik') ||
		questionLower.includes('summary')

	const types: Array<DocumentType> = []

	const attendanceKeywords = [
		'absen',
		'kehadiran',
		'check in',
		'check out',
		'hadir',
		'tidak hadir',
		'terlambat',
	]

	const attendanceTypeKeywords = [
		'cuti',
		'izin',
		'sakit',
		'leave',
		'permission',
		'cuti sakit',
		'cuti tahunan',
		'melakukan cuti',
		'mengambil cuti',
		'karyawan cuti',
		'tidak hadir',
		'libur',
	]

	const shiftKeywords = [
		'shift',
		'jadwal',
		'jam kerja',
		'masuk kerja',
		'schedule',
		'pagi',
		'siang',
		'malam',
		'jam masuk',
		'jam keluar',
	]

	const employeeKeywords = [
		'karyawan',
		'pegawai',
		'staff',
		'employee',
		'nama',
		'gaji',
		'salary',
		'department',
		'departemen',
		'posisi',
		'position',
		'jabatan',
		'tunjangan',
	]

	// Check attendance keywords
	if (attendanceKeywords.some((kw) => questionLower.includes(kw))) {
		types.push(DocumentType.ATTENDANCE)
	}

	// Check attendance type keywords (cuti, izin, sakit) - bisa di ATTENDANCE atau SHIFT
	if (attendanceTypeKeywords.some((kw) => questionLower.includes(kw))) {
		types.push(DocumentType.ATTENDANCE)
		types.push(DocumentType.SHIFT)
	}

	// Check shift keywords
	if (shiftKeywords.some((kw) => questionLower.includes(kw))) {
		types.push(DocumentType.SHIFT)
	}

	// Check employee keywords
	if (employeeKeywords.some((kw) => questionLower.includes(kw))) {
		types.push(DocumentType.EMPLOYEE)
	}

	if (types.length === 0) {
		types.push(
			DocumentType.EMPLOYEE,
			DocumentType.ATTENDANCE,
			DocumentType.SHIFT,
		)
	}

	// Remove duplicates
	const uniqueTypes = Array.from(new Set(types))

	return { types: uniqueTypes, isStats }
}

// src/lib/embedding-attendance.ts
import { generateEmbedding } from '../local-embedding'
import { DocumentType, upsertEmbedding } from './utils'
import type { DocumentMetadata } from './utils'
import { prisma } from '@/db'

export function formatAttendanceForEmbedding(attendance: any): string {
  const date = new Date(attendance.date).toLocaleDateString('id-ID')
  const checkIn = attendance.checkIn
    ? new Date(attendance.checkIn).toLocaleTimeString('id-ID')
    : 'Belum'
  const checkOut = attendance.checkOut
    ? new Date(attendance.checkOut).toLocaleTimeString('id-ID')
    : 'Belum'

  return `
Absensi Karyawan: ${attendance.employee.firstName} ${attendance.employee.lastName}
NIK: ${attendance.employee.employeeId}
Department: ${attendance.employee.department?.name || 'Tidak ada'}
Position: ${attendance.employee.position?.name || 'Tidak ada'}
Tanggal: ${date}
Check In: ${checkIn}
Check Out: ${checkOut}
Status: ${attendance.status}
Lokasi Check In: ${attendance.checkInLat && attendance.checkInLng ? `${attendance.checkInLat}, ${attendance.checkInLng}` : 'Tidak ada'}
Lokasi Check Out: ${attendance.checkOutLat && attendance.checkOutLng ? `${attendance.checkOutLat}, ${attendance.checkOutLng}` : 'Tidak ada'}
Catatan Check In: ${attendance.checkInNotes || 'Tidak ada'}
Catatan Check Out: ${attendance.checkOutNotes || 'Tidak ada'}
Catatan: ${attendance.notes || 'Tidak ada'}
`.trim()
}

export async function embedAttendance(attendanceId: string): Promise<void> {
  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id: attendanceId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            department: { select: { id: true, name: true } },
            position: { select: { id: true, name: true } },
          },
        },
      },
    })

    if (!attendance) {
      throw new Error(`Attendance ${attendanceId} tidak ditemukan`)
    }

    const content = formatAttendanceForEmbedding(attendance)
    const embeddingVector = await generateEmbedding(content)

    const metadata: DocumentMetadata = {
      type: DocumentType.ATTENDANCE,
      id: attendance.id,
      organizationId: attendance.organizationId,
      employeeId: attendance.employee.employeeId,
      employeeName: `${attendance.employee.firstName} ${attendance.employee.lastName}`,
      departmentName: attendance.employee.department?.name,
      positionName: attendance.employee.position?.name,
      date: attendance.date.toISOString(),
      status: attendance.status,
      hasCheckIn: !!attendance.checkIn,
      hasCheckOut: !!attendance.checkOut,
    }

    await upsertEmbedding(
      attendance.organizationId,
      content,
      embeddingVector,
      metadata,
    )
    console.log(
      `✅ Embedded attendance: ${attendance.employee.firstName} ${attendance.employee.lastName} on ${new Date().toLocaleDateString('id-ID')}`,
    )
  } catch (error) {
    console.error(`❌ Error embedding attendance ${attendanceId}:`, error)
    throw error
  }
}

export async function deleteAttendanceEmbedding(
  attendanceId: string,
  organizationId: string,
): Promise<void> {
  try {
    await prisma.documentEmbedding.deleteMany({
      where: {
        organizationId,
        metadata: {
          path: ['type', 'id'],
          equals: [DocumentType.ATTENDANCE, attendanceId],
        },
      },
    })
    console.log(`✅ Deleted embedding for attendance: ${attendanceId}`)
  } catch (error) {
    console.error(
      `❌ Error deleting attendance embedding ${attendanceId}:`,
      error,
    )
    throw error
  }
}

export async function bulkEmbedAttendances(
  attendanceIds: Array<string>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<string>,
  }

  for (let i = 0; i < attendanceIds.length; i++) {
    try {
      await embedAttendance(attendanceIds[i])
      results.success++

      if (onProgress) {
        onProgress(i + 1, attendanceIds.length)
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `Attendance ${attendanceIds[i]}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return results
}

export async function embedAttendancesByDateRange(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const attendances = await prisma.attendance.findMany({
    where: {
      organizationId,
      date: { gte: startDate, lte: endDate },
    },
    select: { id: true },
  })

  return bulkEmbedAttendances(
    attendances.map((a) => a.id),
    onProgress,
  )
}

export async function embedAllAttendances(
  organizationId: string,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const attendances = await prisma.attendance.findMany({
    where: { organizationId },
    select: { id: true },
  })

  return bulkEmbedAttendances(
    attendances.map((a) => a.id),
    onProgress,
  )
}

export async function searchAttendances(
  query: string,
  organizationId: string,
  limit: number = 5,
) {
  const { vectorSearch } = await import('./utils')
  return vectorSearch<{
    type: DocumentType.ATTENDANCE
    id: string
    organizationId: string
    employeeId: string
    employeeName: string
    departmentName?: string
    positionName?: string
    date: string
    status: string
    hasCheckIn: boolean
    hasCheckOut: boolean
  }>(query, organizationId, {
    limit,
    documentType: DocumentType.ATTENDANCE,
  })
}

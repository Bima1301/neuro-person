import { generateEmbedding } from '../local-embedding'
import { DocumentType, upsertEmbedding } from './utils'
import type { DocumentMetadata } from './utils'
import { prisma } from '@/db'

export function formatShiftAllocationForEmbedding(allocation: any): string {
  const date = new Date(allocation.date).toLocaleDateString('id-ID', {
    timeZone: 'UTC',
  })

  const attendanceTypeName = allocation.attendanceType.name
  const attendanceTypeCode = allocation.attendanceType.code || ''
  const isMustPresence = allocation.attendanceType.isMustPresence

  let cutiKeywords = ''
  if (!isMustPresence) {
    if (attendanceTypeName.toLowerCase().includes('cuti')) {
      cutiKeywords = `cuti cuti sakit cuti tahunan cuti karyawan melakukan cuti mengambil cuti`
    } else if (attendanceTypeName.toLowerCase().includes('izin')) {
      cutiKeywords = `izin perizinan izin karyawan`
    } else if (attendanceTypeName.toLowerCase().includes('libur')) {
      cutiKeywords = `libur libur nasional hari libur`
    }
  }

  const attendanceTypeContext = isMustPresence
    ? `Status kehadiran: ${attendanceTypeName}. Tipe kehadiran: ${attendanceTypeName}. Karyawan dengan tipe kehadiran ${attendanceTypeName}. Hari kerja.`
    : `Status kehadiran: ${attendanceTypeName}. Tipe kehadiran: ${attendanceTypeName}. Karyawan dengan tipe kehadiran ${attendanceTypeName}. Status: ${attendanceTypeName}. ${cutiKeywords}`

  return `
Jadwal Shift Karyawan: ${allocation.employee.firstName} ${allocation.employee.lastName}
NIK: ${allocation.employee.employeeId}
Department: ${allocation.employee.department?.name || 'Tidak ada'}
Position: ${allocation.employee.position?.name || 'Tidak ada'}
Tanggal: ${date}
Tipe Kehadiran: ${attendanceTypeName}${attendanceTypeCode ? ` (${attendanceTypeCode})` : ''}
${attendanceTypeContext}
Harus Presensi: ${isMustPresence ? 'Ya' : 'Tidak'}
${!isMustPresence ? `Karyawan tidak hadir. Karyawan ${attendanceTypeName.toLowerCase()}. ${cutiKeywords}` : ''}
Shift: ${allocation.shift ? `${allocation.shift.name} (${allocation.shift.startTime} - ${allocation.shift.endTime})` : 'Tidak ada shift'}
`.trim()
}

export async function embedShiftAllocation(
  allocationId: string,
): Promise<void> {
  try {
    const allocation = await prisma.employeeShift.findUnique({
      where: { id: allocationId },
      include: {
        employee: {
          select: {
            id: true,
            employeeId: true,
            firstName: true,
            lastName: true,
            organizationId: true,
            department: { select: { id: true, name: true } },
            position: { select: { id: true, name: true } },
          },
        },
        attendanceType: true,
        shift: true,
      },
    })

    if (!allocation) {
      throw new Error(`Shift allocation ${allocationId} tidak ditemukan`)
    }

    const content = formatShiftAllocationForEmbedding(allocation)
    const embeddingVector = await generateEmbedding(content)

    const metadata: DocumentMetadata = {
      type: DocumentType.SHIFT,
      id: allocation.id,
      organizationId: allocation.employee.organizationId,
      employeeId: allocation.employee.employeeId,
      employeeName: `${allocation.employee.firstName} ${allocation.employee.lastName}`,
      departmentName: allocation.employee.department?.name,
      positionName: allocation.employee.position?.name,
      date: allocation.date.toISOString(),
      attendanceTypeName: allocation.attendanceType.name,
      attendanceTypeCode: allocation.attendanceType.code,
      isMustPresence: allocation.attendanceType.isMustPresence,
      shiftId: allocation.shift?.id,
      shiftName: allocation.shift?.name,
      shiftTime: allocation.shift
        ? `${allocation.shift.startTime} - ${allocation.shift.endTime}`
        : null,
    }

    await upsertEmbedding(
      allocation.employee.organizationId,
      content,
      embeddingVector,
      metadata,
    )

    const dateStr = new Date(allocation.date).toLocaleDateString('id-ID', {
      timeZone: 'UTC',
    })
    console.log(
      `✅ Embedded shift allocation: ${allocation.employee.firstName} ${allocation.employee.lastName} on ${dateStr}`,
    )
  } catch (error) {
    console.error(`❌ Error embedding shift allocation ${allocationId}:`, error)
    throw error
  }
}

export async function deleteShiftAllocationEmbedding(
  allocationId: string,
  organizationId: string,
): Promise<void> {
  try {
    await prisma.documentEmbedding.deleteMany({
      where: {
        organizationId,
        metadata: {
          path: ['type', 'id'],
          equals: [DocumentType.SHIFT, allocationId],
        },
      },
    })
    console.log(`✅ Deleted embedding for shift allocation: ${allocationId}`)
  } catch (error) {
    console.error(
      `❌ Error deleting shift allocation embedding ${allocationId}:`,
      error,
    )
    throw error
  }
}

export async function bulkEmbedShiftAllocations(
  allocationIds: Array<string>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<string>,
  }

  for (let i = 0; i < allocationIds.length; i++) {
    try {
      await embedShiftAllocation(allocationIds[i])
      results.success++

      if (onProgress) {
        onProgress(i + 1, allocationIds.length)
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `Shift allocation ${allocationIds[i]}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return results
}

export async function embedShiftAllocationsByDateRange(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const allocations = await prisma.employeeShift.findMany({
    where: {
      employee: { organizationId },
      date: { gte: startDate, lte: endDate },
    },
    select: { id: true },
  })

  return bulkEmbedShiftAllocations(
    allocations.map((a) => a.id),
    onProgress,
  )
}

export async function embedAllShiftAllocations(
  organizationId: string,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const allocations = await prisma.employeeShift.findMany({
    where: { employee: { organizationId } },
    select: { id: true },
  })

  return bulkEmbedShiftAllocations(
    allocations.map((a) => a.id),
    onProgress,
  )
}

export async function searchShiftAllocations(
  query: string,
  organizationId: string,
  limit: number = 5,
) {
  const { vectorSearch } = await import('./utils')
  return vectorSearch<{
    type: DocumentType.SHIFT
    id: string
    organizationId: string
    employeeId: string
    employeeName: string
    departmentName?: string
    positionName?: string
    date: string
    attendanceTypeName: string
    attendanceTypeCode?: string
    isMustPresence: boolean
    shiftId?: string
    shiftName?: string
    shiftTime?: string
  }>(query, organizationId, {
    limit,
    documentType: DocumentType.SHIFT,
  })
}

import { generateEmbedding } from '../local-embedding'
import { DocumentType, upsertEmbedding } from './utils'
import type { DocumentMetadata } from './utils'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee'
import { prisma } from '@/db'

export function formatEmployeeForEmbedding(employee: EmployeeDetail): string {
  return `
Karyawan: ${employee.firstName} ${employee.lastName}
NIK: ${employee.employeeId}
Email: ${employee.email}
Department: ${employee.department?.name || 'Tidak ada'}
Position: ${employee.position?.name || 'Tidak ada'}
Manager: ${employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'Tidak ada'}
Status: ${employee.status}
Tipe Employment: ${employee.employmentType}
Tanggal Masuk: ${employee.hireDate}
Gaji Pokok: Rp ${employee.baseSalary.toLocaleString('id-ID')}
Tunjangan: ${employee.allowances.map((a) => `${a.allowanceType.name} (Rp ${a.amount.toLocaleString('id-ID')})`).join(', ') || 'Tidak ada'}
`.trim()
}

export async function embedEmployee(employeeId: string): Promise<void> {
  try {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        department: true,
        position: true,
        user: { select: { email: true, role: true } },
        manager: { select: { firstName: true, lastName: true } },
        allowances: { include: { allowanceType: true } },
      },
    })

    if (!employee) {
      throw new Error(`Employee ${employeeId} tidak ditemukan`)
    }

    const content = formatEmployeeForEmbedding(employee)
    const embeddingVector = await generateEmbedding(content)

    const metadata: DocumentMetadata = {
      type: DocumentType.EMPLOYEE,
      id: employee.id,
      organizationId: employee.organizationId,
      employeeId: employee.employeeId,
      name: `${employee.firstName} ${employee.lastName}`,
      departmentId: employee.department?.id,
      departmentName: employee.department?.name,
      positionId: employee.position?.id,
      positionName: employee.position?.name,
      status: employee.status,
      employmentType: employee.employmentType,
    }

    await upsertEmbedding(
      employee.organizationId,
      content,
      embeddingVector,
      metadata,
    )
    console.log(
      `✅ Embedded employee: ${employee.firstName} ${employee.lastName}`,
    )
  } catch (error) {
    console.error(`❌ Error embedding employee ${employeeId}:`, error)
    throw error
  }
}

export async function deleteEmployeeEmbedding(
  employeeId: string,
  organizationId: string,
): Promise<void> {
  try {
    await prisma.documentEmbedding.deleteMany({
      where: {
        organizationId,
        metadata: {
          path: ['type', 'id'],
          equals: [DocumentType.EMPLOYEE, employeeId],
        },
      },
    })
    console.log(`✅ Deleted embedding for employee: ${employeeId}`)
  } catch (error) {
    console.error(`❌ Error deleting employee embedding ${employeeId}:`, error)
    throw error
  }
}

export async function bulkEmbedEmployees(
  employeeIds: Array<string>,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as Array<string>,
  }

  for (let i = 0; i < employeeIds.length; i++) {
    try {
      await embedEmployee(employeeIds[i])
      results.success++

      if (onProgress) {
        onProgress(i + 1, employeeIds.length)
      }
    } catch (error) {
      results.failed++
      results.errors.push(
        `Employee ${employeeIds[i]}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
    }
  }

  return results
}

export async function embedAllEmployees(
  organizationId: string,
  onProgress?: (current: number, total: number) => void,
): Promise<{ success: number; failed: number; errors: Array<string> }> {
  const employees = await prisma.employee.findMany({
    where: { organizationId },
    select: { id: true },
  })

  const employeeIds = employees.map((e) => e.id)
  return bulkEmbedEmployees(employeeIds, onProgress)
}

export async function searchEmployees(
  query: string,
  organizationId: string,
  limit: number = 5,
) {
  const { vectorSearch } = await import('./utils')
  return vectorSearch<{
    type: DocumentType.EMPLOYEE
    id: string
    organizationId: string
    employeeId: string
    name: string
    departmentId?: string
    departmentName?: string
    positionId?: string
    positionName?: string
    status: string
    employmentType: string
  }>(query, organizationId, {
    limit,
    documentType: DocumentType.EMPLOYEE,
  })
}

import { useMemo } from 'react'
import { createEmployeeColumns } from './employee-columns'
import type { Employee } from './employee-columns'
import { DataTable } from '@/components/ui/data-table'

interface EmployeeTableProps {
  employees: Array<Employee>
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete?: (id: string) => void
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function EmployeeTable({
  employees,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: EmployeeTableProps) {
  const columns = useMemo(
    () => createEmployeeColumns(onEdit, onDelete || (() => {})),
    [onEdit, onDelete],
  )

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  return (
    <DataTable
      columns={columns}
      data={employees}
      page={page}
      totalPages={totalPages}
      total={total}
      pageSize={pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      manualPagination={true}
    />
  )
}

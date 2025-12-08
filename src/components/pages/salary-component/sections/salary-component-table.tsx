import { useMemo } from 'react'
import { createSalaryComponentColumns } from './salary-component-columns'
import type { SalaryComponent } from './salary-component-columns'
import { DataTable } from '@/components/ui/data-table'

interface SalaryComponentTableProps {
  salaryComponents: Array<SalaryComponent>
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

export function SalaryComponentTable({
  salaryComponents,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: SalaryComponentTableProps) {
  const columns = useMemo(
    () => createSalaryComponentColumns(onEdit, onDelete || (() => {})),
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
      data={salaryComponents}
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


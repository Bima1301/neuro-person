import { createShiftColumns } from './shift-columns'
import type { Shift } from './shift-columns'
import { DataTable } from '@/components/ui/data-table'

interface ShiftTableProps {
  shifts: Array<Shift>
  isLoading: boolean
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function ShiftTable({
  shifts,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ShiftTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  const columns = createShiftColumns(onEdit, onDelete)
  return (
    <DataTable
      columns={columns}
      data={shifts}
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

import { createAttendanceTypeColumns } from './attendance-type-columns'
import type { AttendanceType } from './attendance-type-columns'
import { DataTable } from '@/components/ui/data-table'

interface AttendanceTypeTableProps {
  attendanceTypes: Array<AttendanceType>
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

export function AttendanceTypeTable({
  attendanceTypes,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AttendanceTypeTableProps) {
  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  const columns = createAttendanceTypeColumns(onEdit, onDelete)
  return (
    <DataTable
      columns={columns}
      data={attendanceTypes}
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

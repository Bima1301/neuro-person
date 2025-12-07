import { useMemo } from 'react'
import { createPositionColumns } from './position-columns'
import type { Position } from './position-columns'
import { DataTable } from '@/components/ui/data-table'

interface PositionTableProps {
  positions: Array<Position>
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

export function PositionTable({
  positions,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PositionTableProps) {
  const columns = useMemo(
    () => createPositionColumns(onEdit, onDelete || (() => {})),
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
      data={positions}
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

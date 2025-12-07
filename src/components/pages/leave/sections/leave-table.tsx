import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { createLeaveColumns } from './leave-columns'
import type { LeaveRequest } from './leave-columns'
import { DataTable } from '@/components/ui/data-table'
import { useTRPC } from '@/integrations/trpc/react'

interface LeaveTableProps {
  leaves: Array<LeaveRequest>
  isLoading: boolean
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function LeaveTable({
  leaves,
  isLoading,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: LeaveTableProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const approveMutation = useMutation(
    trpc.leave.approve.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.leave.list.queryKey(),
        })
        toast.success('Cuti berhasil disetujui')
      },
      onError: (error) => {
        toast.error(`Gagal menyetujui cuti: ${error.message}`)
      },
    }),
  )

  const rejectMutation = useMutation(
    trpc.leave.reject.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.leave.list.queryKey(),
        })
        toast.success('Cuti berhasil ditolak')
      },
      onError: (error) => {
        toast.error(`Gagal menolak cuti: ${error.message}`)
      },
    }),
  )

  const columns = useMemo(
    () =>
      createLeaveColumns(
        (id) => approveMutation.mutate({ id }),
        (id) => rejectMutation.mutate({ id, reason: 'Ditolak oleh admin' }),
      ),
    [approveMutation, rejectMutation],
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
      data={leaves}
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'
import { toast } from 'sonner'
import { createPayrollColumns } from './payroll-columns'
import type { Payroll } from './payroll-columns'
import { DataTable } from '@/components/ui/data-table'
import { useTRPC } from '@/integrations/trpc/react'

interface PayrollTableProps {
  payrolls: Array<Payroll>
  isLoading: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function PayrollTable({
  payrolls,
  isLoading,
  onEdit,
  onDelete,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PayrollTableProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const updateStatusMutation = useMutation(
    trpc.payroll.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.summary.queryKey(),
        })
        toast.success('Status payroll berhasil diupdate')
      },
      onError: (error) => {
        toast.error(`Gagal mengupdate status: ${error.message}`)
      },
    }),
  )

  const columns = useMemo(
    () =>
      createPayrollColumns(
        (id) => updateStatusMutation.mutate({ id, status: 'PAID' }),
        onEdit,
        onDelete,
      ),
    [updateStatusMutation, onEdit, onDelete],
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
      data={payrolls}
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

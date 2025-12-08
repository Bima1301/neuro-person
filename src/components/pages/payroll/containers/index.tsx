import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { PayrollSummary } from '../sections/payroll-summary'
import { PayrollTable } from '../sections/payroll-table'
import { PayrollGenerateDialog } from '../dialogs/generate-dialog'
import { PayrollEditDialog } from '../dialogs/edit-dialog'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  Card as CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/integrations/trpc/react'

export function PayrollContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [period, setPeriod] = useState(currentMonth)
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false)
  const [editPayrollId, setEditPayrollId] = useState<string | null>(null)
  const [deletePayrollId, setDeletePayrollId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.payroll.list.queryOptions({
      period: period ? `${period}-01` : undefined,
      page,
      perPage,
    }),
  )
  const payrolls = data?.items || []

  const payrollToDelete = payrolls.find((p) => p.id === deletePayrollId)

  const deleteMutation = useMutation(
    trpc.payroll.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.summary.queryKey(),
        })
        toast.success('Payroll berhasil dihapus')
        setDeletePayrollId(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus payroll: ${error.message}`)
      },
    }),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">Kelola penggajian karyawan</p>
        </div>
        <Button onClick={() => setIsGenerateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Payroll
        </Button>
      </div>

      {/* Summary Cards */}
      <PayrollSummary />

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative w-[200px]">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="month"
                className="pl-9"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <CardContainer>
        <CardHeader>
          <CardTitle>Daftar Payroll</CardTitle>
          <CardDescription>
            Total {data?.total || 0} data payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollTable
            payrolls={payrolls}
            isLoading={isLoading}
            onEdit={setEditPayrollId}
            onDelete={setDeletePayrollId}
            page={page}
            totalPages={data?.totalPages}
            total={data?.total}
            pageSize={perPage}
            onPageChange={setPage}
            onPageSizeChange={(newPerPage) => {
              setPerPage(newPerPage)
              setPage(1)
            }}
          />
        </CardContent>
      </CardContainer>

      {/* Generate Dialog */}
      <PayrollGenerateDialog
        open={isGenerateDialogOpen}
        onOpenChange={setIsGenerateDialogOpen}
      />

      {/* Edit Dialog */}
      <PayrollEditDialog
        open={!!editPayrollId}
        onOpenChange={(open) => !open && setEditPayrollId(null)}
        payrollId={editPayrollId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletePayrollId}
        onOpenChange={(open) => !open && setDeletePayrollId(null)}
        onConfirm={() => {
          if (deletePayrollId) {
            deleteMutation.mutate({ id: deletePayrollId })
          }
        }}
        title="Hapus Payroll"
        itemName={
          payrollToDelete
            ? `payroll untuk ${payrollToDelete.employee.firstName} ${payrollToDelete.employee.lastName}`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

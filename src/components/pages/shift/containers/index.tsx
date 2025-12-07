import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { ShiftCreateDialog } from '../dialogs/create-dialog'
import { ShiftEditDialog } from '../dialogs/edit-dialog'
import { ShiftTable } from '../sections/shift-table'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { useTRPC } from '@/integrations/trpc/react'

export function ShiftContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editShiftId, setEditShiftId] = useState<string | null>(null)
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.shift.list.queryOptions({
      page,
      perPage,
    }),
  )
  const shifts = data?.items || []

  const shiftToDelete = shifts.find((s) => s.id === deleteShiftId)

  const deleteMutation = useMutation(
    trpc.shift.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: trpc.shift.list.queryKey() })
        toast.success('Shift berhasil dihapus')
        setDeleteShiftId(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus shift: ${error.message}`)
      },
    }),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Shift</h1>
          <p className="text-muted-foreground">Kelola jadwal shift karyawan</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Shift
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Shift</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Shift Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Shift</CardTitle>
          <CardDescription>Kelola shift kerja untuk karyawan</CardDescription>
        </CardHeader>
        <CardContent>
          <ShiftTable
            shifts={shifts}
            isLoading={isLoading}
            onEdit={setEditShiftId}
            onDelete={setDeleteShiftId}
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
      </Card>

      {/* Add Dialog */}
      <ShiftCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Dialog */}
      <ShiftEditDialog
        open={!!editShiftId}
        onOpenChange={(open) => !open && setEditShiftId(null)}
        shiftId={editShiftId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteShiftId}
        onOpenChange={(open) => !open && setDeleteShiftId(null)}
        onConfirm={() => {
          if (deleteShiftId) {
            deleteMutation.mutate({ id: deleteShiftId })
          }
        }}
        title="Hapus Shift"
        itemName={shiftToDelete ? `shift "${shiftToDelete.name}"` : undefined}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

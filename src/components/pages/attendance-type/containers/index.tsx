import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calendar, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { AttendanceTypeCreateDialog } from '../dialogs/create-dialog'
import { AttendanceTypeEditDialog } from '../dialogs/edit-dialog'
import { AttendanceTypeTable } from '../sections/attendance-type-table'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

export function AttendanceTypeContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editAttendanceTypeId, setEditAttendanceTypeId] = useState<
    string | null
  >(null)
  const [deleteAttendanceTypeId, setDeleteAttendanceTypeId] = useState<
    string | null
  >(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.attendanceType.list.queryOptions({
      page,
      perPage,
    }),
  )
  const attendanceTypes = data?.items || []

  const attendanceTypeToDelete = attendanceTypes.find(
    (at) => at.id === deleteAttendanceTypeId,
  )

  const deleteMutation = useMutation(
    trpc.attendanceType.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.attendanceType.list.queryKey(),
        })
        toast.success('Tipe kehadiran berhasil dihapus')
        setDeleteAttendanceTypeId(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus tipe kehadiran: ${error.message}`)
      },
    }),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Management Tipe Kehadiran</h1>
          <p className="text-muted-foreground">
            Kelola tipe kehadiran untuk alokasi shift
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Tipe Kehadiran
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tipe Kehadiran
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Type Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tipe Kehadiran</CardTitle>
          <CardDescription>
            Kelola tipe kehadiran yang digunakan dalam alokasi shift
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceTypeTable
            attendanceTypes={attendanceTypes}
            isLoading={isLoading}
            onEdit={setEditAttendanceTypeId}
            onDelete={setDeleteAttendanceTypeId}
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
      <AttendanceTypeCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Dialog */}
      <AttendanceTypeEditDialog
        open={!!editAttendanceTypeId}
        onOpenChange={(open) => !open && setEditAttendanceTypeId(null)}
        attendanceTypeId={editAttendanceTypeId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteAttendanceTypeId}
        onOpenChange={(open) => !open && setDeleteAttendanceTypeId(null)}
        onConfirm={() => {
          if (deleteAttendanceTypeId) {
            deleteMutation.mutate({ id: deleteAttendanceTypeId })
          }
        }}
        title="Hapus Tipe Kehadiran"
        itemName={
          attendanceTypeToDelete
            ? `tipe kehadiran "${attendanceTypeToDelete.name}"`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

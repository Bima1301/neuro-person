import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AttendanceDetailDialog } from '../dialogs/attendance-detail-dialog'
import { attendanceColumns } from './attendance-columns'
import type { Attendance } from './attendance-columns'
import { DataTable } from '@/components/ui/data-table'
import { useTRPC } from '@/integrations/trpc/react'
import { DeleteDialog } from '@/components/shared/delete-dialog'

interface AttendanceTableProps {
  attendances: Array<Attendance>
  isLoading: boolean
  page?: number
  totalPages?: number
  total?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
}

export function AttendanceTable({
  attendances,
  isLoading,
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: AttendanceTableProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [selectedAttendance, setSelectedAttendance] =
    useState<Attendance | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [attendanceToDelete, setAttendanceToDelete] =
    useState<Attendance | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleViewDetail = (attendance: Attendance) => {
    setSelectedAttendance(attendance)
    setIsDialogOpen(true)
  }

  const handleDeleteClick = (attendance: Attendance) => {
    setAttendanceToDelete(attendance)
    setIsDeleteDialogOpen(true)
  }

  const deleteMutation = useMutation(
    trpc.attendance.delete.mutationOptions({
      onSuccess: () => {
        toast.success('Data absensi berhasil dihapus')
        queryClient.invalidateQueries({
          queryKey: trpc.attendance.list.queryKey(),
        })
        setIsDeleteDialogOpen(false)
        setAttendanceToDelete(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus data absensi: ${error.message}`)
      },
    }),
  )

  const handleConfirmDelete = () => {
    if (attendanceToDelete) {
      deleteMutation.mutate({ id: attendanceToDelete.id })
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Memuat data...
      </div>
    )
  }

  return (
    <>
      <DataTable
        columns={attendanceColumns}
        data={attendances}
        meta={{
          onViewDetail: handleViewDetail,
          onDelete: handleDeleteClick,
        }}
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        manualPagination={true}
      />
      <AttendanceDetailDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        attendance={selectedAttendance}
      />
      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Absensi?"
        itemName={
          attendanceToDelete
            ? `data absensi ${attendanceToDelete.employee.firstName} ${attendanceToDelete.employee.lastName} pada ${new Date(
                attendanceToDelete.date,
              ).toLocaleDateString('id-ID', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </>
  )
}

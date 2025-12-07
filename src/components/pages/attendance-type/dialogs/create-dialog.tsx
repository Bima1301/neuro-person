import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AttendanceTypeForm } from '../sections/attendance-type-form'
import type { AttendanceTypeCreateInput } from '@/integrations/trpc/routers/attendance-type/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface AttendanceTypeCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AttendanceTypeCreateDialog({
  open,
  onOpenChange,
}: AttendanceTypeCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.attendanceType.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.attendanceType.list.queryKey(),
        })
        toast.success('Tipe kehadiran berhasil ditambahkan')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal menambahkan tipe kehadiran: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: AttendanceTypeCreateInput) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Tipe Kehadiran Baru</DialogTitle>
          <DialogDescription>
            Buat tipe kehadiran baru untuk alokasi shift
          </DialogDescription>
        </DialogHeader>
        <AttendanceTypeForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

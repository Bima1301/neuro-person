import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { LeaveForm } from '../sections/leave-form'
import type { LeaveCreateInput } from '@/integrations/trpc/routers/leave/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface LeaveCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LeaveCreateDialog({
  open,
  onOpenChange,
}: LeaveCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.leave.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.leave.list.queryKey(),
        })
        toast.success('Pengajuan cuti berhasil dibuat')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal mengajukan cuti: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: LeaveCreateInput) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ajukan Cuti</DialogTitle>
          <DialogDescription>
            Buat pengajuan cuti baru untuk karyawan
          </DialogDescription>
        </DialogHeader>
        <LeaveForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

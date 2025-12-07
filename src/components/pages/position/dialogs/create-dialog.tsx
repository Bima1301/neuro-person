import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PositionForm } from '../sections/position-form'
import type { PositionCreateInput } from '@/integrations/trpc/routers/position/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface PositionCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PositionCreateDialog({
  open,
  onOpenChange,
}: PositionCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.position.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.position.list.queryKey(),
        })
        toast.success('Posisi berhasil ditambahkan')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal menambahkan posisi: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: PositionCreateInput) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Posisi Baru</DialogTitle>
          <DialogDescription>
            Buat posisi/jabatan baru dalam perusahaan
          </DialogDescription>
        </DialogHeader>
        <PositionForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { PositionForm } from '../sections/position-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface PositionEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  positionId: string | null
}

export function PositionEditDialog({
  open,
  onOpenChange,
  positionId,
}: PositionEditDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: position, isLoading } = useQuery(
    trpc.position.get.queryOptions(
      { id: positionId! },
      { enabled: !!positionId && open },
    ),
  )

  const updateMutation = useMutation(
    trpc.position.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.position.list.queryKey(),
        })
        toast.success('Posisi berhasil diperbarui')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui posisi: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: { name: string; departmentId: string }) => {
    if (!positionId) return
    updateMutation.mutate({ id: positionId, ...data })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Posisi</DialogTitle>
          <DialogDescription>Perbarui data posisi</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Memuat data...
          </div>
        ) : position ? (
          <PositionForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={updateMutation.isPending}
            defaultValues={{
              name: position.name,
              departmentId: position.departmentId || '',
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

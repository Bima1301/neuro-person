import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SalaryComponentForm } from '../sections/salary-component-form'
import type { SalaryComponentUpdateInput } from '@/integrations/trpc/routers/salary-component/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface SalaryComponentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  salaryComponentId: string | null
}

export function SalaryComponentEditDialog({
  open,
  onOpenChange,
  salaryComponentId,
}: SalaryComponentEditDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: salaryComponent, isLoading } = useQuery(
    trpc.salaryComponent.get.queryOptions(
      { id: salaryComponentId! },
      { enabled: !!salaryComponentId },
    ),
  )

  const updateMutation = useMutation(
    trpc.salaryComponent.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.salaryComponent.list.queryKey(),
        })
        toast.success('Komponen gaji berhasil diperbarui')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui komponen gaji: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: SalaryComponentUpdateInput) => {
    if (salaryComponentId) {
      updateMutation.mutate({ ...data, id: salaryComponentId })
    }
  }

  if (isLoading || !salaryComponent) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8 text-muted-foreground">
            Memuat data...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Komponen Gaji</DialogTitle>
          <DialogDescription>
            Perbarui informasi komponen gaji
          </DialogDescription>
        </DialogHeader>
        <SalaryComponentForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={updateMutation.isPending}
          defaultValues={{
            name: salaryComponent.name,
            type: salaryComponent.type,
            amount: salaryComponent.amount ?? undefined,
            description: salaryComponent.description ?? undefined,
          }}
        />
      </DialogContent>
    </Dialog>
  )
}


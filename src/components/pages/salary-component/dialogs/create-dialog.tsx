import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SalaryComponentForm } from '../sections/salary-component-form'
import type { SalaryComponentCreateInput } from '@/integrations/trpc/routers/salary-component/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface SalaryComponentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SalaryComponentCreateDialog({
  open,
  onOpenChange,
}: SalaryComponentCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.salaryComponent.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.salaryComponent.list.queryKey(),
        })
        toast.success('Komponen gaji berhasil ditambahkan')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal menambahkan komponen gaji: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: SalaryComponentCreateInput) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Komponen Gaji Baru</DialogTitle>
          <DialogDescription>
            Buat komponen gaji baru untuk tambahan atau potongan
          </DialogDescription>
        </DialogHeader>
        <SalaryComponentForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}


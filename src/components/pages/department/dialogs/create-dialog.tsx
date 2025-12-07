import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DepartmentForm } from '../sections/department-form'
import type { DepartmentCreateInput } from '@/integrations/trpc/routers/department/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface DepartmentCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DepartmentCreateDialog({
  open,
  onOpenChange,
}: DepartmentCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.department.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.department.list.queryKey(),
        })
        toast.success('Departemen berhasil ditambahkan')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal menambahkan departemen: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: DepartmentCreateInput) => {
    createMutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Departemen Baru</DialogTitle>
          <DialogDescription>
            Buat departemen baru untuk perusahaan Anda
          </DialogDescription>
        </DialogHeader>
        <DepartmentForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}

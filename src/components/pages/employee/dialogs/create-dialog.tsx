import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EmployeeForm } from '../sections/employee-form'
import type {
  EmployeeCreateInput,
  EmployeeMutationInput,
} from '@/integrations/trpc/routers/employee/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface EmployeeCreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalEmployees: number
}

export function EmployeeCreateDialog({
  open,
  onOpenChange,
  totalEmployees,
}: EmployeeCreateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const createMutation = useMutation(
    trpc.employee.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.employee.list.queryKey(),
        })
        toast.success('Karyawan berhasil ditambahkan')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal menambahkan karyawan: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: EmployeeCreateInput | EmployeeMutationInput) => {
    createMutation.mutate(data as EmployeeCreateInput)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tambah Karyawan Baru</DialogTitle>
          <DialogDescription>
            Isi data karyawan baru di bawah ini
          </DialogDescription>
        </DialogHeader>
        <EmployeeForm
          mode="create"
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={createMutation.isPending}
          totalEmployees={totalEmployees}
        />
      </DialogContent>
    </Dialog>
  )
}

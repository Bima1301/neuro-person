import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { DepartmentForm } from '../sections/department-form'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface DepartmentEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  departmentId: string | null
}

export function DepartmentEditDialog({
  open,
  onOpenChange,
  departmentId,
}: DepartmentEditDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: department, isLoading } = useQuery(
    trpc.department.get.queryOptions(
      { id: departmentId! },
      { enabled: !!departmentId && open },
    ),
  )

  const updateMutation = useMutation(
    trpc.department.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.department.list.queryKey(),
        })
        toast.success('Departemen berhasil diperbarui')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui departemen: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: { name: string; description?: string }) => {
    if (!departmentId) return
    updateMutation.mutate({ id: departmentId, ...data })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Departemen</DialogTitle>
          <DialogDescription>Perbarui data departemen</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">
            Memuat data...
          </div>
        ) : department ? (
          <DepartmentForm
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={updateMutation.isPending}
            defaultValues={{
              name: department.name,
              description: department.description || '',
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

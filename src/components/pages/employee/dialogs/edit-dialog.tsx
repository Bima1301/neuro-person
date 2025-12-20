import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { EmployeeForm } from '../sections/employee-form'
import type { EmployeeMutationInput } from '@/integrations/trpc/routers/employee/validation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTRPC } from '@/integrations/trpc/react'

interface EmployeeEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string | null
  darkMode?: boolean
}

export function EmployeeEditDialog({
  open,
  onOpenChange,
  employeeId,
  darkMode = false,
}: EmployeeEditDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: employee, isLoading } = useQuery(
    trpc.employee.get.queryOptions(
      { id: employeeId ?? '' },
      { enabled: !!employeeId && open },
    ),
  )

  const updateMutation = useMutation(
    trpc.employee.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.employee.list.queryKey(),
        })
        toast.success('Karyawan berhasil diperbarui')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui karyawan: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: EmployeeMutationInput) => {
    if (!employeeId) return
    updateMutation.mutate({ id: employeeId, ...data })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-4xl! max-h-[90dvh] overflow-y-auto ${darkMode
            ? 'bg-[#1e2128] border-white/10 text-white [&_button[data-slot="dialog-close"]]:text-white/70 [&_button[data-slot="dialog-close"]]:hover:text-white'
            : ''
          }`}
      >
        <DialogHeader>
          <DialogTitle className={darkMode ? 'text-white' : ''}>
            Edit Karyawan
          </DialogTitle>
          <DialogDescription className={darkMode ? 'text-white/60' : ''}>
            Perbarui data karyawan
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div
            className={`py-8 text-center ${darkMode ? 'text-white/60' : 'text-muted-foreground'
              }`}
          >
            Memuat data...
          </div>
        ) : employee ? (
          <EmployeeForm
            totalEmployees={0}
            mode="edit"
            onSubmit={handleSubmit}
            onCancel={() => onOpenChange(false)}
            isPending={updateMutation.isPending}
            darkMode={darkMode}
            defaultValues={{
              firstName: employee.firstName,
              lastName: employee.lastName,
              phone: employee.phone || undefined,
              address: employee.address || undefined,
              city: employee.city || undefined,
              avatar: (employee as any).avatar || undefined,
              dateOfBirth: employee.dateOfBirth
                ? new Date(employee.dateOfBirth).toISOString().split('T')[0]
                : undefined,
              gender: employee.gender || undefined,
              maritalStatus: employee.maritalStatus || undefined,
              departmentId: employee.departmentId || undefined,
              positionId: employee.positionId || undefined,
              status: employee.status,
              baseSalary: employee.baseSalary,
              employmentType: employee.employmentType || undefined,
            }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

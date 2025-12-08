import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { EmployeeCombobox } from '@/components/shared/employee-combobox'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/integrations/trpc/react'
import { payrollGenerateInput } from '@/integrations/trpc/routers/payroll/validation'

interface PayrollGenerateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayrollGenerateDialog({
  open,
  onOpenChange,
}: PayrollGenerateDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const form = useForm({
    resolver: zodResolver(payrollGenerateInput),
    defaultValues: {
      employeeId: '',
      period: new Date().toISOString().slice(0, 7),
    },
  })

  const generateMutation = useMutation(
    trpc.payroll.generate.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.summary.queryKey(),
        })
        toast.success('Payroll berhasil digenerate')
        onOpenChange(false)
        form.reset()
      },
      onError: (error) => {
        toast.error(`Gagal generate payroll: ${error.message}`)
      },
    }),
  )

  const handleSubmit = (data: { employeeId: string; period: string }) => {
    generateMutation.mutate({
      employeeId: data.employeeId,
      period: `${data.period}-01`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Generate Payroll</DialogTitle>
          <DialogDescription>
            Pilih karyawan, bulan, dan tahun untuk generate payroll
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Karyawan *</FormLabel>
                  <FormControl>
                    <EmployeeCombobox
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Pilih karyawan..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Periode (Bulan/Tahun) *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="month"
                        className="pl-9"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? 'Menggenerate...' : 'Generate'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}


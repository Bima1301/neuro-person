import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { LeaveCreateInput } from '@/integrations/trpc/routers/leave/validation'
import { EmployeeCombobox } from '@/components/shared/employee-combobox'
import { Button } from '@/components/ui/button'
import { Combobox } from '@/components/ui/combobox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useTRPC } from '@/integrations/trpc/react'
import { leaveCreateInput } from '@/integrations/trpc/routers/leave/validation'

interface LeaveFormProps {
  onSubmit: (data: LeaveCreateInput) => void
  onCancel: () => void
  isPending?: boolean
  defaultValues?: Partial<LeaveCreateInput>
}

export function LeaveForm({
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
}: LeaveFormProps) {
  const trpc = useTRPC()

  const { data: leaveTypes } = useQuery(trpc.leave.types.queryOptions())

  const leaveTypeOptions =
    leaveTypes?.map((type) => ({
      value: type.id,
      label: type.name,
    })) || []

  const form = useForm<LeaveCreateInput>({
    resolver: zodResolver(leaveCreateInput),
    defaultValues: {
      employeeId: '',
      leaveTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="Pilih karyawan"
                  status="ACTIVE"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="leaveTypeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Cuti *</FormLabel>
              <FormControl>
                <Combobox
                  options={leaveTypeOptions}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Pilih jenis cuti"
                  searchPlaceholder="Cari jenis cuti..."
                  emptyText="Tidak ada jenis cuti."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Mulai *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tanggal Selesai *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alasan</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Alasan pengajuan cuti..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Ajukan Cuti'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

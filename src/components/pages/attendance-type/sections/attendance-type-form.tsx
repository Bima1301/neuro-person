import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { AttendanceTypeCreateInput } from '@/integrations/trpc/routers/attendance-type/validation'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { attendanceTypeCreateInput } from '@/integrations/trpc/routers/attendance-type/validation'

interface AttendanceTypeFormProps {
  onSubmit: (data: AttendanceTypeCreateInput) => void
  onCancel: () => void
  isPending?: boolean
  defaultValues?: Partial<AttendanceTypeCreateInput>
}

export function AttendanceTypeForm({
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
}: AttendanceTypeFormProps) {
  const form = useForm<AttendanceTypeCreateInput>({
    resolver: zodResolver(attendanceTypeCreateInput),
    defaultValues: {
      name: '',
      code: '',
      isMustPresence: true,
      ...defaultValues,
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Tipe Kehadiran *</FormLabel>
              <FormControl>
                <Input placeholder="HADIR" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kode</FormLabel>
              <FormControl>
                <Input placeholder="HDR" {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isMustPresence"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Wajib Presensi</FormLabel>
                <p className="text-sm text-muted-foreground">
                  Jika dicentang, karyawan dapat melakukan presensi (CICO) pada
                  hari tersebut. Jika tidak dicentang (misal: CUTI), karyawan
                  tidak dapat melakukan presensi.
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

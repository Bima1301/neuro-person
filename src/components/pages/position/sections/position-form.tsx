import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import type { PositionCreateInput } from '@/integrations/trpc/routers/position/validation'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { InputMask } from '@/components/ui/input-mask'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTRPC } from '@/integrations/trpc/react'
import { positionCreateInput } from '@/integrations/trpc/routers/position/validation'
import {
  SelectEmptyState,
  SelectEmptyStateWithAdd,
} from '@/components/shared/select-empty-state'

interface PositionFormProps {
  onSubmit: (data: PositionCreateInput) => void
  onCancel: () => void
  isPending?: boolean
  defaultValues?: Partial<PositionCreateInput>
}

export function PositionForm({
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
}: PositionFormProps) {
  const trpc = useTRPC()

  const { data: deptData } = useQuery(trpc.department.list.queryOptions())
  const departments = deptData?.items || []

  const form = useForm<PositionCreateInput>({
    resolver: zodResolver(positionCreateInput),
    defaultValues: {
      name: '',
      departmentId: '',
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
              <FormLabel>Nama Posisi *</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="departmentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Departemen *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih departemen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.length === 0 ? (
                    <SelectEmptyState
                      message="Belum ada departemen"
                      createButtonLabel="Buat Departemen"
                      createRoute="/app/departments"
                    />
                  ) : (
                    <>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                      <SelectEmptyStateWithAdd
                        message=""
                        createButtonLabel="Buat Departemen Baru"
                        createRoute="/app/departments"
                        items={departments}
                      />
                    </>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="baseSalary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gaji Pokok</FormLabel>
              <FormControl>
                <InputMask
                  inputType="currency"
                  placeholder="Rp 0"
                  {...field}
                  onChange={(_e, rawValue) => field.onChange(rawValue)}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftPresenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Shift Presensi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis shift presensi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="locationPresenceType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jenis Lokasi Presensi</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ''}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis lokasi presensi" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                  <SelectItem value="FLEXIBLE">Flexible</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
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

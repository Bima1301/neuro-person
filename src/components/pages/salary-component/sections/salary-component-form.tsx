import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { SalaryComponentCreateInput } from '@/integrations/trpc/routers/salary-component/validation'
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
import { Textarea } from '@/components/ui/textarea'
import { salaryComponentCreateInput } from '@/integrations/trpc/routers/salary-component/validation'

interface SalaryComponentFormProps {
  onSubmit: (data: SalaryComponentCreateInput) => void
  onCancel: () => void
  isPending?: boolean
  defaultValues?: Partial<SalaryComponentCreateInput>
}

export function SalaryComponentForm({
  onSubmit,
  onCancel,
  isPending,
  defaultValues,
}: SalaryComponentFormProps) {
  const form = useForm<SalaryComponentCreateInput>({
    resolver: zodResolver(salaryComponentCreateInput),
    defaultValues: {
      name: '',
      type: undefined,
      amount: undefined,
      description: '',
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
              <FormLabel>Nama Komponen *</FormLabel>
              <FormControl>
                <Input placeholder="Tunjangan Transport" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipe *</FormLabel>
              <Select
                onValueChange={(value: 'ADDITION' | 'DEDUCTION') =>
                  field.onChange(value)
                }
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe komponen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ADDITION">Tambahan</SelectItem>
                  <SelectItem value="DEDUCTION">Potongan</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Jumlah Default (Opsional)</FormLabel>
              <FormControl>
                <InputMask
                  inputType="currency"
                  placeholder="Rp 0"
                  {...field}
                  onChange={(_e, rawValue) =>
                    field.onChange(rawValue ? Number(rawValue) : undefined)
                  }
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Deskripsi komponen gaji..."
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
            {isPending ? 'Menyimpan...' : 'Simpan'}
          </Button>
        </div>
      </form>
    </Form>
  )
}


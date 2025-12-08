import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
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
import { InputMask } from '@/components/ui/input-mask'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTRPC } from '@/integrations/trpc/react'
import { payrollUpdateInput } from '@/integrations/trpc/routers/payroll/validation'
import { formatCurrency } from '@/lib/utils'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PayrollEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payrollId: string | null
}

export function PayrollEditDialog({
  open,
  onOpenChange,
  payrollId,
}: PayrollEditDialogProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data: payroll, isLoading: isLoadingPayroll } = useQuery(
    trpc.payroll.get.queryOptions(
      { id: payrollId! },
      { enabled: !!payrollId && open },
    ),
  )

  const { data: salaryComponentsData } = useQuery(
    trpc.salaryComponent.list.queryOptions({ perPage: 100 }),
  )
  const salaryComponents = salaryComponentsData?.items || []

  const form = useForm({
    resolver: zodResolver(payrollUpdateInput),
    defaultValues: {
      baseSalary: 0,
      components: [] as Array<{
        name: string
        type: 'ADDITION' | 'DEDUCTION'
        amount: number
        sourceId?: string
      }>,
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'components',
  })

  // Initialize form when payroll data is loaded
  useEffect(() => {
    if (payroll) {
      form.setValue('baseSalary', payroll.baseSalary)
      const components =
        payroll.payrollComponents?.map((pc) => ({
          name: pc.name,
          type: pc.type as 'ADDITION' | 'DEDUCTION',
          amount: pc.amount,
          sourceId: pc.sourceId ?? undefined,
        })) || []
      form.setValue('components', components)
    }
  }, [payroll, form])

  const updateMutation = useMutation(
    trpc.payroll.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.list.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.get.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.payroll.summary.queryKey(),
        })
        toast.success('Payroll berhasil diperbarui')
        onOpenChange(false)
      },
      onError: (error) => {
        toast.error(`Gagal memperbarui payroll: ${error.message}`)
      },
    }),
  )

  const baseSalary = form.watch('baseSalary') || 0
  const components = form.watch('components') || []

  // Calculate totals
  const { totalAllowance, totalDeduction, grossSalary, netSalary } =
    useMemo(() => {
      const allowance = components
        .filter((comp) => comp.type === 'ADDITION')
        .reduce((sum, comp) => sum + (comp.amount || 0), 0)

      const deduction = components
        .filter((comp) => comp.type === 'DEDUCTION')
        .reduce((sum, comp) => sum + (comp.amount || 0), 0)

      const gross = baseSalary + allowance
      const net = gross - deduction

      return {
        totalAllowance: allowance,
        totalDeduction: deduction,
        grossSalary: gross,
        netSalary: net,
      }
    }, [components, baseSalary])

  const handleSubmit = (data: {
    baseSalary?: number
    components?: Array<{
      name: string
      type: 'ADDITION' | 'DEDUCTION'
      amount: number
      sourceId?: string
    }>
  }) => {
    if (!payrollId) return
    updateMutation.mutate({
      id: payrollId,
      ...data,
    })
  }

  const handleAddComponent = () => {
    append({
      name: '',
      type: 'ADDITION',
      amount: 0,
      sourceId: undefined,
    })
  }

  const handleSelectFromMaster = (index: number, sourceId: string) => {
    const selectedComponent = salaryComponents.find((sc) => sc.id === sourceId)
    if (selectedComponent) {
      form.setValue(`components.${index}.name`, selectedComponent.name)
      form.setValue(`components.${index}.type`, selectedComponent.type)
      form.setValue(
        `components.${index}.amount`,
        selectedComponent.amount ?? 0,
      )
      form.setValue(`components.${index}.sourceId`, selectedComponent.id)
    }
  }

  if (isLoadingPayroll || !payroll) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="text-center py-8 text-muted-foreground">
            Memuat data...
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Payroll</DialogTitle>
          <DialogDescription>
            Edit detail payroll untuk {payroll.employee.firstName}{' '}
            {payroll.employee.lastName}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Employee Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Nama Karyawan</p>
                <p className="font-medium">
                  {payroll.employee.firstName} {payroll.employee.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">NIK</p>
                <p className="font-medium">{payroll.employee.employeeId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departemen</p>
                <p className="font-medium">
                  {payroll.employee.department?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Posisi</p>
                <p className="font-medium">
                  {payroll.employee.position?.name || '-'}
                </p>
              </div>
            </div>

            {/* Base Salary */}
            <FormField
              control={form.control}
              name="baseSalary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gaji Pokok *</FormLabel>
                  <FormControl>
                    <InputMask
                      inputType="currency"
                      placeholder="Rp 0"
                      {...field}
                      onChange={(_e, rawValue) =>
                        field.onChange(rawValue ? Number(rawValue) : 0)
                      }
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Components Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Komponen Gaji</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddComponent}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Komponen
                </Button>
              </div>

              {fields.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Komponen</TableHead>
                        <TableHead>Tipe</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        <TableHead className="w-[80px]">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const component = form.watch(`components.${index}`)
                        const isFromMaster = !!component.sourceId

                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              {isFromMaster ? (
                                <FormField
                                  control={form.control}
                                  name={`components.${index}.sourceId`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={(value) => {
                                          field.onChange(value)
                                          handleSelectFromMaster(index, value)
                                        }}
                                        value={field.value || ''}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Pilih dari master data" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          {salaryComponents.map((sc) => (
                                            <SelectItem key={sc.id} value={sc.id}>
                                              {sc.name} (
                                              {sc.type === 'ADDITION'
                                                ? 'Tambahan'
                                                : 'Potongan'}
                                              )
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              ) : (
                                <FormField
                                  control={form.control}
                                  name={`components.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Nama komponen"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              {isFromMaster ? (
                                <span className="text-sm text-muted-foreground">
                                  {component.type === 'ADDITION'
                                    ? 'Tambahan'
                                    : 'Potongan'}
                                </span>
                              ) : (
                                <FormField
                                  control={form.control}
                                  name={`components.${index}.type`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <Select
                                        onValueChange={(value: 'ADDITION' | 'DEDUCTION') =>
                                          field.onChange(value)
                                        }
                                        value={field.value}
                                      >
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="ADDITION">
                                            Tambahan
                                          </SelectItem>
                                          <SelectItem value="DEDUCTION">
                                            Potongan
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`components.${index}.amount`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <InputMask
                                        inputType="currency"
                                        placeholder="Rp 0"
                                        {...field}
                                        onChange={(_e, rawValue) =>
                                          field.onChange(
                                            rawValue ? Number(rawValue) : 0,
                                          )
                                        }
                                        value={field.value}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    if (isFromMaster) {
                                      // Switch to manual
                                      form.setValue(
                                        `components.${index}.sourceId`,
                                        undefined,
                                      )
                                    } else {
                                      // Switch to master
                                      if (salaryComponents.length > 0) {
                                        handleSelectFromMaster(
                                          index,
                                          salaryComponents[0].id,
                                        )
                                      }
                                    }
                                  }}
                                  title={
                                    isFromMaster
                                      ? 'Ubah ke input manual'
                                      : 'Pilih dari master data'
                                  }
                                >
                                  {isFromMaster ? 'Manual' : 'Master'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => remove(index)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada komponen gaji. Klik "Tambah Komponen" untuk
                  menambahkan.
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Tambahan
                </span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(totalAllowance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Potongan
                </span>
                <span className="font-medium text-destructive">
                  -{formatCurrency(totalDeduction)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Gaji Kotor</span>
                <span className="font-medium">
                  {formatCurrency(grossSalary)}
                </span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Gaji Bersih</span>
                <span className="font-semibold text-lg">
                  {formatCurrency(netSalary)}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

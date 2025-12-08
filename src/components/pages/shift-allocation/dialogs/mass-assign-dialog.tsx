import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { useFieldArray, useForm } from 'react-hook-form'
import type { ShiftAllocationMassAssignInput } from '@/integrations/trpc/routers/shift-allocation/validation'
import { EmployeeCombobox } from '@/components/shared/employee-combobox'
import {
  SelectEmptyState,
  SelectEmptyStateWithAdd,
} from '@/components/shared/select-empty-state'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { shiftAllocationMassAssignInput } from '@/integrations/trpc/routers/shift-allocation/validation'

interface Shift {
  id: string
  name: string
  startTime: string
  endTime: string
}

interface AttendanceType {
  id: string
  name: string
  code: string | null
  isMustPresence: boolean
}

interface MassAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  attendanceTypes: Array<AttendanceType>
  shifts: Array<Shift>
  onSubmit: (data: ShiftAllocationMassAssignInput) => void
  isPending?: boolean
}

const DAYS = [
  { value: 0, label: 'Minggu' },
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
  { value: 6, label: 'Sabtu' },
]

export function MassAssignDialog({
  open,
  onOpenChange,
  attendanceTypes,
  shifts,
  onSubmit,
  isPending,
}: MassAssignDialogProps) {
  const today = format(new Date(), 'yyyy-MM-dd')

  const form = useForm<ShiftAllocationMassAssignInput>({
    resolver: zodResolver(shiftAllocationMassAssignInput),
    defaultValues: {
      startDate: today,
      endDate: today,
      days: [1, 2, 3, 4, 5], // Mon-Fri
      assignments: [{ employeeId: '', attendanceTypeId: '', shiftId: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'assignments',
  })

  const handleDayToggle = (day: number, checked: boolean) => {
    const currentDays = form.getValues('days')
    if (checked) {
      form.setValue(
        'days',
        [...currentDays, day].sort((a, b) => a - b),
      )
    } else {
      form.setValue(
        'days',
        currentDays.filter((d) => d !== day),
      )
    }
  }

  const handleSubmit = (data: ShiftAllocationMassAssignInput) => {
    const validAssignments = data.assignments.filter(
      (a) => a.employeeId && a.attendanceTypeId,
    )
    if (validAssignments.length === 0) return

    // Filter out shiftId if attendanceType doesn't require it
    const processedAssignments = validAssignments.map((a) => {
      const attendanceType = attendanceTypes.find(
        (at) => at.id === a.attendanceTypeId,
      )
      if (attendanceType?.isMustPresence && a.shiftId) {
        return { ...a, shiftId: a.shiftId }
      }
      return { employeeId: a.employeeId, attendanceTypeId: a.attendanceTypeId }
    })

    onSubmit({
      ...data,
      assignments: processedAssignments,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Mass Assign Shift</DialogTitle>
          <DialogDescription>
            Alokasikan shift untuk beberapa karyawan sekaligus
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Mulai</FormLabel>
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
                    <FormLabel>Tanggal Selesai</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Days Selection */}
            <FormField
              control={form.control}
              name="days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hari</FormLabel>
                  <div className="flex flex-wrap gap-3">
                    {DAYS.map((day) => (
                      <Label
                        key={day.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={field.value.includes(day.value)}
                          onCheckedChange={(checked) =>
                            handleDayToggle(day.value, !!checked)
                          }
                        />
                        <span className="text-sm">{day.label}</span>
                      </Label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assignments */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Karyawan, Tipe Kehadiran & Shift</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      employeeId: '',
                      attendanceTypeId: '',
                      shiftId: '',
                    })
                  }
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => {
                  const attendanceTypeId = form.watch(
                    `assignments.${index}.attendanceTypeId`,
                  )
                  const selectedAttendanceType = attendanceTypes.find(
                    (at) => at.id === attendanceTypeId,
                  )
                  const showShiftSelection =
                    selectedAttendanceType?.isMustPresence ?? false

                  return (
                    <div key={field.id} className="flex gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`assignments.${index}.employeeId`}
                        render={({ field: empField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <EmployeeCombobox
                                value={empField.value}
                                onValueChange={empField.onChange}
                                placeholder="Pilih karyawan"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`assignments.${index}.attendanceTypeId`}
                        render={({ field: atField }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Select
                                value={atField.value}
                                onValueChange={(value) => {
                                  atField.onChange(value)
                                  // Clear shiftId if attendanceType doesn't require it
                                  const at = attendanceTypes.find(
                                    (a) => a.id === value,
                                  )
                                  if (!at?.isMustPresence) {
                                    form.setValue(
                                      `assignments.${index}.shiftId`,
                                      '',
                                    )
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pilih tipe kehadiran" />
                                </SelectTrigger>
                                <SelectContent>
                                  {attendanceTypes.length === 0 ? (
                                    <SelectEmptyState
                                      message="Belum ada tipe kehadiran"
                                      createButtonLabel="Buat Tipe Kehadiran"
                                      createRoute="/app/attendance-types"
                                      onClose={() => onOpenChange(false)}
                                    />
                                  ) : (
                                    <>
                                      {attendanceTypes.map((at) => (
                                        <SelectItem key={at.id} value={at.id}>
                                          {at.name} {at.code && `(${at.code})`}
                                        </SelectItem>
                                      ))}
                                      <SelectEmptyStateWithAdd
                                        message=""
                                        createButtonLabel="Buat Tipe Kehadiran Baru"
                                        createRoute="/app/attendance-types"
                                        onClose={() => onOpenChange(false)}
                                        items={attendanceTypes}
                                      />
                                    </>
                                  )}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {showShiftSelection && (
                        <FormField
                          control={form.control}
                          name={`assignments.${index}.shiftId`}
                          render={({ field: shiftField }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Select
                                  value={shiftField.value}
                                  onValueChange={shiftField.onChange}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Pilih shift" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {shifts.length === 0 ? (
                                      <SelectEmptyState
                                        message="Belum ada shift"
                                        createButtonLabel="Buat Shift"
                                        createRoute="/app/shifts"
                                        onClose={() => onOpenChange(false)}
                                      />
                                    ) : (
                                      <>
                                        {shifts.map((shift) => (
                                          <SelectItem
                                            key={shift.id}
                                            value={shift.id}
                                          >
                                            {shift.name} ({shift.startTime}-
                                            {shift.endTime})
                                          </SelectItem>
                                        ))}
                                        <SelectEmptyStateWithAdd
                                          message=""
                                          createButtonLabel="Buat Shift Baru"
                                          createRoute="/app/shifts"
                                          onClose={() => onOpenChange(false)}
                                          items={shifts}
                                        />
                                      </>
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

import { Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

interface DayShift {
  day: number
  attendanceTypeId: string
  shiftId?: string
}

interface EmployeeScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId: string
  employeeName: string
  month: number
  year: number
  attendanceTypes: Array<AttendanceType>
  shifts: Array<Shift>
  onSubmit: (data: {
    employeeId: string
    month: number
    year: number
    schedules: Array<DayShift>
  }) => void
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

export function EmployeeScheduleDialog({
  open,
  onOpenChange,
  employeeId,
  employeeName,
  month,
  year,
  attendanceTypes,
  shifts,
  onSubmit,
  isPending,
}: EmployeeScheduleDialogProps) {
  const [schedules, setSchedules] = useState<Array<DayShift>>([
    { day: 1, attendanceTypeId: '', shiftId: '' },
  ])

  useEffect(() => {
    if (open) {
      setSchedules([{ day: 1, attendanceTypeId: '', shiftId: '' }])
    }
  }, [open])

  const usedDays = schedules.map((s) => s.day)

  const handleAddSchedule = () => {
    if (schedules.length >= 7) return
    const availableDay = DAYS.find((d) => !usedDays.includes(d.value))
    if (availableDay) {
      setSchedules((prev) => [
        ...prev,
        { day: availableDay.value, attendanceTypeId: '', shiftId: '' },
      ])
    }
  }

  const handleRemoveSchedule = (index: number) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index))
  }

  const handleChange = (
    index: number,
    field: 'day' | 'attendanceTypeId' | 'shiftId',
    value: string | number,
  ) => {
    setSchedules((prev) =>
      prev.map((s, i) => {
        if (i === index) {
          const updated = {
            ...s,
            [field]: field === 'day' ? Number(value) : value,
          }
          // If attendanceType changed, clear shiftId if not required
          if (field === 'attendanceTypeId') {
            const at = attendanceTypes.find((a) => a.id === value)
            if (!at?.isMustPresence) {
              updated.shiftId = undefined
            }
          }
          return updated
        }
        return s
      }),
    )
  }

  const handleSubmit = () => {
    const validSchedules = schedules.filter(
      (s) => s.attendanceTypeId && (!s.shiftId || s.shiftId),
    )
    if (validSchedules.length === 0) return
    onSubmit({ employeeId, month, year, schedules: validSchedules })
  }

  const isValid = schedules.some(
    (s) => s.attendanceTypeId && (!s.shiftId || s.shiftId),
  )

  const monthName = new Date(year, month - 1).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Jadwal Shift - {employeeName}</DialogTitle>
          <DialogDescription>
            Atur jadwal shift mingguan untuk bulan <strong>{monthName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Jadwal per Hari</span>
              {schedules.length < 7 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSchedule}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Hari
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {schedules.map((schedule, index) => {
                const availableDays = DAYS.filter(
                  (d) =>
                    d.value === schedule.day || !usedDays.includes(d.value),
                )

                const selectedAttendanceType = attendanceTypes.find(
                  (at) => at.id === schedule.attendanceTypeId,
                )
                const showShiftSelection =
                  selectedAttendanceType?.isMustPresence ?? false

                return (
                  <div
                    key={`${schedule.day}-${index}`}
                    className="flex gap-2 items-center"
                  >
                    <Select
                      value={schedule.day.toString()}
                      onValueChange={(v) => handleChange(index, 'day', v)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Pilih hari" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDays.map((day) => (
                          <SelectItem
                            key={day.value}
                            value={day.value.toString()}
                          >
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={schedule.attendanceTypeId}
                      onValueChange={(v) =>
                        handleChange(index, 'attendanceTypeId', v)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipe kehadiran" />
                      </SelectTrigger>
                      <SelectContent>
                        {attendanceTypes.map((at) => (
                          <SelectItem key={at.id} value={at.id}>
                            {at.name} {at.code && `(${at.code})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {showShiftSelection && (
                      <Select
                        value={schedule.shiftId || ''}
                        onValueChange={(v) => handleChange(index, 'shiftId', v)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Pilih shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem key={shift.id} value={shift.id}>
                              {shift.name} ({shift.startTime}-{shift.endTime})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {schedules.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSchedule(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid || isPending}>
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

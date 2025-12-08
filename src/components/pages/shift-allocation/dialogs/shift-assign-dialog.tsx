import { format } from 'date-fns'
import { id } from 'date-fns/locale'
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
import {
  SelectEmptyState,
  SelectEmptyStateWithAdd,
} from '@/components/shared/select-empty-state'

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

interface ShiftAssignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeName: string
  date: string
  currentAttendanceTypeId?: string
  currentShiftId?: string
  attendanceTypes: Array<AttendanceType>
  shifts: Array<Shift>
  onAssign: (attendanceTypeId: string, shiftId?: string) => void
  isPending?: boolean
}

export function ShiftAssignDialog({
  open,
  onOpenChange,
  employeeName,
  date,
  currentAttendanceTypeId,
  currentShiftId,
  attendanceTypes,
  shifts,
  onAssign,
  isPending,
}: ShiftAssignDialogProps) {
  const [selectedAttendanceTypeId, setSelectedAttendanceTypeId] =
    useState<string>('')
  const [selectedShiftId, setSelectedShiftId] = useState<string>('')

  useEffect(() => {
    if (currentAttendanceTypeId) {
      setSelectedAttendanceTypeId(currentAttendanceTypeId)
    } else {
      setSelectedAttendanceTypeId('')
    }
    if (currentShiftId) {
      setSelectedShiftId(currentShiftId)
    } else {
      setSelectedShiftId('')
    }
  }, [currentAttendanceTypeId, currentShiftId])

  const selectedAttendanceType = attendanceTypes.find(
    (at) => at.id === selectedAttendanceTypeId,
  )
  const showShiftSelection = selectedAttendanceType?.isMustPresence ?? false

  const formattedDate = date
    ? format(new Date(date), 'EEEE, d MMMM yyyy', { locale: id })
    : ''

  const handleSubmit = () => {
    if (selectedAttendanceTypeId) {
      onAssign(
        selectedAttendanceTypeId,
        showShiftSelection ? selectedShiftId : undefined,
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alokasi Shift</DialogTitle>
          <DialogDescription>
            Pilih shift untuk <strong>{employeeName}</strong> pada{' '}
            <strong>{formattedDate}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Select
            value={selectedAttendanceTypeId}
            onValueChange={setSelectedAttendanceTypeId}
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

          {showShiftSelection && (
            <Select value={selectedShiftId} onValueChange={setSelectedShiftId}>
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
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
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
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedAttendanceTypeId ||
                (showShiftSelection && !selectedShiftId) ||
                isPending
              }
            >
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

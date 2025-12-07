import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { id } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmployeeScheduleDialog } from '../dialogs/employee-schedule-dialog'
import { MassAssignDialog } from '../dialogs/mass-assign-dialog'
import { ShiftAssignDialog } from '../dialogs/shift-assign-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSidebar } from '@/components/ui/sidebar'
import { useTRPC } from '@/integrations/trpc/react'

interface EmployeeShiftMap {
  [employeeId: string]: {
    [date: string]: {
      id: string
      attendanceTypeId: string
      attendanceTypeName: string
      attendanceTypeIsMustPresence: boolean
      shiftId?: string | null
      shiftName?: string | null
      startTime?: string | null
      endTime?: string | null
    }
  }
}

export function ShiftAllocationContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { state: sidebarState } = useSidebar()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(
    null,
  )
  const [isMassAssignOpen, setIsMassAssignOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string
    employeeName: string
    date: string
    currentAttendanceTypeId?: string
    currentShiftId?: string
  } | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<{
    id: string
    name: string
  } | null>(null)
  const [employeePage, setEmployeePage] = useState(1)
  const perPage = 10

  const month = currentDate.getMonth() + 1
  const year = currentDate.getFullYear()

  const { data: employeeData } = useQuery(
    trpc.employee.paginated.queryOptions({
      status: 'ACTIVE',
      departmentId: selectedDepartment || undefined,
      page: employeePage,
      perPage,
    }),
  )

  const employees = employeeData?.items
  const totalEmployees = employeeData?.total || 0
  const totalPages = employeeData?.totalPages || 1

  const { data: allocations } = useQuery(
    trpc.shiftAllocation.list.queryOptions({ month, year }),
  )
  const { data: shiftsData } = useQuery(trpc.shift.list.queryOptions())
  const shifts = shiftsData?.items || []
  const { data: attendanceTypesData } = useQuery(
    trpc.attendanceType.list.queryOptions(),
  )
  const attendanceTypes = attendanceTypesData?.items || []
  const { data: departmentsData } = useQuery(
    trpc.department.list.queryOptions(),
  )
  const departments = departmentsData?.items || []

  const assignMutation = useMutation(
    trpc.shiftAllocation.assign.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.shiftAllocation.list.queryKey(),
        })
        toast.success('Shift berhasil dialokasikan')
        setSelectedCell(null)
      },
      onError: (error) => {
        toast.error(`Gagal mengalokasikan shift: ${error.message}`)
      },
    }),
  )

  const massAssignMutation = useMutation(
    trpc.shiftAllocation.massAssign.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.shiftAllocation.list.queryKey(),
        })
        toast.success(`${data.count} alokasi shift berhasil dibuat`)
        setIsMassAssignOpen(false)
      },
      onError: (error) => {
        toast.error(`Gagal mengalokasikan shift: ${error.message}`)
      },
    }),
  )

  const employeeScheduleMutation = useMutation(
    trpc.shiftAllocation.employeeSchedule.mutationOptions({
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: trpc.shiftAllocation.list.queryKey(),
        })
        toast.success(`${data.count} alokasi shift berhasil dibuat`)
        setSelectedEmployee(null)
      },
      onError: (error) => {
        toast.error(`Gagal mengalokasikan shift: ${error.message}`)
      },
    }),
  )

  const employeeShiftMap: EmployeeShiftMap = {}
  allocations?.forEach((alloc) => {
    const empId = alloc.employeeId
    const dateStr = format(new Date(alloc.date), 'yyyy-MM-dd')
    if (!employeeShiftMap[empId]) {
      employeeShiftMap[empId] = {}
    }
    employeeShiftMap[empId][dateStr] = {
      id: alloc.id,
      attendanceTypeId: alloc.attendanceType.id,
      attendanceTypeName: alloc.attendanceType.name,
      attendanceTypeIsMustPresence: alloc.attendanceType.isMustPresence,
      shiftId: alloc.shift?.id,
      shiftName: alloc.shift?.name,
      startTime: alloc.shift?.startTime,
      endTime: alloc.shift?.endTime,
    }
  })

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleCellClick = (
    employeeId: string,
    employeeName: string,
    date: Date,
  ) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const currentShift = employeeShiftMap[employeeId]?.[dateStr]
    setSelectedCell({
      employeeId,
      employeeName,
      date: dateStr,
      currentAttendanceTypeId: currentShift?.attendanceTypeId,
      currentShiftId: currentShift?.shiftId || undefined,
    })
  }

  const handleAssignShift = (attendanceTypeId: string, shiftId?: string) => {
    if (!selectedCell) return
    assignMutation.mutate({
      employeeId: selectedCell.employeeId,
      attendanceTypeId,
      shiftId,
      date: selectedCell.date,
    })
  }

  const sidebarWidth = sidebarState === 'expanded' ? '18rem' : '3rem'

  return (
    <div
      className="space-y-6 overflow-hidden transition-all duration-200"
      style={{ maxWidth: `calc(100vw - ${sidebarWidth} - 3rem)` }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alokasi Shift Kerja</h1>
          <p className="text-muted-foreground">
            Kelola jadwal shift karyawan per bulan
          </p>
        </div>
        <Button onClick={() => setIsMassAssignOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Mass Assign
        </Button>
      </div>

      <Card>
        <CardContent className="flex justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xl font-semibold min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: id })}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleToday}>
              Hari Ini
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Select
              onValueChange={(val) => {
                setSelectedDepartment(val || null)
                setEmployeePage(1)
              }}
              value={selectedDepartment || ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih departemen" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden max-w-full">
        <CardContent className="overflow-x-auto p-0 mx-6 rounded-md">
          <div className="flex w-fit">
            <div className="sticky left-0 z-10 bg-background border-r flex flex-col">
              <div className="h-[60px] min-w-[224px] bg-primary text-primary-foreground p-2 flex items-center justify-center font-medium">
                Karyawan
              </div>
              {employees?.map((employee) => (
                <button
                  type="button"
                  key={employee.id}
                  onClick={() =>
                    setSelectedEmployee({
                      id: employee.id,
                      name: `${employee.firstName} ${employee.lastName}`,
                    })
                  }
                  className="h-[150px] min-w-[224px] bg-muted/50 p-2 flex flex-col justify-center items-center gap-1 hover:bg-muted transition-colors cursor-pointer text-left relative border-b"
                >
                  <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded w-fit absolute top-2 left-2">
                    {employee.employeeId}
                  </span>
                  <span className="text-lg font-medium">
                    {employee.firstName} {employee.lastName}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1">
              <div className="flex flex-col">
                <div className="flex">
                  {days.map((day) => (
                    <div
                      key={day.toISOString()}
                      className="min-w-[224px] h-[60px] bg-primary text-primary-foreground p-2 text-center flex flex-col justify-center border-l border-primary-foreground/20"
                    >
                      <div className="text-sm">{dayNames[getDay(day)]}</div>
                      <div className="font-bold">{format(day, 'd')}</div>
                    </div>
                  ))}
                </div>

                {employees?.map((employee) => (
                  <div key={employee.id} className="flex">
                    {days.map((day) => {
                      const dateStr = format(day, 'yyyy-MM-dd')
                      const shift = employeeShiftMap[employee.id]?.[dateStr]
                      const isWeekend = getDay(day) === 0 || getDay(day) === 6

                      return (
                        <button
                          key={day.toISOString()}
                          type="button"
                          onClick={() =>
                            handleCellClick(
                              employee.id,
                              `${employee.firstName} ${employee.lastName}`,
                              day,
                            )
                          }
                          className={`
														min-w-[224px] h-[150px] p-2 text-sm transition-all cursor-pointer
														border-l border-b hover:bg-primary/20
														${isWeekend ? 'bg-muted' : 'bg-background'}
														${shift ? 'bg-primary/10' : ''}
													`}
                        >
                          {shift && (
                            <div className="text-center h-full flex flex-col justify-center">
                              <div className="font-medium text-primary text-base">
                                {shift.attendanceTypeName}
                              </div>
                              {shift.shiftName && (
                                <>
                                  <div className="text-muted-foreground text-sm mt-1">
                                    {shift.shiftName}
                                  </div>
                                  <div className="text-muted-foreground text-xs mt-1">
                                    {shift.startTime} - {shift.endTime}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {(!employees || employees.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              Belum ada karyawan aktif
            </div>
          )}
        </CardContent>

        <div className="flex items-center justify-between px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Menampilkan {(employeePage - 1) * perPage + 1}-
            {Math.min(employeePage * perPage, totalEmployees)} dari{' '}
            {totalEmployees} karyawan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEmployeePage((p) => Math.max(1, p - 1))}
              disabled={employeePage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <span className="text-sm">
              {employeePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setEmployeePage((p) => Math.min(totalPages, p + 1))
              }
              disabled={employeePage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <ShiftAssignDialog
        open={!!selectedCell}
        onOpenChange={(open) => !open && setSelectedCell(null)}
        employeeName={selectedCell?.employeeName || ''}
        date={selectedCell?.date || ''}
        currentAttendanceTypeId={selectedCell?.currentAttendanceTypeId}
        currentShiftId={selectedCell?.currentShiftId}
        attendanceTypes={attendanceTypes || []}
        shifts={shifts || []}
        onAssign={handleAssignShift}
        isPending={assignMutation.isPending}
      />

      <MassAssignDialog
        open={isMassAssignOpen}
        onOpenChange={setIsMassAssignOpen}
        attendanceTypes={attendanceTypes || []}
        shifts={shifts || []}
        onSubmit={(data) => massAssignMutation.mutate(data)}
        isPending={massAssignMutation.isPending}
      />

      <EmployeeScheduleDialog
        open={!!selectedEmployee}
        onOpenChange={(open) => !open && setSelectedEmployee(null)}
        employeeId={selectedEmployee?.id || ''}
        employeeName={selectedEmployee?.name || ''}
        month={month}
        year={year}
        attendanceTypes={attendanceTypes || []}
        shifts={shifts || []}
        onSubmit={(data) => employeeScheduleMutation.mutate(data)}
        isPending={employeeScheduleMutation.isPending}
      />
    </div>
  )
}

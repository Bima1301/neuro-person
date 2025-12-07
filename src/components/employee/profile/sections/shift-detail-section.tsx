import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useTRPC } from '@/integrations/trpc/react'

interface Props {
  employee: EmployeeDetail
}

export default function ShiftDetailSection({ employee }: Props) {
  const trpc = useTRPC()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const { data: todayShift, isLoading } = useQuery(
    trpc.shiftAllocation.getToday.queryOptions(
      { date: todayStr },
      { enabled: !!employee.id },
    ),
  )

  return (
    <Card className="bg-[#1e2128] border-white/5">
      <CardHeader>
        <CardTitle className="text-white">
          Detail Shift : {format(new Date(), 'dd MMMM yyyy', { locale: id })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div>
            <p className="text-sm text-white/60">Memuat data shift...</p>
          </div>
        ) : todayShift ? (
          <>
            {todayShift.shift && (
              <div className="space-y-3">
                <h4 className="font-semibold text-white">Shift Hari Ini</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Nama Shift</p>
                    <p className="text-sm text-white font-medium">
                      {todayShift.shift.name}
                    </p>
                  </div>
                  {todayShift.shift.startTime && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Waktu Masuk</p>
                      <p className="text-sm text-white">
                        {todayShift.shift.startTime}
                      </p>
                    </div>
                  )}
                  {todayShift.shift.endTime && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">Waktu Pulang</p>
                      <p className="text-sm text-white">
                        {todayShift.shift.endTime}
                      </p>
                    </div>
                  )}
                  {todayShift.attendanceType && (
                    <div>
                      <p className="text-xs text-white/60 mb-1">
                        Tipe Kehadiran
                      </p>
                      <p className="text-sm text-white">
                        {todayShift.attendanceType.name}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <p className="text-sm text-white/60">
              Tidak ada shift untuk hari ini
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

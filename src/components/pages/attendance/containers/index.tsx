import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { AttendanceFilters } from '../sections/attendance-filters'
import { AttendanceTable } from '../sections/attendance-table'
import type { AttendanceStatus } from '@/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

export function AttendanceContainer() {
  const trpc = useTRPC()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [statusFilter, setStatusFilter] = useState<
    AttendanceStatus | undefined
  >()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.attendance.list.queryOptions({
      date,
      status: statusFilter,
      page,
      perPage,
    }),
  )
  const attendances = data?.items || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Absensi</h1>
          <p className="text-muted-foreground">
            Kelola kehadiran karyawan harian
          </p>
        </div>
        <Button>Check-in Manual</Button>
      </div>

      {/* Filters */}
      <AttendanceFilters
        date={date}
        onDateChange={(value) => {
          setDate(value)
          setPage(1)
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}
      />

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rekap Absensi</CardTitle>
          <CardDescription>
            Total {data?.total || 0} data absensi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AttendanceTable
            attendances={attendances}
            isLoading={isLoading}
            page={page}
            totalPages={data?.totalPages}
            total={data?.total}
            pageSize={perPage}
            onPageChange={setPage}
            onPageSizeChange={(newPerPage) => {
              setPerPage(newPerPage)
              setPage(1)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

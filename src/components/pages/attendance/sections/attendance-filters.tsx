import { CalendarIcon, Filter } from 'lucide-react'
import type { AttendanceStatus } from '@/generated/prisma/enums'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AttendanceFiltersProps {
  date: string
  onDateChange: (value: string) => void
  statusFilter: AttendanceStatus | undefined
  onStatusFilterChange: (value: AttendanceStatus | undefined) => void
}

export function AttendanceFilters({
  date,
  onDateChange,
  statusFilter,
  onStatusFilterChange,
}: AttendanceFiltersProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              className="pl-9"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) =>
              onStatusFilterChange(
                v === 'all' ? undefined : (v as AttendanceStatus),
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="PRESENT">Hadir</SelectItem>
              <SelectItem value="LATE">Terlambat</SelectItem>
              <SelectItem value="ABSENT">Tidak Hadir</SelectItem>
              <SelectItem value="HALF_DAY">Setengah Hari</SelectItem>
              <SelectItem value="ON_LEAVE">Cuti</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

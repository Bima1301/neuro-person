import { Filter } from 'lucide-react'
import type { LeaveStatus } from '@/generated/prisma/enums'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface LeaveFiltersProps {
  statusFilter: LeaveStatus | undefined
  onStatusFilterChange: (value: LeaveStatus | undefined) => void
}

export function LeaveFilters({
  statusFilter,
  onStatusFilterChange,
}: LeaveFiltersProps) {
  return (
    <Card>
      <CardContent>
        <div className="flex gap-4">
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) =>
              onStatusFilterChange(v === 'all' ? undefined : (v as LeaveStatus))
            }
          >
            <SelectTrigger className="w-[200px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="PENDING">Menunggu</SelectItem>
              <SelectItem value="APPROVED">Disetujui</SelectItem>
              <SelectItem value="REJECTED">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

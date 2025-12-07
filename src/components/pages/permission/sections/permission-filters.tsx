import { Filter, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PermissionFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  statusFilter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | undefined
  onStatusFilterChange: (
    value: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | undefined,
  ) => void
}

export function PermissionFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: PermissionFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari karyawan, tipe perizinan, atau keterangan..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={statusFilter || 'all'}
            onValueChange={(v) =>
              onStatusFilterChange(
                v === 'all'
                  ? undefined
                  : (v as 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'),
              )
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
              <SelectItem value="CANCELLED">Dibatalkan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

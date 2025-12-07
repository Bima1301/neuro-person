import { Eye, MoreHorizontal, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { AttendanceListItem } from '@/integrations/trpc/routers/attendance/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Attendance = AttendanceListItem

const getStatusBadge = (status: string) => {
  const config: Record<
    string,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
      label: string
    }
  > = {
    PRESENT: { variant: 'default', label: 'Hadir' },
    LATE: { variant: 'secondary', label: 'Terlambat' },
    ABSENT: { variant: 'destructive', label: 'Tidak Hadir' },
    LEAVE: { variant: 'outline', label: 'Cuti' },
    SICK: { variant: 'outline', label: 'Sakit' },
  }
  return config[status] || { variant: 'outline', label: status }
}

const formatTime = (time: Date | string | null) => {
  if (!time) return '-'
  const d = time instanceof Date ? time : new Date(time)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const attendanceColumns: Array<ColumnDef<Attendance>> = [
  {
    accessorKey: 'date',
    header: 'Tanggal',
    cell: ({ row }) => formatDate(row.getValue('date')),
  },
  {
    id: 'employee',
    header: 'Karyawan',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">
          {row.original.employee.firstName} {row.original.employee.lastName}
        </p>
        <p className="text-sm text-muted-foreground">
          {row.original.employee.employeeId}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'checkIn',
    header: 'Jam Masuk',
    cell: ({ row }) => formatTime(row.getValue('checkIn')),
  },
  {
    accessorKey: 'checkOut',
    header: 'Jam Keluar',
    cell: ({ row }) => formatTime(row.getValue('checkOut')),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = getStatusBadge(row.getValue('status'))
      return <Badge variant={status.variant}>{status.label}</Badge>
    },
  },
  {
    id: 'actions',
    header: 'Aksi',
    cell: ({ row, table }) => {
      const meta = table.options.meta as {
        onViewDetail?: (attendance: Attendance) => void
        onDelete?: (attendance: Attendance) => void
      }
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => meta?.onViewDetail?.(row.original)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => meta?.onDelete?.(row.original)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

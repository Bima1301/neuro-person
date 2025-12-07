import { Check, MoreHorizontal, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface LeaveRequest {
  id: string
  startDate: Date | string
  endDate: Date | string
  totalDays: number
  status: string
  reason: string | null
  employee: {
    firstName: string
    lastName: string
    employeeId: string
  }
  leaveType: {
    name: string
  }
}

const getStatusBadge = (status: string) => {
  const config: Record<
    string,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
      label: string
    }
  > = {
    PENDING: { variant: 'secondary', label: 'Menunggu' },
    APPROVED: { variant: 'default', label: 'Disetujui' },
    REJECTED: { variant: 'destructive', label: 'Ditolak' },
    CANCELLED: { variant: 'outline', label: 'Dibatalkan' },
  }
  return config[status] || { variant: 'outline', label: status }
}

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export const createLeaveColumns = (
  onApprove: (id: string) => void,
  onReject: (id: string) => void,
): Array<ColumnDef<LeaveRequest>> => [
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
    id: 'leaveType',
    header: 'Jenis Cuti',
    cell: ({ row }) => row.original.leaveType.name,
  },
  {
    id: 'date',
    header: 'Tanggal',
    cell: ({ row }) =>
      `${formatDate(row.original.startDate)} - ${formatDate(row.original.endDate)}`,
  },
  {
    accessorKey: 'totalDays',
    header: 'Durasi',
    cell: ({ row }) => `${row.getValue('totalDays')} hari`,
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
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) =>
      row.original.status === 'PENDING' ? (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onApprove(row.original.id)}>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Setujui
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onReject(row.original.id)}>
                <X className="mr-2 h-4 w-4 text-destructive" />
                Tolak
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null,
  },
]

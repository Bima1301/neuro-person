import { Check, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'

export interface Payroll {
  id: string
  period: Date | string
  baseSalary: number
  grossSalary?: number
  totalAllowance: number
  totalDeduction: number
  netSalary: number
  status: string
  employee: {
    firstName: string
    lastName: string
    employeeId: string
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
    PENDING: { variant: 'secondary', label: 'Pending' },
    PROCESSED: { variant: 'outline', label: 'Diproses' },
    PAID: { variant: 'default', label: 'Dibayar' },
    CANCELLED: { variant: 'destructive', label: 'Dibatalkan' },
  }
  return config[status] || { variant: 'outline', label: status }
}

const formatPeriod = (period: Date | string) => {
  const d = period instanceof Date ? period : new Date(period)
  return d.toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  })
}

export const createPayrollColumns = (
  onMarkPaid: (id: string) => void,
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void,
): Array<ColumnDef<Payroll>> => [
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
    accessorKey: 'period',
    header: 'Periode',
    cell: ({ row }) => formatPeriod(row.getValue('period')),
  },
  {
    accessorKey: 'baseSalary',
    header: () => <span className="text-right">Gaji Pokok</span>,
    cell: ({ row }) => (
      <span className="text-right block">
        {formatCurrency(row.getValue('baseSalary') ?? 0)}
      </span>
    ),
  },
  {
    accessorKey: 'grossSalary',
    header: () => <span className="text-right">Gaji Kotor</span>,
    cell: ({ row }) => (
      <span className="text-right block">
        {formatCurrency(
          row.getValue('grossSalary') ?? row.original.baseSalary + row.original.totalAllowance,
        )}
      </span>
    ),
  },
  {
    accessorKey: 'totalAllowance',
    header: () => <span className="text-right">Tunjangan</span>,
    cell: ({ row }) => (
      <span className="text-right block text-green-600">
        +{formatCurrency(row.getValue('totalAllowance'))}
      </span>
    ),
  },
  {
    accessorKey: 'totalDeduction',
    header: () => <span className="text-right">Potongan</span>,
    cell: ({ row }) => (
      <span className="text-right block text-destructive">
        -{formatCurrency(row.getValue('totalDeduction'))}
      </span>
    ),
  },
  {
    accessorKey: 'netSalary',
    header: () => <span className="text-right">Gaji Bersih</span>,
    cell: ({ row }) => (
      <span className="text-right block font-medium">
        {formatCurrency(row.getValue('netSalary'))}
      </span>
    ),
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
    cell: ({ row }) => (
      <div className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            {row.original.status === 'PENDING' && (
              <DropdownMenuItem onClick={() => onMarkPaid(row.original.id)}>
                <Check className="mr-2 h-4 w-4 text-green-600" />
                Tandai Dibayar
              </DropdownMenuItem>
            )}
            {onDelete && row.original.status !== 'PAID' && (
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(row.original.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

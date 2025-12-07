import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type {
  LocationPresenceType,
  ShiftPresenceType,
} from '@/generated/prisma/enums'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'

export interface Position {
  id: string
  name: string
  baseSalary?: number | null
  department: { name: string } | null
  _count: { employees: number }
  shiftPresenceType: ShiftPresenceType | null
  locationPresenceType: LocationPresenceType | null
}

export const createPositionColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): Array<ColumnDef<Position>> => [
  {
    accessorKey: 'name',
    header: 'Nama Posisi',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    id: 'department',
    header: 'Departemen',
    cell: ({ row }) => row.original.department?.name || '-',
  },
  {
    accessorKey: 'baseSalary',
    header: 'Gaji Pokok',
    cell: ({ row }) => formatCurrency(row.getValue('baseSalary')),
  },
  {
    accessorKey: 'shiftPresenceType',
    header: 'Jenis Presensi',
    cell: ({ row }) => row.original.shiftPresenceType || '-',
  },
  {
    accessorKey: 'locationPresenceType',
    header: 'Jenis Lokasi Presensi',
    cell: ({ row }) => row.original.locationPresenceType || '-',
  },
  {
    id: 'employeeCount',
    header: 'Jumlah Karyawan',
    cell: ({ row }) => row.original._count.employees,
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
            <DropdownMenuItem onClick={() => onEdit(row.original.id)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]

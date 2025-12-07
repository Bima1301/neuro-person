import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface AttendanceType {
  id: string
  name: string
  code: string | null
  isMustPresence: boolean
}

export const createAttendanceTypeColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): Array<ColumnDef<AttendanceType>> => [
  {
    accessorKey: 'name',
    header: 'Nama',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'code',
    header: 'Kode',
    cell: ({ row }) => row.original.code || '-',
  },
  {
    accessorKey: 'isMustPresence',
    header: 'Wajib Presensi',
    cell: ({ row }) => (
      <Badge variant={row.original.isMustPresence ? 'default' : 'secondary'}>
        {row.original.isMustPresence ? 'Ya' : 'Tidak'}
      </Badge>
    ),
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
              onClick={() => onDelete(row.original.id)}
              className="text-destructive"
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

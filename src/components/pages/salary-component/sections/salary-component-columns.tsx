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
import { formatCurrency } from '@/lib/utils'

export interface SalaryComponent {
  id: string
  name: string
  description: string | null
  type: 'ADDITION' | 'DEDUCTION'
  amount: number | null
}

export const createSalaryComponentColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): Array<ColumnDef<SalaryComponent>> => [
  {
    accessorKey: 'name',
    header: 'Nama Komponen',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'type',
    header: 'Tipe',
    cell: ({ row }) => {
      const type = row.getValue('type') as 'ADDITION' | 'DEDUCTION'
      return (
        <Badge variant={type === 'ADDITION' ? 'default' : 'destructive'}>
          {type === 'ADDITION' ? 'Tambahan' : 'Potongan'}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'amount',
    header: 'Jumlah Default',
    cell: ({ row }) => {
      const amount = row.getValue('amount') as number | null
      return amount !== null ? formatCurrency(amount) : '-'
    },
  },
  {
    accessorKey: 'description',
    header: 'Deskripsi',
    cell: ({ row }) => row.original.description || '-',
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

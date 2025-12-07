import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { EmployeeListItem } from '@/integrations/trpc/routers/employee/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Re-export for convenience
export type Employee = EmployeeListItem

const getStatusBadge = (status: string) => {
  const config: Record<
    string,
    {
      variant: 'default' | 'secondary' | 'destructive' | 'outline'
      label: string
    }
  > = {
    ACTIVE: { variant: 'default', label: 'Active' },
    INACTIVE: { variant: 'secondary', label: 'Inactive' },
  }
  return config[status] || { variant: 'outline', label: status }
}

export const createEmployeeColumns = (
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
): Array<ColumnDef<Employee>> => [
  {
    accessorKey: 'employeeId',
    header: 'NIK',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('employeeId')}</span>
    ),
  },
  {
    id: 'name',
    header: 'Nama',
    cell: ({ row }) => {
      const employee = row.original
      const initials =
        `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase()
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={employee.avatar || undefined} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {employee.firstName} {employee.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{employee.email}</p>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'username',
    header: 'Username',
    cell: ({ row }) => {
      const username = row.getValue('username') as string | null
      return (
        <span className="font-mono text-sm text-muted-foreground">
          {username || '-'}
        </span>
      )
    },
  },
  {
    id: 'department',
    header: 'Departemen',
    cell: ({ row }) => row.original.department?.name || '-',
  },
  {
    id: 'position',
    header: 'Posisi',
    cell: ({ row }) => row.original.position?.name || '-',
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

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteDialog } from '@/components/shared/delete-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

interface Department {
  id: string
  name: string
  description: string | null
  _count: { employees: number }
}

interface DepartmentCardProps {
  department: Department
  onEdit: (id: string) => void
}

export function DepartmentCard({ department, onEdit }: DepartmentCardProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const deleteMutation = useMutation(
    trpc.department.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.department.list.queryKey(),
        })
        toast.success('Departemen berhasil dihapus')
        setIsDeleteDialogOpen(false)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus departemen: ${error.message}`)
      },
    }),
  )

  return (
    <Card className="group">
      <CardHeader className="flex flex-row items-start justify-between">
        <div className="space-y-1">
          <CardTitle className="text-lg">{department.name}</CardTitle>
          {department.description && (
            <CardDescription>{department.description}</CardDescription>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(department.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:text-destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{department._count.employees} karyawan</span>
        </div>
      </CardContent>

      <DeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => deleteMutation.mutate({ id: department.id })}
        title="Hapus Departemen"
        itemName={`departemen "${department.name}"`}
        isPending={deleteMutation.isPending}
      />
    </Card>
  )
}

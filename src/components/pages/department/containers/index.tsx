import { useQuery } from '@tanstack/react-query'
import { Building2, Plus } from 'lucide-react'
import { useState } from 'react'
import { DepartmentCreateDialog } from '../dialogs/create-dialog'
import { DepartmentEditDialog } from '../dialogs/edit-dialog'
import { DepartmentCard } from '../sections/department-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

export function DepartmentContainer() {
  const trpc = useTRPC()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editDepartmentId, setEditDepartmentId] = useState<string | null>(null)

  const { data, isLoading } = useQuery(trpc.department.list.queryOptions())
  const departments = data?.items || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Departemen</h1>
          <p className="text-muted-foreground">
            Kelola struktur departemen perusahaan
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Departemen
        </Button>
      </div>

      {/* Departments Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          Memuat data...
        </div>
      ) : departments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Belum ada departemen</p>
            <Button className="mt-4" onClick={() => setIsAddDialogOpen(true)}>
              Tambah Departemen Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onEdit={setEditDepartmentId}
            />
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <DepartmentCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Dialog */}
      <DepartmentEditDialog
        open={!!editDepartmentId}
        onOpenChange={(open) => !open && setEditDepartmentId(null)}
        departmentId={editDepartmentId}
      />
    </div>
  )
}

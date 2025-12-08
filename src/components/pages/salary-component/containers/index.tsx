import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { SalaryComponentCreateDialog } from '../dialogs/create-dialog'
import { SalaryComponentEditDialog } from '../dialogs/edit-dialog'
import { SalaryComponentTable } from '../sections/salary-component-table'
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

export function SalaryComponentContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editSalaryComponentId, setEditSalaryComponentId] = useState<
    string | null
  >(null)
  const [deleteSalaryComponentId, setDeleteSalaryComponentId] = useState<
    string | null
  >(null)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.salaryComponent.list.queryOptions({
      page,
      perPage,
    }),
  )
  const salaryComponents = data?.items || []

  const salaryComponentToDelete = salaryComponents.find(
    (sc) => sc.id === deleteSalaryComponentId,
  )

  const deleteMutation = useMutation(
    trpc.salaryComponent.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.salaryComponent.list.queryKey(),
        })
        toast.success('Komponen gaji berhasil dihapus')
        setDeleteSalaryComponentId(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus komponen gaji: ${error.message}`)
      },
    }),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Komponen Gaji</h1>
          <p className="text-muted-foreground">
            Kelola komponen tambahan dan potongan gaji
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Komponen Gaji
        </Button>
      </div>

      {/* Salary Components Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Komponen Gaji</CardTitle>
          <CardDescription>
            Total {data?.total || 0} komponen gaji terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalaryComponentTable
            salaryComponents={salaryComponents}
            isLoading={isLoading}
            onEdit={setEditSalaryComponentId}
            onDelete={setDeleteSalaryComponentId}
            page={page}
            totalPages={data?.totalPages}
            total={data?.total}
            pageSize={perPage}
            onPageChange={setPage}
            onPageSizeChange={(newPerPage) => {
              setPerPage(newPerPage)
              setPage(1)
            }}
          />
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <SalaryComponentCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />

      {/* Edit Dialog */}
      <SalaryComponentEditDialog
        open={!!editSalaryComponentId}
        onOpenChange={(open) => !open && setEditSalaryComponentId(null)}
        salaryComponentId={editSalaryComponentId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteSalaryComponentId}
        onOpenChange={(open) => !open && setDeleteSalaryComponentId(null)}
        onConfirm={() => {
          if (deleteSalaryComponentId) {
            deleteMutation.mutate({ id: deleteSalaryComponentId })
          }
        }}
        title="Hapus Komponen Gaji"
        itemName={
          salaryComponentToDelete
            ? `komponen gaji "${salaryComponentToDelete.name}"`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}


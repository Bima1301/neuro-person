import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { EmployeeCreateDialog } from '../dialogs/create-dialog'
import { EmployeeEditDialog } from '../dialogs/edit-dialog'
import { ImportDialog } from '../dialogs/import-dialog'
import { EmployeeFilters } from '../sections/employee-filters'
import { EmployeeTable } from '../sections/employee-table'
import { useTRPC } from '@/integrations/trpc/react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/shared/delete-dialog'

export function EmployeeContainer() {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<
    'ACTIVE' | 'INACTIVE' | undefined
  >()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editEmployeeId, setEditEmployeeId] = useState<string | null>(null)
  const [deleteEmployeeId, setDeleteEmployeeId] = useState<string | null>(null)

  const { data, isLoading } = useQuery(
    trpc.employee.list.queryOptions({
      search,
      status: statusFilter,
      page,
      perPage,
    }),
  )
  const employees = data?.items || []

  const employeeToDelete = employees.find((e) => e.id === deleteEmployeeId)

  const deleteMutation = useMutation(
    trpc.employee.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.employee.list.queryKey(),
        })
        toast.success('Karyawan berhasil dihapus')
        setDeleteEmployeeId(null)
      },
      onError: (error) => {
        toast.error(`Gagal menghapus karyawan: ${error.message}`)
      },
    }),
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Karyawan</h1>
          <p className="text-muted-foreground">
            Kelola data karyawan perusahaan Anda
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Karyawan
          </Button>
        </div>
      </div>

      {/* Filters */}
      <EmployeeFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1) // Reset to first page when search changes
        }}
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setPage(1) // Reset to first page when filter changes
        }}
      />

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
          <CardDescription>
            Total {data?.total || 0} karyawan terdaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeTable
            employees={employees}
            isLoading={isLoading}
            onEdit={setEditEmployeeId}
            onDelete={setDeleteEmployeeId}
            page={page}
            totalPages={data?.totalPages}
            total={data?.total}
            pageSize={perPage}
            onPageChange={setPage}
            onPageSizeChange={(newPerPage) => {
              setPerPage(newPerPage)
              setPage(1) // Reset to first page when changing page size
            }}
          />
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <EmployeeCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        totalEmployees={data?.total || 0}
      />

      {/* Edit Dialog */}
      <EmployeeEditDialog
        open={!!editEmployeeId}
        onOpenChange={(open) => !open && setEditEmployeeId(null)}
        employeeId={editEmployeeId}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteEmployeeId}
        onOpenChange={(open) => !open && setDeleteEmployeeId(null)}
        onConfirm={() => {
          if (deleteEmployeeId) {
            deleteMutation.mutate({ id: deleteEmployeeId })
          }
        }}
        title="Hapus Karyawan"
        itemName={
          employeeToDelete
            ? `karyawan "${employeeToDelete.firstName} ${employeeToDelete.lastName}"`
            : undefined
        }
        isPending={deleteMutation.isPending}
      />

      {/* Import Dialog */}
      <ImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  )
}

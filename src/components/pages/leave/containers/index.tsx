import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { LeaveCreateDialog } from '../dialogs/create-dialog'
import { LeaveFilters } from '../sections/leave-filters'
import { LeaveTable } from '../sections/leave-table'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

export function LeaveContainer() {
  const trpc = useTRPC()
  const [statusFilter, setStatusFilter] = useState<
    'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | undefined
  >()
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const { data, isLoading } = useQuery(
    trpc.leave.list.queryOptions({
      status: statusFilter,
      page,
      perPage,
    }),
  )
  const leaves = data?.items || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manajemen Cuti</h1>
          <p className="text-muted-foreground">
            Kelola pengajuan cuti karyawan
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Ajukan Cuti
        </Button>
      </div>

      {/* Filters */}
      <LeaveFilters
        statusFilter={statusFilter}
        onStatusFilterChange={(value) => {
          setStatusFilter(value)
          setPage(1)
        }}
      />

      {/* Leave Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Pengajuan Cuti</CardTitle>
          <CardDescription>
            Total {data?.total || 0} pengajuan cuti
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveTable
            leaves={leaves}
            isLoading={isLoading}
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
      <LeaveCreateDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
      />
    </div>
  )
}

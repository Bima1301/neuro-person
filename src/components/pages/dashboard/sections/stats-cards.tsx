import { useQuery } from '@tanstack/react-query'
import { Building2, Calendar, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'
import { formatCurrency } from '@/lib/utils'

export function StatsCards() {
  const trpc = useTRPC()
  const { data: stats } = useQuery(trpc.dashboard.stats.queryOptions())

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
          <p className="text-xs text-muted-foreground">
            {stats?.activeEmployees || 0} aktif
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Departemen</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.totalDepartments || 0}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">
            Perizinan Pending
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats?.pendingPermissionRequests || 0}
          </div>
          <p className="text-xs text-muted-foreground">menunggu persetujuan</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats?.totalPayroll || 0)}
          </div>
          <p className="text-xs text-muted-foreground">bulan ini</p>
        </CardContent>
      </Card>
    </div>
  )
}

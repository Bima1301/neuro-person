import { useQuery } from '@tanstack/react-query'
import { CalendarIcon, Plus } from 'lucide-react'
import { useState } from 'react'
import { PayrollSummary } from '../sections/payroll-summary'
import { PayrollTable } from '../sections/payroll-table'
import { Button } from '@/components/ui/button'
import {
  Card,
  Card as CardContainer,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTRPC } from '@/integrations/trpc/react'

export function PayrollContainer() {
  const trpc = useTRPC()
  const currentMonth = new Date().toISOString().slice(0, 7)
  const [period, setPeriod] = useState(currentMonth)

  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  const { data, isLoading } = useQuery(
    trpc.payroll.list.queryOptions({
      period: period ? `${period}-01` : undefined,
      page,
      perPage,
    }),
  )
  const payrolls = data?.items || []

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">Kelola penggajian karyawan</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generate Payroll
        </Button>
      </div>

      {/* Summary Cards */}
      <PayrollSummary />

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative w-[200px]">
              <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="month"
                className="pl-9"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Table */}
      <CardContainer>
        <CardHeader>
          <CardTitle>Daftar Payroll</CardTitle>
          <CardDescription>
            Total {data?.total || 0} data payroll
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PayrollTable
            payrolls={payrolls}
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
      </CardContainer>
    </div>
  )
}

import { AttendanceLineChart } from '../sections/attendance-line-chart'
import { AttendanceOverview } from '../sections/attendance-overview'
import { EmployeePieChart } from '../sections/employee-pie-chart'
import { StatsCards } from '../sections/stats-cards'

export function DashboardContainer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di NeuroPerson Dashboard
        </p>
      </div>

      <StatsCards />

      <div className="grid gap-6 md:grid-cols-2">
        <EmployeePieChart />
        <AttendanceLineChart />
      </div>

      <AttendanceOverview />
    </div>
  )
}

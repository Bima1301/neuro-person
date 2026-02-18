import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/shared/coming-soon'

export const Route = createFileRoute('/app/reports/employees')({
  component: ReportsEmployeesPage,
})

function ReportsEmployeesPage() {
  return (
    <ComingSoon
      title="Laporan Karyawan"
      description="Fitur laporan data karyawan akan segera hadir."
    />
  )
}

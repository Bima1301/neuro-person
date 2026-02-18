import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/shared/coming-soon'

export const Route = createFileRoute('/app/reports/attendance')({
  component: ReportsAttendancePage,
})

function ReportsAttendancePage() {
  return (
    <ComingSoon
      title="Laporan Absensi"
      description="Fitur laporan absensi akan segera hadir."
    />
  )
}

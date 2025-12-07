import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/integrations/better-auth/client'
import { useTRPC } from '@/integrations/trpc/react'
import ActionSection from '../sections/action-section'
import EmployeeDetailSection from '../sections/employee-detail-section'
import Header from '../sections/header'
import OfficeDetailSection from '../sections/office-detail-section'
import ShiftDetailSection from '../sections/shift-detail-section'

export default function ProfileContainer() {
  const { data: session } = useSession()
  const trpc = useTRPC()

  const { data: employee, isLoading } = useQuery(
    trpc.employee.getByUserId.queryOptions(
      { userId: session?.user?.id || '' },
      { enabled: !!session?.user?.id },
    ),
  )

  if (isLoading) {
    return (
      <div className="pb-20 min-h-full">
        <Header />
        <div className="px-6 mt-6">
          <div className="text-center py-8 text-white/60">
            Memuat data profile...
          </div>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="pb-20 min-h-full">
        <Header />
        <div className="px-6 mt-6">
          <div className="text-center py-8 text-white/60">
            Data karyawan tidak ditemukan
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 min-h-full">
      <Header />
      <div className="px-6 mt-6 space-y-6">
        <EmployeeDetailSection employee={employee} />
        <ShiftDetailSection employee={employee} />
        <OfficeDetailSection employee={employee} />
        <ActionSection employee={employee} />
      </div>
    </div>
  )
}


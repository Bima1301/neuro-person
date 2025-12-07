import { useQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShieldX } from 'lucide-react'
import { useEffect } from 'react'
import { EmployeeNavbar } from '@/components/employee/navbar'
import CircleLoader from '@/components/shared/circle-loader'
import { Button } from '@/components/ui/button'
import { useSession } from '@/integrations/better-auth/client'
import { useTRPC } from '@/integrations/trpc/react'

export const Route = createFileRoute('/employee')({
  component: EmployeeLayout,
})

function EmployeeLayout() {
  const { data: session, isPending: isSessionLoading } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      navigate({ to: '/employee-sign-in', replace: true })
    }
  }, [session, isSessionLoading, navigate])

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800">
        <CircleLoader baseColor="white" />
      </div>
    )
  }

  if (!session?.user) {
    return null // Will redirect
  }

  return <EmployeeLayoutWithGuard />
}

function EmployeeLayoutWithGuard() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const trpc = useTRPC()

  const { data, isLoading } = useQuery(
    trpc.organization.checkEmployeeAccess.queryOptions(
      { userId: session?.user?.id || '' },
      { enabled: !!session?.user?.id },
    ),
  )

  useEffect(() => {
    if (isLoading) return

    // Redirect if user doesn't have organization
    if (data && !data.isValid && data.reason?.includes('organisasi')) {
      navigate({ to: '/onboarding' })
      return
    }

    // Redirect to app if not valid employee
    if (data && !data.isValid) {
      // Small delay to show error message
      const timer = setTimeout(() => {
        navigate({ to: '/app' })
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [data, isLoading, navigate])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-slate-900 to-slate-800">
        <CircleLoader baseColor="white" />
      </div>
    )
  }

  // Check if user is valid employee
  if (data && !data.isValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4 bg-linear-to-b from-slate-900 to-slate-800">
        <ShieldX className="h-16 w-16 text-white" />
        <h1 className="text-2xl font-bold text-white">Akses Ditolak</h1>
        <p className="text-blue-100 text-center max-w-md">
          {data.reason || 'Anda tidak memiliki akses ke portal karyawan'}
          <br />
          <br />
          Portal ini hanya untuk karyawan yang terdaftar di sistem.
        </p>
        <Button variant="secondary" onClick={() => navigate({ to: '/app' })}>
          Ke Dashboard Admin
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-900 to-slate-800 pb-20">
      <Outlet />
      <EmployeeNavbar />
    </div>
  )
}

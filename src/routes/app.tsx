import { useQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ShieldX } from 'lucide-react'
import { useEffect } from 'react'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SiteHeader } from '@/components/layout/site-header'
import CircleLoader from '@/components/shared/circle-loader'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Role } from '@/generated/prisma/enums'
import { useSession } from '@/integrations/better-auth/client'
import { useTRPC } from '@/integrations/trpc/react'

const ADMIN_ROLES: Array<Role> = [Role.ADMIN, Role.HR_MANAGER, Role.MANAGER]

export const Route = createFileRoute('/app')({
  component: AppLayout,
})

function AppLayout() {
  const { data: session, isPending: isSessionLoading } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isSessionLoading && !session?.user) {
      navigate({ to: '/sign-in' })
    }
  }, [session, isSessionLoading, navigate])

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleLoader />
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return <AppLayoutWithGuard />
}

function AppLayoutWithGuard() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const trpc = useTRPC()

  const { data, isLoading } = useQuery(
    trpc.organization.checkUserOrg.queryOptions(
      { userId: session?.user?.id || '' },
      { enabled: !!session?.user?.id },
    ),
  )

  useEffect(() => {
    if (isLoading) return
    if (data && !data.hasOrganization) {
      navigate({ to: '/onboarding' })
    }
  }, [data, isLoading, navigate])

  if (isLoading || (data && !data.hasOrganization)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircleLoader />
      </div>
    )
  }

  if (data?.role && !ADMIN_ROLES.includes(data.role)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <ShieldX className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Akses Ditolak</h1>
        <p className="text-muted-foreground text-center">
          Anda tidak memiliki akses ke halaman admin.
          <br />
          Silakan gunakan portal karyawan.
        </p>
        <Button onClick={() => navigate({ to: '/employee' })}>
          Ke Portal Karyawan
        </Button>
      </div>
    )
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

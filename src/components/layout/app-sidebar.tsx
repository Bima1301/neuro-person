import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  Bell,
  Brain,
  Briefcase,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  Clock,
  CreditCard,
  Database,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  MoreHorizontal,
  User,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { authClient, useSession } from '@/integrations/better-auth/client'

const menuItems = [
  {
    title: 'Dashboard',
    url: '/app',
    icon: LayoutDashboard,
  },
  {
    title: 'Karyawan',
    url: '/app/employees',
    icon: Users,
  },
  {
    title: 'AI Chatbot',
    url: '/app/chatbot',
    icon: MessageSquare,
  },
  {
    title: 'Alokasi Shift',
    url: '/app/shift-allocation',
    icon: CalendarDays,
  },
  {
    title: 'Absensi',
    url: '/app/attendance',
    icon: Clock,
  },
  {
    title: 'Perizinan',
    url: '/app/permission',
    icon: Calendar,
  },
  {
    title: 'Penggajian',
    url: '/app/payroll',
    icon: CreditCard,
  },
]

const masterDataItems = [
  {
    title: 'Departemen',
    url: '/app/departments',
    icon: Building2,
  },
  {
    title: 'Posisi/Jabatan',
    url: '/app/positions',
    icon: Briefcase,
  },
  {
    title: 'Shift Kerja',
    url: '/app/shifts',
    icon: Clock,
  },
  {
    title: 'Tipe Kehadiran',
    url: '/app/attendance-types',
    icon: CalendarCheck,
  },
  {
    title: 'Komponen Gaji',
    url: '/app/salary-components',
    icon: CreditCard,
  },
]

const reportItems = [
  {
    title: 'Laporan Karyawan',
    url: '/app/reports/employees',
    icon: FileText,
  },
  {
    title: 'Laporan Absensi',
    url: '/app/reports/attendance',
    icon: FileText,
  },
]

function UserMenuSection() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/' })
  }

  // Get user initials for avatar
  const getInitials = (name?: string | null) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name[0].toUpperCase()
  }

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="w-full rounded-lg hover:bg-primary/10 p-3 flex items-center gap-3 transition-colors cursor-pointer"
          >
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-primary">
                  {getInitials(session?.user?.name)}
                </span>
              </div>
            )}
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email || ''}
              </p>
            </div>
            <MoreHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex items-center gap-3">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {getInitials(session?.user?.name)}
                  </span>
                </div>
              )}
              <div className="flex flex-col">
                <p className="text-sm font-semibold">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session?.user?.email || ''}
                </p>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsLogoutDialogOpen(true)}
            className="text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin logout? Anda perlu login kembali untuk
              mengakses akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export function AppSidebar({
  variant = 'sidebar',
}: {
  variant?: 'sidebar' | 'inset'
}) {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <Sidebar variant={variant} collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/app">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-white text-primary-foreground">
                  <img src="/logo192.png" alt="NeuroPerson" className="w-full h-full object-contain" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">NeuroPerson</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Human Resource System
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            Master Data
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {masterDataItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Laporan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath === item.url}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <UserMenuSection />
      </SidebarFooter>
    </Sidebar>
  )
}

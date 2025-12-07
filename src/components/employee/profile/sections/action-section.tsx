import { useNavigate } from '@tanstack/react-router'
import { LogOut, Pencil } from 'lucide-react'
import { useState } from 'react'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee/types'
import { authClient } from '@/integrations/better-auth/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { EmployeeEditDialog } from '@/components/pages/employee/dialogs/edit-dialog'

interface Props {
  employee: EmployeeDetail
}

export default function ActionSection({ employee }: Props) {
  const navigate = useNavigate()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleSignOut = async () => {
    await authClient.signOut()
    navigate({ to: '/employee-sign-in' })
  }

  return (
    <>
      <div className="space-y-3">
        <Card className="bg-[#1e2128] border-white/5">
          <CardContent className="p-4 grid grid-cols-2 gap-3">
            <Button
              className="w-full justify-start bg-red-500/20 text-red-400 border-0 hover:bg-red-500/30 shadow-lg transition-all"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
            <Button
              className="w-full justify-start bg-[#252932] text-white border-0 hover:bg-[#2d3239] shadow-lg transition-all"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit Karyawan
            </Button>
          </CardContent>
        </Card>
      </div>

      <EmployeeEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        employeeId={employee.id}
        darkMode={true}
      />

      <AlertDialog
        open={isLogoutDialogOpen}
        onOpenChange={setIsLogoutDialogOpen}
      >
        <AlertDialogContent className="bg-[#1e2128] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Konfirmasi Logout
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Apakah Anda yakin ingin logout? Anda perlu login kembali untuk
              mengakses akun Anda.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-3">
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Logout
            </AlertDialogAction>
            <AlertDialogCancel className="border-white/10 hover:bg-white/10">
              Batal
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

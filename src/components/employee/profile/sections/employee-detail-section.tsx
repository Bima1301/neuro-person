import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  employee: EmployeeDetail
}

function getGenderLabel(gender: string | null | undefined): string {
  switch (gender) {
    case 'MALE':
      return 'Laki-laki'
    case 'FEMALE':
      return 'Perempuan'
    default:
      return '-'
  }
}

function getMaritalStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'SINGLE':
      return 'Belum Menikah'
    case 'MARRIED':
      return 'Menikah'
    case 'DIVORCED':
      return 'Cerai'
    case 'WIDOWED':
      return 'Janda/Duda'
    default:
      return '-'
  }
}

function getEmploymentTypeLabel(type: string | null | undefined): string {
  switch (type) {
    case 'FULL_TIME':
      return 'Full Time'
    case 'PART_TIME':
      return 'Part Time'
    case 'CONTRACT':
      return 'Kontrak'
    case 'INTERN':
      return 'Magang'
    default:
      return '-'
  }
}

export default function EmployeeDetailSection({ employee }: Props) {
  const initials =
    `${employee.firstName[0] || ''}${employee.lastName[0] || ''}`.toUpperCase()

  return (
    <Card className="bg-[#1e2128] border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Detail Karyawan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20 border-2 border-cyan-500/30">
            <AvatarImage
              src={employee.avatar || undefined}
              className="object-cover"
            />
            <AvatarFallback className="bg-cyan-500/20 text-cyan-400 text-2xl font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            {employee.gender && (
              <Badge
                variant="secondary"
                className="mb-2 bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
              >
                {getGenderLabel(employee.gender)}
              </Badge>
            )}
            <h3 className="text-xl font-bold text-white">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-sm text-white/60">NIK: {employee.employeeId}</p>
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Kontak */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Kontak</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-white/60 mb-1">Email</p>
              <p className="text-sm text-white">{employee.email}</p>
            </div>
            {employee.phone && (
              <div>
                <p className="text-xs text-white/60 mb-1">Telepon</p>
                <p className="text-sm text-white">{employee.phone}</p>
              </div>
            )}
            {employee.address && (
              <div>
                <p className="text-xs text-white/60 mb-1">Alamat</p>
                <p className="text-sm text-white">{employee.address}</p>
              </div>
            )}
            {employee.city && (
              <div>
                <p className="text-xs text-white/60 mb-1">Kota</p>
                <p className="text-sm text-white">{employee.city}</p>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Informasi Pribadi */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Informasi Pribadi</h4>
          <div className="grid grid-cols-1 gap-3">
            {employee.dateOfBirth && (
              <div>
                <p className="text-xs text-white/60 mb-1">Tanggal Lahir</p>
                <p className="text-sm text-white">
                  {format(new Date(employee.dateOfBirth), 'dd MMMM yyyy', {
                    locale: id,
                  })}
                </p>
              </div>
            )}
            {employee.maritalStatus && (
              <div>
                <p className="text-xs text-white/60 mb-1">Status Perkawinan</p>
                <p className="text-sm text-white">
                  {getMaritalStatusLabel(employee.maritalStatus)}
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator className="bg-white/10" />

        {/* Informasi Karyawan */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Informasi Karyawan</h4>
          <div className="grid grid-cols-1 gap-3">
            <div>
              <p className="text-xs text-white/60 mb-1">Status</p>
              <Badge
                variant={employee.status === 'ACTIVE' ? 'default' : 'secondary'}
                className={
                  employee.status === 'ACTIVE'
                    ? 'bg-green-500/20 text-green-300 border-green-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30'
                }
              >
                {employee.status === 'ACTIVE' ? 'Aktif' : 'Tidak Aktif'}
              </Badge>
            </div>
            {employee.hireDate && (
              <div>
                <p className="text-xs text-white/60 mb-1">Tanggal Masuk</p>
                <p className="text-sm text-white">
                  {format(new Date(employee.hireDate), 'dd MMMM yyyy', {
                    locale: id,
                  })}
                </p>
              </div>
            )}
            {employee.employmentType && (
              <div>
                <p className="text-xs text-white/60 mb-1">Tipe Karyawan</p>
                <p className="text-sm text-white">
                  {getEmploymentTypeLabel(employee.employmentType)}
                </p>
              </div>
            )}
            {employee.baseSalary > 0 && (
              <div>
                <p className="text-xs text-white/60 mb-1">Gaji Pokok</p>
                <p className="text-sm text-white">
                  Rp {employee.baseSalary.toLocaleString('id-ID')}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

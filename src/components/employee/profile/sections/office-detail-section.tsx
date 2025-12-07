import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { EmployeeDetail } from '@/integrations/trpc/routers/employee/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  employee: EmployeeDetail
}

export default function OfficeDetailSection({ employee }: Props) {
  return (
    <Card className="bg-[#1e2128] border-white/5">
      <CardHeader>
        <CardTitle className="text-white">Detail Kantor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Penempatan */}
        <div className="space-y-3">
          <h4 className="font-semibold text-white">Penempatan</h4>
          {employee.position && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-white/60 mb-1">Posisi</p>
                <p className="text-sm text-white font-medium">
                  {employee.position.name}
                </p>
              </div>
              {employee.department && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Departemen</p>
                  <p className="text-sm text-white">
                    {employee.department.name}
                  </p>
                </div>
              )}
              {employee.hireDate && (
                <div>
                  <p className="text-xs text-white/60 mb-1">
                    TMT (Terhitung Mulai Tanggal)
                  </p>
                  <p className="text-sm text-white">
                    {format(new Date(employee.hireDate), 'dd MMMM yyyy', {
                      locale: id,
                    })}
                  </p>
                </div>
              )}
              {employee.organization && (
                <div>
                  <p className="text-xs text-white/60 mb-1">Perusahaan</p>
                  <p className="text-sm text-white">
                    {employee.organization.name}
                  </p>
                </div>
              )}
            </div>
          )}
          {!employee.position && (
            <p className="text-sm text-white/60">Belum ada penempatan</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

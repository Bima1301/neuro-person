import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Filter, Search } from 'lucide-react'
import { useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import type { PermissionStatus } from '@/generated/prisma/enums'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  filter: {
    search: string
    status: PermissionStatus | undefined
  }
  setFilter: Dispatch<
    SetStateAction<{
      search: string
      status: PermissionStatus | undefined
    }>
  >
}

export default function Header({ filter, setFilter }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-[#282c34] text-white px-6 pt-12 pb-8">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 rounded-full transition-colors"
          onClick={() => navigate({ to: '/employee' })}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Perizinan</h1>
          <p className="text-sm text-white/60">
            Kelola pengajuan perizinan Anda
          </p>
        </div>
      </div>

      {/* Search Card */}
      <div className="bg-[#1e2128] rounded-2xl p-4 border border-white/5">
        <div className="flex gap-3">
          <Input
            placeholder="Cari perizinan..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="pl-10 bg-[#252932] border-white/10 text-white placeholder:text-white/40 rounded-xl focus:ring-2 focus:ring-cyan-500/30"
            prefixIcon={<Search className="h-4 w-4 text-white" />}
          />

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="bg-[#252932] border-white/10 text-white hover:bg-[#2a2d35] gap-2 rounded-xl"
              >
                <Filter className="h-4 w-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-64 bg-[#1e2128] border-white/10"
              align="end"
            >
              <div className="space-y-4">
                <h4 className="font-medium text-sm text-white">
                  Filter Status
                </h4>
                <Select
                  value={filter.status || 'all'}
                  onValueChange={(value) => {
                    setFilter({
                      ...filter,
                      status:
                        value === 'all'
                          ? undefined
                          : (value as PermissionStatus),
                    })
                    setOpen(false)
                  }}
                >
                  <SelectTrigger className="w-full bg-[#252932] border-white/10 text-white">
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1e2128] border-white/10">
                    <SelectItem value="all" className="text-white">
                      Semua Status
                    </SelectItem>
                    <SelectItem value="PENDING" className="text-white">
                      Menunggu
                    </SelectItem>
                    <SelectItem value="APPROVED" className="text-white">
                      Disetujui
                    </SelectItem>
                    <SelectItem value="REJECTED" className="text-white">
                      Ditolak
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}

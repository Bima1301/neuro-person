import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { Button } from '@/components/ui/button'

interface Props {
  filter: {
    month?: string
    year?: string
  }
  setFilter: Dispatch<
    SetStateAction<{
      month?: string
      year?: string
    }>
  >
}

export default function Header({ filter, setFilter }: Props) {
  const navigate = useNavigate()

  const padMonth = (month: number) => (month + 1).toString().padStart(2, '0')

  const handlePreviousMonth = () => {
    const currentMonth = Number(filter.month || new Date().getMonth() + 1) - 1
    const currentYear = Number(filter.year || new Date().getFullYear())

    let newMonth = currentMonth - 1
    let newYear = currentYear

    if (newMonth < 0) {
      newMonth = 11
      newYear = currentYear - 1
    }

    setFilter({
      ...filter,
      month: padMonth(newMonth),
      year: newYear.toString(),
    })
  }

  const handleNextMonth = () => {
    const currentMonth = Number(filter.month || new Date().getMonth() + 1) - 1
    const currentYear = Number(filter.year || new Date().getFullYear())

    let newMonth = currentMonth + 1
    let newYear = currentYear

    if (newMonth > 11) {
      newMonth = 0
      newYear = currentYear + 1
    }

    setFilter({
      ...filter,
      month: padMonth(newMonth),
      year: newYear.toString(),
    })
  }

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
          <h1 className="text-2xl font-bold text-white">Presensi</h1>
          <p className="text-sm text-white/60">Riwayat presensi Anda</p>
        </div>
      </div>

      {/* Filter Card */}
      <div className="bg-[#1e2128] rounded-2xl p-4 border border-white/5">
        <div className="flex justify-evenly items-center">
          <Button
            variant="ghost"
            className="text-white bg-[#252932] w-auto h-full aspect-square border-white/10 border rounded-lg hover:bg-[#2a2d35]"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <input
            type="month"
            onChange={(e) => {
              const [year, month] = e.target.value.split('-')
              setFilter({ ...filter, month, year })
            }}
            className="px-4 py-2 border border-white/10 rounded-lg text-center text-white bg-[#252932] focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
            value={
              filter.month && filter.year
                ? `${filter.year}-${filter.month}`
                : undefined
            }
          />
          <Button
            variant="ghost"
            className="text-white bg-[#252932] w-auto h-full aspect-square border-white/10 border rounded-lg hover:bg-[#2a2d35]"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  )
}

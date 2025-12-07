import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/integrations/better-auth/client'
import { getMonthEndUTC, getMonthStartUTC } from '@/lib/date-utils'

interface Props {
  filter: {
    month?: string
    year?: string
  }
}

export default function AttendanceList({ filter }: Props) {
  const trpc = useTRPC()
  const { data: session } = useSession()
  const listRef = useRef<HTMLDivElement>(null)
  const limit = 10

  // Get current employee
  const { data: employee } = useQuery(
    trpc.employee.getByUserId.queryOptions(
      { userId: session?.user.id || '' },
      { enabled: !!session?.user.id },
    ),
  )

  // Calculate start and end date for the selected month using UTC
  const getDateRange = () => {
    if (!filter.month || !filter.year) {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const start = getMonthStartUTC(year, month)
      const end = getMonthEndUTC(year, month)
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
      }
    }

    const month = parseInt(filter.month)
    const year = parseInt(filter.year)
    const start = getMonthStartUTC(year, month)
    const end = getMonthEndUTC(year, month)

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }
  }

  const { startDate, endDate } = getDateRange()

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery(
      trpc.attendance.infinite.infiniteQueryOptions(
        {
          employeeId: employee?.id,
          startDate,
          endDate,
          limit,
        },
        {
          enabled: !!employee?.id && !!startDate && !!endDate,
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
    )

  const attendances = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) || []
  }, [data])

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!listRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = listRef.current
    if (
      scrollHeight - scrollTop <= clientHeight * 1.5 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])

  // Attach scroll listener
  useEffect(() => {
    const container = listRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (time: Date | string | null) => {
    if (!time) return '--:--'
    const d = time instanceof Date ? time : new Date(time)
    return d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'LATE':
        return <Clock className="h-5 w-5 text-orange-500" />
      case 'ABSENT':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'Hadir'
      case 'LATE':
        return 'Terlambat'
      case 'ABSENT':
        return 'Tidak Hadir'
      default:
        return status
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="text-center text-white/60">Memuat data...</div>
      </div>
    )
  }

  return (
    <div className="px-4 py-6 pb-20">
      {/* Attendance List */}
      {isLoading ? (
        <div className="text-center text-white/60 py-8">Memuat data...</div>
      ) : attendances.length === 0 ? (
        <Card className="bg-[#1e2128] border-white/5">
          <CardContent className="p-6 text-center text-white/60">
            Tidak ada data presensi untuk periode yang dipilih
          </CardContent>
        </Card>
      ) : (
        <div
          ref={listRef}
          className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto"
          onScroll={handleScroll}
        >
          {attendances.map((attendance) => (
            <Card key={attendance.id} className="bg-[#1e2128] border-white/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(attendance.status)}
                    <div className="flex-1">
                      <p className="font-medium text-white">
                        {formatDate(attendance.date)}
                      </p>
                      <p className="text-sm text-white/60">
                        {formatTime(attendance.checkIn)} -{' '}
                        {formatTime(attendance.checkOut)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      attendance.status === 'PRESENT'
                        ? 'text-green-400'
                        : attendance.status === 'LATE'
                          ? 'text-orange-400'
                          : 'text-red-400'
                    }`}
                  >
                    {getStatusLabel(attendance.status)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-white/60" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

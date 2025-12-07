import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { useTRPC } from '@/integrations/trpc/react'

const chartConfig = {
  hadir: {
    label: 'Hadir',
    color: 'hsl(var(--chart-1))',
  },
  terlambat: {
    label: 'Terlambat',
    color: 'hsl(var(--chart-2))',
  },
  tidakHadir: {
    label: 'Tidak Hadir',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig

export function AttendanceLineChart() {
  const trpc = useTRPC()

  const { data } = useQuery(trpc.attendance.list.queryOptions({}))
  const attendances = data?.items || []

  // Group attendance by date (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return date.toISOString().split('T')[0]
  })

  const chartData = last7Days.map((date) => {
    const dayAttendances = attendances.filter(
      (a) => new Date(a.date).toISOString().split('T')[0] === date,
    )

    return {
      date: new Date(date).toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
      }),
      hadir: dayAttendances.filter((a) => a.status === 'PRESENT').length,
      terlambat: dayAttendances.filter((a) => a.status === 'LATE').length,
      tidakHadir: dayAttendances.filter((a) => a.status === 'ABSENT').length,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Kehadiran</CardTitle>
        <CardDescription>Kehadiran karyawan 7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="hadir"
              stroke="var(--color-hadir)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-hadir)' }}
            />
            <Line
              type="monotone"
              dataKey="terlambat"
              stroke="var(--color-terlambat)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-terlambat)' }}
            />
            <Line
              type="monotone"
              dataKey="tidakHadir"
              stroke="var(--color-tidakHadir)"
              strokeWidth={2}
              dot={{ fill: 'var(--color-tidakHadir)' }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

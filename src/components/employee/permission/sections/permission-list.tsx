import { zodResolver } from '@hookform/resolvers/zod'
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import type { PermissionStatus } from '@/generated/prisma/enums'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useTRPC } from '@/integrations/trpc/react'
import { useSession } from '@/integrations/better-auth/client'

const permissionRequestSchema = z
  .object({
    attendanceTypeId: z.string().min(1, 'Pilih tipe perizinan'),
    startDate: z.string().min(1, 'Tanggal awal wajib diisi'),
    endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true // already caught by min(1)
      const start = new Date(data.startDate)
      const end = new Date(data.endDate)
      return end >= start
    },
    {
      message: 'Tanggal selesai harus sama atau setelah tanggal awal',
      path: ['endDate'],
    },
  )

type PermissionRequestInput = z.infer<typeof permissionRequestSchema>

interface Props {
  filter: {
    search: string
    status: PermissionStatus | undefined
    month?: string
    year?: string
  }

  setFilter: (filter: {
    search: string
    status: PermissionStatus | undefined
    month?: string
    year?: string
  }) => void
}

export default function PermissionList({ filter, setFilter }: Props) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Get current employee
  const { data: employee } = useQuery(
    trpc.employee.getByUserId.queryOptions(
      { userId: session?.user.id || '' },
      { enabled: !!session?.user.id },
    ),
  )

  const { data: permissionTypes } = useQuery(
    trpc.permission.types.queryOptions(),
  )

  const listRef = useRef<HTMLDivElement>(null)
  const limit = 10

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingPermissions,
  } = useInfiniteQuery(
    trpc.permission.infinite.infiniteQueryOptions(
      {
        employeeId: employee?.id,
        search: filter.search || undefined,
        status: filter.status,
        month: filter.month,
        year: filter.year,
        limit,
      },
      {
        enabled: !!employee?.id,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
  )

  const myPermissions = useMemo(() => {
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

  const form = useForm<PermissionRequestInput>({
    resolver: zodResolver(permissionRequestSchema),
    defaultValues: {
      attendanceTypeId: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  })

  const createMutation = useMutation(
    trpc.permission.create.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.permission.list.queryKey({
            employeeId: employee?.id,
            search: filter.search || undefined,
            status: filter.status,
          }),
        })
        toast.success('Pengajuan perizinan berhasil dikirim')
        setIsDialogOpen(false)
        form.reset()
      },
      onError: (error) => {
        toast.error(`Gagal mengajukan perizinan: ${error.message}`)
      },
    }),
  )

  const onSubmit = (data: PermissionRequestInput) => {
    if (!employee?.id) {
      toast.error('Data karyawan tidak ditemukan')
      return
    }

    createMutation.mutate({
      employeeId: employee.id,
      attendanceTypeId: data.attendanceTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<
      string,
      {
        variant: 'default' | 'secondary' | 'destructive' | 'outline'
        label: string
      }
    > = {
      PENDING: { variant: 'secondary', label: 'Menunggu' },
      APPROVED: { variant: 'default', label: 'Disetujui' },
      REJECTED: { variant: 'destructive', label: 'Ditolak' },
    }
    return config[status] || { variant: 'outline', label: status }
  }

  const formatDate = (date: Date | string) => {
    const d = date instanceof Date ? date : new Date(date)
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const padMonth = (month: number) => (month + 1).toString().padStart(2, '0')

  const handlePreviousMonth = () => {
    const currentMonth = Number(filter.month) - 1
    const currentYear = Number(filter.year)

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
    const currentMonth = Number(filter.month) - 1
    const currentYear = Number(filter.year)

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
    <div className="px-4 py-6 space-y-4">
      {/* Permission List */}
      <div className="space-y-4">
        <div className="flex justify-evenly">
          <Button
            variant="ghost"
            className="text-white bg-[#282c34] w-auto h-full aspect-square border-slate-500 border rounded-lg"
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
            className="px-4 py-2 border border-slate-500 rounded-lg text-center text-white bg-[#282c34]"
            value={
              filter.month && filter.year
                ? `${filter.year}-${filter.month}`
                : undefined
            }
          />
          <Button
            variant="ghost"
            className="text-white bg-[#282c34] w-auto h-full aspect-square border-slate-500 border rounded-lg"
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {isLoadingPermissions ? (
          <div className="text-center text-white/60 py-8">Memuat data...</div>
        ) : myPermissions?.length === 0 ? (
          <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardContent className="px-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center">
                <Calendar className="h-10 w-10 text-emerald-400" />
              </div>
              <p className="text-white/70 text-lg">
                Belum ada pengajuan perizinan
              </p>
              <p className="text-white/50 text-sm mt-2">
                Mulai dengan mengajukan perizinan baru
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            ref={listRef}
            className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto"
            onScroll={handleScroll}
          >
            {myPermissions.map((permission) => {
              const status = getStatusBadge(permission.status)
              return (
                <Card
                  key={permission.id}
                  className="bg-stone-900 shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] overflow-hidden group border-stone-500"
                >
                  <CardContent className="px-5 relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="font-bold text-lg text-white mb-1">
                          {permission.attendanceType.name}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-white/60">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(permission.startDate)} -{' '}
                            {formatDate(permission.endDate)}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={status.variant}
                        className={`ml-3 ${permission.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : permission.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : permission.status === 'REJECTED'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                          } backdrop-blur-sm`}
                      >
                        {status.label}
                      </Badge>
                    </div>
                    {permission.reason && (
                      <div className="mt-3 pt-3 border-t border-slate-700/50">
                        <p className="text-sm text-white/70 leading-relaxed">
                          {permission.reason}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-white/60" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-50">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 shadow-2xl bg-linear-to-br from-blue-500 to-emerald-500 hover:from-blue-600 hover:to-emerald-600 transition-all hover:scale-110 border-2 border-white/20 backdrop-blur-sm"
        >
          <Plus className="h-7 w-7" />
        </Button>
      </div>

      {/* Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#1e2128] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              Ajukan Perizinan
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="attendanceTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">
                      Tipe Perizinan
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-[#252932] border-white/10 text-white">
                          <SelectValue placeholder="Pilih tipe perizinan" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-[#1e2128] border-white/10">
                        {permissionTypes?.map((type) => (
                          <SelectItem
                            key={type.id}
                            value={type.id}
                            className="text-white! focus:bg-[#252932]"
                          >
                            {type.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">
                        Tanggal Awal
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-[#252932] border-white/10 text-white"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/90">
                        Tanggal Selesai
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          className="bg-[#252932] border-white/10 text-white"
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/90">
                      Keterangan (Opsional)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Masukkan keterangan perizinan..."
                        rows={3}
                        {...field}
                        className="bg-[#252932] border-white/10 text-white placeholder:text-white/40"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-linear-to-br from-cyan-500 to-lime-400 hover:from-cyan-600 hover:to-lime-500 text-white font-semibold"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Mengirim...' : 'Kirim Pengajuan'}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

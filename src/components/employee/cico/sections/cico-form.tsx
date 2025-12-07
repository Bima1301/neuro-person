import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { PhotoCaptureSection } from './photo-capture-section'
import { LocationSection } from './location-section'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { useSession } from '@/integrations/better-auth/client'
import { useTRPC } from '@/integrations/trpc/react'

export default function CicoForm() {
  const { type } = useParams({ from: '/employee/cico/$type' })
  const navigate = useNavigate()
  const { data: session } = useSession()
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  )

  const { data: employee } = useQuery(
    trpc.employee.getByUserId.queryOptions(
      { userId: session?.user.id || '' },
      { enabled: !!session?.user.id },
    ),
  )

  const uploadMutation = useMutation(trpc.upload.uploadImage.mutationOptions())

  const checkInMutation = useMutation(
    trpc.attendance.checkIn.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.attendance.list.queryKey({ employeeId: employee?.id }),
        })
        toast.success('Check-in berhasil!')
        navigate({ to: '/employee' })
      },
      onError: (error) => {
        toast.error(`Gagal check-in: ${error.message}`)
      },
    }),
  )

  const checkOutMutation = useMutation(
    trpc.attendance.checkOut.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.attendance.list.queryKey({ employeeId: employee?.id }),
        })
        toast.success('Check-out berhasil!')
        navigate({ to: '/employee' })
      },
      onError: (error) => {
        toast.error(`Gagal check-out: ${error.message}`)
      },
    }),
  )

  // Handle submit button click
  const handleSubmit = () => {
    if (!capturedPhoto) {
      toast.error('Silakan ambil foto terlebih dahulu')
      return
    }

    if (!location) {
      toast.error('Lokasi GPS diperlukan. Silakan izinkan akses lokasi.')
      return
    }

    if (!employee?.id) {
      toast.error('Data karyawan tidak ditemukan')
      return
    }

    if (type === 'check-in') {
      uploadMutation.mutate(
        {
          file: capturedPhoto,
          folder: 'cico-photos',
        },
        {
          onSuccess: (data: { url: string }) => {
            checkInMutation.mutate({
              employeeId: employee.id,
              photo: data.url,
              notes: notes || undefined,
              type: 'CHECK_IN',
              latitude: location.lat,
              longitude: location.lng,
            })
          },
          onError: (error) => {
            toast.error(`Gagal check-in: ${error.message}`)
          },
        },
      )
    } else if (type === 'check-out') {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)

      uploadMutation.mutate(
        {
          file: capturedPhoto,
          folder: 'cico-photos',
        },
        {
          onSuccess: (data: { url: string }) => {
            checkOutMutation.mutate({
              employeeId: employee.id,
              photo: data.url,
              notes: notes || undefined,
              type: 'CHECK_OUT',
              targetDate: yesterday.toISOString().split('T')[0],
            })
          },
          onError: (error) => {
            toast.error(`Gagal check-out: ${error.message}`)
          },
        },
      )
    }
  }

  const isPending = checkInMutation.isPending || checkOutMutation.isPending
  const isCheckIn = type === 'check-in'

  return (
    <div className="px-4 py-6">
      <Card className="bg-[#1e2128] border-white/5 shadow-xl">
        <CardContent className="space-y-6">
          {/* Camera Section */}
          <PhotoCaptureSection
            capturedPhoto={capturedPhoto}
            onPhotoChange={setCapturedPhoto}
          />

          {/* Location Section */}
          <LocationSection location={location} onLocationChange={setLocation} />

          {/* Notes Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/90">
              Keterangan (Opsional)
            </label>
            <Textarea
              placeholder="Tambahkan keterangan jika diperlukan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-[#252932] border-white/10 text-white placeholder:text-white/40"
            />
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={
              !capturedPhoto ||
              !location ||
              isPending ||
              uploadMutation.isPending
            }
            className="w-full bg-button-employee disabled:opacity-50"
            size="lg"
          >
            {isPending || uploadMutation.isPending
              ? 'Memproses...'
              : isCheckIn
                ? 'Submit Check In'
                : 'Submit Check Out'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

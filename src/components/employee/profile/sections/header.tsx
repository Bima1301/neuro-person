import { useNavigate } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Header() {
  const navigate = useNavigate()

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
          <h1 className="text-2xl font-bold text-white">Profile</h1>
          <p className="text-sm text-white/60">Informasi detail karyawan</p>
        </div>
      </div>
    </div>
  )
}

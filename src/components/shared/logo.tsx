import { Brain } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg p-1">
        <img src="/logo192.png" alt="NeuroPerson" className="w-full h-full object-contain" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        NeuroPerson
      </span>
    </div>
  )
}

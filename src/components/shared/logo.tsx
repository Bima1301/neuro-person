import { Brain } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
        <Brain className="w-6 h-6 text-white" />
      </div>
      <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        NeuroPerson
      </span>
    </div>
  )
}

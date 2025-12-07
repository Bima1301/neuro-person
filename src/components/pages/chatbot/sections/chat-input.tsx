import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  isPending: boolean
}

export function ChatInput({
  value,
  onChange,
  onSend,
  isPending,
}: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t p-4 md:p-6 bg-background shrink-0 shadow-lg">
      <div className="flex gap-3 mx-auto">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Tanyakan apapun tentang data karyawan..."
          className="min-h-[80px] max-h-[200px] resize-none text-sm"
          disabled={isPending}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isPending}
          size="icon"
          className="h-[80px] w-[80px] shrink-0 shadow-sm"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 text-center mx-auto">
        Tekan{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
          Enter
        </kbd>{' '}
        untuk mengirim,{' '}
        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
          Shift+Enter
        </kbd>{' '}
        untuk baris baru
      </p>
    </div>
  )
}

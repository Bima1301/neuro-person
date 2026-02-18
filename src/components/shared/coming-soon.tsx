import { Construction } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = 'Coming Soon',
  description = 'Fitur ini sedang dalam pengembangan.',
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="w-full max-w-md border-dashed">
        <CardContent className="flex flex-col items-center gap-4 pt-8 pb-8 text-center">
          <div className="rounded-full bg-muted p-4">
            <Construction className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

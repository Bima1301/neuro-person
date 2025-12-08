import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SelectEmptyStateProps {
    message: string
    createButtonLabel: string
    createRoute: string
    onClose?: () => void
}

export function SelectEmptyState({
    message,
    createButtonLabel,
    createRoute,
    onClose,
}: SelectEmptyStateProps) {
    const navigate = useNavigate()

    const handleCreate = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onClose) {
            onClose()
        }
        navigate({ to: createRoute })
    }

    return (
        <div className="px-2 py-1.5 text-sm">
            <div className="flex flex-col gap-2 py-2">
                <p className="text-muted-foreground">{message}</p>
                <Button
                    type="button"
                    size="sm"
                    onClick={handleCreate}
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    {createButtonLabel}
                </Button>
            </div>
        </div>
    )
}

interface SelectEmptyStateWithAddProps {
    message: string
    createButtonLabel: string
    createRoute: string
    onClose?: () => void
    items: Array<unknown>
}

export function SelectEmptyStateWithAdd({
    message,
    createButtonLabel,
    createRoute,
    onClose,
    items,
}: SelectEmptyStateWithAddProps) {
    const navigate = useNavigate()

    const handleCreate = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (onClose) {
            onClose()
        }
        navigate({ to: createRoute })
    }

    if (items.length === 0) {
        return (
            <div className="px-2 py-1.5 text-sm">
                <div className="flex flex-col gap-2 py-2">
                    <p className="text-muted-foreground">{message}</p>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleCreate}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        {createButtonLabel}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="border-t px-2 py-1.5">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCreate}
                className="w-full justify-start text-sm font-normal"
            >
                <Plus className="mr-2 h-4 w-4" />
                {createButtonLabel}
            </Button>
        </div>
    )
}


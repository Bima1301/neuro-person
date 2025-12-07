import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Eye, Search, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useTRPC } from '@/integrations/trpc/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ChatHistory() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery(
    trpc.chatBot.history.queryOptions({
      page,
      limit: 10,
      search: search || undefined,
    }),
  )

  const deleteMutation = useMutation(
    trpc.chatBot.delete.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.chatBot.history.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.chatBot.stats.queryKey(),
        })
        toast.success('Chat berhasil dihapus')
      },
      onError: (error) => {
        toast.error(error.message || 'Gagal menghapus chat')
      },
    }),
  )

  const { data: chatDetail } = useQuery(
    trpc.chatBot.get.queryOptions(
      { id: selectedChat || '' },
      { enabled: !!selectedChat },
    ),
  )

  const handleDelete = (id: string) => {
    if (id) {
      deleteMutation.mutate({ id })
    }
  }

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d)
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari dalam riwayat chat..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Memuat riwayat...
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Belum ada riwayat chat
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pertanyaan</TableHead>
                  <TableHead>Jawaban</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map((chat) => (
                  <TableRow key={chat.id}>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm">{chat.question}</p>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {chat.answer}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(chat.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setSelectedChat(chat.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl! max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>Detail Chat</DialogTitle>
                              <DialogDescription>
                                {formatDate(chat.createdAt)}
                              </DialogDescription>
                            </DialogHeader>
                            {chatDetail && (
                              <div className="space-y-4">
                                <div>
                                  <p className="text-sm font-medium mb-2">
                                    Pertanyaan:
                                  </p>
                                  <Card className="p-4 bg-muted">
                                    <p className="text-sm">
                                      {chatDetail.question}
                                    </p>
                                  </Card>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">
                                    Jawaban:
                                  </p>
                                  <Card className="p-4">
                                    <div
                                      className="prose prose-sm dark:prose-invert max-w-none 
													prose-headings:mt-4 prose-headings:mb-3 prose-headings:font-semibold
													prose-h2:text-lg prose-h3:text-base
													prose-p:my-3 prose-p:leading-relaxed
													prose-ul:my-3 prose-ol:my-3 
													prose-li:my-1.5 prose-li:leading-relaxed
													prose-strong:text-foreground prose-strong:font-semibold
													prose-code:text-primary prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
													prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-pre:border prose-pre:border-border
													prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic
													prose-table:w-full prose-table:border-collapse
													prose-th:border prose-th:border-border prose-th:p-2 prose-th:bg-muted prose-th:font-semibold
													prose-td:border prose-td:border-border prose-td:p-2
													prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80
													prose-img:rounded-lg prose-img:shadow-sm"
                                    >
                                      <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                      >
                                        {chatDetail.answer}
                                      </ReactMarkdown>
                                    </div>
                                  </Card>
                                </div>
                                {chatDetail.context &&
                                  typeof chatDetail.context === 'object' &&
                                  'sources' in chatDetail.context &&
                                  Array.isArray(chatDetail.context.sources) &&
                                  chatDetail.context.sources.length > 0 && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">
                                        Referensi (
                                        {chatDetail.context.sources.length}):
                                      </p>
                                      <div className="flex flex-wrap gap-2">
                                        {chatDetail.context.sources.map(
                                          (source: any, idx: number) => (
                                            <Badge key={idx} variant="outline">
                                              {source.name || source.employeeId}
                                              {source.similarity && (
                                                <span className="ml-1 text-muted-foreground">
                                                  ({source.similarity}%)
                                                </span>
                                              )}
                                            </Badge>
                                          ),
                                        )}
                                      </div>
                                    </div>
                                  )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Chat?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tindakan ini tidak dapat dibatalkan. Chat akan
                                dihapus secara permanen.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(chat.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Menampilkan {data.items.length} dari {data.total} chat
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Sebelumnya
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPage((p) => Math.min(data.totalPages, p + 1))
                    }
                    disabled={page >= data.totalPages}
                  >
                    Selanjutnya
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

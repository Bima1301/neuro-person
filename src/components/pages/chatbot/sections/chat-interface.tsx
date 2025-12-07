import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Bot, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChatInput } from './chat-input'
import type { ChatSource } from '@/integrations/trpc/routers/chat-bot/types'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card } from '@/components/ui/card'
import { useTRPC } from '@/integrations/trpc/react'

interface Message {
  id: string
  question: string
  answer: string
  sources?: Array<ChatSource>
  timestamp: Date
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Array<Message>>([])
  const [input, setInput] = useState('')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const trpc = useTRPC()
  const queryClient = useQueryClient()

  const queryMutation = useMutation(
    trpc.chatBot.query.mutationOptions({
      onSuccess: (response, variables) => {
        setMessages((prev) => {
          const updated = [...prev]
          const lastMessage = updated[updated.length - 1]
          if (
            lastMessage &&
            lastMessage.question === variables.question &&
            !lastMessage.answer
          ) {
            lastMessage.answer = response.answer
            lastMessage.sources = response.sources
          } else {
            const botMessage: Message = {
              id: `bot-${Date.now()}`,
              question: '',
              answer: response.answer,
              sources: response.sources,
              timestamp: new Date(),
            }
            updated.push(botMessage)
          }
          return updated
        })
        toast.success('Pertanyaan berhasil dijawab')

        queryClient.invalidateQueries({
          queryKey: trpc.chatBot.history.queryKey(),
        })
        queryClient.invalidateQueries({
          queryKey: trpc.chatBot.stats.queryKey(),
        })
      },
      onError: (error) => {
        console.error('Error sending message:', error)
        toast.error(
          error instanceof Error
            ? error.message
            : 'Gagal mengirim pertanyaan. Silakan coba lagi.',
        )
      },
    }),
  )

  const sendMessage = () => {
    if (!input.trim() || queryMutation.isPending) return

    const question = input.trim()
    setInput('')

    const userMessageId = `user-${Date.now()}`
    const userMessage: Message = {
      id: userMessageId,
      question,
      answer: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])

    // Build conversation history from previous messages (last 5 pairs)
    const conversationHistory = messages
      .filter((msg) => msg.answer) // Only include completed messages
      .slice(-5) // Take last 5 completed conversations
      .flatMap((msg) => [
        { role: 'user' as const, content: msg.question },
        { role: 'assistant' as const, content: msg.answer },
      ])

    queryMutation.mutate(
      {
        question,
        contextLimit: 5,
        conversationHistory,
      },

      {
        onError: () => {
          setMessages((prev) => prev.filter((m) => m.id !== userMessageId))
        },
      },
    )
  }

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]',
      )
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-background shadow-sm">
      <ScrollArea
        ref={scrollAreaRef}
        className="flex-1 min-h-0 p-4 md:p-6"
        style={{ height: '100%' }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-4">
            <div className="rounded-full bg-primary/10 p-6 mb-6">
              <Bot className="h-16 w-16 text-primary opacity-80" />
            </div>
            <p className="text-2xl font-semibold mb-2">Mulai percakapan</p>
            <p className="text-sm mb-6 max-w-md">
              Tanyakan apapun tentang data karyawan, misalnya:
            </p>
            <ul className="text-sm space-y-2 max-w-md text-left">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>"Siapa saja karyawan di department IT?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>"Berapa total gaji karyawan full-time?"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>"Tampilkan karyawan yang bergabung tahun 2024"</span>
              </li>
            </ul>
          </div>
        ) : (
          <div className="space-y-6 pb-4 mx-auto">
            {messages.map((message) => (
              <div key={message.id} className="space-y-4">
                {message.question && (
                  <div className="flex gap-3 items-start">
                    <div className="flex shrink-0">
                      <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shadow-sm">
                        <User className="h-5 w-5 text-primary-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <Card className="p-4 bg-muted/50 border-muted shadow-sm gap-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                          Anda
                        </p>
                        <p className="text-sm whitespace-pre-wrap wrap-break-word">
                          {message.question}
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {message.answer && (
                  <div className="flex gap-3 items-start">
                    <div className="shrink-0">
                      <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <Card className="p-5 bg-card border shadow-sm gap-3">
                        <p className="text-xs font-medium mb-4 text-primary flex items-center gap-2 uppercase tracking-wide">
                          <Bot className="h-4 w-4" />
                          AI Assistant
                        </p>
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
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.answer}
                          </ReactMarkdown>
                        </div>
                      </Card>

                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2 pt-1">
                          <p className="text-xs text-muted-foreground font-medium">
                            📚 Referensi ({message.sources.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {message.sources.map((source, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs cursor-default hover:bg-muted transition-colors border-muted-foreground/20"
                              >
                                {source.name || source.employeeId}
                                {source.similarity && (
                                  <span className="ml-1.5 text-muted-foreground font-normal">
                                    ({source.similarity}%)
                                  </span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {queryMutation.isPending && (
              <div className="flex gap-3 items-start">
                <div className="shrink-0">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1">
                  <Card className="p-4 bg-card border shadow-sm">
                    <div className="flex items-center gap-3">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        AI sedang memproses pertanyaan Anda...
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        isPending={queryMutation.isPending}
      />
    </div>
  )
}

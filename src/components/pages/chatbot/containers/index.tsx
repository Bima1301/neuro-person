import { useState } from 'react'
import { History, MessageSquare } from 'lucide-react'
import { ChatInterface } from '../sections/chat-interface'
import { ChatHistory } from '../sections/chat-history'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ChatBotContainer() {
  const [activeTab, setActiveTab] = useState('chat')

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="shrink-0">
        <h1 className="text-3xl font-bold">AI Chatbot</h1>
        <p className="text-muted-foreground">
          Tanyakan apapun tentang data karyawan dengan AI Assistant
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full flex flex-col flex-1 min-h-0"
      >
        <TabsList className="grid w-full grid-cols-2 shrink-0">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6 flex-1 min-h-0 flex flex-col">
          <ChatInterface />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <ChatHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

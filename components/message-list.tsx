"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Message } from "./message"
import type { ChatMessage } from "@/lib/types"

interface MessageListProps {
  messages: ChatMessage[]
  isLoading: boolean
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isLoading])

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea ref={scrollAreaRef} className="h-full custom-scrollbar">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
          {messages.map((message, index) => (
            <Message
              key={message.id}
              message={message}
              isLast={index === messages.length - 1}
              isLoading={isLoading && index === messages.length - 1 && message.role === "assistant"}
            />
          ))}
          {isLoading && (
            <div className="flex justify-start message-fade-in">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  AI
                </div>
                <div className="chatgpt-message-assistant rounded-2xl p-4 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>
    </div>
  )
}

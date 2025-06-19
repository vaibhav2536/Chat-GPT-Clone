"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Edit3,
  Download,
  Share,
  Volume2,
  ChevronLeft,
  ChevronRight,
  FileText,
  ImageIcon,
  File,
} from "lucide-react"
import type { ChatMessage } from "@/lib/types"
import { cn } from "@/lib/utils"
import { useChatStore } from "@/lib/chat-store"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MessageProps {
  message: ChatMessage
  isLast: boolean
  isLoading?: boolean
}

export function Message({ message, isLast, isLoading = false }: MessageProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(message.content)
  const [isHovered, setIsHovered] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)

  const { updateMessage, currentChatId, regenerateResponse, switchResponseVersion, currentChat } = useChatStore()

  const handleEdit = () => {
    setIsEditing(true)
    setEditContent(message.content)
  }

  const handleSaveEdit = async () => {
    if (currentChatId && editContent.trim() !== message.content) {
      setIsRegenerating(true)

      // Update the user message
      updateMessage(currentChatId, message.id, editContent.trim())

      // Regenerate the assistant response
      await regenerateResponse(currentChatId, message.id, editContent.trim())

      setIsRegenerating(false)
    }
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(message.content)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
  }

  const handleRegenerateResponse = async () => {
    if (currentChatId && message.role === "assistant") {
      setIsRegenerating(true)
      // Find the previous user message
      if (currentChat) {
        const messageIndex = currentChat.messages.findIndex((msg) => msg.id === message.id)
        const userMessage = currentChat.messages[messageIndex - 1]
        if (userMessage && userMessage.role === "user") {
          await regenerateResponse(currentChatId, userMessage.id)
        }
      }
      setIsRegenerating(false)
    }
  }

  const handlePreviousVersion = () => {
    if (currentChatId && message.versions && message.currentVersion !== undefined && message.currentVersion > 0) {
      switchResponseVersion(currentChatId, message.id, message.currentVersion - 1)
    }
  }

  const handleNextVersion = () => {
    if (
      currentChatId &&
      message.versions &&
      message.currentVersion !== undefined &&
      message.currentVersion < message.versions.length - 1
    ) {
      switchResponseVersion(currentChatId, message.id, message.currentVersion + 1)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-blue-400" />
    if (type === "application/pdf") return <FileText className="h-4 w-4 text-red-400" />
    if (type.startsWith("text/")) return <FileText className="h-4 w-4 text-green-400" />
    return <File className="h-4 w-4 text-gray-400" />
  }

  const isUser = message.role === "user"
  const isAssistant = message.role === "assistant"
  const showActions = !isEditing && !isLoading && !isRegenerating && (isHovered || (isLast && !isLoading))
  const hasMultipleVersions = message.versions && message.versions.length > 1
  const currentVersion = message.currentVersion ?? 0
  const totalVersions = message.versions?.length ?? 1

  return (
    <div
      className={cn("group message-fade-in w-full", isUser ? "flex justify-end" : "flex justify-start")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("w-full max-w-none", isUser ? "flex justify-end" : "flex justify-start")}>
        <div
          className={cn(
            "rounded-2xl p-4 relative max-w-[85%] break-words",
            isUser ? "chatgpt-message-user ml-auto" : "chatgpt-message-assistant mr-auto",
          )}
        >
          {/* Avatar for assistant */}
          {isAssistant && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                AI
              </div>
              <div className="flex-1 min-w-0">
                {isRegenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="typing-dots">
                      <div className="dot"></div>
                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                ) : (
                  <div className="text-white prose prose-invert max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          return inline ? (
                            <code
                              className="bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-green-400"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <pre className="bg-gray-800 border border-gray-600 rounded-lg p-4 overflow-x-auto my-4">
                              <code className="text-sm font-mono text-gray-100 whitespace-pre">{children}</code>
                            </pre>
                          )
                        },
                        p: ({ children }) => <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1 ml-4">{children}</ul>,
                        ol: ({ children }) => (
                          <ol className="list-decimal list-inside mb-3 space-y-1 ml-4">{children}</ol>
                        ),
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>,
                        h4: ({ children }) => <h4 className="text-base font-bold mb-2 mt-3 first:mt-0">{children}</h4>,
                        strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-gray-500 pl-4 italic my-4 text-gray-300">
                            {children}
                          </blockquote>
                        ),
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="min-w-full border border-gray-600 rounded-lg">{children}</table>
                          </div>
                        ),
                        thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
                        tbody: ({ children }) => <tbody className="bg-gray-800">{children}</tbody>,
                        tr: ({ children }) => <tr className="border-b border-gray-600">{children}</tr>,
                        th: ({ children }) => (
                          <th className="px-4 py-2 text-left font-semibold text-white">{children}</th>
                        ),
                        td: ({ children }) => <td className="px-4 py-2 text-gray-200">{children}</td>,
                        hr: () => <hr className="border-gray-600 my-6" />,
                        a: ({ children, href }) => (
                          <a
                            href={href}
                            className="text-blue-400 hover:text-blue-300 underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {children}
                          </a>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}

                {/* Version Navigation for Assistant Messages */}
                {isAssistant && hasMultipleVersions && !isRegenerating && (
                  <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-400">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={handlePreviousVersion}
                      disabled={currentVersion === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs">
                      {currentVersion + 1} / {totalVersions}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-white disabled:opacity-30"
                      onClick={handleNextVersion}
                      disabled={currentVersion === totalVersions - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* User message */}
          {isUser && (
            <div className="w-full">
              {/* File attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex gap-2 mb-3 flex-wrap">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-gray-600 rounded-xl p-3 w-24 h-24 flex flex-col items-center justify-center"
                    >
                      {attachment.type.startsWith("image/") && attachment.url ? (
                        <ImageIcon
                          src={attachment.url || "/placeholder.svg"}
                          alt={attachment.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          {getFileIcon(attachment.type)}
                          <span className="text-xs text-gray-300 mt-1 truncate w-full text-center">
                            {attachment.name.split(".").pop()}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isEditing ? (
                <div className="bg-gray-600 rounded-2xl p-4 relative">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="bg-transparent border-0 text-white resize-none focus:ring-0 focus:outline-none text-base leading-relaxed p-0 min-h-[60px]"
                    placeholder="Type your message..."
                    autoFocus
                  />
                  <div className="flex gap-2 justify-end mt-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleCancelEdit}
                      disabled={isRegenerating}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveEdit}
                      disabled={isRegenerating || !editContent.trim()}
                      className="bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {isRegenerating ? (
                        <div className="flex items-center gap-2">
                          <div className="loading-spinner border-black border-t-transparent w-4 h-4"></div>
                          Sending...
                        </div>
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-white whitespace-pre-wrap break-words">{message.content}</div>
              )}
            </div>
          )}

          {/* Message Actions - Only show when response is complete */}
          {showActions && (
            <div
              className={cn(
                "absolute -bottom-8 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10",
                isUser ? "right-0" : "left-12",
              )}
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                onClick={handleCopy}
              >
                <Copy className="h-4 w-4" />
              </Button>

              {isUser && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  onClick={handleEdit}
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              )}

              {isAssistant && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  >
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                    onClick={handleRegenerateResponse}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 bg-black/20 backdrop-blur-sm hover:bg-black/40 text-white rounded-lg transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

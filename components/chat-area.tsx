"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Paperclip, Mic, ChevronDown, Share, MoreHorizontal, Menu, Plus, Settings } from "lucide-react"
import { MessageList } from "./message-list"
import { FilePreview } from "./file-preview"
import { useChatStore } from "@/lib/chat-store"
import { cn } from "@/lib/utils"
import type { UploadedFile } from "@/lib/types"

interface ChatAreaProps {
  isSidebarOpen: boolean
  onToggleSidebar?: () => void
}

export function ChatArea({ isSidebarOpen, onToggleSidebar }: ChatAreaProps) {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { currentChat, addMessage, currentChatId, createNewChat, updateMessage } = useChatStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && uploadedFiles.length === 0) || isLoading) return

    setError(null)
    let chatId = currentChatId
    if (!chatId) {
      chatId = createNewChat()
    }

    const userMessage = {
      id: Date.now().toString(),
      role: "user" as const,
      content: input,
      timestamp: new Date(),
    }

    addMessage(chatId, userMessage)
    setIsLoading(true)
    const currentInput = input
    setInput("")
    setUploadedFiles([]) // Clear uploaded files after sending

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [userMessage],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""
      const assistantMessageId = (Date.now() + 1).toString()

      // Add initial assistant message
      const assistantMessage = {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: new Date(),
      }
      addMessage(chatId, assistantMessage)

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6)
              if (data === "[DONE]") break

              try {
                const parsed = JSON.parse(data)
                const content = parsed.choices?.[0]?.delta?.content
                if (content) {
                  assistantContent += content
                  // Update the message in the store
                  updateMessage(chatId, assistantMessageId, assistantContent)
                }
              } catch (e) {
                // Ignore parsing errors
                console.warn("Failed to parse streaming data:", e)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error)
      setError(error instanceof Error ? error.message : "An error occurred")

      // Add error message
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant" as const,
        content: "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: new Date(),
      }
      addMessage(chatId, errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const fileId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const uploadedFile: UploadedFile = {
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
          file,
        }

        // Create preview for images
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const preview = e.target?.result as string
            setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, preview } : f)))
          }
          reader.readAsDataURL(file)
        }

        setUploadedFiles((prev) => [...prev, uploadedFile])
      })
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  useEffect(() => {
    adjustTextareaHeight()
  }, [input])

  const displayMessages = currentChat?.messages || []
  const hasMessages = displayMessages.length > 0

  return (
    <div className="flex flex-col h-full w-full min-w-0">
      {/* Header - Fixed with matching background */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0 chatgpt-main">
        <div className="flex items-center gap-3">
          {!isSidebarOpen && (
            <Button size="sm" variant="ghost" className="text-gray-400 hover:bg-gray-700" onClick={onToggleSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-medium text-white">ChatGPT</h1>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Saved memory full
          </div>
          <Button size="sm" className="chatgpt-button text-white">
            Get Plus
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400">
            <Share className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" className="text-gray-400">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg flex-shrink-0">
          <p className="text-red-400 text-sm">{error}</p>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-400 hover:text-red-300 mt-2"
            onClick={() => setError(null)}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Main Content Area */}
      {hasMessages ? (
        // Chat Messages View
        <div className="flex-1 flex flex-col min-h-0">
          <MessageList messages={displayMessages} isLoading={isLoading} />
          {/* Input Area - Fixed at bottom with matching background */}
          <div className="p-4 flex-shrink-0 chatgpt-main border-t border-gray-700">
            {/* File Previews */}
            {uploadedFiles.length > 0 && (
              <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-2 mb-3 flex-wrap">
                  {uploadedFiles.map((file) => (
                    <FilePreview key={file.id} file={file} onRemove={handleRemoveFile} />
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
              <div className="relative flex items-center gap-2 p-3 chatgpt-input rounded-2xl max-w-4xl mx-auto">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex-shrink-0"
                  onClick={handleFileUpload}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>

                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  disabled={isLoading}
                  className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none disabled:opacity-50"
                  rows={1}
                />

                <div className="flex items-center gap-2 flex-shrink-0">
                  {input.trim() || uploadedFiles.length > 0 ? (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading}
                      className="bg-white text-black hover:bg-gray-200 rounded-full w-8 h-8 p-0 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="loading-spinner border-black border-t-transparent"></div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-gray-400 hover:text-white rounded-full w-8 h-8 p-0"
                      onClick={() => setIsRecording(!isRecording)}
                    >
                      <Mic className={cn("h-4 w-4", isRecording && "text-red-500")} />
                    </Button>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </form>

            <p className="text-xs text-gray-500 text-center mt-2">
              ChatGPT can make mistakes. Check important info.{" "}
              <span className="underline cursor-pointer hover:text-gray-400">See Cookie Preferences</span>.
            </p>
          </div>
        </div>
      ) : (
        // Empty State - Centered Layout
        <div className="flex-1 flex flex-col items-center justify-center px-4 min-h-0">
          <div className="w-full max-w-3xl">
            {/* Welcome Message */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-medium text-white mb-2">What's on your mind today?</h2>
            </div>

            {/* File Previews for Empty State */}
            {uploadedFiles.length > 0 && (
              <div className="w-full max-w-3xl">
                <div className="flex gap-2 mb-4 justify-start flex-wrap">
                  {uploadedFiles.map((file) => (
                    <FilePreview key={file.id} file={file} onRemove={handleRemoveFile} />
                  ))}
                </div>
              </div>
            )}

            {/* Centered Input Area */}
            <form onSubmit={handleSubmit} className="relative mb-8">
              <div className="relative flex items-center gap-2 p-4 chatgpt-input rounded-3xl">
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-gray-400 hover:text-white flex-shrink-0"
                  onClick={handleFileUpload}
                >
                  <Plus className="h-5 w-5" />
                </Button>

                <Textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything"
                  disabled={isLoading}
                  className="flex-1 min-h-[24px] max-h-[200px] resize-none border-0 bg-transparent text-white placeholder-gray-400 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none text-lg disabled:opacity-50 flex items-center"
                  rows={1}
                />

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-white flex items-center gap-2 px-3 py-2 rounded-full"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">Tools</span>
                  </Button>

                  {input.trim() || uploadedFiles.length > 0 ? (
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isLoading}
                      className="bg-white text-black hover:bg-gray-200 rounded-full w-10 h-10 p-0 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="loading-spinner border-black border-t-transparent"></div>
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white rounded-full w-10 h-10 p-0"
                        onClick={() => setIsRecording(!isRecording)}
                      >
                        <Mic className={cn("h-5 w-5", isRecording && "text-red-500")} />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </form>

            {/* Footer Text */}
            <p className="text-xs text-gray-500 text-center">
              ChatGPT can make mistakes. Check important info.{" "}
              <span className="underline cursor-pointer hover:text-gray-400">See Cookie Preferences</span>.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

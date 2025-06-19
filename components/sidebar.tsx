"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  PenSquare,
  Search,
  Library,
  Play,
  Grid3X3,
  MessageSquare,
  Trash2,
  Edit3,
  Menu,
  ChevronDown,
  Settings,
} from "lucide-react"
import { useChatStore } from "@/lib/chat-store"
import { cn } from "@/lib/utils"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  // Add mobile detection effect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && isOpen) {
      // Don't auto-close, but ensure overlay behavior
    }
  }, [isMobile])

  const { chats, currentChatId, createNewChat, selectChat, deleteChat, updateChatTitle } = useChatStore()

  const filteredChats = chats.filter((chat) => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleNewChat = () => {
    createNewChat()
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChat(chatId)
  }

  const handleEditTitle = (chatId: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingChatId(chatId)
    setEditingTitle(currentTitle)
  }

  const handleSaveTitle = (chatId: string) => {
    if (editingTitle.trim() && editingTitle !== chats.find((c) => c.id === chatId)?.title) {
      updateChatTitle(chatId, editingTitle.trim())
    }
    setEditingChatId(null)
    setEditingTitle("")
  }

  const handleCancelEdit = () => {
    setEditingChatId(null)
    setEditingTitle("")
  }

  const handleKeyDown = (e: React.KeyboardEvent, chatId: string) => {
    if (e.key === "Enter") {
      handleSaveTitle(chatId)
    } else if (e.key === "Escape") {
      handleCancelEdit()
    }
  }

  return (
    <div
      className={cn(
        "chatgpt-sidebar flex flex-col h-full transition-all duration-300 ease-in-out flex-shrink-0",
        isOpen ? "w-64" : "w-0 overflow-hidden",
        // Mobile overlay styles
        isMobile && isOpen && "fixed inset-y-0 left-0 z-50 shadow-2xl"
      )}
    >
      {/* Top Section - Fixed */}
      <div className="flex items-center justify-between p-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* ChatGPT Logo */}
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <div className="w-4 h-4 bg-black rounded-full relative">
              <div className="absolute inset-0.5 bg-white rounded-full"></div>
              <div className="absolute inset-1 bg-black rounded-full"></div>
            </div>
          </div>
          <Button onClick={onToggle} size="sm" variant="ghost" className="text-gray-400 hover:bg-gray-700 p-1 h-6 w-6">
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 text-white">
          <span className="text-lg font-medium">ChatGPT</span>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Navigation Section - Fixed */}
      <div className="flex-shrink-0">
        {/* New Chat Button */}
        <div className="px-3 pb-3">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-3 bg-transparent hover:bg-gray-700 text-white border-0 h-10"
            variant="outline"
          >
            <PenSquare className="h-4 w-4" />
            New chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 pb-3">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-700 h-10">
            <Search className="h-4 w-4" />
            Search chats
          </Button>
        </div>

        {/* Navigation Items */}
        <div className="px-3 pb-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-700 h-10">
            <Library className="h-4 w-4" />
            Library
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mx-3 mb-4"></div>

        {/* Additional Items */}
        <div className="px-3 pb-4 space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-700 h-10">
            <Play className="h-4 w-4" />
            Sora
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 text-gray-300 hover:bg-gray-700 h-10">
            <Grid3X3 className="h-4 w-4" />
            GPTs
          </Button>
        </div>
      </div>

      {/* Chat History - Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="px-3 pb-2">
          <h3 className="text-sm font-medium text-gray-400">Chats</h3>
        </div>
        <ScrollArea className="flex-1 px-3 custom-scrollbar">
          <div className="space-y-1 pb-4">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                className={cn(
                  "group flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors text-sm",
                  currentChatId === chat.id && "bg-gray-700",
                )}
                onClick={() => {
                  selectChat(chat.id)
                  if (isMobile) {
                    onToggle() // Close sidebar on mobile after selecting chat
                  }
                }}
              >
                <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                
                {editingChatId === chat.id ? (
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={() => handleSaveTitle(chat.id)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id)}
                    className="flex-1 bg-gray-600 text-gray-200 px-2 py-1 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="flex-1 text-gray-200 truncate">{chat.title}</span>
                )}
                
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-600"
                    onClick={(e) => handleEditTitle(chat.id, chat.title, e)}
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-gray-600 text-red-400"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
            {filteredChats.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-8">No chats yet. Start a new conversation!</div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer - Fixed */}
      <div className="p-3 border-t border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700 cursor-pointer">
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <Settings className="h-3 w-3 text-gray-300" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-white font-medium">Upgrade plan</div>
            <div className="text-xs text-gray-400">More access to the best models</div>
          </div>
        </div>
      </div>
    </div>
  )
}

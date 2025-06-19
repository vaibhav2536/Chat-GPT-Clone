"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { ChatArea } from "./chat-area"
import { useChatStore } from "@/lib/chat-store"
import { ConnectionStatus } from "./connection-status"
import { cn } from "@/lib/utils"

export function ChatInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Default to closed
  const [isMobile, setIsMobile] = useState(false)
  const { initializeStore } = useChatStore()

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      // Set sidebar open by default on desktop, closed on mobile
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true)
      } else if (mobile && isSidebarOpen) {
        setIsSidebarOpen(false)
      }
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    initializeStore()
  }, [initializeStore])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden chatgpt-bg relative">
      <Sidebar isOpen={isSidebarOpen} onToggle={toggleSidebar} />
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          // On mobile, always take full width
          isMobile ? "w-full" : "",
        )}
      >
        <ChatArea isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      </div>
      <ConnectionStatus />
    </div>
  )
}

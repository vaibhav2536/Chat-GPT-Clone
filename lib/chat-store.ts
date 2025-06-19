"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { ChatMessage, Chat } from "./types"

interface ChatStore {
  chats: Chat[]
  currentChatId: string | null
  currentChat: Chat | null

  // Actions
  createNewChat: () => string
  selectChat: (chatId: string) => void
  deleteChat: (chatId: string) => void
  updateChatTitle: (chatId: string, title: string) => void
  addMessage: (chatId: string, message: ChatMessage) => void
  updateMessage: (chatId: string, messageId: string, content: string) => void
  deleteMessage: (chatId: string, messageId: string) => void
  clearAllChats: () => void
  initializeStore: () => void

  // New actions for response versions
  addResponseVersion: (chatId: string, messageId: string, newContent: string) => void
  switchResponseVersion: (chatId: string, messageId: string, versionIndex: number) => void
  regenerateResponse: (chatId: string, userMessageId: string, newUserContent?: string) => Promise<void>
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      currentChatId: null,
      currentChat: null,

      createNewChat: () => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title: "New Chat",
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        set((state) => ({
          chats: [newChat, ...state.chats],
          currentChatId: newChat.id,
          currentChat: newChat,
        }))

        return newChat.id
      },

      selectChat: (chatId: string) => {
        const chat = get().chats.find((c) => c.id === chatId)
        if (chat) {
          set({
            currentChatId: chatId,
            currentChat: chat,
          })
        }
      },

      deleteChat: (chatId: string) => {
        set((state) => {
          const newChats = state.chats.filter((c) => c.id !== chatId)
          const newCurrentChatId =
            state.currentChatId === chatId ? (newChats.length > 0 ? newChats[0].id : null) : state.currentChatId
          const newCurrentChat = newCurrentChatId ? newChats.find((c) => c.id === newCurrentChatId) || null : null

          return {
            chats: newChats,
            currentChatId: newCurrentChatId,
            currentChat: newCurrentChat,
          }
        })
      },

      updateChatTitle: (chatId: string, title: string) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat,
          )

          return {
            chats: updatedChats,
            currentChat:
              state.currentChat?.id === chatId
                ? { ...state.currentChat, title, updatedAt: new Date() }
                : state.currentChat,
          }
        })
      },

      addMessage: (chatId: string, message: ChatMessage) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              const updatedChat = {
                ...chat,
                messages: [...chat.messages, message],
                updatedAt: new Date(),
                title:
                  chat.messages.length === 0 && message.role === "user"
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
                    : chat.title,
              }
              return updatedChat
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat:
              state.currentChatId === chatId ? updatedChats.find((c) => c.id === chatId) || null : state.currentChat,
          }
        })
      },

      updateMessage: (chatId: string, messageId: string, content: string) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => (msg.id === messageId ? { ...msg, content } : msg)),
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat:
              state.currentChatId === chatId ? updatedChats.find((c) => c.id === chatId) || null : state.currentChat,
          }
        })
      },

      deleteMessage: (chatId: string, messageId: string) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.filter((msg) => msg.id !== messageId),
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat:
              state.currentChatId === chatId ? updatedChats.find((c) => c.id === chatId) || null : state.currentChat,
          }
        })
      },

      addResponseVersion: (chatId: string, messageId: string, newContent: string) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.id === messageId && msg.role === "assistant") {
                    const versions = msg.versions || [msg.content]
                    const newVersions = [...versions, newContent]
                    return {
                      ...msg,
                      content: newContent,
                      versions: newVersions,
                      currentVersion: newVersions.length - 1,
                    }
                  }
                  return msg
                }),
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat:
              state.currentChatId === chatId ? updatedChats.find((c) => c.id === chatId) || null : state.currentChat,
          }
        })
      },

      switchResponseVersion: (chatId: string, messageId: string, versionIndex: number) => {
        set((state) => {
          const updatedChats = state.chats.map((chat) => {
            if (chat.id === chatId) {
              return {
                ...chat,
                messages: chat.messages.map((msg) => {
                  if (msg.id === messageId && msg.versions && msg.versions[versionIndex]) {
                    return {
                      ...msg,
                      content: msg.versions[versionIndex],
                      currentVersion: versionIndex,
                    }
                  }
                  return msg
                }),
                updatedAt: new Date(),
              }
            }
            return chat
          })

          return {
            chats: updatedChats,
            currentChat:
              state.currentChatId === chatId ? updatedChats.find((c) => c.id === chatId) || null : state.currentChat,
          }
        })
      },

      regenerateResponse: async (chatId: string, userMessageId: string, newUserContent?: string) => {
        const state = get()
        const chat = state.chats.find((c) => c.id === chatId)
        if (!chat) return

        // Update user message if new content provided
        if (newUserContent) {
          get().updateMessage(chatId, userMessageId, newUserContent)
        }

        // Find the user message and its corresponding assistant response
        const userMessageIndex = chat.messages.findIndex((msg) => msg.id === userMessageId)
        if (userMessageIndex === -1) return

        const userMessage = chat.messages[userMessageIndex]
        const assistantMessageIndex = userMessageIndex + 1
        const assistantMessage = chat.messages[assistantMessageIndex]

        try {
          const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messages: [{ ...userMessage, content: newUserContent || userMessage.content }],
            }),
          })

          if (!response.ok) {
            throw new Error("Failed to regenerate response")
          }

          const reader = response.body?.getReader()
          const decoder = new TextDecoder()
          let assistantContent = ""

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
                      // Update the message in real-time during streaming
                      if (assistantMessage) {
                        get().updateMessage(chatId, assistantMessage.id, assistantContent)
                      }
                    }
                  } catch (e) {
                    console.warn("Failed to parse streaming data:", e)
                  }
                }
              }
            }
          }

          // Add as new version if assistant message exists
          if (assistantMessage && assistantContent) {
            get().addResponseVersion(chatId, assistantMessage.id, assistantContent)
          }
        } catch (error) {
          console.error("Failed to regenerate response:", error)
        }
      },

      clearAllChats: () => {
        set({
          chats: [],
          currentChatId: null,
          currentChat: null,
        })
      },

      initializeStore: () => {
        // This function can be used to initialize the store on app start
        const state = get()
        if (state.chats.length === 0) {
          // Optionally create a default chat or leave empty
        }
      },
    }),
    {
      name: "chatgpt-clone-storage",
      partialize: (state) => ({
        chats: state.chats,
        currentChatId: state.currentChatId,
      }),
    },
  ),
)

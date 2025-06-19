export interface ChatMessage {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: Date
  attachments?: FileAttachment[]
  versions?: string[] // For storing multiple response versions
  currentVersion?: number // Index of current version being displayed
  parentMessageId?: string // Link to the user message that generated this response
}

export interface FileAttachment {
  id: string
  name: string
  type: string
  size: number
  url: string
  preview?: string // For image previews
}

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatContext {
  maxTokens: number
  temperature: number
  model: string
}

export interface UploadedFile {
  id: string
  name: string
  type: string
  size: number
  file: File
  preview?: string
}

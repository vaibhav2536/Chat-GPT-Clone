"use client"

import { Button } from "@/components/ui/button"
import { X, FileText, ImageIcon, File } from "lucide-react"
import type { UploadedFile } from "@/lib/types"

interface FilePreviewProps {
  file: UploadedFile
  onRemove: (fileId: string) => void
}

export function FilePreview({ file, onRemove }: FilePreviewProps) {
  const isImage = file.type.startsWith("image/")
  const isPDF = file.type === "application/pdf"
  const isText = file.type.startsWith("text/")

  const getFileIcon = () => {
    if (isImage) return <ImageIcon className="h-6 w-6 text-blue-400" />
    if (isPDF) return <FileText className="h-6 w-6 text-red-400" />
    if (isText) return <FileText className="h-6 w-6 text-green-400" />
    return <File className="h-6 w-6 text-gray-400" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="relative bg-gray-600 rounded-xl p-3 w-24 h-24 flex flex-col items-center justify-center group">
      {/* Remove button */}
      <Button
        size="sm"
        variant="ghost"
        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-gray-800 hover:bg-gray-700 text-white rounded-full border border-gray-500"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-3 w-3" />
      </Button>

      {/* File preview */}
      {isImage && file.preview ? (
        <img
          src={file.preview || "/placeholder.svg"}
          alt={file.name}
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-full">
          {getFileIcon()}
          <span className="text-xs text-gray-300 mt-1 truncate w-full text-center">{file.name.split(".").pop()}</span>
        </div>
      )}

      {/* Tooltip with file info */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
        {file.name} ({formatFileSize(file.size)})
      </div>
    </div>
  )
}

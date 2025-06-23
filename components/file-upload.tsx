"use client"

import type React from "react"

import { useState, useRef } from "react"
import { FileUp, FileText, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface FileUploadProps {
  onFileContent: (content: string) => void
  onError: (error: string) => void
  accept?: string
  maxSize?: number // in MB
}

export function FileUpload({
  onFileContent,
  onError,
  accept = ".txt,.md,.html,.docx,.doc",
  maxSize = 5,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isReading, setIsReading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    processFile(selectedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const droppedFile = e.dataTransfer.files?.[0]
    if (!droppedFile) return
    processFile(droppedFile)
  }

  const processFile = (selectedFile: File) => {
    setFile(selectedFile)
    setIsReading(true)
    setError(null)
    setProgress(0)

    // Check file type
    const validTypes = [
      "text/plain",
      "text/markdown",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/html",
    ]
    const isValidExtension =
      selectedFile.name.endsWith(".md") ||
      selectedFile.name.endsWith(".txt") ||
      selectedFile.name.endsWith(".html") ||
      selectedFile.name.endsWith(".doc") ||
      selectedFile.name.endsWith(".docx")

    if (!validTypes.includes(selectedFile.type) && !isValidExtension) {
      const errorMsg = "Unsupported file type. Please upload a text, markdown, HTML, or Word document."
      setError(errorMsg)
      onError(errorMsg)
      setIsReading(false)
      return
    }

    // Check file size (max 5MB by default)
    if (selectedFile.size > maxSize * 1024 * 1024) {
      const errorMsg = `File is too large. Maximum size is ${maxSize}MB.`
      setError(errorMsg)
      onError(errorMsg)
      setIsReading(false)
      return
    }

    const reader = new FileReader()

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 10
      })
    }, 100)

    reader.onload = (event) => {
      clearInterval(interval)
      setProgress(100)

      const content = event.target?.result as string
      onFileContent(content)
      setIsReading(false)
    }

    reader.onerror = () => {
      clearInterval(interval)
      const errorMsg = "Failed to read file. Please try again or paste the content manually."
      setError(errorMsg)
      onError(errorMsg)
      setIsReading(false)
    }

    reader.readAsText(selectedFile)
  }

  const handleRemoveFile = () => {
    setFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      {!file ? (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm font-medium mb-1">Drag and drop your file here or click to browse</p>
          <p className="text-xs text-muted-foreground">Supports TXT, MD, HTML, and Word documents (max {maxSize}MB)</p>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={accept}
            onChange={handleFileUpload}
            disabled={isReading}
          />
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleRemoveFile} disabled={isReading}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {isReading && (
            <div className="mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Reading file...</span>
              </div>
              <Progress value={progress} className="h-1" />
            </div>
          )}
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect, useRef } from "react"
import { Bold, Italic, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Smile, Hash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface RichTextEditorProps {
  initialValue: string
  onChange: (value: string) => void
  className?: string
  placeholder?: string
  hashtags?: string[]
  onSave?: () => void
}

export function RichTextEditor({
  initialValue,
  onChange,
  className,
  placeholder = "Enter content...",
  hashtags = [],
  onSave,
}: RichTextEditorProps) {
  const [content, setContent] = useState(initialValue)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Common emojis for social media
  const commonEmojis = [
    "😊",
    "👍",
    "🔥",
    "💯",
    "🙌",
    "✨",
    "📈",
    "🚀",
    "💡",
    "👀",
    "🎉",
    "🤔",
    "💪",
    "🌟",
    "📱",
    "💻",
    "📊",
    "🔍",
    "📝",
    "🎯",
    "⚡",
    "💰",
    "🏆",
    "📢",
    "🌈",
    "❤️",
    "👏",
    "🤩",
    "😍",
    "🙏",
  ]

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialValue
    }
  }, [initialValue])

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      setContent(newContent)
      onChange(newContent)
    }
  }

  const execCommand = (command: string, value = "") => {
    document.execCommand(command, false, value)
    handleContentChange()
    if (editorRef.current) {
      editorRef.current.focus()
    }
  }

  const insertText = (text: string) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      range.collapse(false)
      selection.removeAllRanges()
      selection.addRange(range)
      handleContentChange()
    } else if (editorRef.current) {
      editorRef.current.innerHTML += text
      handleContentChange()
    }
  }

  const insertHashtag = (tag: string) => {
    insertText(` #${tag} `)
  }

  const insertEmoji = (emoji: string) => {
    insertText(emoji)
  }

  const handleSave = () => {
    setIsEditing(false)
    if (onSave) {
      onSave()
    }
    toast({
      title: "Content saved",
      description: "Your edits have been saved successfully.",
    })
  }

  return (
    <div className={cn("border rounded-md overflow-hidden", className)}>
      {/* Editor Toolbar */}
      <div className="flex items-center gap-0.5 p-1 border-b bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("bold")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("italic")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex border-l mx-1 h-6" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyLeft")}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyCenter")}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => execCommand("justifyRight")}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="flex border-l mx-1 h-6" />

        {/* Emoji Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Emoji">
              <Smile className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {commonEmojis.map((emoji, index) => (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => insertEmoji(emoji)}
                >
                  {emoji}
                </Button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Hashtag Picker */}
        {hashtags.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="ghost" size="sm" className="h-8 w-8 p-0" title="Insert Hashtag">
                <Hash className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="flex flex-wrap gap-1">
                {hashtags.map((tag, index) => (
                  <Button
                    key={index}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => insertHashtag(tag)}
                  >
                    #{tag}
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}

        <div className="ml-auto">
          <Button type="button" size="sm" onClick={handleSave} className="h-8">
            Save
          </Button>
        </div>
      </div>

      {/* Editable Content Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[150px] max-h-[400px] overflow-y-auto focus:outline-none"
        onInput={handleContentChange}
        onFocus={() => setIsEditing(true)}
        placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: initialValue }}
      />
    </div>
  )
}

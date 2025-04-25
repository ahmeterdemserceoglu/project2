"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Smile, Paperclip, ImageIcon, X } from "lucide-react"
import EmojiPicker from "@/components/emoji-picker"
import FileUpload from "@/components/file-upload"
import ImageUpload from "@/components/image-upload"

interface MessageInputProps {
  onSendMessage: (text: string) => Promise<void>
  onSendFile: (fileUrl: string, fileName: string, fileType: string) => Promise<void>
  onSendImage: (imageUrl: string, fileName: string) => Promise<void>
  disabled?: boolean
  placeholder?: string
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendFile,
  onSendImage,
  disabled = false,
  placeholder = "Mesajınızı yazın...",
}) => {
  const [message, setMessage] = useState("")
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const emojiButtonRef = useRef<HTMLButtonElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // Emoji picker dışında bir yere tıklandığında kapatma
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isEmojiPickerOpen &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setIsEmojiPickerOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isEmojiPickerOpen])

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!message.trim() || disabled || isSending) return

    try {
      setIsSending(true)
      await onSendMessage(message)
      setMessage("")
      inputRef.current?.focus()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsSending(false)
    }
  }

  const handleEmojiSelect = (emoji: any) => {
    setMessage((prev) => prev + emoji.native)
    setIsEmojiPickerOpen(false)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSendMessage} className="flex items-center gap-2 p-2 bg-background border-t">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
            ref={emojiButtonRef}
            disabled={disabled}
          >
            <Smile className="h-5 w-5" />
          </Button>

          <FileUpload
            onFileUpload={onSendFile}
            disabled={disabled}
            buttonProps={{
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground",
            }}
            icon={<Paperclip className="h-5 w-5" />}
          />

          <ImageUpload
            onImageUpload={onSendImage}
            disabled={disabled}
            buttonProps={{
              variant: "ghost",
              size: "icon",
              className: "h-9 w-9 rounded-full text-muted-foreground hover:text-foreground",
            }}
            icon={<ImageIcon className="h-5 w-5" />}
          />
        </div>

        <div className="relative flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            className="pr-10 py-5 rounded-full bg-muted/50"
            disabled={disabled || isSending}
            ref={inputRef}
            onKeyDown={handleKeyDown}
          />
          {message && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full hover:bg-muted"
              onClick={() => setMessage("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          type="submit"
          size="icon"
          className="rounded-full flex-shrink-0 h-10 w-10"
          disabled={!message.trim() || disabled || isSending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {isEmojiPickerOpen && (
        <div className="absolute bottom-full right-0 mb-2 z-10" ref={emojiPickerRef}>
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        </div>
      )}
    </div>
  )
}

export default MessageInput

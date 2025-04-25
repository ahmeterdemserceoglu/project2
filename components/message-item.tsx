"use client"

import type React from "react"
import { useState } from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { FileText, ImageIcon, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Message } from "@/lib/types"

interface MessageItemProps {
  message: Message
  isCurrentUser: boolean
  userName: string
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isCurrentUser, userName }) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Mesaj zamanını formatla
  const formatMessageTime = (timestamp: any) => {
    if (!timestamp) return ""

    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

      // Bugün ise sadece saati göster
      const today = new Date()
      if (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      ) {
        return format(date, "HH:mm", { locale: tr })
      }

      // Dün ise "Dün" ve saati göster
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      if (
        date.getDate() === yesterday.getDate() &&
        date.getMonth() === yesterday.getMonth() &&
        date.getFullYear() === yesterday.getFullYear()
      ) {
        return `Dün, ${format(date, "HH:mm", { locale: tr })}`
      }

      // Diğer durumlar için tam tarih
      return format(date, "d MMM, HH:mm", { locale: tr })
    } catch (err) {
      console.error("Error formatting message time:", err)
      return ""
    }
  }

  // Sistem mesajı
  if (message.senderId === "system") {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted/50 text-muted-foreground text-xs px-3 py-1.5 rounded-full">{message.text}</div>
      </div>
    )
  }

  return (
    <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} mb-4 group`} data-message-id={message.id}>
      <div className={`flex ${isCurrentUser ? "flex-row-reverse" : "flex-row"} max-w-[80%] items-end gap-2`}>
        {/* Avatar - sadece diğer kullanıcı için göster */}
        {!isCurrentUser && (
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {message.senderName?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col ${isCurrentUser ? "items-end" : "items-start"}`}>
          {/* Gönderen adı - sadece diğer kullanıcı için göster */}
          {!isCurrentUser && <span className="text-xs text-muted-foreground mb-1 ml-1">{message.senderName}</span>}

          <div
            className={`rounded-2xl px-4 py-2 shadow-sm ${
              isCurrentUser ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none"
            }`}
          >
            {/* Metin içeriği */}
            {message.text && <p className="whitespace-pre-wrap break-words">{message.text}</p>}

            {/* Resim içeriği */}
            {message.imageUrl && (
              <div className="mt-2">
                <a href={message.imageUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative rounded-lg overflow-hidden bg-black/5 hover:bg-black/10 transition-colors">
                    <img
                      src={message.imageUrl || "/placeholder.svg"}
                      alt={message.fileName || "Gönderilen resim"}
                      className="max-h-60 max-w-full object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                      <Button size="sm" variant="secondary" className="gap-1">
                        <ImageIcon className="h-4 w-4" />
                        <span>Görüntüle</span>
                      </Button>
                    </div>
                  </div>
                </a>
                {message.fileName && (
                  <span className="text-xs mt-1 block text-muted-foreground">{message.fileName}</span>
                )}
              </div>
            )}

            {/* Dosya içeriği */}
            {message.fileUrl && !message.imageUrl && (
              <div className="mt-2">
                <a
                  href={message.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 p-2 rounded-md ${
                    isCurrentUser ? "bg-primary-foreground/20" : "bg-background"
                  }`}
                >
                  <FileText className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.fileName || "Dosya"}</p>
                    <p className="text-xs text-muted-foreground">{message.fileType || "Bilinmeyen dosya türü"}</p>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            )}
          </div>

          {/* Zaman bilgisi */}
          <span
            className={`text-[10px] text-muted-foreground mt-1 ${
              isCurrentUser ? "mr-1" : "ml-1"
            } opacity-70 group-hover:opacity-100`}
          >
            {formatMessageTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default MessageItem

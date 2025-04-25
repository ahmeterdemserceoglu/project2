"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { subscribeToUserStatus } from "@/lib/user-status"
import type { UserStatus } from "@/lib/user-status"

interface UserStatusBadgeProps {
  userId: string
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ userId, showLabel = false, size = "md" }) => {
  const [status, setStatus] = useState<UserStatus | null>(null)
  const [lastActive, setLastActive] = useState<Date | null>(null)

  useEffect(() => {
    if (!userId) return

    // Kullanıcı durumuna abone ol
    const unsubscribe = subscribeToUserStatus(userId, (statusData) => {
      if (statusData) {
        setStatus(statusData.status)
        setLastActive(statusData.lastChanged)
      } else {
        setStatus("offline")
        setLastActive(null)
      }
    })

    return () => unsubscribe()
  }, [userId])

  // Son aktif zamanı formatla
  const formatLastActive = () => {
    if (!lastActive) return "Bilinmiyor"

    const now = new Date()
    const diffMs = now.getTime() - lastActive.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return "Şimdi"
    if (diffMins < 60) return `${diffMins} dakika önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    return `${diffDays} gün önce`
  }

  // Durum yok ise gösterme
  if (!status) return null

  // Durum renklerini ve metinlerini belirle
  const statusConfig = {
    online: {
      color: "bg-green-500",
      text: "Çevrimiçi",
      tooltip: "Çevrimiçi",
    },
    offline: {
      color: "bg-gray-400",
      text: "Çevrimd��şı",
      tooltip: lastActive ? `Son görülme: ${formatLastActive()}` : "Çevrimdışı",
    },
    away: {
      color: "bg-yellow-500",
      text: "Uzakta",
      tooltip: "Uzakta",
    },
  }

  const config = statusConfig[status]

  // Boyut sınıflarını belirle
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
    lg: "h-3 w-3",
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5">
            <div className={`${sizeClasses[size]} ${config.color} rounded-full animate-pulse`} />
            {showLabel && <span className="text-xs text-muted-foreground">{config.text}</span>}
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {config.tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default UserStatusBadge

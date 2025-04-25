"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { PackageOpen } from "lucide-react"
import type { ReactNode } from "react"

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  actionLabel?: string
  actionLink?: string
  action?: ReactNode
}

export function EmptyState({
  icon: Icon = PackageOpen,
  title,
  description,
  actionLabel,
  actionLink,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>

      {/* Render either the action element or the button with link */}
      {action ? (
        action
      ) : actionLabel && actionLink ? (
        <Button asChild>
          <Link href={actionLink}>{actionLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

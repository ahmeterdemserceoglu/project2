import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  BookOpen,
  Home,
  Search,
  PenToolIcon as Tool,
  Cpu,
  Dumbbell,
  Scissors,
  Music,
  type LucideIcon,
} from "lucide-react"

interface CategoryCardProps {
  icon: string
  title: string
  description: string
  href: string
}

// Map of icon names to Lucide components
const iconMap: Record<string, LucideIcon> = {
  tool: Tool,
  home: Home,
  "book-open": BookOpen,
  search: Search,
  cpu: Cpu,
  dumbbell: Dumbbell,
  scissors: Scissors,
  music: Music,
}

export default function CategoryCard({ icon, title, description, href }: CategoryCardProps) {
  // Get the icon component from the map, or use Search as fallback
  const IconComponent = iconMap[icon] || Search

  return (
    <Link href={href} className="block transition-transform hover:scale-105">
      <Card className="h-full">
        <CardHeader className="pb-2">
          <IconComponent className="h-8 w-8 text-primary" />
          <CardTitle className="text-xl">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

"use client"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function JoinSection() {
  const { user } = useAuth()

  // Kullanıcı giriş yapmışsa bu bölümü gösterme
  if (user) {
    return null
  }

  return (
    <section className="bg-primary/10 py-12">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Hemen Katıl</h2>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Eşyalarını paylaşarak veya ihtiyacın olan eşyaları ödünç alarak sürdürülebilir bir topluluk oluşturmaya
            katkıda bulun.
          </p>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button asChild size="lg" className="gap-1">
              <Link href="/auth/register">
                Üye Ol
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

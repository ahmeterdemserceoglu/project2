import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AuthProvider } from "@/context/auth-context"
import { LiveSupport } from "@/components/live-support"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Anında Ortak Yaşam",
  description: "Eşyalarınızı paylaşın, ihtiyacınız olanı ödünç alın",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <LiveSupport />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

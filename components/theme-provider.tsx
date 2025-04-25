"use client"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Tema değişikliklerinin tarayıcıda saklanmasını sağlar
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="aninda-ortak-yasam-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

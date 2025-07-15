import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

// Import polyfills for server-side rendering
import "@/lib/polyfills"

import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "next-themes"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Career Path Navigator",
  description: "AI-powered career discovery platform",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.min.js"></script>
      </head>
      <body className={`${inter.className} `}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SidebarProvider>
            <div className="flex min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <main className="flex-1 p-6 pb-24 md:pb-6 overflow-x-hidden">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

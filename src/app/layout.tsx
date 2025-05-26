import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

import { SidebarProvider } from "@/components/ui/sidebar"

import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "next-themes"
import TransparentNavbar from "@/components/header"

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
      <body className={inter.className}>
   <TransparentNavbar />
          
            <div className="flex min-h-screen">
           
              <div className="flex-1 flex flex-col">
                
            
                <main className="flex-1">{children}</main>
              </div>
            </div>
     

      </body>
    </html>
  )
}

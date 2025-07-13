import type React from "react"
import type { Metadata } from "next"
import { Inter, Crimson_Text } from "next/font/google"
import "./globals.css"

import { SidebarProvider } from "@/components/ui/sidebar"

import { ThemeToggle } from "@/components/theme-toggle"
import { ThemeProvider } from "next-themes"
import TransparentNavbar from "@/components/header"

const inter = Inter({ subsets: ["latin"] })
const crimsonText = Crimson_Text({ 
  subsets: ["latin"], 
  weight: ["400", "600", "700"],
  variable: "--font-serif"
})

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
      <body className={`${inter.className} ${crimsonText.variable}`}>
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

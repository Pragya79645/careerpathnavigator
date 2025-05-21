"use client"

import { Home, LayoutDashboard, FileText, Mic, Map, LogIn, Menu, X, BookOpen, Briefcase, Lightbulb, Target } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// Menu items
const items = [
   {
    title: "SignUp/SignIn",
    url: "/auth",
    icon: LogIn,
  },
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  
  {
    title: "Resume Analyzer",
    url: "/resume-analyzer",
    icon: FileText,
  },

  {
    title: "Company Targeted",
    url: "/company-target",
    icon: Target,
  },
  {
    title: "Prep For Your Interview",
    url: "/interview-questions",
    icon: LayoutDashboard,
  },
 
  {
    title: "Ask Groq",
    url: "/askGroq",
    icon: Mic,
  },
  {
    title: "Career Counselor",
    url: "/counselor",
    icon: Lightbulb,
  },

  {
    title: "WorkFlow Manager",
    url: "/WorkflowManager",
    icon: Map,
  },
 
]

export function AppSidebar() {
  const pathname = usePathname()
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()

  return (
    <>
      <div className="fixed left-3 top-8 z-50 md:hidden">
        <SidebarTrigger 
          className="bg-indigo-500/70 text-white backdrop-blur-md transition-all duration-300 hover:bg-indigo-600/80 hover:shadow-lg hover:shadow-indigo-500/30" 
        />
      </div>
      <Sidebar
        variant="floating"
        className="border-r border-indigo-300/60 bg-white dark:bg-indigo-950 transition-all duration-300"
      >
        <SidebarHeader className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Avatar className="border-2 border-indigo-400 shadow-sm transition-all duration-300 hover:border-indigo-500 hover:shadow-md hover:shadow-teal-500/20">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-teal-400 text-white">PP</AvatarFallback>
            </Avatar>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text font-medium text-transparent transition-all duration-300 hover:from-indigo-500 hover:to-indigo-600">
              PathPILOT
            </div>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpenMobile(false)}>
            {openMobile ? <X className="h-5 w-5 text-indigo-600" /> : <Menu className="h-5 w-5 text-indigo-500" />}
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu className="mt-2">
            {items.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.url}
                  tooltip={item.title}
                  className="group my-1 rounded-md transition-all duration-300 hover:bg-indigo-100 dark:hover:bg-indigo-800/60 hover:shadow-sm"
                >
                  <a href={item.url} className="flex items-center gap-3 px-3 py-2">
                    <item.icon
                      className={`h-5 w-5 transition-all duration-300 ${
                        pathname === item.url
                          ? "text-indigo-600 dark:text-indigo-400 font-bold"
                          : "text-black group-hover:text-indigo-500 dark:text-black font-bold text-2xl"
                      }`}
                    />
                    <span
                      className={`transition-all duration-300 ${
                        pathname === item.url
                          ? "bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text font-medium text-transparent"
                          : "text-black group-hover:text-indigo-500 dark:text-black"
                      }`}
                    >
                      {item.title}
                    </span>
                    {pathname === item.url && (
                      <div className="absolute inset-y-0 right-0 w-1 rounded-l-md bg-teal-500" />
                    )}
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4">
          <div className="bg-gradient-to-r from-indigo-600/80 to-indigo-400/80 bg-clip-text text-xs text-transparent transition-all duration-300 hover:from-indigo-500/80 hover:to-indigo-600/80">
            © 2025 Career Path Navigator
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
"use client"

import { 
  Home, 
  LayoutDashboard, 
  FileText, 
  Mic, 
  Map, 
  LogIn, 
  Menu, 
  X, 
  BookOpen, 
  Briefcase, 
  Lightbulb, 
  Target,
  MessageSquare,
  User,
  Settings,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Route,
  ChevronRight,
  Sparkles,
  Code,
  Compass
} from "lucide-react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"

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

// Menu items organized by category
const mainItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
    description: "Dashboard overview"
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    description: "Career insights"
  },
]

const careerItems = [
  {
    title: "Resume Analyzer",
    url: "/resume-analyzer",
    icon: FileText,
    description: "AI-powered analysis"
  },
    {
    title: "GitGaze",
    url: "/portfolioranker",
    icon: Code,
    description: "AI-powered analysis"
  },
  {
    title: "Career Counselor",
    url: "/counselor",
    icon: Lightbulb,
    description: "Expert guidance"
  },
  {
    title: "Career Path",
    url: "/path",
    icon: Compass,
    description: "Plan your journey"
  },
  {
    title: "Roadmap",
    url: "/roadmap",
    icon: Map,
    description: "Visual progress"
  },
]

const jobItems = [
  {
    title: "Company Target",
    url: "/company-target",
    icon: Target,
    description: "Find your match"
  },
  {
    title: "Interview Prep",
    url: "/interview-questions",
    icon: MessageSquare,
    description: "Practice questions"
  },
  {
    title: "Failure Analysis",
    url: "/failureAnalyser",
    icon: AlertTriangle,
    description: "Learn & improve"
  },
]

const toolItems = [
  {
    title: "Ask Gen AI",
    url: "/askGroq",
    icon: Sparkles,
    description: "AI assistant"
  },
 
  {
    title: "Workflow Manager",
    url: "/WorkflowManager",
    icon: Settings,
    description: "Organize tasks"
  },

]

const authItems = [
  {
    title: "Sign In",
    url: "/auth",
    icon: LogIn,
    description: "Access your account"
  },
 
]

// Mobile bottom nav items (most important)
const mobileNavItems = [
  { title: "Home", url: "/", icon: Home },
  { title: "Resume", url: "/resume-analyzer", icon: FileText },
  { title: "Jobs", url: "/company-target", icon: Target },
  { title: "AI Chat", url: "/askGroq", icon: Sparkles },
  { title: "Profile", url: "/auth", icon: User },
]

// Component for rendering menu sections
const MenuSection = ({ title, items, pathname }: { title: string, items: any[], pathname: string }) => (
  <div className="mb-6">
    <h3 className="mb-3 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-1">
      {items.map((item) => (
        <motion.div
          key={item.title}
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <Link href={item.url}>
            <div className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${
              pathname === item.url
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                : "hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:text-indigo-600"
            }`}>
              <item.icon className={`h-5 w-5 transition-all duration-200 ${
                pathname === item.url
                  ? "text-white"
                  : "text-gray-500 group-hover:text-indigo-500"
              }`} />
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-sm ${
                  pathname === item.url ? "text-white" : ""
                }`}>
                  {item.title}
                </div>
                {item.description && (
                  <div className={`text-xs opacity-75 ${
                    pathname === item.url ? "text-white/80" : "text-gray-500"
                  }`}>
                    {item.description}
                  </div>
                )}
              </div>
              {pathname === item.url && (
                <ChevronRight className="h-4 w-4 text-white/80" />
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  </div>
)

// Mobile Bottom Navigation Component
const MobileBottomNav = ({ pathname }: { pathname: string }) => {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setIsVisible(lastScrollY > currentScrollY || currentScrollY < 10)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="fixed bottom-4 left-4 right-4 z-50 md:hidden"
        >
          <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 rounded-2xl shadow-xl shadow-black/10 px-2 py-3">
            <div className="flex items-center justify-around">
              {mobileNavItems.map((item) => (
                <Link key={item.title} href={item.url}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                      pathname === item.url
                        ? "text-indigo-600"
                        : "text-gray-600 hover:text-indigo-500"
                    }`}
                  >
                    {pathname === item.url && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-indigo-50 rounded-xl"
                        transition={{ duration: 0.2 }}
                      />
                    )}
                    <item.icon className={`h-5 w-5 relative z-10 ${
                      pathname === item.url ? "text-indigo-600" : ""
                    }`} />
                    <span className={`text-xs font-medium relative z-10 ${
                      pathname === item.url ? "text-indigo-600" : ""
                    }`}>
                      {item.title}
                    </span>
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { toggleSidebar, openMobile, setOpenMobile } = useSidebar()

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav pathname={pathname} />
      
      {/* Desktop Sidebar Toggle */}
      <div className="fixed left-4 top-4 z-50 md:hidden">
        <SidebarTrigger className="bg-white/90 backdrop-blur-xl border border-gray-200/50 text-gray-700 shadow-lg hover:bg-white/95 hover:shadow-xl transition-all duration-300" />
      </div>

      {/* Main Sidebar */}
      <Sidebar
        variant="floating"
        className="border-r-0 bg-white/80 backdrop-blur-xl dark:bg-gray-950/80 transition-all duration-300 hidden md:flex"
      >
        <SidebarHeader className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Image 
                src="/logo.jpg" 
                alt="Career Path Navigator" 
                width={48} 
                height={48} 
                className="rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300"
              />
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur" />
            </div>
            <div className="flex flex-col">
              <div className="font-bold text-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Career Navigator
              </div>
              <div className="text-xs text-gray-500 font-medium">
                AI-Powered Career Growth
              </div>
            </div>
          </Link>
        </SidebarHeader>

        <SidebarContent className="px-4 py-6 space-y-2 overflow-y-auto scrollbar-hide">
          <MenuSection title="Overview" items={mainItems} pathname={pathname} />
          <MenuSection title="Career Development" items={careerItems} pathname={pathname} />
          <MenuSection title="Job Search" items={jobItems} pathname={pathname} />
          <MenuSection title="AI Tools" items={toolItems} pathname={pathname} />
          <MenuSection title="Account" items={authItems} pathname={pathname} />
        </SidebarContent>

        <SidebarFooter className="p-6 border-t border-gray-100 dark:border-gray-800">
          <div className="text-center space-y-2">
            <div className="bg-gradient-to-r from-indigo-600/80 to-purple-600/80 bg-clip-text text-xs font-semibold text-transparent">
              © 2025 Career Navigator
            </div>
            <div className="text-xs text-gray-500">
              Navigate Your Future with AI
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  )
}
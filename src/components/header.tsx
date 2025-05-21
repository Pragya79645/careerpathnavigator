"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { LogIn, Home, FileText, Target, LayoutDashboard, Mic, Lightbulb, Map, MoreHorizontal } from 'lucide-react'

const TransparentNavbar = () => {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [moreMenuOpen, setMoreMenuOpen] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }

        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    // Navigation items with icons
    const items = [
        {
            title: "SignUp",
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
            title: "Prep For Interview",
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
            title: "Workflow Manager",
            url: "/WorkflowManager",
            icon: Map,
        },
    ]

    return (
        <>
            <motion.div
                className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
                    scrolled ? "w-5/6 md:w-3/4 lg:w-2/3" : "w-11/12 md:w-4/5 lg:w-3/4"
                }`}
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            >
                <motion.div
                    className={`rounded-full px-4 md:px-6 lg:px-8 py-3 ${
                        scrolled
                            ? "bg-indigo-300 border border-[#4DB6AC] backdrop-blur-md shadow-lg"
                            : "bg-[#cbacec] backdrop-blur-md shadow-lg"
                    }`}
                    whileHover={{ scale: 1.02 }}
                >
                    <div className="flex items-center justify-between">
                        <Link href="/">
                            <motion.div
                                className="flex items-center cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <motion.div
                                    className="hidden sm:block"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3, duration: 0.5 }}
                                >
                                    <h1 className="text-white font-extrabold text-xs tracking-wider">
                                        Path<span className="text-[#110e6c]">PILOT</span> 
                                    </h1>
                                </motion.div>
                            </motion.div>
                        </Link>

                        {/* Desktop Nav - EXTRA LARGE SCREENS ONLY (1280px+) */}
                        <nav className="hidden xl:flex items-center space-x-3">
                            {/* Show all items on extra large screens */}
                            {items.map((item, index) => (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="flex items-center text-black hover:text-[#3DEFE9] transition-colors duration-300 text-sm font-bold py-1 px-2"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index + 0.5, duration: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1.5 relative z-10"
                                    >
                                        {item.icon && <item.icon className="w-4 h-4" />}
                                        {item.title}
                                    </motion.div>
                                </Link>
                            ))}
                        </nav>
                        
                        {/* Large Screens (1024px-1279px) */}
                        <nav className="hidden lg:flex xl:hidden items-center space-x-2">
                            {/* Show first 6 items on large screens */}
                            {items.slice(0, 6).map((item, index) => (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="flex items-center text-black hover:text-[#3DEFE9] transition-colors duration-300 text-xs font-bold py-1 px-1.5"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index + 0.5, duration: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1 relative z-10"
                                    >
                                        {item.icon && <item.icon className="w-3 h-3" />}
                                        {item.title}
                                    </motion.div>
                                </Link>
                            ))}
                            
                            {/* More Menu for large screens */}
                            <div className="relative">
                                <motion.button
                                    className="flex items-center text-black hover:text-[#3DEFE9] transition-colors duration-300 text-xs font-bold py-1 px-1.5"
                                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div className="flex items-center gap-1 relative z-10">
                                        <MoreHorizontal className="w-3 h-3" />
                                        <span>More</span>
                                    </motion.div>
                                </motion.button>
                                
                                <AnimatePresence>
                                    {moreMenuOpen && (
                                        <motion.div
                                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-50"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="py-1 rounded-md bg-white shadow-xs">
                                                {items.slice(6).map((item, index) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.url}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100"
                                                        onClick={() => setMoreMenuOpen(false)}
                                                    >
                                                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </nav>
                        
                        {/* Tablet Nav - MEDIUM SCREENS ONLY */}
                        <nav className="hidden md:flex lg:hidden items-center space-x-1.5">
                            {/* Show first 4 items on medium screens */}
                            {items.slice(0, 4).map((item, index) => (
                                <Link
                                    key={item.title}
                                    href={item.url}
                                    className="flex items-center text-black hover:text-[#3DEFE9] transition-colors duration-300 text-xs font-bold py-1 px-1.5"
                                >
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 * index + 0.5, duration: 0.3 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="flex items-center gap-1 relative z-10"
                                    >
                                        {item.icon && <item.icon className="w-3 h-3" />}
                                        <span>{item.title}</span>
                                    </motion.div>
                                </Link>
                            ))}
                            
                            {/* More Menu for tablet devices */}
                            <div className="relative">
                                <motion.button
                                    className="flex items-center text-black hover:text-[#3DEFE9] transition-colors duration-300 text-xs font-bold py-1 px-1.5"
                                    onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <motion.div className="flex items-center gap-1 relative z-10">
                                        <MoreHorizontal className="w-3 h-3" />
                                        <span>More</span>
                                    </motion.div>
                                </motion.button>
                                
                                <AnimatePresence>
                                    {moreMenuOpen && (
                                        <motion.div
                                            className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-50"
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            exit={{ y: -20, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div className="py-1 rounded-md bg-white shadow-xs">
                                                {items.slice(4).map((item, index) => (
                                                    <Link
                                                        key={item.title}
                                                        href={item.url}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100"
                                                        onClick={() => setMoreMenuOpen(false)}
                                                    >
                                                        {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                                                        {item.title}
                                                    </Link>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </nav>

                        {/* Mobile Toggle */}
                        <div className="md:hidden">
                            <motion.button
                                className="text-white p-2"
                                onClick={() => setMenuOpen(!menuOpen)}
                                whileTap={{ scale: 0.9 }}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <div className="w-6 h-6 flex flex-col justify-center items-center">
                                    <motion.span
                                        className="w-5 h-0.5 bg-white mb-1 block"
                                        animate={menuOpen ? { rotate: 45, y: 5 } : { rotate: 0, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.span
                                        className="w-5 h-0.5 bg-white mb-1 block"
                                        animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                    <motion.span
                                        className="w-5 h-0.5 bg-white block"
                                        animate={menuOpen ? { rotate: -45, y: -5 } : { rotate: 0, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Mobile Menu - Floating Above */}
                <AnimatePresence>
                    {menuOpen && (
                        <motion.div
                            className="md:hidden absolute top-full mt-2 left-0 right-0 z-40"
                            initial={{ y: -20, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -20, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="mx-2 bg-black/90 backdrop-blur-md rounded-lg shadow-xl border border-gray-800 p-4">
                                {items.map((item, index) => (
                                    <Link
                                        key={item.title}
                                        href={item.url}
                                        className="flex items-center py-3 text-gray-300 hover:text-[#3DEFE9] transition-colors duration-300 text-sm"
                                        onClick={() => setMenuOpen(false)}
                                    >
                                        <motion.div
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{ x: 0, opacity: 1 }}
                                            transition={{ delay: 0.05 * index, duration: 0.2 }}
                                            className="flex items-center gap-1 w-full"
                                        >
                                            {item.icon && <item.icon className="w-5 h-5" />}
                                            {item.title}
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </>
    )
}

export default TransparentNavbar
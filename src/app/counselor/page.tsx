"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Send,
  Loader2,
  Briefcase,
  Sparkles,
  ChevronRight,
  MessageSquare,
  Lightbulb,
  TrendingUp,
  Zap,
  BarChart,
  Compass,
  Menu,
  X,
  Plus,
  Archive,
  Star,
  Clock,
  Trash2,
  Wind,
  Timer,
  Heart,
  Brain,
  Activity,
  Coffee,
  BookOpen,
  Target,
  Battery,
  Smile,
  ExternalLink,
  Play,
  Headphones,
  Smartphone,
} from "lucide-react"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore"
import { initializeApp } from "firebase/app"

// Your Firebase configuration
// Replace these with your actual Firebase config

// Firebase configuration
const firebaseConfig = {
  // Replace with your Firebase config
  apiKey: "AIzaSyAxm7qtwA-HnVlbNa0nbvkJ2GVDku38VIQ",
  authDomain: "careerpathnavigator-8783c.firebaseapp.com",
  projectId: "careerpathnavigator-8783c",
  storageBucket: "careerpathnavigator-8783c.firebasestorage.app",
  messagingSenderId: "411185912011",
  appId: "1:411185912011:web:03fb1b13a0aae0fe33634e",
  measurementId: "G-F14VF8W9RJ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const auth = getAuth(app)

export default function CareerCounselor() {
  const [question, setQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [wellnessSuggestions, setWellnessSuggestions] = useState<any[]>([])
  const [showWellnessSuggestions, setShowWellnessSuggestions] = useState(false)
  const [archivedChats, setArchivedChats] = useState<
    { id: string; date: Date; preview: string; messages: { role: string; content: string }[] }[]
  >([])
  const [showArchive, setShowArchive] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoadingChats, setIsLoadingChats] = useState(false)

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        // Load archived chats from Firebase when user logs in
        loadArchivedChats(currentUser.uid)
      } else {
        // Clear archived chats when user logs out
        setArchivedChats([])
      }
    })

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  // Load archived chats from Firebase
  const loadArchivedChats = async (userId: string) => {
    setIsLoadingChats(true)
    try {
      const q = query(collection(db, "previous"), where("userId", "==", userId))
      const querySnapshot = await getDocs(q)
      
      const chats = querySnapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          date: data.date.toDate(),
          preview: data.preview,
          messages: data.messages,
          userId: data.userId
        }
      })
      
      setArchivedChats(chats)
    } catch (error) {
      console.error("Error loading archived chats:", error)
    } finally {
      setIsLoadingChats(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!question.trim()) return

    setIsLoading(true)

    // Add user question to chat history
    const updatedHistory = [...chatHistory, { role: "user", content: question }]

    setChatHistory(updatedHistory)

    try {
      const result = await fetch("/api/career-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedHistory,
        }),
      })

      const data = await result.json()

      // Add AI response to chat history
      setChatHistory([...updatedHistory, { role: "assistant", content: data.response }])

      // Update wellness suggestions if provided
      if (data.wellnessSuggestions && data.wellnessSuggestions.length > 0) {
        setWellnessSuggestions(data.wellnessSuggestions)
        setShowWellnessSuggestions(true)
      }

      setQuestion("")
    } catch (error) {
      console.error("Error fetching career advice:", error)
      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: "Sorry, there was an error processing your request. Please try again." },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  async function archiveAndClearChat() {
    if (chatHistory.length > 0) {
      // Create a preview from the first user message or first few characters
      const userMessage = chatHistory.find((msg) => msg.role === "user")?.content || ""
      const preview = userMessage.length > 30 ? userMessage.substring(0, 30) + "..." : userMessage

      // Create a new archived chat
      const newArchivedChat = {
        id: Date.now().toString(),
        date: new Date(),
        preview: preview || "Conversation",
        messages: [...chatHistory],
      }

      // Add to local archived chats
      setArchivedChats((prev) => [newArchivedChat, ...prev])

      // If user is signed in, save to Firebase
      if (user) {
        try {
          const chatData = {
            userId: user.uid,
            date: new Date(),
            preview: preview || "Conversation",
            messages: [...chatHistory]
          }
          
          // Add to 'previous' collection
          await addDoc(collection(db, "previous"), chatData)
          
          // Optionally update the user document in 'users' collection to reference this chat
          // This creates a relation between users and their chats
          const userRef = doc(db, "users", user.uid)
          await updateDoc(userRef, {
            previousChats: arrayUnion(newArchivedChat.id)
          })
          
          // Refresh the archived chats from Firebase
          loadArchivedChats(user.uid)
        } catch (error) {
          console.error("Error saving chat to Firebase:", error)
        }
      }
    }

    // Clear current chat
    setChatHistory([])
    setQuestion("")
    setWellnessSuggestions([])
    setShowWellnessSuggestions(false)
  }

  async function deleteChat(chatId: string, e: React.MouseEvent) {
    e.stopPropagation() // Prevent the chat from being restored when delete is clicked
    
    try {
      if (user) {
        // Delete from Firebase
        await deleteDoc(doc(db, "previous", chatId))
      }
      
      // Delete from local state
      setArchivedChats((prev) => prev.filter((chat) => chat.id !== chatId))
    } catch (error) {
      console.error("Error deleting chat:", error)
    }
  }

  function restoreChat(chatId: string) {
    // Find the chat to restore
    const chatToRestore = archivedChats.find((chat) => chat.id === chatId)

    if (chatToRestore) {
      // If there's a current conversation, archive it first
      if (chatHistory.length > 0) {
        archiveAndClearChat()
      }

      // Restore the selected chat
      setChatHistory(chatToRestore.messages)
      setWellnessSuggestions([])
      setShowWellnessSuggestions(false)

      // Remove from archived chats only if user is not signed in
      // For signed-in users, we keep it in both places
      if (!user) {
        setArchivedChats((prev) => prev.filter((chat) => chat.id !== chatId))
      }
    }
  }

  // Simplified formatMessage function with clean formatting and only highlight headings
  const formatMessage = (content: string) => {
    let formattedContent = content

    // Format emphasis (colons) but with more subtle styling
    formattedContent = formattedContent.replace(/:([^:]+):/g, '<span class="font-medium text-purple-700">$1</span>')

    // Format special sections with simpler styling
    formattedContent = formattedContent
      .replace(
        /ACTION: (.*?)(?=\n|$)/g,
        '<div class="bg-purple-50/50 p-3 my-2 rounded-lg border-l-2 border-purple-400 backdrop-blur-sm shadow-sm"><span class="font-medium">Action:</span> $1</div>',
      )
      .replace(
        /TIP: (.*?)(?=\n|$)/g,
        '<div class="bg-teal-50/50 p-3 my-2 rounded-lg border-l-2 border-teal-400 backdrop-blur-sm shadow-sm"><span class="font-medium">Tip:</span> $1</div>',
      )
      .replace(
        /NOTE: (.*?)(?=\n|$)/g,
        '<div class="bg-blue-50/50 p-3 my-2 rounded-lg border-l-2 border-blue-400 backdrop-blur-sm shadow-sm"><span class="font-medium">Note:</span> $1</div>',
      )
      .replace(
        /EXAMPLE: (.*?)(?=\n|$)/g,
        '<div class="bg-amber-50/50 p-3 my-2 rounded-lg border-l-2 border-amber-400 backdrop-blur-sm shadow-sm"><span class="font-medium">Example:</span> $1</div>',
      )

    // Clean up formatting for lists
    const processList = (text: string) => {
      const lines = text.split("\n")

      for (let i = 0; i < lines.length; i++) {
        // Fix empty bullet points
        if (lines[i].match(/^-\s*$/)) {
          lines[i] = "- [This point needs attention]"
        }

        // Fix empty numbered list items
        const match = lines[i].match(/^(\d+)\.\s*$/)
        if (match) {
          lines[i] = `${match[1]}. [This point needs attention]`
        }
      }

      return lines.join("\n")
    }

    formattedContent = processList(formattedContent)

    // Format bullet lists with simpler styling
    formattedContent = formattedContent
      .replace(/^- (.*?)$/gm, "<li>$1</li>")
      .replace(/(<li>.*?<\/li>(?:\r?\n|)+)+/g, '<ul class="list-disc pl-5 my-2 space-y-1">$&</ul>')

    // Format numbered lists with simpler styling
    formattedContent = formattedContent
      .replace(/^\d+\. (.*?)$/gm, "<li>$1</li>")
      .replace(/(<li>.*?<\/li>(?:\r?\n|)+)+/g, (match) => {
        // Only convert to ordered list if it hasn't already been wrapped in a ul
        if (!match.includes('<ul class="list-disc')) {
          return '<ol class="list-decimal pl-5 my-2 space-y-1">' + match + "</ol>"
        }
        return match
      })

    // Highlight headings with a clean style
    formattedContent = formattedContent
      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-semibold mt-3 mb-2 text-purple-700">$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold mt-4 mb-2 text-purple-800">$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-3 text-purple-900">$1</h1>')

    // Format paragraphs with reasonable spacing
    formattedContent = formattedContent.replace(
      /^(?!<[houil][l123]|<li|<div|<p|<h[123])(.+?)$/gm,
      '<p class="mb-2">$1</p>',
    )

    // Clean up any remaining newlines between HTML elements
    formattedContent = formattedContent.replace(/>\n+</g, "><")

    return formattedContent
  }

  // Helper function to get icon component by name
  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      Wind,
      Timer,
      Heart,
      Brain,
      Activity,
      Coffee,
      BookOpen,
      Target,
      Battery,
      Smile,
      Sparkles,
      Lightbulb,
      Zap,
      BarChart,
      TrendingUp,
      default: Sparkles
    }
    return icons[iconName] || icons.default
  }

  // Helper function to get color classes
  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: { bg: string; border: string; text: string; icon: string } } = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-600' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-600' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' },
      teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', icon: 'text-teal-600' },
      amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-600' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700', icon: 'text-pink-600' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', icon: 'text-orange-600' },
      red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: 'text-red-600' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-600' },
      cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', icon: 'text-cyan-600' },
      yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-600' },
      emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-600' },
      rose: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', icon: 'text-rose-600' },
      default: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-600' }
    }
    return colorMap[color] || colorMap.default
  }

  // Function to dismiss wellness suggestions
  const dismissWellnessSuggestions = () => {
    setShowWellnessSuggestions(false)
  }

  // Add custom scrollbar styles
  const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #c4b5fd;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #a78bfa;
  }
  `

  return (
    <div className="flex flex-col min-h-screen bg-white mt-22">
      <style jsx>{customScrollbarStyles}</style>
      <header className="bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 shadow-lg sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm mr-3">
              <Compass className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">PathPILOT</h1>
              <div className="hidden md:flex items-center text-xs text-purple-100">
                <Sparkles className="h-3 w-3 mr-1" />
                <p>AI-powered career guidance</p>
              </div>
            </div>
          </div>
          
          {/* User status indicator */}
          {user && (
            <div className="hidden md:flex items-center text-xs bg-white/10 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span>{user.email}</span>
            </div>
          )}
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {wellnessSuggestions.length > 0 && (
              <button
                onClick={() => setShowWellnessSuggestions(!showWellnessSuggestions)}
                className="bg-green-500/20 hover:bg-green-600/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/10"
              >
                <Sparkles className="h-4 w-4" />
                <span>Wellness Tips</span>
              </button>
            )}
            <button
              onClick={archiveAndClearChat}
              className="bg-teal-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all backdrop-blur-sm border border-white/10"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden bg-purple-500/20 p-2 rounded-lg" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-purple-700 shadow-lg p-4 z-20 flex flex-col space-y-3 border-t border-white/10">
            {user && (
              <div className="flex items-center text-xs bg-white/10 px-3 py-2 rounded-lg mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span>{user.email}</span>
              </div>
            )}
            <button
              onClick={() => {
                archiveAndClearChat();
                setMobileMenuOpen(false);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Chat</span>
            </button>
            <button
              onClick={() => {
                setShowArchive(!showArchive);
                setMobileMenuOpen(false);
              }}
              className="bg-purple-500/20 hover:bg-purple-600/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <Archive className="h-4 w-4" />
              <span>Archives</span>
            </button>
            {wellnessSuggestions.length > 0 && (
              <button
                onClick={() => {
                  setShowWellnessSuggestions(!showWellnessSuggestions);
                  setMobileMenuOpen(false);
                }}
                className="bg-green-500/20 hover:bg-green-600/30 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Wellness Tips</span>
              </button>
            )}
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto p-4 max-w-5xl">
        {isLoadingChats && (
          <div className="bg-purple-100 rounded-xl p-4 mb-6 flex items-center justify-center">
            <Loader2 className="h-5 w-5 text-purple-600 animate-spin mr-2" />
            <span className="text-purple-600">Loading your previous conversations...</span>
          </div>
        )}
        
        <div className="bg-purple-100 rounded-xl shadow-lg p-6 mb-6 border border-gray-100 relative">
          <div className="relative z-10">
            <div className="flex flex-col space-y-6 mb-6">
              {chatHistory.length === 0 && (
                <div className="text-center py-12 px-4">
                  <div className="inline-flex items-center justify-center p-4 bg-purple-50 rounded-full mb-4">
                    <Lightbulb className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Your Career Journey Starts Here</h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    Ask about career paths, skill development, interview preparation, or any professional guidance you need.
                  </p>
                </div>
              )}

              {chatHistory.map((message, index) => (
                <div
                  key={index}
                  className={`rounded-xl relative ${
                    message.role === "user" ? "ml-4 md:ml-12" : "mr-4 md:mr-12"
                  }`}
                >
                  <div
                    className={`p-4 ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-100"
                        : "bg-gradient-to-r from-purple-50 to-purple-100/50 border border-purple-100"
                    } rounded-xl shadow-sm`}
                  >
                    <div className="flex items-center mb-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-teal-500 to-teal-600"
                            : "bg-gradient-to-br from-purple-500 to-purple-600"
                        } text-white font-medium mr-3`}
                      >
                        {message.role === "user" ? "U" : "AI"}
                      </div>
                      <p className="font-medium text-gray-800">
                        {message.role === "user" ? "You" : "Career Advisor"}
                      </p>
                      <div
                        className={`ml-auto text-xs px-2 py-1 rounded-md ${
                          message.role === "user" ? "bg-teal-100 text-teal-700" : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>

                    <div
                      className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about career paths, skills, interviews..."
                className="w-full p-4 pl-5 pr-16 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 shadow-sm"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white p-2 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-70 flex items-center justify-center w-10 h-10"
                disabled={isLoading || !question.trim()}
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </form>
          </div>
        </div>

        {/* Wellness Suggestions Section */}
        {showWellnessSuggestions && wellnessSuggestions.length > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg p-6 mb-6 border border-green-100 relative">
            <div className="absolute top-4 right-4">
              <button
                onClick={dismissWellnessSuggestions}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center mb-4">
              <div className="bg-gradient-to-r from-green-500 to-teal-500 p-2 rounded-lg mr-4">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Wellness Boost</h3>
                <p className="text-gray-600 text-sm">Quick suggestions to enhance your well-being</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wellnessSuggestions.map((suggestion, index) => {
                const IconComponent = getIconComponent(suggestion.icon)
                const colors = getColorClasses(suggestion.color)
                
                return (
                  <div
                    key={suggestion.id}
                    className={`${colors.bg} ${colors.border} border rounded-lg p-4 transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start">
                      <div className={`${colors.icon} mr-3 mt-1`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        {/* Empathy Message */}
                        {suggestion.empathyMessage && (
                          <div className="mb-3 p-2 bg-white/50 rounded-lg border-l-4 border-blue-400">
                            <p className="text-sm text-blue-700 font-medium italic">
                              💝 {suggestion.empathyMessage}
                            </p>
                          </div>
                        )}
                        
                        <h4 className={`font-semibold ${colors.text} mb-1`}>
                          {suggestion.title}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2 leading-relaxed">
                          {suggestion.description}
                        </p>
                        
                        {/* Tags */}
                        {suggestion.tags && suggestion.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {suggestion.tags.map((tag: string, tagIndex: number) => (
                              <span
                                key={tagIndex}
                                className={`text-xs px-2 py-1 rounded-full ${colors.text} bg-white/60 font-medium`}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${colors.text} font-medium px-2 py-1 rounded-full bg-white/50`}>
                            {suggestion.duration}
                          </span>
                          <button
                            onClick={() => {
                              console.log('Wellness suggestion clicked:', suggestion.type)
                            }}
                            className={`text-xs ${colors.text} hover:underline font-medium`}
                          >
                            Try it now →
                          </button>
                        </div>
                        <div className="mt-3 p-3 bg-white/30 rounded-lg">
                          <p className="text-xs text-gray-700 leading-relaxed mb-2">
                            <strong>Action:</strong> {suggestion.action}
                          </p>
                          
                          {/* Resources Section */}
                          {suggestion.resources && (
                            <div className="mt-3 space-y-2">
                              {suggestion.resources.youtube && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <Play className="h-3 w-3 mr-1 text-red-500" />
                                  <a 
                                    href={suggestion.resources.youtube}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:underline flex items-center"
                                  >
                                    Watch tutorial video
                                    <ExternalLink className="h-3 w-3 ml-1" />
                                  </a>
                                </div>
                              )}
                              
                              {suggestion.resources.sounds && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <Headphones className="h-3 w-3 mr-1 text-blue-500" />
                                  <span>Listen to: {suggestion.resources.sounds}</span>
                                </div>
                              )}
                              
                              {suggestion.resources.apps && (
                                <div className="flex items-center text-xs text-gray-600">
                                  <Smartphone className="h-3 w-3 mr-1 text-green-500" />
                                  <span>Try apps: {suggestion.resources.apps}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-4 text-center">
              <button
                onClick={dismissWellnessSuggestions}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Dismiss suggestions
              </button>
            </div>
            
            {/* Quick Resources Section */}
            <div className="mt-6 pt-4 border-t border-green-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Wellness Resources</h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <a
                  href="https://www.youtube.com/watch?v=inpok4MKVLM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Play className="h-3 w-3 mr-2 text-blue-500" />
                  5-Min Meditation
                </a>
                <a
                  href="https://www.youtube.com/watch?v=Ks-_Mh1QhMc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Heart className="h-3 w-3 mr-2 text-pink-500" />
                  You Are Enough
                </a>
                <a
                  href="https://www.youtube.com/watch?v=RqcOCBb4arc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Activity className="h-3 w-3 mr-2 text-teal-500" />
                  Work-Life Balance
                </a>
                <a
                  href="https://www.youtube.com/watch?v=tOAEEDMojRg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Zap className="h-3 w-3 mr-2 text-orange-500" />
                  Beat Procrastination
                </a>
              </div>
              
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                <a
                  href="https://www.youtube.com/watch?v=WPPPFqsECz0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <TrendingUp className="h-3 w-3 mr-2 text-green-500" />
                  Stop Comparing
                </a>
                <a
                  href="https://www.youtube.com/watch?v=DbDoBzGY3vo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Headphones className="h-3 w-3 mr-2 text-purple-500" />
                  Burnout Recovery
                </a>
                <a
                  href="https://www.youtube.com/watch?v=YRPh_GaiL8s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center p-3 bg-white/50 rounded-lg hover:bg-white/70 transition-colors text-xs text-gray-600"
                >
                  <Wind className="h-3 w-3 mr-2 text-blue-500" />
                  Breathing Exercise
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Previous Conversations Section */}
        {archivedChats.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
            <div className="relative z-10">
              <button
                onClick={() => setShowArchive(!showArchive)}
                className="flex items-center justify-between w-full"
              >
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-purple-500 to-teal-500 p-2 rounded-lg mr-4">
                    <Archive className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Previous Conversations</h2>
                    <p className="text-gray-500 text-sm">
                      {archivedChats.length} archived {archivedChats.length === 1 ? "conversation" : "conversations"}
                    </p>
                  </div>
                </div>
                <div className="bg-purple-100 rounded-lg p-1">
                  <ChevronRight
                    className={`h-5 w-5 text-purple-600 transition-transform duration-300 ${showArchive ? "rotate-90" : ""}`}
                  />
                </div>
              </button>

              {showArchive && (
                <div className="space-y-3 mt-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                  {archivedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="w-full p-4 rounded-lg transition-all bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 text-left flex items-center justify-between group"
                    >
                      <button
                        onClick={() => restoreChat(chat.id)}
                        className="flex items-start flex-1"
                      >
                        <div className="mr-3 mt-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800 mb-1 line-clamp-1">{chat.preview}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(chat.date).toLocaleDateString()} at{" "}
                            {new Date(chat.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </button>
                      
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => deleteChat(chat.id, e)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-purple-500 to-teal-500 p-2 rounded-lg mr-4">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800">Trending Topics</h2>
                <p className="text-gray-500 text-sm">Explore popular career questions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Career transitions", icon: <Zap className="h-4 w-4" /> },
                { title: "Resume building", icon: <BarChart className="h-4 w-4" /> },
                { title: "Interview preparation", icon: <MessageSquare className="h-4 w-4" /> },
                { title: "Skill development", icon: <TrendingUp className="h-4 w-4" /> },
                { title: "Work-life balance", icon: <Compass className="h-4 w-4" /> },
                { title: "Stress management", icon: <Heart className="h-4 w-4" /> },
                { title: "Productivity tips", icon: <Brain className="h-4 w-4" /> },
                { title: "Focus techniques", icon: <Target className="h-4 w-4" /> },
                { title: "Career burnout", icon: <Coffee className="h-4 w-4" /> },
                { title: "Salary negotiation", icon: <Zap className="h-4 w-4" /> },
                { title: "Remote work", icon: <Briefcase className="h-4 w-4" /> },
                { title: "Time management", icon: <Clock className="h-4 w-4" /> },
              ].map((topic, index) => (
                <button
                  key={index}
                  className="group p-4 text-left rounded-lg transition-all bg-gray-50 hover:bg-purple-50 border border-gray-100 hover:border-purple-200 flex items-center justify-between"
                  onClick={() => setQuestion(`I need advice on ${topic.title.toLowerCase()}`)}
                >
                  <div className="flex items-center">
                    <div className="mr-3 text-purple-500">{topic.icon}</div>
                    <span className="text-gray-800 font-medium">{topic.title}</span>
                  </div>
                  <div className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-50 border-t border-gray-100 py-6 px-6 mt-6">
        <div className="container mx-auto text-center">
          <div className="flex justify-center items-center mb-3">
            <div className="bg-gradient-to-r from-purple-500 to-teal-500 p-2 rounded-lg">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <h3 className="ml-2 text-lg font-bold text-gray-800">PathPILOT</h3>
          </div>
          <p className="text-gray-500 mb-1">© {new Date().getFullYear()} PathPILOT | Personalized career guidance</p>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Powered by advanced AI technology to help you navigate your professional journey
          </p>
        </div>
      </footer>
    </div>
  )
}
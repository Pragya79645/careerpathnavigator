"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Send, User, Bot } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hey boss! I'm your career assistant. What can I help you with today?",
    },
  ])
  const [inputValue, setInputValue] = useState("")

  const toggleRecording = () => {
    setIsRecording(!isRecording)
    if (!isRecording) {
      // Simulate voice recognition after 2 seconds
      setTimeout(() => {
        addMessage("user", "What skills should I learn to become a frontend developer?")
        setIsRecording(false)

        // Simulate assistant response after 1 more second
        setTimeout(() => {
          addMessage(
            "assistant",
            "Okay boss, here's your roadmap! For frontend development, focus on HTML, CSS, and JavaScript as your foundation. Then level up with React, TypeScript, and responsive design. Don't forget about version control with Git and basic UI/UX principles. Want me to create a detailed learning plan for you?",
          )
        }, 1000)
      }, 2000)
    }
  }

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [...prev, { role, content }])
  }

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      addMessage("user", inputValue)
      setInputValue("")

      // Simulate assistant response
      setTimeout(() => {
        addMessage(
          "assistant",
          "Great question! I'd recommend starting with the basics of HTML, CSS, and JavaScript. Then move on to learning a framework like React. Would you like me to create a personalized learning path for you?",
        )
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-4xl h-[calc(100vh-3.5rem)] flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-6"
      >
        <h1 className="text-3xl font-bold mb-2">Voice Assistant</h1>
        <p className="text-muted-foreground">Ask questions about your career path using your voice</p>
      </motion.div>

      <Card className="flex-1 flex flex-col overflow-hidden border-purple-500/20">
        <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}>
                    <Avatar className={message.role === "assistant" ? "bg-purple-500" : "bg-blue-500"}>
                      {message.role === "assistant" ? <Bot className="h-5 w-5" /> : <User className="h-5 w-5" />}
                      <AvatarFallback>{message.role === "assistant" ? "AI" : "ME"}</AvatarFallback>
                    </Avatar>
                    <div
                      className={`rounded-lg p-3 ${message.role === "user" ? "bg-blue-500 text-white" : "bg-muted"}`}
                    >
                      {message.content}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="Type your message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-purple-500/20 focus-visible:ring-purple-500"
              />
            </div>
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Send className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant={isRecording ? "destructive" : "default"}
              onClick={toggleRecording}
              className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-purple-500 hover:bg-purple-600"}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isRecording ? 1 : 0,
          scale: isRecording ? 1 : 0.8,
        }}
        className="fixed inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="relative">
          <div className={`absolute inset-0 rounded-full bg-purple-500/20 ${isRecording ? "animate-ping" : ""}`}></div>
          <div className="relative h-32 w-32 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Mic className="h-12 w-12 text-white" />
          </div>
        </div>
      </motion.div>
    </div>
  )
}

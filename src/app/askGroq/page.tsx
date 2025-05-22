'use client';
import { useState, useRef, useEffect } from "react";
import { Mic, Send, Terminal, User, Bot, ChevronDown, AlertCircle, Code, Zap } from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to the latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput("");
  
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: input }),
      });
  
      const data = await res.json();
  
      // Clean markdown formatting
      const cleanAnswer = data.answer
        .replace(/[*_`#>-]/g, '')
        .replace(/\n{2,}/g, '\n\n');
  
      const botMsg = { role: "bot", content: cleanAnswer };
      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Error fetching response:", error);
      const errorMsg = { role: "bot", content: "System error: Request failed. Please try again." };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition");
      return;
    }
    
    setIsRecording(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.onerror = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  // SVG Wave Pattern
  const WavePattern = () => (
    <svg className="absolute top-0 left-0 w-full h-20 opacity-5" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4f46e5" d="M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,176C672,149,768,107,864,112C960,117,1056,171,1152,197.3C1248,224,1344,224,1392,224L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
    </svg>
  );

  // Circuit SVG pattern
  const CircuitPattern = () => (
    <svg className="absolute bottom-0 right-0 w-64 h-64 opacity-5" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="40" stroke="#4f46e5" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="30" stroke="#4f46e5" strokeWidth="1" fill="none" />
      <circle cx="50" cy="50" r="20" stroke="#4f46e5" strokeWidth="1" fill="none" />
      <line x1="10" y1="50" x2="30" y2="50" stroke="#4f46e5" strokeWidth="1" />
      <line x1="70" y1="50" x2="90" y2="50" stroke="#4f46e5" strokeWidth="1" />
      <line x1="50" y1="10" x2="50" y2="30" stroke="#4f46e5" strokeWidth="1" />
      <line x1="50" y1="70" x2="50" y2="90" stroke="#4f46e5" strokeWidth="1" />
    </svg>
  );

  // Loading dots animation
  const LoadingDots = () => (
    <div className="flex space-x-1 items-center justify-center p-2">
      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
      <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></span>
    </div>
  );

  return (
    <div className="fixed inset-0 w-screen h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      {/* Main container with grid */}
      <div className="w-full max-w-5xl h-[90vh] grid grid-rows-[auto_1fr_auto] rounded-lg border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden relative">
        {/* Decorative patterns */}
        <WavePattern />
        <CircuitPattern />
        
        {/* Header */}
        <header className="px-6 py-4 border-b border-gray-800 bg-gray-900 flex items-center justify-between relative z-10 mt-16">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gradient-to-r from-teal-500 to-teal-600">
              <Terminal size={16} />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-purple-500">
                Groq Career Assistant
              </h1>
              <div className="flex items-center text-xs text-gray-400">
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1"></span>
                  System online
                </span>
              
               
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-400">
            <div className="flex items-center px-3 py-1 rounded-md bg-gray-800 border border-gray-700">
              <Code size={14} className="mr-2" />
            
            </div>
            <div className="flex items-center px-3 py-1 rounded-md bg-gray-800 border border-gray-700">
              <Zap size={14} className="mr-2" />
           
            </div>
          </div>
        </header>
        
        {/* Messages container */}
        <div className="overflow-y-auto px-4 py-2 bg-gradient-to-b from-gray-900 to-gray-950 relative z-10">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 p-1 mb-6">
                <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                  <Terminal size={30} className="text-teal-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Career Assistant Ready</h2>
              <p className="text-gray-400 text-center max-w-md mb-8">Ask me anything about career development, job searching, or professional growth</p>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { icon: <Code size={16} />, text: "Web Development Guidance" },
                  { icon: <User size={16} />, text: "Interview preparation" },
                  { icon: <ChevronDown size={16} />, text: "Salary negotiation" },
                  { icon: <AlertCircle size={16} />, text: "Industry trends" }
                ].map((item, i) => (
                  <button
                    key={i}
                    className="flex items-center p-3 bg-gray-800 hover:bg-gray-750 border border-gray-700 rounded-md text-left text-sm group"
                    onClick={() => setInput(item.text)}
                  >
                    <span className="mr-2 text-teal-400 group-hover:text-teal-300">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex space-x-3 max-w-[80%]">
                    {msg.role !== "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center">
                        <Bot size={16} className="text-gray-900" />
                      </div>
                    )}
                    
                    <div 
                      className={`py-3 px-4 rounded-lg ${
                        msg.role === "user" 
                        ? "bg-gradient-to-r from-purple-600/90 to-purple-700/90 border border-purple-500/20" 
                        : "bg-gradient-to-r from-teal-600/90 to-teal-700/90 border border-teal-500/20"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-purple-500 flex items-center justify-center">
                        <User size={16} className="text-gray-900" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-md bg-teal-500 flex items-center justify-center">
                      <Bot size={16} className="text-gray-900" />
                    </div>
                    <div className="py-3 px-4 rounded-lg bg-gradient-to-r from-teal-600/90 to-teal-700/90 border border-teal-500/20">
                      <LoadingDots />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input container */}
        <div className="p-4 border-t border-gray-800 bg-gray-900 relative">
          <div className="flex items-center space-x-2">
            <div className="flex-grow relative">
              <input
                ref={inputRef}
                type="text"
                className="w-full py-3 px-4 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-transparent placeholder-gray-500"
                placeholder={isRecording ? "Listening..." : "Type your career question..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isRecording}
              />
              
              {input.length > 0 && !isRecording && (
                <button 
                  onClick={() => setInput("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </button>
              )}
            </div>
            
            <button 
              onClick={startListening}
              className={`p-3 rounded-md ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-gray-800 border border-gray-700 text-purple-400 hover:text-purple-300 hover:bg-gray-750"
              }`}
              disabled={loading}
            >
              <Mic size={18} />
            </button>
            
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()} 
              className={`p-3 rounded-md bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white ${
                (loading || !input.trim()) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-500 text-center">
            <p>Groq Career Assistant • Built with technical excellence</p>
          </div>
        </div>
      </div>
    </div>
  );
}
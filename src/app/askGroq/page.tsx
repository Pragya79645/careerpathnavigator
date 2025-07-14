'use client';
import { useState, useRef, useEffect } from "react";
import { 
  Mic, Send, Terminal, User, Bot, ChevronDown, AlertCircle, Code, Zap, 
  Sun, Moon, ThumbsUp, ThumbsDown, Heart, RotateCcw, Sparkles, 
  FileText, CheckCircle, ArrowRight, BookOpen, Target, Lightbulb
} from 'lucide-react';

interface Message {
  role: string;
  content: string;
  tabContent?: {
    resources?: string[];
    nextSteps?: string[];
    examples?: string[];
  };
  tasks?: string[];
  id: string;
}

interface Reaction {
  messageId: string;
  type: 'like' | 'dislike' | 'love';
}

export default function GeminiCareerAssistant() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<{[key: string]: string}>({});
  const [typingText, setTypingText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Typing animation effect
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setTypingText("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setTypingText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        callback();
      }
    }, 20);
  };

  const processGeminiResponse = (text: string) => {
    const sections = text.split('\n\n');
    const tabContent = {
      resources: [] as string[],
      nextSteps: [] as string[],
      examples: [] as string[]
    };
    const tasks = [] as string[];
    let mainContent = text;

    // Extract resources
    const resourceMatch = text.match(/📚 Resources?:?\s*((?:[-•]\s*.*(?:\n|$))+)/i);
    if (resourceMatch) {
      tabContent.resources = resourceMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•]\s*/, ''));
    }

    // Extract next steps
    const nextStepsMatch = text.match(/📝 Next Steps?:?\s*((?:[-•]\s*.*(?:\n|$))+)/i);
    if (nextStepsMatch) {
      tabContent.nextSteps = nextStepsMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•]\s*/, ''));
    }

    // Extract examples
    const examplesMatch = text.match(/💡 Examples?:?\s*((?:[-•]\s*.*(?:\n|$))+)/i);
    if (examplesMatch) {
      tabContent.examples = examplesMatch[1].split('\n').filter(line => line.trim()).map(line => line.replace(/^[-•]\s*/, ''));
    }

    // Extract tasks
    const taskMatches = text.match(/✅ Task:?\s*(.*?)(?=\n|$)/gi);
    if (taskMatches) {
      tasks.push(...taskMatches.map(match => match.replace(/✅ Task:?\s*/i, '')));
    }

    return { mainContent, tabContent, tasks };
  };

  const generateFollowUpQuestions = (userInput: string) => {
    const questions = [
      "Want me to suggest 3 project ideas based on your skills?",
      "Should I check if your portfolio is industry-ready?",
      "Would you like me to create a learning roadmap for this topic?",
      "Shall I provide some interview questions for this area?",
      "Do you want specific resources for skill improvement?"
    ];
    
    return questions.slice(0, 2); // Return 2 random questions
  };

  const handleSend = async (customPrompt?: string) => {
    const prompt = customPrompt || input;
    if (!prompt.trim()) return;
    
    const userMsg: Message = { 
      role: "user", 
      content: prompt,
      id: Date.now().toString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setInput("");

    try {
      const enhancedPrompt = `
        You are a friendly AI career assistant named Gemini. Respond in a helpful, encouraging tone.
        
        Please structure your response with:
        1. A warm, conversational main answer
        2. If applicable, add sections for:
           📚 Resources: (list helpful resources)
           📝 Next Steps: (actionable next steps)
           💡 Examples: (relevant examples)
           ✅ Task: (specific mini-tasks to complete)
        
        Also suggest 1-2 follow-up questions at the end.
        
        User question: ${prompt}
      `;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: enhancedPrompt }),
      });

      const data = await res.json();
      const { mainContent, tabContent, tasks } = processGeminiResponse(data.answer);

      typeMessage(mainContent, () => {
        const botMsg: Message = { 
          role: "bot", 
          content: mainContent,
          tabContent: Object.keys(tabContent).some(key => tabContent[key as keyof typeof tabContent].length > 0) ? tabContent : undefined,
          tasks: tasks.length > 0 ? tasks : undefined,
          id: Date.now().toString()
        };
        setMessages(prev => [...prev, botMsg]);
      });

    } catch (error) {
      console.error("Error:", error);
      const errorMsg: Message = { 
        role: "bot", 
        content: "I'm having trouble connecting right now. Please try again!",
        id: Date.now().toString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleReaction = (messageId: string, type: 'like' | 'dislike' | 'love') => {
    setReactions(prev => {
      const existing = prev.find(r => r.messageId === messageId);
      if (existing) {
        return prev.filter(r => r.messageId !== messageId);
      }
      return [...prev, { messageId, type }];
    });
  };

  const toggleTask = (task: string) => {
    setCompletedTasks(prev => 
      prev.includes(task) 
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const summarizeChat = async () => {
    if (messages.length === 0) return;
    
    const chatHistory = messages.map(m => `${m.role}: ${m.content}`).join('\n');
    const summaryPrompt = `Please provide a brief summary of this career conversation:\n\n${chatHistory}`;
    
    handleSend(summaryPrompt);
  };

  const regenerateResponse = async (messageIndex: number) => {
    if (messageIndex < 1) return;
    
    const userMessage = messages[messageIndex - 1];
    const newMessages = messages.slice(0, messageIndex);
    setMessages(newMessages);
    
    handleSend(userMessage.content);
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
    
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    recognition.start();
  };

  const themeClasses = isDark 
    ? "bg-gray-900 text-white" 
    : "bg-white text-gray-900";

  const cardClasses = isDark 
    ? "bg-gray-800 border-gray-700" 
    : "bg-gray-50 border-gray-200";

  const LoadingDots = () => (
    <div className="flex space-x-1 items-center justify-center p-2">
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "0ms" }}></span>
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "300ms" }}></span>
      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: "600ms" }}></span>
    </div>
  );

  const TabContent = ({ message }: { message: Message }) => {
    const tabs = [];
    if (message.tabContent?.resources?.length) tabs.push({ key: 'resources', label: 'Resources', icon: BookOpen });
    if (message.tabContent?.nextSteps?.length) tabs.push({ key: 'nextSteps', label: 'Next Steps', icon: Target });
    if (message.tabContent?.examples?.length) tabs.push({ key: 'examples', label: 'Examples', icon: Lightbulb });
    
    if (tabs.length === 0) return null;
    
    const activeTabKey = activeTab[message.id] || tabs[0].key;
    
    return (
      <div className="mt-3 border-t border-gray-600 pt-3">
        <div className="flex space-x-2 mb-3">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(prev => ({ ...prev, [message.id]: tab.key }))}
              className={`flex items-center px-3 py-1 rounded-md text-sm ${
                activeTabKey === tab.key 
                  ? 'bg-indigo-500 text-white' 
                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'} hover:bg-indigo-400`
              }`}
            >
              <tab.icon size={14} className="mr-1" />
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className={`p-3 rounded-md ${cardClasses}`}>
          {message.tabContent?.[activeTabKey as keyof typeof message.tabContent]?.map((item, i) => (
            <div key={i} className="flex items-start space-x-2 mb-2">
              <ArrowRight size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TaskList = ({ tasks }: { tasks: string[] }) => (
    <div className="mt-3 border-t border-gray-600 pt-3">
      <h4 className="text-sm font-medium mb-2 flex items-center">
        <CheckCircle size={14} className="mr-1 text-indigo-400" />
        Mini Tasks
      </h4>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center space-x-2">
            <button
              onClick={() => toggleTask(task)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                completedTasks.includes(task)
                  ? 'bg-indigo-500 border-indigo-500 text-white'
                  : 'border-gray-400 hover:border-indigo-400'
              }`}
            >
              {completedTasks.includes(task) && <CheckCircle size={12} />}
            </button>
            <span className={`text-sm ${completedTasks.includes(task) ? 'line-through text-gray-500' : ''}`}>
              {task}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`fixed inset-0 w-screen h-screen ${themeClasses} flex items-center justify-center transition-colors duration-300`}>
      <div className={`w-full max-w-5xl h-[90vh] grid grid-rows-[auto_1fr_auto] rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-300'} ${cardClasses} shadow-2xl overflow-hidden`}>
        
        {/* Header */}
        <header className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'} flex items-center justify-between`}>
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
                Gemini Career Assistant
              </h1>
              <div className="flex items-center text-xs text-gray-400">
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
                  AI-powered career guidance
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-md ${cardClasses} hover:bg-opacity-80`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button
              onClick={summarizeChat}
              disabled={messages.length === 0}
              className={`flex items-center px-3 py-2 rounded-md ${cardClasses} hover:bg-opacity-80 disabled:opacity-50`}
            >
              <FileText size={16} className="mr-1" />
              Summarize
            </button>
          </div>
        </header>
        
        {/* Messages */}
        <div className={`overflow-y-auto px-4 py-2 ${isDark ? 'bg-gray-950' : 'bg-gray-100'}`}>
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-1 mb-6">
                <div className={`w-full h-full rounded-full ${themeClasses} flex items-center justify-center`}>
                  <Sparkles size={30} className="text-indigo-400" />
                </div>
              </div>
              
              <h2 className="text-xl font-semibold mb-2">Hi! I'm your Gemini Career Assistant</h2>
              <p className="text-gray-400 text-center max-w-md mb-8">
                I'm here to help with career development, job searching, and professional growth with personalized guidance!
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { icon: <Code size={16} />, text: "Web Development Career Path" },
                  { icon: <User size={16} />, text: "Interview Preparation Tips" },
                  { icon: <Target size={16} />, text: "Salary Negotiation Guide" },
                  { icon: <BookOpen size={16} />, text: "Industry Trend Analysis" }
                ].map((item, i) => (
                  <button
                    key={i}
                    className={`flex items-center p-3 ${cardClasses} hover:bg-opacity-80 rounded-md text-left text-sm group transition-all hover:scale-105`}
                    onClick={() => setInput(item.text)}
                  >
                    <span className="mr-2 text-indigo-400 group-hover:text-indigo-300">{item.icon}</span>
                    <span>{item.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, i) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className="flex space-x-3 max-w-[80%]">
                    {msg.role !== "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                      </div>
                    )}
                    
                    <div className={`py-3 px-4 rounded-lg ${
                      msg.role === "user" 
                        ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white" 
                        : `${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      
                      {msg.tabContent && <TabContent message={msg} />}
                      {msg.tasks && <TaskList tasks={msg.tasks} />}
                      
                      {msg.role === "bot" && (
                        <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-600">
                          <button
                            onClick={() => handleReaction(msg.id, 'like')}
                            className={`p-1 rounded hover:bg-gray-600 ${
                              reactions.find(r => r.messageId === msg.id && r.type === 'like') ? 'text-indigo-400' : 'text-gray-400'
                            }`}
                          >
                            <ThumbsUp size={14} />
                          </button>
                          <button
                            onClick={() => handleReaction(msg.id, 'dislike')}
                            className={`p-1 rounded hover:bg-gray-600 ${
                              reactions.find(r => r.messageId === msg.id && r.type === 'dislike') ? 'text-red-400' : 'text-gray-400'
                            }`}
                          >
                            <ThumbsDown size={14} />
                          </button>
                          <button
                            onClick={() => handleReaction(msg.id, 'love')}
                            className={`p-1 rounded hover:bg-gray-600 ${
                              reactions.find(r => r.messageId === msg.id && r.type === 'love') ? 'text-red-400' : 'text-gray-400'
                            }`}
                          >
                            <Heart size={14} />
                          </button>
                          <button
                            onClick={() => regenerateResponse(i)}
                            className="p-1 rounded hover:bg-gray-600 text-gray-400 hover:text-gray-300"
                          >
                            <RotateCcw size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {msg.role === "user" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center">
                        <User size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className={`py-3 px-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <LoadingDots />
                    </div>
                  </div>
                </div>
              )}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex space-x-3 max-w-[80%]">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Sparkles size={16} className="text-white" />
                    </div>
                    <div className={`py-3 px-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="whitespace-pre-wrap">{typingText}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Input */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="flex items-center space-x-2">
            <div className="flex-grow relative">
              <input
                ref={inputRef}
                type="text"
                className={`w-full py-3 px-4 ${cardClasses} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
                placeholder={isRecording ? "Listening..." : "Ask me anything about your career..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={isRecording}
              />
            </div>
            
            <button 
              onClick={startListening}
              className={`p-3 rounded-md ${
                isRecording
                  ? "bg-red-500 text-white animate-pulse"
                  : `${cardClasses} text-indigo-400 hover:text-indigo-300`
              }`}
              disabled={loading}
            >
              <Mic size={18} />
            </button>
            
            <button 
              onClick={() => handleSend()}
              disabled={loading || !input.trim()} 
              className={`p-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white ${
                (loading || !input.trim()) ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Send size={18} />
            </button>
          </div>
          
          <div className="mt-2 text-xs text-gray-400 text-center">
            <p>Gemini Career Assistant • Powered by Google's AI</p>
          </div>
        </div>
      </div>
    </div>
  );
}
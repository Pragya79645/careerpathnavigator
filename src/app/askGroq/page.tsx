'use client';
import { useState, useRef, useEffect } from "react";
import { 
  Mic, Send, Terminal, User, Bot, ChevronDown, AlertCircle, Code, Zap, 
  Sun, Moon, ThumbsUp, ThumbsDown, Heart, RotateCcw, Sparkles, 
  FileText, CheckCircle, ArrowRight, BookOpen, Target, Lightbulb, StopCircle, ExternalLink, Edit3, Save, X
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
  edited?: boolean;
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
  const [stopTyping, setStopTyping] = useState(false);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string>("");
  const [detectedIntents, setDetectedIntents] = useState<string[]>([]);
  const [pausedResponseContent, setPausedResponseContent] = useState<string>("");
  const [hasPausedResponse, setHasPausedResponse] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Intent badge colors for UI
  const getIntentColor = (intent: string) => {
    const colors: { [key: string]: string } = {
      'LEARNING': 'bg-blue-500/20 text-blue-400',
      'JOB_SEARCH': 'bg-green-500/20 text-green-400',
      'INTERVIEW_PREP': 'bg-red-500/20 text-red-400',
      'PORTFOLIO': 'bg-purple-500/20 text-purple-400',
      'TECHNOLOGY': 'bg-orange-500/20 text-orange-400',
      'CAREER_ADVICE': 'bg-indigo-500/20 text-indigo-400',
      'SALARY': 'bg-yellow-500/20 text-yellow-400',
      'NETWORKING': 'bg-pink-500/20 text-pink-400',
    };
    return colors[intent] || 'bg-gray-500/20 text-gray-400';
  };

  // Predefined resources for common topics
  const getTopicResources = (topic: string) => {
    const resources: { [key: string]: string[] } = {
      'web development': [
        '[freeCodeCamp](https://freecodecamp.org) - Free coding bootcamp',
        '[MDN Web Docs](https://developer.mozilla.org) - Web development reference',
        '[The Odin Project](https://theodinproject.com) - Full-stack curriculum'
      ],
      'javascript': [
        '[JavaScript.info](https://javascript.info) - Modern JS tutorial',
        '[Eloquent JavaScript](https://eloquentjavascript.net) - Free online book',
        '[You Don\'t Know JS](https://github.com/getify/You-Dont-Know-JS) - Book series'
      ],
      'react': [
        '[React Official Docs](https://react.dev) - Official documentation',
        '[React Training](https://reacttraining.com) - Professional courses',
        '[Scrimba React Course](https://scrimba.com/learn/learnreact) - Interactive learning'
      ],
      'interview': [
        '[LeetCode](https://leetcode.com) - Coding practice',
        '[Pramp](https://pramp.com) - Mock interviews',
        '[InterviewBit](https://interviewbit.com) - Technical prep'
      ],
      'portfolio': [
        '[GitHub Pages](https://pages.github.com) - Free hosting',
        '[Netlify](https://netlify.com) - Easy deployment',
        '[Vercel](https://vercel.com) - Frontend platform'
      ],
      'jobs': [
        '[LinkedIn Jobs](https://linkedin.com/jobs) - Professional network',
        '[AngelList](https://angel.co) - Startup jobs',
        '[Remote.co](https://remote.co) - Remote opportunities'
      ]
    };
    
    return resources[topic.toLowerCase()] || [];
  };

  // Simplified function to render content with links and bullet points only
  const renderMessageContent = (content: string) => {
    // First handle line breaks and bullet points
    const lines = content.split('\n');
    const processedLines = lines.map((line, lineIndex) => {
      // Handle bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        const bulletContent = line.trim().substring(2);
        return (
          <div key={`line-${lineIndex}`} className="flex items-start gap-2 my-1">
            <span className="text-blue-400 mt-1">•</span>
            <span>{processLinksInText(bulletContent)}</span>
          </div>
        );
      }
      
      // Regular line
      return line ? (
        <div key={`line-${lineIndex}`} className="my-1">
          {processLinksInText(line)}
        </div>
      ) : (
        <br key={`line-${lineIndex}`} />
      );
    });
    
    return processedLines;
  };

  // Helper function to process only links within text
  const processLinksInText = (content: string) => {
    const parts = [];
    let currentIndex = 0;
    
    // Only handle links, no asterisk formatting
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;

    while ((match = linkRegex.exec(content)) !== null) {
      // Add text before the link
      if (match.index > currentIndex) {
        parts.push(content.slice(currentIndex, match.index));
      }
      
      // Add the clickable link
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline decoration-dotted transition-colors"
        >
          {match[1]}
          <ExternalLink size={12} className="inline" />
        </a>
      );
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (currentIndex < content.length) {
      parts.push(content.slice(currentIndex));
    }
    
    return parts.length > 0 ? parts : content;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Enhanced typing animation with stop functionality
  const typeMessage = (text: string, callback: () => void) => {
    setIsTyping(true);
    setStopTyping(false);
    setTypingText("");
    let i = 0;
    
    const timer = setInterval(() => {
      if (stopTyping) {
        clearInterval(timer);
        setIsTyping(false);
        setTypingText(text); // Show full text when stopped
        // Don't call callback when stopped - let user decide next action
        return;
      }
      
      if (i < text.length) {
        setTypingText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTyping(false);
        callback(); // Only call callback when naturally completed
      }
    }, 30); // Slightly slower for better readability
    
    setTypingTimer(timer);
  };

  const stopResponse = () => {
    console.log("StopResponse called - resetting all states");
    setStopTyping(true);
    setHasPausedResponse(true);
    setPausedResponseContent(typingText);
    setLoading(false); // Reset loading state so user can send new messages
    
    // Immediately save the paused content as a complete message
    if (typingText.trim()) {
      const pausedBotMsg: Message = { 
        role: "bot", 
        content: typingText + " (response paused)",
        id: Date.now().toString() + "_paused"
      };
      setMessages(prev => [...prev, pausedBotMsg]);
    }
    
    // Now reset the typing states
    setIsTyping(false);
    setTypingText("");
    if (typingTimer) {
      clearInterval(typingTimer);
      setTypingTimer(null);
    }
    console.log("StopResponse completed - paused content saved as message, user can type new message");
  };

  const continueResponse = () => {
    // Since paused responses are now immediately saved as complete messages,
    // we just need to reset the paused state
    setHasPausedResponse(false);
    setPausedResponseContent("");
    setIsTyping(false);
    setStopTyping(false);
    setTypingText("");
    console.log("Continue response - paused state cleared");
  };

  // Edit message functionality
  const startEditingMessage = (messageId: string, currentContent: string) => {
    // Disable editing when AI is responding, unless user has stopped it
    // Allow editing only when:
    // 1. AI is not responding at all (!loading && !isTyping)
    // 2. User has explicitly stopped the AI response (stopTyping = true)
    if ((loading || isTyping) && !stopTyping) return; 
    setEditingMessageId(messageId);
    setEditingText(currentContent);
  };

  const cancelEditing = () => {
    setEditingMessageId(null);
    setEditingText("");
  };

  const saveEditedMessage = async (messageId: string) => {
    if (!editingText.trim()) return;
    
    // Find the message index
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return;

    // Remove all messages after this one (including bot responses)
    // but keep the messages before the edited one for context
    const messagesToKeep = messages.slice(0, messageIndex);
    setMessages(messagesToKeep);

    // Clear editing state
    setEditingMessageId(null);
    setEditingText("");

    // Resend the edited message - handleSend will add it properly to the state
    handleSend(editingText.trim());
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
    if (!prompt.trim()) {
      console.log("HandleSend: Empty prompt, returning");
      return;
    }
    
    // Prevent multiple simultaneous sends
    if (loading) {
      console.log("Already loading, preventing duplicate send. Loading:", loading);
      return;
    }
    
    console.log("HandleSend called with:", { 
      prompt, 
      loading, 
      isTyping, 
      stopTyping, 
      hasPausedResponse,
      pausedResponseContent: pausedResponseContent.length 
    });
    
    // Get current messages state for conversation history
    let updatedMessages = [...messages];
    
    // NOTE: Paused responses are already saved as complete messages in stopResponse()
    // so we don't need to save them again here
    
    // ALWAYS reset all typing-related states when starting a new request
    console.log("Resetting all typing states");
    setIsTyping(false);
    setStopTyping(false);
    setTypingText("");
    setHasPausedResponse(false);
    setPausedResponseContent("");
    if (typingTimer) {
      clearInterval(typingTimer);
      setTypingTimer(null);
    }
    
    const userMsg: Message = { 
      role: "user", 
      content: prompt,
      id: Date.now().toString()
    };
    updatedMessages.push(userMsg);
    setMessages(updatedMessages);
    setLoading(true);
    setInput("");

    console.log("About to send API request. Loading state set to:", true);

    try {
      console.log("Sending to backend:", { prompt, conversationHistory: updatedMessages });
      
      // The backend now handles intent detection and dynamic context building
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          prompt: prompt, // Send the raw prompt - backend will handle enhancement
          conversationHistory: updatedMessages // Send the updated conversation history
        }),
      });

      if (!res.ok) {
        throw new Error(`API response not ok: ${res.status}`);
      }

      const data = await res.json();
      console.log("Received from backend:", data);
      
      if (!data.answer) {
        throw new Error("No answer received from backend");
      }

      const { mainContent, tabContent, tasks } = processGeminiResponse(data.answer);

      // Update detected intents if new intent is detected
      if (data.detectedIntent && !detectedIntents.includes(data.detectedIntent)) {
        setDetectedIntents(prev => [...prev, data.detectedIntent]);
      }

      console.log("Starting typeMessage with:", mainContent);
      
      typeMessage(mainContent, () => {
        console.log("TypeMessage completed, adding to messages");
        const botMsg: Message = { 
          role: "bot", 
          content: mainContent,
          tabContent: Object.keys(tabContent).some(key => tabContent[key as keyof typeof tabContent].length > 0) ? tabContent : undefined,
          tasks: tasks.length > 0 ? tasks : undefined,
          id: Date.now().toString()
        };
        setMessages(prev => [...prev, botMsg]);
        
        // Brief notification that editing is now available
        setTimeout(() => {
          // This could show a subtle notification or just rely on the edit button becoming available
        }, 500);
      });

    } catch (error) {
      console.error("Error in handleSend:", error);
      const errorMsg: Message = { 
        role: "bot", 
        content: "I'm having trouble connecting right now. Please try again!",
        id: Date.now().toString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      console.log("Setting loading to false");
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
    
    const recentMessages = messages.slice(-10); // Last 10 messages for better context
    const chatHistory = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');
    const summaryPrompt = `Based on our conversation history, provide a comprehensive summary with:
- Key topics we discussed (3-4 bullet points)
- Main advice and recommendations given
- Specific resources mentioned with links
- Suggested next steps for continuing the conversation

Conversation to summarize:
${chatHistory}`;
    
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
              <div className="flex items-center text-xs text-gray-400 flex-wrap gap-2">
                <span className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 mr-1"></span>
                  Intent-based AI guidance
                </span>
                {messages.length > 0 && (
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
                    Conversation memory active
                  </span>
                )}
                {detectedIntents.length > 0 && (
                  <div className="flex items-center gap-1 ml-2">
                    <span className="text-xs">Detected:</span>
                    {detectedIntents.slice(-3).map((intent, i) => (
                      <span
                        key={i}
                        className={`px-2 py-0.5 rounded-full text-xs ${getIntentColor(intent)}`}
                      >
                        {intent.replace('_', ' ').toLowerCase()}
                      </span>
                    ))}
                  </div>
                )}
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
                Get quick, actionable career advice with conversation memory! I'll remember our discussion and build upon it.
              </p>
              
              <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  { icon: <Code size={16} />, text: "Best web development resources?" },
                  { icon: <User size={16} />, text: "Top coding interview prep sites?" },
                  { icon: <Target size={16} />, text: "Where to find remote jobs?" },
                  { icon: <BookOpen size={16} />, text: "Free programming courses?" }
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
                  <div className="flex space-x-3 max-w-[80%] group">{/* Added group class here */}
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
                      {msg.role === "user" && editingMessageId === msg.id ? (
                        // Edit mode for user messages
                        <div className="space-y-3">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="w-full p-2 bg-white/10 border border-white/20 rounded text-white placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-white/30"
                            rows={3}
                            placeholder="Edit your message..."
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                saveEditedMessage(msg.id);
                              }
                              if (e.key === 'Escape') {
                                cancelEditing();
                              }
                            }}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-300">
                              Press Enter to save, Shift+Enter for new line, Esc to cancel
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={cancelEditing}
                                className="p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white"
                                title="Cancel editing"
                              >
                                <X size={16} />
                              </button>
                              <button
                                onClick={() => saveEditedMessage(msg.id)}
                                className="p-1 rounded hover:bg-white/10 text-green-300 hover:text-green-200"
                                title="Save changes"
                              >
                                <Save size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Normal display mode
                        <>
                          <div className={msg.role === "user" ? "whitespace-pre-wrap" : ""}>
                            {msg.role === "user" ? msg.content : renderMessageContent(msg.content)}
                          </div>
                          
                          {/* Edited indicator */}
                          {msg.role === "user" && msg.edited && (
                            <span className="text-xs text-gray-300 opacity-70 mt-1 block">
                              (edited)
                            </span>
                          )}
                          
                          {/* Edit button for user messages */}
                          {msg.role === "user" && (
                            <button
                              onClick={() => startEditingMessage(msg.id, msg.content)}
                              disabled={(loading || isTyping) && !stopTyping} // Disable when AI is responding unless stopped
                              className={`mt-2 p-1 rounded hover:bg-white/10 text-gray-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity ${
                                ((loading || isTyping) && !stopTyping) ? 'cursor-not-allowed opacity-50' : ''
                              }`}
                              title={((loading || isTyping) && !stopTyping) ? "Cannot edit while AI is responding. Click Stop to enable editing." : "Edit message"}
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </>
                      )}
                      
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
                    <div className={`py-3 px-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} relative`}>
                      <div>{renderMessageContent(typingText)}</div>
                      <button
                        onClick={stopResponse}
                        className="absolute top-2 right-2 p-1 rounded hover:bg-gray-600 text-red-400 hover:text-red-300"
                        title="Stop response"
                      >
                        <StopCircle size={16} />
                      </button>
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
          {isTyping && (
            <div className="mb-3 flex items-center justify-between p-2 bg-indigo-500/10 rounded-md border border-indigo-500/20">
              <span className="text-sm text-indigo-400 flex items-center gap-2">
                <Sparkles size={14} className="animate-pulse" />
                Gemini is typing... {stopTyping && "(Response paused - you can ask a new question)"}
              </span>
              <button
                onClick={stopResponse}
                className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30"
              >
                <StopCircle size={12} />
                Stop
              </button>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <div className="flex-grow relative">
              <input
                ref={inputRef}
                type="text"
                className={`w-full py-3 px-4 ${cardClasses} rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-gray-400`}
                placeholder={isRecording ? "Listening..." : "Ask me anything about your career..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !loading && input.trim()) {
                    console.log("Enter pressed, calling handleSend. Loading:", loading, "Input:", input.trim());
                    handleSend();
                  }
                }}
                disabled={isRecording || loading}
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
            <p>Gemini Career Assistant • Quick & Actionable Career Advice</p>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Send, Loader2, Sparkles, MoveRight, Check, Bookmark, X, MessageSquare, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesText } from '@/components/sparkle-text';
import TechnicalFlashcards from '@/components/TechnicalFlashcards';

// Define Question interface with difficulty and importance
interface Question {
  id: number;
  text: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importance: 'High' | 'Medium' | 'Low';
}

// Define Resource interface
interface Resource {
  title: string;
  url?: string;
  type: 'Website' | 'Video' | 'Course' | 'Book' | 'Practice Platform' | 'Article' | 'GitHub' | 'PDF';
  description?: string;
}

// Define the new response interface
interface InterviewPrepResponse {
  mode: 'general' | 'company-specific';
  displayMode: 'interview' | 'flashcard';
  company: string;
  role: string;
  questionType: string;
  interviewRounds: string[];
  questions: Array<{question: string; answer: string; difficulty: 'Easy' | 'Medium' | 'Hard'; importance: 'High' | 'Medium' | 'Low'}>;
  topicsToPrepare: string[];
  resources: Resource[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tip: string;
  applicationTimeline?: string;
  preparationTimeEstimate?: string;
  sourceNote?: string;
}

export default function InterviewQuestionsGenerator() {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [questionType, setQuestionType] = useState('all');
  const [displayMode, setDisplayMode] = useState<'interview' | 'flashcard'>('interview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [prepResponse, setPrepResponse] = useState<InterviewPrepResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set());
  const [activeAnswerIndex, setActiveAnswerIndex] = useState<number | null>(null);

  // Test API connectivity
  const testApiConnectivity = async () => {
    console.log('🔍 Testing API connectivity...');
    try {
      // Try to get the base URL for absolute requests in production
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const apiUrl = `${baseUrl}/api/interview-questions`;
      
      console.log('🔗 Testing connection to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('🔍 Health check response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ API is accessible:', data);
        return true;
      } else {
        console.error('❌ API health check failed:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('❌ API connectivity test failed:', error);
      return false;
    }
  };

  // Reset display mode to 'interview' when question type changes away from 'technical'
  useEffect(() => {
    if (questionType !== 'technical') {
      setDisplayMode('interview');
    }
  }, [questionType]);

  // Test API connectivity on component mount
  useEffect(() => {
    testApiConnectivity();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role.trim()) {
      setError('Please enter a role');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('🚀 Starting request to API...');
      console.log('Request data:', { role, questionType, company: company.trim() || undefined, mode: displayMode });
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // Try to get the base URL for absolute requests in production
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const apiUrl = `${baseUrl}/api/interview-questions`;
      
      console.log('🔗 Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          role, 
          questionType,
          company: company.trim() || undefined,
          mode: displayMode
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        // Get the error details from the response
        let errorMessage = 'Failed to fetch interview questions';
        let errorDetails = '';
        
        try {
          const errorData = await response.json();
          console.error('❌ Error response data:', errorData);
          errorMessage = errorData.error || errorMessage;
          errorDetails = errorData.details || '';
        } catch (parseError) {
          console.error('❌ Could not parse error response:', parseError);
          // Try to get text response
          try {
            const errorText = await response.text();
            console.error('❌ Error response text:', errorText);
            errorDetails = errorText.substring(0, 200); // Limit error text
          } catch {
            console.error('❌ Could not get error text');
          }
        }
        
        throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''} (Status: ${response.status})`);
      }
      
      console.log('✅ Parsing successful response...');
      const data = await response.json() as InterviewPrepResponse;
      
      console.log('📊 Response data structure:', {
        mode: data.mode,
        displayMode: data.displayMode,
        questionCount: data.questions?.length || 0,
        hasResources: !!data.resources?.length,
        company: data.company,
        role: data.role
      });
      
      setPrepResponse(data);
      setQuestions(data.questions.map((q: any, index: number) => ({
        id: index,
        text: q.question,
        answer: q.answer,
        difficulty: q.difficulty || 'Medium',
        importance: q.importance || 'Medium'
      })));
      // Reset saved questions when generating new ones
      setSavedQuestions(new Set());
      setActiveAnswerIndex(null);
      
      console.log('🎉 Request completed successfully!');
      
    } catch (err) {
      console.error('💥 Request failed:', err);
      
      let errorMessage = 'An unexpected error occurred';
      
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('Failed to fetch')) {
          errorMessage = 'Network error: Could not connect to the server. Please check your connection and try again.';
        } else if (err.message.includes('NetworkError')) {
          errorMessage = 'Network error: Please check your internet connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. The server may be busy. Please try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveQuestion = (index: number) => {
    const newSaved = new Set(savedQuestions);
    if (newSaved.has(index)) {
      newSaved.delete(index);
    } else {
      newSaved.add(index);
    }
    setSavedQuestions(newSaved);
  };

  const toggleAnswerView = (index: number) => {
    if (activeAnswerIndex === index) {
      setActiveAnswerIndex(null);
    } else {
      setActiveAnswerIndex(index);
    }
  };

  const questionTypeLabels = {
    all: 'Mixed Questions',
    technical: 'Technical Questions',
    behavioral: 'Behavioral Questions',
    dsa: 'DSA Questions'
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-white to-purple-50">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
        {/* Header */}
       
        <div className="text-center mb-6 sm:mb-8 mt-16">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white px-4 py-1.5   mb-3"
          >
            <Sparkles size={16} className="text-purple-400" />
            <span className="text-sm font-medium bg-gradient-to-r from-teal-500 to-purple-400 bg-clip-text text-transparent">
              AI-Powered Interview Prep
            </span>
            <div><SparklesText text={''} /></div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent"
          >
            Interview Questions Generator
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-gray-600 max-w-3xl mx-auto text-sm sm:text-base"
          >
            Generate tailored interview questions with suggested answers for any role in seconds. Perfect for candidates and interviewers alike.
          </motion.p>
        </div>
        
        {/* Display mode specific content */}
        {displayMode === 'flashcard' && prepResponse && questionType === 'technical' ? (
          <TechnicalFlashcards 
            data={{
              questions: questions.map(q => ({
                question: q.text,
                answer: q.answer,
                difficulty: q.difficulty,
                importance: q.importance
              })),
              company: prepResponse.company || '',
              role: role,
              difficulty: prepResponse.difficulty || 'Medium',
              tip: prepResponse.tip || ''
            }}
          />
        ) : (
          <>
            {/* Layout for desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-5 lg:p-6 backdrop-blur-sm ${questions.length > 0 ? 'lg:col-span-4' : 'lg:col-span-10 lg:col-start-2 mx-auto w-full'}`}
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Role
                  </label>
                  <div className="relative">
                    <input
                      id="role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g., Product Manager, Frontend Developer, Data Scientist"
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Company <span className="text-gray-400">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      id="company"
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g., Google, Amazon, Microsoft, Apple"
                      className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all outline-none"
                    />
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {['all', 'technical', 'behavioral', 'dsa'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setQuestionType(type)}
                        className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                          questionType === type 
                          ? 'bg-gradient-to-r from-teal-500 to-purple-400 text-white shadow-md' 
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {type === 'all' && (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <Sparkles size={16} className={questionType === type ? 'text-white' : 'text-gray-500'} />
                          </div>
                        )}
                        {type === 'technical' && (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M16 18 22 12 16 6"></path><path d="M8 6 2 12 8 18"></path></svg>
                          </div>
                        )}
                        {type === 'behavioral' && (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <MessageSquare size={16} className={questionType === type ? 'text-white' : 'text-gray-500'} />
                          </div>
                        )}
                        {type === 'dsa' && (
                          <div className="h-4 w-4 flex items-center justify-center">
                            <Code size={16} className={questionType === type ? 'text-white' : 'text-gray-500'} />
                          </div>
                        )}
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Display Mode Selector - Only show for technical questions */}
                {questionType === 'technical' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Mode
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['interview', 'flashcard'] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setDisplayMode(mode)}
                          className={`py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                            displayMode === mode 
                            ? 'bg-gradient-to-r from-teal-500 to-purple-400 text-white shadow-md' 
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {mode === 'interview' && (
                            <div className="h-4 w-4 flex items-center justify-center">
                              <MessageSquare size={16} className={displayMode === mode ? 'text-white' : 'text-gray-500'} />
                            </div>
                          )}
                          {mode === 'flashcard' && (
                            <div className="h-4 w-4 flex items-center justify-center">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                                <path d="M14 2v6h6"/>
                                <path d="M16 13H8"/>
                                <path d="M16 17H8"/>
                                <path d="M10 9H8"/>
                              </svg>
                            </div>
                          )}
                          {mode === 'interview' ? 'Interview' : 'Flashcards'}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 p-3 sm:p-3.5 bg-gradient-to-r from-teal-500 to-purple-400 text-white rounded-lg hover:opacity-90 transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Generating Questions...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Questions</span>
                    <MoveRight size={18} />
                  </>
                )}
              </button>
            </form>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 rounded-lg flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div>{error}</div>
                  <button
                    onClick={testApiConnectivity}
                    className="mt-2 text-sm underline hover:no-underline font-medium"
                  >
                    Test API Connection
                  </button>
                </div>
              </motion.div>
            )}

            {/* Preparation Info display */}
            {prepResponse && (
              <div className="mt-5 lg:mt-6 hidden lg:block space-y-4">
                {/* Mode and Difficulty */}
                <div className="bg-gradient-to-r from-teal-500/10 to-purple-400/10 rounded-xl p-4">
                  <div className="font-medium text-lg text-gray-700 mb-3">Preparation Overview</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                      <div className="text-sm text-gray-500">Mode</div>
                      <div className="text-sm font-bold text-teal-600 capitalize">{prepResponse.mode.replace('-', ' ')}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                      <div className="text-sm text-gray-500">Difficulty</div>
                      <div className={`text-sm font-bold ${
                        prepResponse.difficulty === 'Easy' ? 'text-green-600' :
                        prepResponse.difficulty === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {prepResponse.difficulty}
                      </div>
                    </div>
                    {prepResponse.preparationTimeEstimate && (
                      <div className="bg-white rounded-lg p-3 flex flex-col items-center col-span-2">
                        <div className="text-sm text-gray-500">Prep Time</div>
                        <div className="text-sm font-bold text-purple-600">{prepResponse.preparationTimeEstimate}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Interview Rounds */}
                {prepResponse.interviewRounds.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-700 mb-2">Interview Rounds</div>
                    <div className="space-y-1">
                      {prepResponse.interviewRounds.map((round, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                          {round}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Topics to Prepare */}
                {prepResponse.topicsToPrepare.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="font-medium text-gray-700 mb-2">Key Topics</div>
                    <div className="flex flex-wrap gap-2">
                      {prepResponse.topicsToPrepare.map((topic, index) => (
                        <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tip */}
                {prepResponse.tip && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4">
                    <div className="font-medium text-yellow-800 mb-1">💡 Pro Tip</div>
                    <div className="text-sm text-yellow-700">{prepResponse.tip}</div>
                  </div>
                )}

                {/* Application Timeline */}
                {prepResponse.applicationTimeline && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="font-medium text-green-800 mb-1">📅 Application Timeline</div>
                    <div className="text-sm text-green-700">{prepResponse.applicationTimeline}</div>
                  </div>
                )}

                {/* Legend */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-700 mb-2">🎯 Question Indicators</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Difficulty</div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Easy</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Medium</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Hard</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Importance</div>
                      <div className="flex gap-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">High</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Medium</span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Low</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Source Note */}
                {prepResponse.sourceNote && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="font-medium text-blue-800 mb-1">📋 Question Sources</div>
                    <div className="text-sm text-blue-700">{prepResponse.sourceNote}</div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Sparkles size={16} className="text-purple-400" />
                    <span>Powered by Groq AI</span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
              
              {/* Results */}
              {questions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="lg:col-span-8 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                >
                  {displayMode === 'flashcard' && questionType !== 'technical' ? (
                    <div className="p-8 text-center">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="text-yellow-800 font-medium mb-2">
                          📚 Flashcard Mode Notice
                        </div>
                        <div className="text-yellow-700 text-sm">
                          Flashcard mode is currently only available for technical questions. 
                          Please select "Technical Questions" to use flashcard mode, or switch to "Interview" mode for other question types.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-purple-400/10">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                          <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-left">
                              Interview Questions for <span className="text-teal-600">{role}</span>
                              {prepResponse?.company && (
                                <span className="text-purple-600"> at {prepResponse.company}</span>
                              )}
                            </h2>
                            <p className="text-gray-500 text-xs sm:text-sm mt-1">
                              {questionTypeLabels[questionType as keyof typeof questionTypeLabels]} to help prepare for your interview
                              {prepResponse?.mode === 'company-specific' && (
                                <span className="ml-1 text-purple-600">• Company-specific preparation</span>
                              )}
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm border border-purple-100">
                            <div className="w-2 h-2 rounded-full bg-teal-400"></div>
                            <span className="text-xs sm:text-sm font-medium text-gray-600">
                              {questions.length} questions
                            </span>
                          </div>
                        </div>
                      </div>
              
              <div className="divide-y divide-gray-100 p-1">
                {questions.map((question, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 sm:p-5 hover:bg-gray-50 transition-colors rounded-lg"
                  >
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-gradient-to-r from-teal-500 to-purple-400 flex items-center justify-center text-white text-xs font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start gap-2 mb-2">
                          <p className="text-sm sm:text-base text-gray-700 flex-1">{question.text}</p>
                          <div className="flex gap-1 flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              question.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {question.difficulty}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              question.importance === 'High' ? 'bg-purple-100 text-purple-800' :
                              question.importance === 'Medium' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {question.importance}
                            </span>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 justify-end">
                          <button 
                            onClick={() => toggleAnswerView(index)}
                            className="text-xs flex items-center gap-1 py-1 px-2 rounded-full bg-teal-100 text-purple-600 border border-purple-200 hover:bg-purple-200 transition-colors"
                          >
                            <MessageSquare size={12} />
                            <span>{activeAnswerIndex === index ? 'Hide Answer' : 'View Answer'}</span>
                          </button>
                          
                          <button 
                            onClick={() => toggleSaveQuestion(index)}
                            className={`text-xs flex items-center gap-1 py-1 px-2 rounded-full ${
                              savedQuestions.has(index) 
                                ? 'bg-green-300 text-teal-600 border border-teal-200' 
                                : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {savedQuestions.has(index) ? (
                              <>
                                <Check size={12} />
                                <span>Saved</span>
                              </>
                            ) : (
                              <>
                                <Bookmark size={12} />
                                <span>Save</span>
                              </>
                            )}
                          </button>
                        </div>
                        
                        {/* Answer Popup */}
                        <AnimatePresence>
                          {activeAnswerIndex === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-3 relative"
                            >
                              <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 text-sm text-gray-700">
                                <div className="font-medium text-purple-700 mb-2 flex justify-between items-center">
                                  <span>Suggested Answer:</span>
                                  <button
                                    onClick={() => setActiveAnswerIndex(null)}
                                    className="text-purple-400 hover:text-purple-600"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                                <p className="whitespace-pre-line">{question.answer}</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Resources Section */}
              {prepResponse?.resources && prepResponse.resources.length > 0 && (
                <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-gray-100">
                  <div className="font-medium text-gray-700 mb-3">📚 Recommended Resources</div>
                  <div className="grid grid-cols-1 gap-3">
                    {prepResponse.resources.map((resource, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              resource.type === 'Website' ? 'bg-blue-100 text-blue-800' :
                              resource.type === 'Video' ? 'bg-red-100 text-red-800' :
                              resource.type === 'Course' ? 'bg-green-100 text-green-800' :
                              resource.type === 'Book' ? 'bg-purple-100 text-purple-800' :
                              resource.type === 'Practice Platform' ? 'bg-orange-100 text-orange-800' :
                              resource.type === 'GitHub' ? 'bg-gray-100 text-gray-800' :
                              resource.type === 'PDF' ? 'bg-pink-100 text-pink-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {resource.type}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium text-gray-900">{resource.title}</span>
                              {resource.url && (
                                <a 
                                  href={resource.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 hover:underline"
                                >
                                  <span>Visit</span>
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                                </a>
                              )}
                            </div>
                            {resource.description && (
                              <p className="text-xs text-gray-600">{resource.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Only show on mobile/tablet */}
                <div className="flex items-center gap-3 lg:hidden">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Sparkles size={16} className="text-purple-400" />
                  </div>
                  <span className="text-xs sm:text-sm text-gray-600">
                    Powered by Groq AI
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => window.print()} 
                    className="text-xs sm:text-sm bg-white text-gray-700 hover:text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg border border-gray-200 shadow-sm font-medium flex items-center gap-1.5 hover:shadow transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                  </button>
                  
                  <button 
                    className="text-xs sm:text-sm bg-gradient-to-r from-teal-500 to-purple-400 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-sm font-medium flex items-center gap-1.5 hover:shadow transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </div>
                    </>
                  )}
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
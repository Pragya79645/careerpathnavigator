'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles, MoveRight, Check, Bookmark, X, MessageSquare, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesText } from '@/components/sparkle-text';

// Define Question interface
interface Question {
  id: number;
  text: string;
  answer: string;
}

export default function InterviewQuestionsGenerator() {
  const [role, setRole] = useState('');
  const [questionType, setQuestionType] = useState('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedQuestions, setSavedQuestions] = useState<Set<number>>(new Set());
  const [activeAnswerIndex, setActiveAnswerIndex] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!role.trim()) {
      setError('Please enter a role');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/interview-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, questionType }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch interview questions');
      }
      
      const data = await response.json();
      setQuestions(data.questions.map((q: any, index: number) => ({
        id: index,
        text: q.question,
        answer: q.answer
      })));
      // Reset saved questions when generating new ones
      setSavedQuestions(new Set());
      setActiveAnswerIndex(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
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
                {error}
              </motion.div>
            )}

            {/* Stats display */}
            {questions.length > 0 && (
              <div className="mt-5 lg:mt-6 hidden lg:block">
                <div className="bg-gradient-to-r from-teal-500/10 to-purple-400/10 rounded-xl p-4">
                  <div className="font-medium text-lg text-gray-700 mb-2">Question Stats</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                      <div className="text-sm text-gray-500">Total</div>
                      <div className="text-xl font-bold text-teal-600">{questions.length}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 flex flex-col items-center">
                      <div className="text-sm text-gray-500">Saved</div>
                      <div className="text-xl font-bold text-purple-600">{savedQuestions.size}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
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
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gradient-to-r from-teal-500/10 to-purple-400/10">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-800 text-left">
                      Interview Questions for <span className="text-teal-600">{role}</span>
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {questionTypeLabels[questionType as keyof typeof questionTypeLabels]} to help prepare for your interview
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
                        <p className="text-sm sm:text-base text-gray-700">{question.text}</p>
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
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
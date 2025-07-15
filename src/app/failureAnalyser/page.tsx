"use client"

import { useState, useRef } from "react"
import {
  Upload,
  FileText,
  MessageSquare,
  Target,
  Brain,
  Heart,
  TrendingUp,
  BookOpen,
  CheckCircle,
  Download,
  Eye,
  Edit,
  Lightbulb,
  Printer,
  ArrowRight,
  Sparkles,
  AlertCircle,
  RefreshCw,
  ChevronDown,
} from "lucide-react"

import { extractTextFromPDF } from "../../../utils/parsePDFc"
import { usePDFParser } from "@/hooks/usePDFParser"
import type React from "react"

interface AnalysisResult {
  analysis: {
    resume_issues: string[]
    interview_issues: string[]
    test_issues: string[]
  }
  recommendations: string[]
  fix_suggestions: {
    resume_rewrite: string
    mock_answer_rewrite: string
  }
  resources: Array<{
    topic: string
    link: string
  }>
  positive_notes: string[]
  encouragement: string
  resume_content?: string
  optimized_resume?: string
  highlighted_issues?: Array<{
    text: string
    issue: string
    suggestion: string
  }>
}

export default function CareerAssistant() {
  const { extractTextFromPDF: extractTextSafely, isReady: pdfReady } = usePDFParser();
  
  const [formData, setFormData] = useState({
    resume_text: "",
    interview_feedback: "",
    test_performance: "",
    target_role: "",
  })

  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [inputMode, setInputMode] = useState<"file" | "text">("file")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [showOptimizedResume, setShowOptimizedResume] = useState(false)
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number | null>(null)
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({})
  const [isDragOver, setIsDragOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Utility function to safely render analysis content
  const safeRenderContent = (content: any): string => {
    if (typeof content === "string") {
      return content
    }
    if (typeof content === "object" && content !== null) {
      // Handle objects with before/after structure
      if (content.before && content.after) {
        return `Before: ${content.before}\n\nAfter: ${content.after}`
      }
      // Fallback to JSON representation
      return JSON.stringify(content, null, 2)
    }
    return "Content not available"
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Ensure this only runs on the client side
    if (typeof window === 'undefined') return;
    
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
      setError("")

      try {
        if (file.type === "application/pdf") {
          setIsLoading(true)
          if (pdfReady) {
            const extractedText = await extractTextSafely(file)
            setFormData((prev) => ({ ...prev, resume_text: extractedText }))
          } else {
            throw new Error("PDF parser is not ready")
          }
          setIsLoading(false)
        } else if (file.type === "text/plain") {
          const text = await file.text()
          setFormData((prev) => ({ ...prev, resume_text: text }))
        } else if (file.name.toLowerCase().endsWith(".docx") || file.name.toLowerCase().endsWith(".doc")) {
          setError("Word documents are not yet supported. Please convert to PDF or paste the text manually.")
        } else {
          setError("Unsupported file type. Please upload a PDF or text file.")
        }
      } catch (error) {
        console.error("File processing failed:", error)
        setError(
          error instanceof Error ? error.message : "Failed to process file. Please try pasting the text manually.",
        )
        setIsLoading(false)
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    // Ensure this only runs on the client side
    if (typeof window === 'undefined') return;

    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      setResumeFile(file)
      setError("")

      // Process the dropped file
      try {
        if (file.type === "application/pdf") {
          setIsLoading(true)
          if (pdfReady) {
            const extractedText = await extractTextSafely(file)
            setFormData((prev) => ({ ...prev, resume_text: extractedText }))
          } else {
            throw new Error("PDF parser is not ready")
          }
          setIsLoading(false)
        } else if (file.type === "text/plain") {
          const text = await file.text()
          setFormData((prev) => ({ ...prev, resume_text: text }))
        } else {
          setError("Unsupported file type. Please upload a PDF or text file.")
        }
      } catch (error) {
        console.error("File processing failed:", error)
        setError(
          error instanceof Error ? error.message : "Failed to process file. Please try pasting the text manually.",
        )
        setIsLoading(false)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (inputMode === "file" && !resumeFile && !formData.resume_text.trim()) {
      setError("Please upload your resume or paste the content")
      return
    }

    if (inputMode === "text" && !formData.resume_text.trim()) {
      setError("Please enter your resume content")
      return
    }

    if (!formData.target_role.trim()) {
      setError("Please specify your target role")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      let response: Response

      if (inputMode === "file" && resumeFile && !formData.resume_text.trim()) {
        // Send as FormData for file upload
        const formDataToSend = new FormData()
        formDataToSend.append("resume", resumeFile)
        formDataToSend.append("interview_feedback", formData.interview_feedback)
        formDataToSend.append("test_performance", formData.test_performance)
        formDataToSend.append("target_role", formData.target_role)

        response = await fetch("/api/failure-analysis", {
          method: "POST",
          body: formDataToSend,
        })
      } else {
        // Send as JSON
        response = await fetch("/api/failure-analysis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resume: formData.resume_text,
            interviewFeedback: formData.interview_feedback,
            testPerformance: formData.test_performance,
            targetRole: formData.target_role,
          }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze your application")
      }

      const result: AnalysisResult = await response.json()
      setAnalysis(result)
    } catch (err) {
      console.error("Submission error:", err)
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const renderFormattedResume = (
    text: string,
    issues: Array<{ text: string; issue: string; suggestion: string }> = [],
  ) => {
    if (!text) return <div className="text-gray-500 italic">No resume content available</div>

    const lines = text.split("\n").filter((line) => line.trim())
    const formattedContent: React.ReactElement[] = []

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim()

      if (isResumeHeader(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-header">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      } else if (isSectionHeader(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-section-header">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      } else if (isContactInfo(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-contact">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      } else if (isJobTitle(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-job-title">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      } else if (isCompanyInfo(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-company">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      } else if (isBulletPoint(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-bullet">
            <span className="bullet-point">•</span>
            <span>{highlightText(trimmedLine.replace(/^[-•*]\s*/, ""), issues, lineIndex)}</span>
          </div>,
        )
      } else if (trimmedLine) {
        formattedContent.push(
          <div key={lineIndex} className="resume-content-line">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>,
        )
      }
    })

    return <div className="resume-formatted">{formattedContent}</div>
  }

  // Helper functions for resume section detection
  const isResumeHeader = (line: string): boolean => {
    const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+/
    const hasCommonWords = /\b(experience|education|skills|projects|summary|objective|contact)\b/i.test(line)
    return namePattern.test(line) && !hasCommonWords && line.length < 50
  }

  const isSectionHeader = (line: string): boolean => {
    const sectionKeywords =
      /^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|OBJECTIVE|CONTACT|CERTIFICATIONS|ACHIEVEMENTS|AWARDS|PROFESSIONAL SUMMARY|TECHNICAL SKILLS)/i
    return sectionKeywords.test(line) || (line.toUpperCase() === line && line.length < 30 && line.length > 3)
  }

  const isContactInfo = (line: string): boolean => {
    return /[@.]/.test(line) || /$$\d{3}$$/.test(line) || /linkedin|github|portfolio/i.test(line)
  }

  const isJobTitle = (line: string): boolean => {
    const jobTitlePattern = /(developer|engineer|manager|analyst|designer|intern|specialist|coordinator|director|lead)/i
    return jobTitlePattern.test(line) && !line.includes("@") && !line.includes("•") && !line.includes("|")
  }

  const isCompanyInfo = (line: string): boolean => {
    const datePattern = /\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i
    return (
      datePattern.test(line) &&
      (line.includes("-") || line.includes("to") || line.includes("present") || line.includes("|"))
    )
  }

  const isBulletPoint = (line: string): boolean => {
    return /^[-•*]\s/.test(line.trim())
  }

  const highlightText = (
    text: string,
    issues: Array<{ text: string; issue: string; suggestion: string }>,
    lineIndex: number,
  ) => {
    if (!issues || issues.length === 0) return <span>{text}</span>

    const highlightedText = text
    const elements: React.ReactElement[] = []
    let lastIndex = 0

    issues.forEach((issue, issueIndex) => {
      const regex = new RegExp(issue.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi")
      let match

      while ((match = regex.exec(highlightedText)) !== null) {
        if (match.index > lastIndex) {
          elements.push(
            <span key={`text-${lineIndex}-${lastIndex}`}>{highlightedText.substring(lastIndex, match.index)}</span>,
          )
        }

        elements.push(
          <span
            key={`highlight-${lineIndex}-${issueIndex}-${match.index}`}
            className={`highlight-issue-${issueIndex % 5} group relative`}
            onClick={() => setSelectedIssueIndex(selectedIssueIndex === issueIndex ? null : issueIndex)}
          >
            {match[0]}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              Click for details
            </div>
          </span>,
        )

        lastIndex = match.index + match[0].length
        regex.lastIndex = 0
        break
      }
    })

    if (lastIndex < highlightedText.length) {
      elements.push(<span key={`text-${lineIndex}-${lastIndex}`}>{highlightedText.substring(lastIndex)}</span>)
    }

    return elements.length > 0 ? <>{elements}</> : <span>{text}</span>
  }

  const downloadOptimizedResume = () => {
    if (!analysis?.optimized_resume || typeof window === 'undefined') return

    const element = document.createElement("a")
    const file = new Blob([analysis.optimized_resume], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "optimized_resume.txt"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const printResume = () => {
    if (typeof window === 'undefined') return
    window.print()
  }

  const resetForm = () => {
    setFormData({
      resume_text: "",
      interview_feedback: "",
      test_performance: "",
      target_role: "",
    })
    setResumeFile(null)
    setAnalysis(null)
    setError("")
    setInputMode("file")
    setShowOptimizedResume(false)
    setSelectedIssueIndex(null)
    setExpandedSections({})
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.8s ease-out;
        }
        
        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(30px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .resume-display {
          font-family: 'Times New Roman', serif;
          line-height: 1.6;
          color: #1a202c;
          background: #ffffff;
        }
        
        .resume-formatted {
          font-size: 11pt;
          max-width: 100%;
        }
        
        .resume-header {
          text-align: center;
          font-size: 20pt;
          font-weight: bold;
          margin-bottom: 12px;
          color: #2d3748;
          border-bottom: 2px solid #4a5568;
          padding-bottom: 8px;
        }
        
        .resume-contact {
          text-align: center;
          font-size: 10pt;
          color: #4a5568;
          margin-bottom: 16px;
        }
        
        .resume-section-header {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #2d3748;
          border-bottom: 1px solid #a0aec0;
          padding-bottom: 4px;
          margin: 20px 0 12px 0;
        }
        
        .resume-job-title {
          font-size: 11pt;
          font-weight: bold;
          color: #2d3748;
          margin: 12px 0 4px 0;
        }
        
        .resume-company {
          font-size: 10pt;
          font-style: italic;
          color: #4a5568;
          margin-bottom: 8px;
        }
        
        .resume-bullet {
          display: flex;
          align-items: flex-start;
          font-size: 10pt;
          line-height: 1.5;
          margin: 4px 0;
          color: #2d3748;
        }
        
        .bullet-point {
          margin-right: 8px;
          font-weight: bold;
          flex-shrink: 0;
          margin-top: 2px;
        }
        
        .resume-content-line {
          font-size: 10pt;
          line-height: 1.5;
          color: #2d3748;
          margin: 4px 0;
        }
        
        .highlight-issue-0 {
          background: linear-gradient(120deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.2) 100%);
          border-left: 3px solid #ef4444;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .highlight-issue-1 {
          background: linear-gradient(120deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.2) 100%);
          border-left: 3px solid #f97316;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .highlight-issue-2 {
          background: linear-gradient(120deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.2) 100%);
          border-left: 3px solid #a855f7;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .highlight-issue-3 {
          background: linear-gradient(120deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.2) 100%);
          border-left: 3px solid #3b82f6;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .highlight-issue-4 {
          background: linear-gradient(120deg, rgba(34, 197, 94, 0.1) 0%, rgba(34, 197, 94, 0.2) 100%);
          border-left: 3px solid #22c55e;
          padding: 2px 6px;
          margin: 0 2px;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .highlight-issue-0:hover,
        .highlight-issue-1:hover,
        .highlight-issue-2:hover,
        .highlight-issue-3:hover,
        .highlight-issue-4:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        @media print {
          .resume-display {
            box-shadow: none;
            border: none;
            padding: 0.5in;
            margin: 0;
            max-width: none;
            font-size: 10pt;
          }
          
          .highlight-issue-0,
          .highlight-issue-1,
          .highlight-issue-2,
          .highlight-issue-3,
          .highlight-issue-4 {
            background: none !important;
            border-left: none !important;
            border-bottom: 1px dotted #666 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="text-center mb-16 animate-fade-in">
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  <Heart className="w-10 h-10 text-red-500 animate-pulse" />
                  <Brain className="w-8 h-8 text-blue-600 absolute -top-2 -right-2" />
                </div>
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">AI Career Assistant</h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Transform rejection into opportunity. Get AI-powered insights to understand why your application didn't
                succeed and receive a personalized roadmap for improvement.
              </p>
            </div>

            {!analysis ? (
              /* Enhanced Input Form */
              <div className="max-w-4xl mx-auto animate-slide-up">
                <div className="glass-effect rounded-3xl shadow-2xl p-8 border border-white/20">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Resume Input Section */}
                    <div className="space-y-6">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Resume Content</h3>
                          <p className="text-sm text-gray-600">Upload your resume or paste the content</p>
                        </div>
                      </div>

                      {/* Input Mode Toggle */}
                      <div className="flex bg-gray-100 rounded-xl p-1 w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => setInputMode("file")}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                            inputMode === "file"
                              ? "bg-white text-blue-600 shadow-md transform scale-105"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          <Upload className="w-4 h-4 inline mr-2" />
                          Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => setInputMode("text")}
                          className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                            inputMode === "text"
                              ? "bg-white text-blue-600 shadow-md transform scale-105"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                        >
                          <Edit className="w-4 h-4 inline mr-2" />
                          Paste Text
                        </button>
                      </div>

                      {inputMode === "file" ? (
                        <div
                          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
                            isDragOver
                              ? "border-blue-400 bg-blue-50 scale-105"
                              : resumeFile
                                ? "border-green-400 bg-green-50"
                                : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                          }`}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx,.txt"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={!pdfReady}
                          />
                          <div className="space-y-4">
                            {!pdfReady ? (
                              <>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <div>
                                  <p className="text-lg font-medium text-gray-700">Loading PDF processor...</p>
                                  <p className="text-sm text-gray-500">Please wait while we initialize the PDF parser</p>
                                </div>
                              </>
                            ) : resumeFile ? (
                              <>
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
                                <div>
                                  <p className="text-lg font-medium text-green-700">{resumeFile.name}</p>
                                  <p className="text-sm text-green-600">File uploaded successfully</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                                <div>
                                  <p className="text-lg font-medium text-gray-700">
                                    Drop your resume here or click to browse
                                  </p>
                                  <p className="text-sm text-gray-500">Supports PDF, DOC, DOCX, TXT files</p>
                                </div>
                              </>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={!pdfReady}
                            className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Choose File
                          </button>
                        </div>
                      ) : (
                        <div className="relative">
                          <textarea
                            value={formData.resume_text}
                            onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                            placeholder="Paste your resume content here..."
                            className="w-full h-48 p-6 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm leading-relaxed transition-all duration-200"
                            required={inputMode === "text"}
                          />
                          <div className="absolute bottom-4 right-4 text-xs text-gray-400">
                            {formData.resume_text.length} characters
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Additional Information Grid */}
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Interview Feedback */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Interview Feedback</h4>
                            <p className="text-xs text-gray-600">Optional</p>
                          </div>
                        </div>
                        <textarea
                          value={formData.interview_feedback}
                          onChange={(e) => setFormData({ ...formData, interview_feedback: e.target.value })}
                          placeholder="Share any feedback you received or your reflection on the interview..."
                          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all duration-200"
                        />
                      </div>

                      {/* Test Performance */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <TrendingUp className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Test Performance</h4>
                            <p className="text-xs text-gray-600">Optional</p>
                          </div>
                        </div>
                        <textarea
                          value={formData.test_performance}
                          onChange={(e) => setFormData({ ...formData, test_performance: e.target.value })}
                          placeholder="Describe your performance on technical tests or coding challenges..."
                          className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Target Role */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <Target className="w-4 h-4 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Target Role</h4>
                          <p className="text-xs text-gray-600">Required</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={formData.target_role}
                        onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                        placeholder="e.g., Senior Frontend Developer, Product Manager, Data Scientist"
                        className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all duration-200"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-scale-in">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700 text-sm">{error}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center space-x-3">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Analyzing Your Application...</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-2">
                          <Sparkles className="w-5 h-5" />
                          <span>Get My Personalized Analysis</span>
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              /* Analysis Results */
              <div className="space-y-8 animate-fade-in">
                {/* Encouragement Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-3xl p-8 text-center shadow-2xl animate-scale-in">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse" />
                  <h2 className="text-3xl font-bold mb-3">Your Analysis is Ready!</h2>
                  <p className="text-xl opacity-95 max-w-2xl mx-auto">{safeRenderContent(analysis.encouragement)}</p>
                </div>

                {/* Main Layout - Resume and Insights */}
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Column - Resume Display */}
                  <div className="space-y-6">
                    <div className="glass-effect rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
                      {/* Resume Header */}
                      <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                            <FileText className="w-6 h-6 mr-3 text-blue-600" />
                            Your Resume
                          </h3>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setShowOptimizedResume(!showOptimizedResume)}
                              className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                showOptimizedResume
                                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              {showOptimizedResume ? "Original" : "Optimized"}
                            </button>
                            <button
                              onClick={printResume}
                              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Printer className="w-4 h-4 mr-2" />
                              Print
                            </button>
                            {analysis.optimized_resume && (
                              <button
                                onClick={downloadOptimizedResume}
                                className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Resume Content */}
                      <div className="resume-display max-h-[600px] overflow-y-auto p-8">
                        {showOptimizedResume
                          ? renderFormattedResume(analysis.optimized_resume || "Optimized resume not available")
                          : renderFormattedResume(
                              analysis.resume_content || "Resume content not available",
                              analysis.highlighted_issues || [],
                            )}
                      </div>

                      {/* Issue Indicators */}
                      {analysis.highlighted_issues &&
                        (analysis.highlighted_issues?.length || 0) > 0 &&
                        !showOptimizedResume && (
                          <div className="p-6 border-t border-gray-200 bg-gray-50">
                            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                              <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                              Issues Found ({analysis.highlighted_issues?.length || 0})
                            </h4>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                              {analysis.highlighted_issues.map((issue, index) => (
                                <div
                                  key={index}
                                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                                    selectedIssueIndex === index
                                      ? "bg-red-100 border-2 border-red-300 shadow-md"
                                      : "bg-white hover:bg-gray-100 border border-gray-200"
                                  }`}
                                  onClick={() => setSelectedIssueIndex(selectedIssueIndex === index ? null : index)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-700 mb-1">"{issue.text}"</p>
                                      <p className="text-sm text-red-600 mb-2">{issue.issue}</p>
                                      {selectedIssueIndex === index && (
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                          <p className="text-sm text-green-700 font-medium flex items-start">
                                            <Lightbulb className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
                                            {issue.suggestion}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <ChevronDown
                                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                        selectedIssueIndex === index ? "rotate-180" : ""
                                      }`}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Right Column - Analysis & Insights */}
                  <div className="space-y-6">
                    {/* Positive Notes */}
                    <div className="glass-effect rounded-3xl p-6 border border-green-200 shadow-xl">
                      <h3 className="flex items-center text-2xl font-bold text-green-800 mb-6">
                        <CheckCircle className="w-6 h-6 mr-3" />
                        What You're Doing Right
                      </h3>
                      <div className="space-y-3">
                        {(analysis.positive_notes || []).map((note, index) => (
                          <div key={index} className="flex items-start p-3 bg-green-50 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <span className="text-green-800 text-sm leading-relaxed">{safeRenderContent(note)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Issues Analysis */}
                    <div className="glass-effect rounded-3xl p-6 border border-red-200 shadow-xl">
                      <h3 className="flex items-center text-2xl font-bold text-red-800 mb-6">
                        <AlertCircle className="w-6 h-6 mr-3" />
                        Areas for Improvement
                      </h3>

                      <div className="space-y-6">
                        {(analysis.analysis?.resume_issues?.length || 0) > 0 && (
                          <div>
                            <button
                              onClick={() => toggleSection("resume")}
                              className="flex items-center justify-between w-full p-4 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                            >
                              <div className="flex items-center">
                                <FileText className="w-5 h-5 mr-3 text-red-600" />
                                <span className="font-semibold text-red-800">
                                  Resume Issues ({analysis.analysis?.resume_issues?.length || 0})
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-red-600 transition-transform duration-200 ${
                                  expandedSections.resume ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {expandedSections.resume && (
                              <div className="mt-3 space-y-2">
                                {(analysis.analysis?.resume_issues || []).map((issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start p-3 bg-white rounded-lg border border-red-200"
                                  >
                                    <span className="text-red-500 mr-3 mt-1">•</span>
                                    <span className="text-red-700 text-sm leading-relaxed">{safeRenderContent(issue)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {(analysis.analysis?.interview_issues?.length || 0) > 0 && (
                          <div>
                            <button
                              onClick={() => toggleSection("interview")}
                              className="flex items-center justify-between w-full p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors"
                            >
                              <div className="flex items-center">
                                <MessageSquare className="w-5 h-5 mr-3 text-orange-600" />
                                <span className="font-semibold text-orange-800">
                                  Interview Issues ({analysis.analysis?.interview_issues?.length || 0})
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-orange-600 transition-transform duration-200 ${
                                  expandedSections.interview ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {expandedSections.interview && (
                              <div className="mt-3 space-y-2">
                                {(analysis.analysis?.interview_issues || []).map((issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start p-3 bg-white rounded-lg border border-orange-200"
                                  >
                                    <span className="text-orange-500 mr-3 mt-1">•</span>
                                    <span className="text-orange-700 text-sm leading-relaxed">{safeRenderContent(issue)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {(analysis.analysis?.test_issues?.length || 0) > 0 && (
                          <div>
                            <button
                              onClick={() => toggleSection("test")}
                              className="flex items-center justify-between w-full p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
                            >
                              <div className="flex items-center">
                                <TrendingUp className="w-5 h-5 mr-3 text-purple-600" />
                                <span className="font-semibold text-purple-800">
                                  Test Issues ({analysis.analysis?.test_issues?.length || 0})
                                </span>
                              </div>
                              <ChevronDown
                                className={`w-5 h-5 text-purple-600 transition-transform duration-200 ${
                                  expandedSections.test ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                            {expandedSections.test && (
                              <div className="mt-3 space-y-2">
                                {(analysis.analysis?.test_issues || []).map((issue, index) => (
                                  <div
                                    key={index}
                                    className="flex items-start p-3 bg-white rounded-lg border border-purple-200"
                                  >
                                    <span className="text-purple-500 mr-3 mt-1">•</span>
                                    <span className="text-purple-700 text-sm leading-relaxed">{safeRenderContent(issue)}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Plan */}
                    <div className="glass-effect rounded-3xl p-6 border border-blue-200 shadow-xl">
                      <h3 className="flex items-center text-2xl font-bold text-blue-800 mb-6">
                        <Brain className="w-6 h-6 mr-3" />
                        Your Action Plan
                      </h3>
                      <div className="space-y-3">
                        {(analysis.recommendations || []).map((rec, index) => (
                          <div
                            key={index}
                            className="flex items-start p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
                          >
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-blue-800 text-sm leading-relaxed">{safeRenderContent(rec)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fix Suggestions - Full Width */}
                <div className="glass-effect rounded-3xl p-8 border border-indigo-200 shadow-xl">
                  <h3 className="flex items-center text-2xl font-bold text-indigo-800 mb-8">
                    <Edit className="w-6 h-6 mr-3" />
                    Before & After Examples
                  </h3>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="font-bold text-indigo-700 text-lg flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        Resume Improvement
                      </h4>
                      <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                        <p className="text-indigo-800 text-sm leading-relaxed">
                          {safeRenderContent(analysis.fix_suggestions.resume_rewrite)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="font-bold text-indigo-700 text-lg flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Interview Answer Improvement
                      </h4>
                      <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-200">
                        <p className="text-indigo-800 text-sm leading-relaxed">
                          {safeRenderContent(analysis.fix_suggestions.mock_answer_rewrite)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resources Section */}
                <div className="glass-effect rounded-3xl p-8 border border-gray-200 shadow-xl">
                  <h3 className="flex items-center text-2xl font-bold text-gray-800 mb-8">
                    <BookOpen className="w-6 h-6 mr-3" />
                    Helpful Resources
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(analysis.resources || []).map((resource, index) => (
                      <a
                        key={index}
                        href={resource?.link || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center p-6 bg-white rounded-2xl hover:bg-gray-50 transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-lg transform hover:-translate-y-1"
                      >
                        <BookOpen className="w-6 h-6 text-gray-500 group-hover:text-blue-600 mr-4 transition-colors" />
                        <span className="text-gray-700 group-hover:text-blue-700 font-medium text-sm transition-colors">
                          {resource?.topic || 'Resource'}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Reset Button */}
                <div className="text-center pt-8">
                  <button
                    onClick={resetForm}
                    className="bg-gray-600 text-white font-semibold py-4 px-8 rounded-2xl hover:bg-gray-700 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center mx-auto space-x-3"
                  >
                    <RefreshCw className="w-5 h-5" />
                    <span>Analyze Another Application</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

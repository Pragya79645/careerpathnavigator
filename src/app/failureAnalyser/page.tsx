'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, MessageSquare, Target, Brain, Heart, TrendingUp, BookOpen, CheckCircle, Download, Eye, Edit, Lightbulb, Printer } from 'lucide-react';
import { extractTextFromPDF } from '../../../utils/parsePDF.js';
import React from 'react';

interface AnalysisResult {
  analysis: {
    resume_issues: string[];
    interview_issues: string[];
    test_issues: string[];
  };
  recommendations: string[];
  fix_suggestions: {
    resume_rewrite: string;
    mock_answer_rewrite: string;
  };
  resources: Array<{
    topic: string;
    link: string;
  }>;
  positive_notes: string[];
  encouragement: string;
  resume_content?: string;
  optimized_resume?: string;
  highlighted_issues?: Array<{
    text: string;
    issue: string;
    suggestion: string;
  }>;
}

export default function CareerAssistant() {
  const [formData, setFormData] = useState({
    resume_text: '',
    interview_feedback: '',
    test_performance: '',
    target_role: ''
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOptimizedResume, setShowOptimizedResume] = useState(false);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setResumeFile(file);
      setError('');
      
      // If it's a PDF, extract text on client side for better processing
      if (file.type === 'application/pdf') {
        try {
          const extractedText = await extractTextFromPDF(file);
          setFormData(prev => ({ ...prev, resume_text: extractedText }));
        } catch (error) {
          console.error('PDF extraction failed:', error);
          // Continue with file upload - backend can handle it
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputMode === 'file' && !resumeFile) {
      setError('Please upload your resume first');
      return;
    }
    
    if (inputMode === 'text' && !formData.resume_text.trim()) {
      setError('Please enter your resume content');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response;
      
      if (inputMode === 'file') {
        // Prefer extracted text if available, otherwise send file
        if (formData.resume_text.trim()) {
          // Send as JSON with extracted text
          response = await fetch('/api/failure-analyser', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              resume: formData.resume_text,
              interviewFeedback: formData.interview_feedback,
              testPerformance: formData.test_performance,
              targetRole: formData.target_role,
            }),
          });
        } else {
          // Send as FormData for file upload
          const formDataToSend = new FormData();
          formDataToSend.append('resume', resumeFile!);
          formDataToSend.append('interview_feedback', formData.interview_feedback);
          formDataToSend.append('test_performance', formData.test_performance);
          formDataToSend.append('target_role', formData.target_role);

          response = await fetch('/api/failure-analyser', {
            method: 'POST',
            body: formDataToSend,
          });
        }
      } else {
        // Send as JSON for text input
        response = await fetch('/api/failure-analyser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resume: formData.resume_text,
            interviewFeedback: formData.interview_feedback,
            testPerformance: formData.test_performance,
            targetRole: formData.target_role,
          }),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to analyze your application');
      }

      const result = await response.json();
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  // Utility functions for resume downloading

  // Enhanced resume formatting function
  const renderFormattedResume = (text: string, issues: Array<{text: string; issue: string; suggestion: string}> = []) => {
    if (!text) return <div>No resume content available</div>;
    
    // Split text into lines and format each section
    const lines = text.split('\n').filter(line => line.trim());
    let formattedContent: React.ReactElement[] = [];
    
    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();
      
      // Detect and format different resume sections
      if (isResumeHeader(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-header mb-6">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      } else if (isSectionHeader(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-section-header mt-6 mb-3">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      } else if (isContactInfo(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-contact mb-2">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      } else if (isJobTitle(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-job-title mt-4 mb-1">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      } else if (isCompanyInfo(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-company mb-2">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      } else if (isBulletPoint(trimmedLine)) {
        formattedContent.push(
          <div key={lineIndex} className="resume-bullet ml-4 mb-1">
            <span className="bullet-point">•</span>
            {highlightText(trimmedLine.replace(/^[-•*]\s*/, ''), issues, lineIndex)}
          </div>
        );
      } else if (trimmedLine) {
        formattedContent.push(
          <div key={lineIndex} className="resume-content-line mb-2">
            {highlightText(trimmedLine, issues, lineIndex)}
          </div>
        );
      }
    });
    
    return <div className="resume-formatted">{formattedContent}</div>;
  };

  // Helper functions for resume section detection
  const isResumeHeader = (line: string): boolean => {
    // Detect name (usually first line, all caps or title case, no common keywords)
    const namePattern = /^[A-Z][a-z]+\s+[A-Z][a-z]+/;
    const hasCommonWords = /\b(experience|education|skills|projects|summary|objective|contact)\b/i.test(line);
    return namePattern.test(line) && !hasCommonWords && line.length < 50;
  };

  const isSectionHeader = (line: string): boolean => {
    const sectionKeywords = /^(EXPERIENCE|EDUCATION|SKILLS|PROJECTS|SUMMARY|OBJECTIVE|CONTACT|CERTIFICATIONS|ACHIEVEMENTS|AWARDS)/i;
    return sectionKeywords.test(line) || (line.toUpperCase() === line && line.length < 30);
  };

  const isContactInfo = (line: string): boolean => {
    return /[@.]/.test(line) || /\(\d{3}\)/.test(line) || /linkedin|github|portfolio/i.test(line);
  };

  const isJobTitle = (line: string): boolean => {
    const jobTitlePattern = /(developer|engineer|manager|analyst|designer|intern|specialist|coordinator|director|lead)/i;
    return jobTitlePattern.test(line) && !line.includes('@') && !line.includes('•');
  };

  const isCompanyInfo = (line: string): boolean => {
    const datePattern = /\d{4}|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i;
    return datePattern.test(line) && (line.includes('-') || line.includes('to') || line.includes('present'));
  };

  const isBulletPoint = (line: string): boolean => {
    return /^[-•*]\s/.test(line.trim());
  };

  // Enhanced highlighting function
  const highlightText = (text: string, issues: Array<{text: string; issue: string; suggestion: string}>, lineIndex: number) => {
    if (!issues || issues.length === 0) return <span>{text}</span>;
    
    let highlightedText = text;
    let elements: React.ReactElement[] = [];
    let lastIndex = 0;
    
    issues.forEach((issue, issueIndex) => {
      const regex = new RegExp(issue.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      let match;
      
      while ((match = regex.exec(highlightedText)) !== null) {
        // Add text before the match
        if (match.index > lastIndex) {
          elements.push(
            <span key={`text-${lineIndex}-${lastIndex}`}>
              {highlightedText.substring(lastIndex, match.index)}
            </span>
          );
        }
        
        // Add highlighted text
        elements.push(
          <span
            key={`highlight-${lineIndex}-${issueIndex}-${match.index}`}
            className={`highlight-issue-${issueIndex % 5}`}
            data-issue={issue.issue}
            data-suggestion={issue.suggestion}
            title={`Issue: ${issue.issue}\nSuggestion: ${issue.suggestion}`}
            onClick={() => setSelectedIssueIndex(selectedIssueIndex === issueIndex ? null : issueIndex)}
          >
            {match[0]}
          </span>
        );
        
        lastIndex = match.index + match[0].length;
        regex.lastIndex = 0; // Reset to find all matches
        break; // Only highlight first occurrence per line
      }
    });
    
    // Add remaining text
    if (lastIndex < highlightedText.length) {
      elements.push(
        <span key={`text-${lineIndex}-${lastIndex}`}>
          {highlightedText.substring(lastIndex)}
        </span>
      );
    }
    
    return elements.length > 0 ? <>{elements}</> : <span>{text}</span>;
  };

  const downloadOptimizedResume = () => {
    if (!analysis?.optimized_resume) return;
    
    const element = document.createElement('a');
    const file = new Blob([analysis.optimized_resume], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'optimized_resume.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const printResume = () => {
    const printContent = document.querySelector('.resume-display');
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.outerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload(); // Reload to restore event handlers
  };

  const resetForm = () => {
    setFormData({
      resume_text: '',
      interview_feedback: '',
      test_performance: '',
      target_role: ''
    });
    setResumeFile(null);
    setAnalysis(null);
    setError('');
    setInputMode('file');
    setShowOptimizedResume(false);
    setSelectedIssueIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* CSS for LaTeX-style resume formatting and highlighting */}
      <style jsx global>{`
        .resume-display {
          font-family: 'Times New Roman', 'DejaVu Serif', serif;
          line-height: 1.6;
          color: #000;
          background: #fff;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .resume-content {
          max-width: 100%;
          margin: 0 auto;
        }
        
        .resume-formatted {
          font-size: 11pt;
        }
        
        .resume-header {
          text-align: center;
          font-size: 18pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 1px;
          border-bottom: 2px solid #000;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        
        .resume-contact {
          text-align: center;
          font-size: 10pt;
          color: #333;
          margin: 2px 0;
        }
        
        .resume-section-header {
          font-size: 12pt;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #666;
          padding-bottom: 2px;
          margin: 16px 0 8px 0;
          color: #000;
        }
        
        .resume-job-title {
          font-size: 11pt;
          font-weight: bold;
          color: #000;
          margin: 8px 0 2px 0;
        }
        
        .resume-company {
          font-size: 10pt;
          font-style: italic;
          color: #333;
          margin: 0 0 4px 0;
        }
        
        .resume-bullet {
          display: flex;
          align-items: flex-start;
          font-size: 10pt;
          line-height: 1.4;
          margin: 2px 0;
          color: #000;
        }
        
        .bullet-point {
          margin-right: 8px;
          font-weight: bold;
          flex-shrink: 0;
        }
        
        .resume-content-line {
          font-size: 10pt;
          line-height: 1.4;
          color: #000;
          margin: 2px 0;
        }
        
        /* LaTeX-style formatting and highlighting */
        .latex-resume {
          font-family: var(--font-serif), 'Crimson Text', 'Computer Modern', 'Latin Modern Roman', 'Times New Roman', serif;
          line-height: 1.5;
          color: #2d3748;
          background: #ffffff;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
          max-width: 8.5in;
          margin: 0 auto;
          font-size: 11pt;
        }

        .resume-header {
          text-align: center;
          font-size: 24pt;
          font-weight: bold;
          margin-bottom: 0.5rem;
          letter-spacing: 0.05em;
          border-bottom: 2px solid #2d3748;
          padding-bottom: 0.5rem;
        }

        .resume-contact {
          text-align: center;
          font-size: 10pt;
          color: #4a5568;
          margin-bottom: 1rem;
        }

        .resume-section-header {
          font-size: 14pt;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          padding-bottom: 0.25rem;
          border-bottom: 1px solid #4a5568;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .resume-job-title {
          font-size: 12pt;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.25rem;
        }

        .resume-company {
          font-size: 11pt;
          font-style: italic;
          color: #4a5568;
          margin-bottom: 0.5rem;
        }

        .resume-bullet {
          font-size: 10pt;
          margin-bottom: 0.25rem;
          display: flex;
          align-items: flex-start;
        }

        .bullet-point {
          margin-right: 0.5rem;
          margin-top: 0.1rem;
          font-weight: bold;
        }

        .resume-content-line {
          font-size: 10pt;
          margin-bottom: 0.25rem;
        }

        /* Issue highlighting with LaTeX-compatible styling */
        .highlight-issue-0 {
          background-color: rgba(239, 68, 68, 0.15);
          border-left: 3px solid #ef4444;
          padding: 2px 4px;
          margin: 0 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .highlight-issue-1 {
          background-color: rgba(249, 115, 22, 0.15);
          border-left: 3px solid #f97316;
          padding: 2px 4px;
          margin: 0 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .highlight-issue-2 {
          background-color: rgba(168, 85, 247, 0.15);
          border-left: 3px solid #a855f7;
          padding: 2px 4px;
          margin: 0 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .highlight-issue-3 {
          background-color: rgba(59, 130, 246, 0.15);
          border-left: 3px solid #3b82f6;
          padding: 2px 4px;
          margin: 0 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .highlight-issue-4 {
          background-color: rgba(34, 197, 94, 0.15);
          border-left: 3px solid #22c55e;
          padding: 2px 4px;
          margin: 0 1px;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }
        
        .highlight-issue-0:hover::after,
        .highlight-issue-1:hover::after,
        .highlight-issue-2:hover::after,
        .highlight-issue-3:hover::after,
        .highlight-issue-4:hover::after {
          content: "Click for details";
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10pt;
          white-space: nowrap;
          z-index: 10;
        }
        
        .highlight-issue-0:hover,
        .highlight-issue-1:hover,
        .highlight-issue-2:hover,
        .highlight-issue-3:hover,
        .highlight-issue-4:hover {
          background-color: rgba(0, 0, 0, 0.1);
          transform: translateY(-1px);
        }
        
        /* Print styles for professional output */
        @media print {
          .latex-resume {
            box-shadow: none;
            border: none;
            padding: 1in;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-red-500 mr-2" />
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              AI Career Assistant
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Turn rejection into redirection. Get personalized insights on why your application didn't work and how to improve for your next opportunity.
            </p>
          </div>

          {!analysis ? (
            /* Input Form */
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Resume Input - File Upload or Text */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                    Resume Content
                  </label>
                  
                  {/* Input Mode Toggle */}
                  <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setInputMode('file')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                        inputMode === 'file'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode('text')}
                      className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                        inputMode === 'text'
                          ? 'bg-white text-blue-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Paste Text
                    </button>
                  </div>

                  {inputMode === 'file' ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center justify-center w-full text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Upload className="w-6 h-6 mr-2" />
                        {resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOC, DOCX, TXT)'}
                      </button>
                    </div>
                  ) : (
                    <textarea
                      value={formData.resume_text}
                      onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
                      placeholder="Paste your resume content here..."
                      className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      required={inputMode === 'text'}
                    />
                  )}
                </div>

                {/* Interview Feedback */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                    Interview Feedback (Optional)
                  </label>
                  <textarea
                    value={formData.interview_feedback}
                    onChange={(e) => setFormData({ ...formData, interview_feedback: e.target.value })}
                    placeholder="Share any feedback you received from the interview, or your own reflection on how it went..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Test Performance */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <TrendingUp className="w-5 h-5 mr-2 text-purple-500" />
                    Test Performance (Optional)
                  </label>
                  <textarea
                    value={formData.test_performance}
                    onChange={(e) => setFormData({ ...formData, test_performance: e.target.value })}
                    placeholder="Describe your performance on any technical tests, coding challenges, or assessments..."
                    className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Target Role */}
                <div>
                  <label className="flex items-center text-lg font-semibold text-gray-700 mb-3">
                    <Target className="w-5 h-5 mr-2 text-orange-500" />
                    Target Role
                  </label>
                  <input
                    type="text"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    placeholder="e.g., Frontend Developer, Product Manager, Data Scientist"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Analyzing Your Application...
                    </div>
                  ) : (
                    'Get My Personalized Analysis'
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Analysis Results - Two Column Layout */
            <div className="space-y-6">
              {/* Encouragement Header */}
              <div className="bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-2xl p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Your Analysis is Ready!</h2>
                <p className="text-lg opacity-90">{analysis.encouragement}</p>
              </div>

              {/* Main Two-Column Layout */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Resume Display with Highlights */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center">
                          <FileText className="w-6 h-6 mr-2 text-blue-500" />
                          Your Resume
                        </h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowOptimizedResume(!showOptimizedResume)}
                            className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            {showOptimizedResume ? 'Original' : 'Optimized'}
                          </button>
                          <button
                            onClick={printResume}
                            className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                          >
                            <Printer className="w-4 h-4 mr-1" />
                            Print
                          </button>
                          {analysis.optimized_resume && (
                            <button
                              onClick={downloadOptimizedResume}
                              className="flex items-center px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      {/* Resume Content with LaTeX-style Formatting */}
                      <div className="latex-resume max-h-96 overflow-y-auto resume-display">
                        {showOptimizedResume ? (
                          <div className="resume-content">
                            {renderFormattedResume(analysis.optimized_resume || 'Optimized resume not available')}
                          </div>
                        ) : (
                          <div className="resume-content">
                            {renderFormattedResume(
                              analysis.resume_content || 'Resume content not available',
                              analysis.highlighted_issues || []
                            )}
                          </div>
                        )}
                      </div>
                      
                      {/* Issue Indicators */}
                      {analysis.highlighted_issues && analysis.highlighted_issues.length > 0 && !showOptimizedResume && (
                        <div className="mt-4 px-6 pb-6">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                            <Lightbulb className="w-4 h-4 mr-1 text-yellow-500" />
                            Issues Found in Resume:
                          </h4>
                          <div className="space-y-2">
                            {analysis.highlighted_issues.map((issue, index) => (
                              <div
                                key={index}
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                  selectedIssueIndex === index 
                                    ? 'bg-red-100 border border-red-300' 
                                    : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                                onClick={() => setSelectedIssueIndex(selectedIssueIndex === index ? null : index)}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-xs font-medium text-gray-600 mb-1">"{issue.text}"</p>
                                    <p className="text-xs text-red-600">{issue.issue}</p>
                                    {selectedIssueIndex === index && (
                                      <p className="text-xs text-green-600 mt-2 font-medium">
                                        💡 {issue.suggestion}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Analysis & Improvements */}
                <div className="space-y-6">
                  {/* Positive Notes */}
                  <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="flex items-center text-xl font-semibold text-green-800 mb-4">
                      <CheckCircle className="w-6 h-6 mr-2" />
                      What You're Doing Right
                    </h3>
                    <ul className="space-y-2">
                      {analysis.positive_notes.map((note, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-green-700 text-sm">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Why You Failed - Issues Analysis */}
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <h3 className="flex items-center text-xl font-semibold text-red-800 mb-4">
                      <Target className="w-6 h-6 mr-2" />
                      Areas That Need Improvement
                    </h3>
                    
                    {analysis.analysis.resume_issues.length > 0 && (
                      <div className="mb-6">
                        <h4 className="flex items-center text-lg font-semibold text-red-700 mb-3">
                          <FileText className="w-5 h-5 mr-2" />
                          Resume Issues
                        </h4>
                        <ul className="space-y-2">
                          {analysis.analysis.resume_issues.map((issue, index) => (
                            <li key={index} className="text-red-700 text-sm flex items-start">
                              <span className="text-red-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.analysis.interview_issues.length > 0 && (
                      <div className="mb-6">
                        <h4 className="flex items-center text-lg font-semibold text-orange-700 mb-3">
                          <MessageSquare className="w-5 h-5 mr-2" />
                          Interview Issues
                        </h4>
                        <ul className="space-y-2">
                          {analysis.analysis.interview_issues.map((issue, index) => (
                            <li key={index} className="text-orange-700 text-sm flex items-start">
                              <span className="text-orange-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.analysis.test_issues.length > 0 && (
                      <div>
                        <h4 className="flex items-center text-lg font-semibold text-purple-700 mb-3">
                          <TrendingUp className="w-5 h-5 mr-2" />
                          Test Issues
                        </h4>
                        <ul className="space-y-2">
                          {analysis.analysis.test_issues.map((issue, index) => (
                            <li key={index} className="text-purple-700 text-sm flex items-start">
                              <span className="text-purple-500 mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Actionable Recommendations */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="flex items-center text-xl font-semibold text-blue-800 mb-4">
                      <Brain className="w-6 h-6 mr-2" />
                      Your Action Plan
                    </h3>
                    <ul className="space-y-3">
                      {analysis.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <TrendingUp className="w-4 h-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                          <span className="text-blue-700 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Fix Suggestions */}
                  <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6">
                    <h3 className="flex items-center text-xl font-semibold text-indigo-800 mb-4">
                      <Edit className="w-6 h-6 mr-2" />
                      Before & After Examples
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-indigo-700 mb-2">Resume Improvement:</h4>
                        <p className="text-indigo-600 bg-indigo-100 p-3 rounded-lg text-sm">
                          {analysis.fix_suggestions.resume_rewrite}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-indigo-700 mb-2">Interview Answer Improvement:</h4>
                        <p className="text-indigo-600 bg-indigo-100 p-3 rounded-lg text-sm">
                          {analysis.fix_suggestions.mock_answer_rewrite}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resources Section - Full Width */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h3 className="flex items-center text-xl font-semibold text-gray-800 mb-4">
                  <BookOpen className="w-6 h-6 mr-2" />
                  Helpful Resources
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.resources.map((resource, index) => (
                    <a
                      key={index}
                      href={resource.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-white rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <BookOpen className="w-5 h-5 text-gray-500 mr-3" />
                      <span className="text-gray-700 font-medium">{resource.topic}</span>
                    </a>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <div className="text-center">
                <button
                  onClick={resetForm}
                  className="bg-gray-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Analyze Another Application
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
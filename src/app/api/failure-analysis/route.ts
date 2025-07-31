import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
  resume_content: string
  optimized_resume: string
  highlighted_issues: Array<{
    text: string
    issue: string
    suggestion: string
  }>
}

async function extractTextFromFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const text = new TextDecoder().decode(buffer)
  
  // For PDF files, you might want to use a proper PDF parser
  // For now, we'll handle text files and assume PDF text is provided
  if (file.type === 'application/pdf') {
    // In a real implementation, you'd use a PDF parsing library here
    throw new Error('PDF parsing not implemented. Please paste your resume text instead.')
  }
  
  return text
}

function createAnalysisPrompt(resumeText: string, interviewFeedback: string, testPerformance: string, targetRole: string): string {
  return `You are an expert career coach and hiring manager. Analyze the following job application materials and provide detailed feedback.

**Resume Content:**
${resumeText}

**Target Role:** ${targetRole}

**Interview Feedback:** ${interviewFeedback || 'Not provided'}

**Test Performance:** ${testPerformance || 'Not provided'}

Please provide a comprehensive analysis in the following JSON format (ensure valid JSON):

{
  "analysis": {
    "resume_issues": ["List specific issues with the resume - be detailed and actionable"],
    "interview_issues": ["List interview-related issues if feedback was provided"],
    "test_issues": ["List test/assessment issues if performance data was provided"]
  },
  "recommendations": ["List 5-7 specific, actionable recommendations for improvement"],
  "fix_suggestions": {
    "resume_rewrite": "Provide a specific before/after example of how to improve a resume bullet point",
    "mock_answer_rewrite": "Provide a specific example of how to improve an interview answer using STAR method"
  },
  "resources": [
    {"topic": "Resource Name", "link": "https://example.com"},
    {"topic": "Another Resource", "link": "https://example.com"}
  ],
  "positive_notes": ["List 3-5 things the candidate is doing well"],
  "encouragement": "A motivational message for the candidate",
  "highlighted_issues": [
    {
      "text": "Exact text from resume that needs improvement",
      "issue": "What's wrong with this text",
      "suggestion": "How to improve it"
    }
  ]
}

Focus on:
1. ATS optimization and keyword usage
2. Quantifiable achievements and metrics
3. Action verbs and impact statements
4. Relevance to the target role
5. Interview preparation and behavioral questions
6. Technical assessment performance
7. Overall presentation and formatting

Be constructive, specific, and actionable in your feedback.`
}

function createOptimizedResumePrompt(resumeText: string, targetRole: string, issues: string[]): string {
  return `Based on the following resume and identified issues, create an optimized version for the role of ${targetRole}.

**Original Resume:**
${resumeText}

**Key Issues to Address:**
${issues.join('\n')}

**Instructions:**
1. Maintain the same basic structure and information
2. Add quantifiable metrics where possible (use realistic estimates if exact numbers aren't available)
3. Use stronger action verbs
4. Optimize for ATS with relevant keywords for ${targetRole}
5. Improve bullet points to show impact and results
6. Ensure proper formatting and professional presentation

Please provide the complete optimized resume text (not JSON, just the resume content):`
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type')
    let resumeText = ''
    let interviewFeedback = ''
    let testPerformance = ''
    let targetRole = ''

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData()
      const resumeFile = formData.get('resume') as File
      interviewFeedback = formData.get('interview_feedback') as string || ''
      testPerformance = formData.get('test_performance') as string || ''
      targetRole = formData.get('target_role') as string || ''

      if (resumeFile) {
        resumeText = await extractTextFromFile(resumeFile)
      }
    } else {
      // Handle JSON data
      const body = await request.json()
      resumeText = body.resume || ''
      interviewFeedback = body.interviewFeedback || ''
      testPerformance = body.testPerformance || ''
      targetRole = body.targetRole || ''
    }

    if (!resumeText.trim()) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      )
    }

    if (!targetRole.trim()) {
      return NextResponse.json(
        { error: 'Target role is required' },
        { status: 400 }
      )
    }

    // Initialize Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    // Get initial analysis
    const analysisPrompt = createAnalysisPrompt(resumeText, interviewFeedback, testPerformance, targetRole)
    const analysisResult = await model.generateContent(analysisPrompt)
    const analysisText = analysisResult.response.text()

    // Parse the JSON response
    let analysis: Partial<AnalysisResult>
    try {
      // Clean the response to extract JSON
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      analysis = JSON.parse(jsonMatch[0])
    } catch (parseError) {
      console.error('Failed to parse analysis JSON:', parseError)
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // Generate optimized resume
    const optimizedResumePrompt = createOptimizedResumePrompt(
      resumeText, 
      targetRole, 
      analysis.analysis?.resume_issues || []
    )
    const optimizedResult = await model.generateContent(optimizedResumePrompt)
    const optimizedResume = optimizedResult.response.text()

    // Combine results
    const finalResult: AnalysisResult = {
      analysis: {
        resume_issues: Array.isArray(analysis.analysis?.resume_issues) ? analysis.analysis.resume_issues : [],
        interview_issues: Array.isArray(analysis.analysis?.interview_issues) ? analysis.analysis.interview_issues : [],
        test_issues: Array.isArray(analysis.analysis?.test_issues) ? analysis.analysis.test_issues : []
      },
      recommendations: Array.isArray(analysis.recommendations) ? analysis.recommendations : [],
      fix_suggestions: {
        resume_rewrite: typeof analysis.fix_suggestions?.resume_rewrite === 'string' 
          ? analysis.fix_suggestions.resume_rewrite 
          : typeof analysis.fix_suggestions?.resume_rewrite === 'object' && analysis.fix_suggestions?.resume_rewrite
          ? JSON.stringify(analysis.fix_suggestions.resume_rewrite, null, 2)
          : 'No resume improvement suggestions available',
        mock_answer_rewrite: typeof analysis.fix_suggestions?.mock_answer_rewrite === 'string'
          ? analysis.fix_suggestions.mock_answer_rewrite
          : typeof analysis.fix_suggestions?.mock_answer_rewrite === 'object' && analysis.fix_suggestions?.mock_answer_rewrite
          ? JSON.stringify(analysis.fix_suggestions.mock_answer_rewrite, null, 2)
          : 'No interview answer improvement suggestions available'
      },
      resources: Array.isArray(analysis.resources) ? analysis.resources : [],
      positive_notes: Array.isArray(analysis.positive_notes) ? analysis.positive_notes : [],
      encouragement: typeof analysis.encouragement === 'string' ? analysis.encouragement : 'Keep working hard - you\'re on the right track!',
      resume_content: resumeText,
      optimized_resume: optimizedResume,
      highlighted_issues: Array.isArray(analysis.highlighted_issues) ? analysis.highlighted_issues : []
    }

    return NextResponse.json(finalResult)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze application. Please try again.' },
      { status: 500 }
    )
  }
}

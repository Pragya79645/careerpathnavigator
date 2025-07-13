import { NextRequest, NextResponse } from 'next/server';

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

// Function to call Gemini API
async function analyzeWithGemini(
  resumeContent: string,
  interviewFeedback: string,
  testPerformance: string,
  targetRole: string
): Promise<AnalysisResult> {
  const prompt = `
You are an empathetic career AI assistant helping a user who was rejected after a job application. Your goal is to provide constructive, actionable feedback while maintaining a supportive tone.

Analyze the following information:
- Resume Content: ${resumeContent}
- Interview Feedback: ${interviewFeedback || 'None provided'}
- Test Performance: ${testPerformance || 'None provided'}
- Target Role: ${targetRole}

Please provide a comprehensive analysis and return ONLY valid JSON in exactly this format (no additional text, no markdown, no code blocks):

{
  "analysis": {
    "resume_issues": ["specific issue 1", "specific issue 2"],
    "interview_issues": ["specific issue 1", "specific issue 2"],
    "test_issues": ["specific issue 1", "specific issue 2"]
  },
  "recommendations": [
    "actionable recommendation 1",
    "actionable recommendation 2",
    "actionable recommendation 3"
  ],
  "fix_suggestions": {
    "resume_rewrite": "Example of how to improve a resume line with specific metrics and impact",
    "mock_answer_rewrite": "Example of how to improve an interview answer with concrete examples and the STAR method"
  },
  "resources": [
    { "topic": "Resume writing", "link": "https://www.coursera.org/learn/resume-writing" },
    { "topic": "Interview preparation", "link": "https://www.pramp.com/" },
    { "topic": "Technical skills for ${targetRole}", "link": "https://leetcode.com/" }
  ],
  "positive_notes": [
    "positive observation 1",
    "positive observation 2"
  ],
  "encouragement": "A supportive, encouraging message that acknowledges the rejection but focuses on growth and future opportunities",
  "highlighted_issues": [
    { "text": "exact text from resume that needs improvement", "issue": "what's wrong with it", "suggestion": "how to improve it" }
  ],
  "optimized_resume": "A completely rewritten and optimized version of the resume tailored for the ${targetRole} position, with improved structure, keywords, quantified achievements, and better formatting"
}

Guidelines:
- Be specific and actionable in your feedback
- Include quantifiable examples in fix_suggestions
- Tailor recommendations to the target role
- Maintain an empathetic, supportive tone
- Focus on growth and improvement opportunities
- Provide relevant, high-quality resource links
- In highlighted_issues, find exact phrases from the resume that need improvement
- Create a completely optimized resume that addresses all identified issues
- Ensure all JSON is properly formatted and valid
`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiRes.ok) {
      throw new Error(`Gemini API error: ${geminiRes.status}`);
    }

    const data = await geminiRes.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean the response - remove any potential markdown code blocks
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    }
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      const parsed = JSON.parse(cleanedText);
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      console.error('Raw response:', rawText);
      throw new Error('Invalid JSON response from Gemini');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

// Fallback analysis function (in case Gemini fails)
async function getFallbackAnalysis(
  resumeContent: string,
  interviewFeedback: string,
  testPerformance: string,
  targetRole: string
): Promise<AnalysisResult> {
  const analysis: AnalysisResult = {
    analysis: {
      resume_issues: [],
      interview_issues: [],
      test_issues: []
    },
    recommendations: [],
    fix_suggestions: {
      resume_rewrite: "",
      mock_answer_rewrite: ""
    },
    resources: [
      { topic: "Resume optimization", link: "https://www.coursera.org/learn/resume-writing" },
      { topic: "Interview preparation", link: "https://www.pramp.com/" },
      { topic: "Technical skill building", link: "https://leetcode.com/" }
    ],
    positive_notes: [
      "Shows initiative by applying to competitive roles",
      "Demonstrates learning mindset through continuous skill development"
    ],
    encouragement: "Every rejection is a step closer to your perfect role. Keep growing and improving! 🚀"
  };

  // Basic analysis logic
  if (resumeContent.length < 500) {
    analysis.analysis.resume_issues.push("Resume appears too brief - consider adding more detailed descriptions");
  }

  const roleLower = targetRole.toLowerCase();
  if (roleLower.includes('developer') || roleLower.includes('engineer')) {
    analysis.recommendations.push("Add quantifiable metrics to your technical projects");
    analysis.recommendations.push("Highlight specific technologies relevant to the role");
    analysis.fix_suggestions.resume_rewrite = "Built a full-stack e-commerce platform using React/Node.js, handling 1000+ concurrent users and reducing page load time by 60%";
    analysis.fix_suggestions.mock_answer_rewrite = "Instead of 'I worked on various projects,' try: 'I developed a real-time chat application using Socket.io and React, which improved user engagement by 35% and supported 500+ concurrent users'";
  }

  if (interviewFeedback.trim()) {
    analysis.analysis.interview_issues.push("Review interview feedback for specific areas of improvement");
    analysis.recommendations.push("Practice mock interviews to build confidence");
  }

  if (testPerformance.trim()) {
    analysis.analysis.test_issues.push("Focus on improving technical assessment performance");
    analysis.recommendations.push("Practice coding problems and technical concepts");
  }

  return analysis;
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let resumeContent = '';
    let interviewFeedback = '';
    let testPerformance = '';
    let targetRole = '';

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload (FormData)
      const formData = await request.formData();
      
      const resumeFile = formData.get('resume') as File;
      interviewFeedback = formData.get('interview_feedback') as string || '';
      testPerformance = formData.get('test_performance') as string || '';
      targetRole = formData.get('target_role') as string || '';

      if (!resumeFile) {
        return NextResponse.json(
          { error: 'Resume file is required' },
          { status: 400 }
        );
      }

      // Read resume content from file
      resumeContent = await resumeFile.text();
    } else {
      // Handle JSON input
      const body = await request.json();
      resumeContent = body.resume || '';
      interviewFeedback = body.interviewFeedback || '';
      testPerformance = body.testPerformance || '';
      targetRole = body.targetRole || '';
    }

    // Validate required fields
    if (!resumeContent.trim()) {
      return NextResponse.json(
        { error: 'Resume content is required' },
        { status: 400 }
      );
    }

    if (!targetRole.trim()) {
      return NextResponse.json(
        { error: 'Target role is required' },
        { status: 400 }
      );
    }

    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY not found, using fallback analysis');
      const analysis = await getFallbackAnalysis(
        resumeContent,
        interviewFeedback,
        testPerformance,
        targetRole
      );
      // Add resume content to response
      const enrichedAnalysis = {
        ...analysis,
        resume_content: resumeContent
      };
      return NextResponse.json(enrichedAnalysis);
    }

    try {
      // Try to analyze with Gemini first
      const analysis = await analyzeWithGemini(
        resumeContent,
        interviewFeedback,
        testPerformance,
        targetRole
      );
      // Add resume content to response
      const enrichedAnalysis = {
        ...analysis,
        resume_content: resumeContent
      };
      return NextResponse.json(enrichedAnalysis);
    } catch (geminiError) {
      console.error('Gemini analysis failed, using fallback:', geminiError);
      
      // If Gemini fails, use fallback analysis
      const fallbackAnalysis = await getFallbackAnalysis(
        resumeContent,
        interviewFeedback,
        testPerformance,
        targetRole
      );
      // Add resume content to fallback response
      const enrichedFallbackAnalysis = {
        ...fallbackAnalysis,
        resume_content: resumeContent
      };
      return NextResponse.json(enrichedFallbackAnalysis);
    }
    
  } catch (error) {
    console.error('Error analyzing application:', error);
    return NextResponse.json(
      { error: 'Failed to analyze application. Please try again.' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
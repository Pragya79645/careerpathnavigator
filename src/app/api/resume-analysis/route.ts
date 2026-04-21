import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

// Initialize Gemini AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set")
  }
  return new GoogleGenerativeAI(apiKey)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { resumeText } = body

    // Handle connectivity test case
    if (resumeText === "Test resume text") {
      console.log("API connectivity test successful")
      return NextResponse.json({ success: true, message: "API connection successful" })
    }

    // Validate input
    if (!resumeText) {
      return NextResponse.json({ error: "Resume text is required" }, { status: 400 })
    }

    console.log("Processing resume text with Gemini 2.5 Flash:", resumeText.substring(0, 100) + "...")

    // Initialize Gemini client
    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    })

    // 1. Extract basic info from the resume
    const parsePrompt = `Parse the following resume and extract the following information in JSON format:
    1. name
    2. email
    3. phone
    4. location (if available)
    5. education (as an array of strings)
    6. skills (as an array of strings)
    7. experience (as an array of objects, each with company, title, dates, and description fields)
    8. certifications (as an array of strings, if available)
    
    Resume text:
    ${resumeText}`;

    const parseResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: parsePrompt }] }],
      systemInstruction: "You are a resume parsing assistant. Extract key information from the resume text provided. Format your response as a JSON object."
    });

    const parsedResumeData = JSON.parse(parseResult.response.text());
    console.log("Successfully parsed resume data")

    // 2. Generate career path analysis
    const careerPrompt = `Based on the following resume information, provide 3 potential career paths for this person. For each career path, include:
    1. A title for the career path
    2. A brief description of why this career path is suitable
    3. A list of requiredSkills for this career path (as an array of strings)
    4. A list of missingSkills (skills the person needs to develop) (as an array of strings)
    5. A development roadmap with specific steps to acquire the missing skills (as an array of objects with step and description fields)
    
    Format your response as a JSON object with a "careerPaths" array.
    
    Resume information:
    ${JSON.stringify(parsedResumeData, null, 2)}`;

    const careerResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: careerPrompt }] }],
      systemInstruction: "You are a career counselor AI. Analyze the resume and provide career path recommendations with skill gap analysis."
    });

    const careerAnalysis = JSON.parse(careerResult.response.text());
    console.log("Successfully generated career analysis")

    // 3. Generate resume improvement suggestions with advanced ATS scoring
    const improvementPrompt = `Analyze this resume based on strict ATS scoring factors and score only based on machine-readable standards.

    Evaluate the resume using these 6 core ATS criteria, scored out of 10:

    ### ATS Scoring Criteria:

    1. **Formatting Compatibility** (1-10): 
       - Avoids tables, columns, graphics, text boxes  
       - Uses standard headings (Experience, Projects, Skills)  
       - Clean, linear, left-aligned layout  

    2. **Keyword Relevance** (1-10):   
       - Contains job-relevant technical keywords (React, JavaScript, APIs, Node.js, Python, SQL, etc.)  
       - Aligns with software developer roles  
       - Repetition of key terms in multiple sections  

    3. **Section Completeness** (1-10):  
       - Includes: Summary/Objective, Skills, Experience, Projects, Education  
       - Sections clearly labeled and distinct  

    4. **Quantified Impact & Action Verbs** (1-10):   
       - Uses data-driven statements (e.g., "Increased speed by 40%", "Led team of 5")  
       - Strong action verbs like built, optimized, deployed, led, developed  

    5. **Grammar & Language Clarity** (1-10): 
       - No spelling or grammar errors  
       - Active voice, consistent tense  
       - Bullet points are concise and clear  

    6. **Length & Density** (1-10):  
       - Appropriate length (1-2 pages for most roles)
       - Balanced white space and content density  
       - Not overcrowded or too sparse

    Provide your response as a JSON object with:
    1. overallAssessment (string): Brief ATS compatibility assessment
    2. contentImprovements (array): Specific content suggestions for ATS optimization
    3. formatImprovements (array): Specific format suggestions for ATS compatibility  
    4. scores object with these exact fields:
       - formattingCompatibility: score 1-10 for ATS-parsable format
       - keywordRelevance: score 1-10 for technical keyword density
       - sectionCompleteness: score 1-10 for having all required sections
       - quantifiedImpact: score 1-10 for data-driven statements and action verbs
       - grammarClarity: score 1-10 for grammar and language quality
       - lengthDensity: score 1-10 for appropriate length and content density
    
    Resume information:
    ${JSON.stringify(parsedResumeData, null, 2)}
    
    Original resume text for formatting analysis:
    ${resumeText.substring(0, 1500)}`;

    const improvementResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: improvementPrompt }] }],
      systemInstruction: "You are an advanced ATS (Applicant Tracking System) evaluator designed for use in modern hiring pipelines at tech companies like Google, Amazon, and Microsoft. Analyze resumes based on strict machine-readable standards, not human readability."
    });

    const improvementSuggestions = JSON.parse(improvementResult.response.text());
    console.log("Successfully generated improvement suggestions")

    // 4. Generate industry insights
    const industryPrompt = `Based on the following resume information, provide industry insights including:
    1. marketDemand (object with demandLevel as string ["High", "Medium", "Low"] and description)
    2. salaryRange (object with min and max values in USD)
    3. growthAreas (array of strings describing growth areas in the candidate's field)
    4. industryTrends (array of objects with trend and description fields)
    5. topEmployers (array of strings listing top employers in the candidate's field)
    
    Format your response as a JSON object.
    
    Resume information:
    ${JSON.stringify(parsedResumeData, null, 2)}`;

    const industryResult = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: industryPrompt }] }],
      systemInstruction: "You are an industry trends analyst. Provide insights about job market trends related to the candidate's skills and experience."
    });

    const industryInsights = JSON.parse(industryResult.response.text());
    console.log("Successfully generated industry insights")

    // Return the combined results
    return NextResponse.json({
      parsed: parsedResumeData,
      careerAnalysis: careerAnalysis,
      improvementSuggestions: improvementSuggestions,
      industryInsights: industryInsights,
    })
  } catch (error: any) {
    console.error("Error in Gemini API:", error.message)
    return NextResponse.json({ error: `Failed to process resume: ${error.message}` }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

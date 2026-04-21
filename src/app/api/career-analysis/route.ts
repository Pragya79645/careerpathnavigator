// api/career-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();
    
    if (!resumeData) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing");
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }
    
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });
    
    // Convert the resume data to a string representation
    const resumeString = JSON.stringify(resumeData, null, 2);
    
    const prompt = `
You are a career expert AI. Analyze this resume data and provide:

1. Three potential career paths based on the candidate's skills and experience
2. Missing skills for each suggested career path
3. A roadmap for acquiring those missing skills

Resume Data:
${resumeString}

Return your analysis as a JSON object with a "careerPaths" array. Each career path should have:
- "title"
- "description"
- "missingSkills" (array of strings)
- "roadmap" (array of objects with "step" and "description")
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      systemInstruction: "You are a career advisor that analyzes resumes and provides career advice. Format your response exactly as requested in JSON."
    });
    
    try {
      const reply = result.response.text();
      const parsed = JSON.parse(reply);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("JSON parsing error:", err);
      console.error("Raw reply from Gemini:", result.response.text());
      return NextResponse.json({ error: "Failed to parse career suggestions" }, { status: 500 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
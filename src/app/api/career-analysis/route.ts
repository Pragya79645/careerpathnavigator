// api/career-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();
    
    if (!resumeData) {
      return NextResponse.json({ error: "Resume data is required" }, { status: 400 });
    }
    
    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing");
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }
    
    // Convert the resume data to a string representation
    const resumeString = JSON.stringify(resumeData, null, 2);
    
    const grokPrompt = `
You are a career expert AI. Analyze this resume data and provide:

1. Three potential career paths based on the candidate's skills and experience
2. Missing skills for each suggested career path
3. A roadmap for acquiring those missing skills

Resume Data:
${resumeString}

Return your analysis in this JSON format:
{
  "careerPaths": [
    {
      "title": "Career Path 1",
      "description": "Why this career path fits the candidate",
      "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "roadmap": [
        {
          "step": "Step 1",
          "description": "Details about this step"
        },
        {
          "step": "Step 2",
          "description": "Details about this step"
        }
      ]
    },
    {
      "title": "Career Path 2",
      "description": "Why this career path fits the candidate",
      "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "roadmap": [
        {
          "step": "Step 1",
          "description": "Details about this step"
        },
        {
          "step": "Step 2",
          "description": "Details about this step"
        }
      ]
    },
    {
      "title": "Career Path 3",
      "description": "Why this career path fits the candidate",
      "missingSkills": ["Skill 1", "Skill 2", "Skill 3"],
      "roadmap": [
        {
          "step": "Step 1",
          "description": "Details about this step"
        },
        {
          "step": "Step 2",
          "description": "Details about this step"
        }
      ]
    }
  ]
}`;

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          { role: 'system', content: 'You are a career advisor that analyzes resumes and provides career advice.' },
          { role: 'user', content: grokPrompt },
        ],
      }),
    });
    
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error("Groq API Error:", errorText);
      return NextResponse.json({ error: "Groq API failed" }, { status: 500 });
    }
    
    const result = await groqResponse.json();
    
    try {
      const reply = result.choices[0].message.content;
      const parsed = JSON.parse(reply);
      return NextResponse.json(parsed);
    } catch (err) {
      console.error("JSON parsing error:", err);
      console.error("Raw reply from Groq:", result.choices[0].message.content);
      return NextResponse.json({ error: "Failed to parse career suggestions" }, { status: 500 });
    }
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
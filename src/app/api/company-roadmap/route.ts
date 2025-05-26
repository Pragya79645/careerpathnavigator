// File: src/app/api/company-roadmap/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { company, role } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    // Call to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-70b-8192",
        messages: [
          {
            role: "system",
            content: `You are a career advisor specializing in tech industry roadmaps with deep knowledge of company-specific hiring practices.
            
            Create detailed, actionable career roadmaps for job seekers targeting specific companies and roles.
            Focus on practical advice that helps candidates stand out in the application process.
            Use markdown formatting to structure your response attractively and readably.`
          },
          {
            role: "user",
            content: `Generate a comprehensive career roadmap for someone targeting a ${role} position at ${company}.

            Structure your response with the following sections using markdown formatting:

            ## 1. Position Overview
            - Detailed description of what the ${role} role entails at ${company} specifically
            - Typical responsibilities and expectations
            - How this role fits into ${company}'s organizational structure

            ## 2. Company Culture & Values
            - Key values ${company} looks for in candidates
            - Unique aspects of ${company}'s work culture
            - How to demonstrate cultural fit during applications and interviews

            ## 3. Technical Skills Required
            - Core technical competencies with priority levels (must-have vs. nice-to-have)
            - ${company}-specific technologies, tools, or methodologies
            - How to demonstrate these skills (projects, certifications, etc.)

            ## 4. Soft Skills & Attributes
            - Critical soft skills valued in this role at ${company}
            - Examples of how these skills apply in day-to-day work
            - How to demonstrate these qualities during the hiring process

            ## 5. Experience Requirements
            - Typical background of successful candidates
            - Alternative paths if someone doesn't have the standard experience
            - How to position non-traditional experience

            ## 6. Detailed Learning Path
            - Specific courses, certifications, and resources with links where possible
            - Books and learning materials valued by ${company} employees
            - Projects to build to demonstrate relevant skills

            ## 7. Application Strategy
            - Best channels to apply (internal referrals, specific job boards, etc.)
            - Resume and portfolio optimization for ${company}'s ATS systems
            - LinkedIn and online presence recommendations

            ## 8. Interview Preparation
            - ${company}'s specific interview process and stages
            - Types of questions to expect with examples
            - Tips from successful candidates who've joined ${company}

            ## 9. Timeline & Roadmap
            - 30-60-90 day preparation plan
            - Milestones to track progress
            - Long-term and short-term goals

            Make the content specific to ${company} and the ${role} position, not generic career advice.
            Use bullet points for readability and include practical examples throughout.`
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq API error status:', response.status);
      console.error('Groq API error text:', errorData);
      return NextResponse.json(
        { error: `API error: ${response.status}` },
        { status: response.status }
      );
    }

    const groqResponse = await response.json();
    const roadmap = groqResponse.choices[0].message.content;

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Error generating roadmap:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to generate roadmap. Please check your API configuration.' },
      { status: 500 }
    );
  }
}
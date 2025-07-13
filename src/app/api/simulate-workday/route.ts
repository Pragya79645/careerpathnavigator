import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    console.log('Simulate workday API called');
    
    // Check if API key exists
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const { job_role, user_context } = await request.json();
    console.log('Request data:', { job_role, user_context });

    if (!job_role || typeof job_role !== 'string') {
      return NextResponse.json(
        { error: 'Job role is required and must be a string' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an AI career mentor that creates realistic day-in-the-life simulations for different job roles. 

Job Role: ${job_role}
User Context: ${user_context || 'No specific background provided'}

Create a detailed, realistic simulation of a typical workday for this role. Your response should be a JSON object with the following structure:

{
  "schedule": [
    {
      "time": "9:00 AM",
      "duration": "30 mins",
      "activity": "Morning Setup",
      "description": "Brief description of what happens during this time slot",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "intensity": "Low/Medium/High"
    }
  ],
  "summary": {
    "tech_intensity": "Low/Medium/High - based on how much technology and technical skills are required",
    "stress_level": "Low/Medium/High - typical stress level for this role",
    "teamwork": "Low/Medium/High - how much collaboration and teamwork is involved",
    "learning_curve": "Low/Medium/High - how steep the learning curve is for someone new to this role",
    "typical_day_hours": "Description of typical work hours (e.g., '9 AM - 5 PM', 'Flexible hours', '8-10 hours with occasional overtime')",
    "work_style": "Brief description of work environment and style (e.g., 'Office-based collaborative', 'Remote-friendly', 'Fast-paced startup environment')",
    "tools": ["List", "of", "common", "tools", "software", "or", "technologies", "used", "in", "this", "role"]
  }
}

Create a realistic 8-hour workday schedule with 8-12 time slots covering:
- Morning setup/preparation (9:00-9:30 AM)
- Email/communication check (9:30-10:00 AM)
- Deep work/core tasks (10:00 AM-12:00 PM)
- Lunch break (12:00-1:00 PM)
- Meetings/collaboration (1:00-3:00 PM)
- Project work/individual tasks (3:00-4:30 PM)
- Wrap-up/planning (4:30-5:00 PM)

For each time slot, provide:
- Realistic time and duration
- Clear activity name
- 2-3 sentence description of what happens
- 2-4 specific tasks performed
- Intensity level (Low/Medium/High)

Make it specific to the job role and realistic for that profession. Consider typical industry practices and work patterns.

Ensure the JSON is valid and properly formatted.
`;

    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    console.log('Gemini API response received, length:', text.length);

    // Clean up the response to extract JSON
    text = text.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    // Try to parse the JSON
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(text);
    } catch (parseError) {
      console.error('JSON parsing failed:', parseError);
      console.error('Raw response:', text);
      
      // Fallback: try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } catch (fallbackError) {
          console.error('Fallback JSON parsing failed:', fallbackError);
          throw new Error('Failed to parse AI response as JSON');
        }
      } else {
        throw new Error('No JSON found in AI response');
      }
    }

    // Validate the response structure
    if (!parsedResponse.schedule || !parsedResponse.summary) {
      console.error('Invalid response structure:', parsedResponse);
      throw new Error('Invalid response structure from AI');
    }

    console.log('Successfully generated simulation');
    return NextResponse.json(parsedResponse);

  } catch (error) {
    console.error('Workday simulation error:', error);
    
    // More specific error handling
    if (error instanceof Error) {
      if (error.message.includes('API key') || error.message.includes('PERMISSION_DENIED')) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('QUOTA_EXCEEDED')) {
        return NextResponse.json(
          { error: 'AI service quota exceeded' },
          { status: 429 }
        );
      }
      
      if (error.message.includes('JSON')) {
        return NextResponse.json(
          { error: 'Failed to process AI response' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate workday simulation' },
      { status: 500 }
    );
  }
}

// Test endpoint to verify API is working
export async function GET() {
  return NextResponse.json({ 
    status: 'API is working',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
}

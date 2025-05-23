// app/api/interview-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This is the type of our request body
interface RequestBody {
  role: string;
  questionType: string;
}

// Structure for question with answer
interface QuestionWithAnswer {
  question: string;
  answer: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request
    const body = await req.json() as RequestBody;
    const { role, questionType } = body;
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Construct the prompt based on the role and question type
    const prompt = constructPrompt(role, questionType);
    
    // Call the Groq API
    const questions = await fetchQuestionsFromGroq(prompt);
    
    // Return the questions
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}

function constructPrompt(role: string, questionType: string): string {
  let promptBase = `Generate a list of 10 common interview questions for a ${role} position, along with suggested answers for each question.`;
  
  switch (questionType) {
    case 'technical':
      promptBase += ' Focus only on technical questions related to the required skills, tools, technologies, and knowledge for this role.';
      break;
    case 'behavioral':
      promptBase += ' Focus only on behavioral and situational questions that assess soft skills, problem-solving approach, teamwork, and cultural fit.';
      break;
    case 'dsa':
      promptBase += ' Focus only on Data Structures and Algorithms (DSA) questions that are commonly asked for this role. Include algorithm problems, coding challenges, time/space complexity analyses, and optimization techniques relevant to this position.';
      promptBase += ' For each DSA question, provide a clear problem statement, example inputs/outputs if applicable, and a detailed solution with code snippets and explanation of the approach.';
      break;
    default:
      promptBase += ' Include a balanced mix of both technical questions about required skills and behavioral questions that assess problem-solving and cultural fit.';
  }
  
  promptBase += ' For each question, provide a concise but comprehensive answer that would demonstrate strong qualifications for the role.';
  promptBase += ' Format your response as JSON with an array of objects, where each object has a "question" field and an "answer" field.';
  
  return promptBase;
}

async function fetchQuestionsFromGroq(prompt: string): Promise<QuestionWithAnswer[]> {
  // Get your Groq API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192', // Use appropriate Groq model
      messages: [
        {
          role: 'system',
          content: 'You are an AI assistant specialized in generating relevant interview questions and high-quality suggested answers for various job roles. Your responses should be specific, concise, and focused on real interview scenarios for the requested role. When generating DSA questions, include clear problem statements, expected inputs/outputs, and detailed algorithm explanations with code samples. Output must be in valid JSON format.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4096, // Increased for longer content with answers
      response_format: { type: "json_object" } // Ensure JSON response
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }
  
  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Parse the JSON response
  try {
    const parsedContent = JSON.parse(content);
    
    // Ensure we have an array of questions and answers
    if (Array.isArray(parsedContent)) {
      return parsedContent as QuestionWithAnswer[];
    } else if (parsedContent.questions && Array.isArray(parsedContent.questions)) {
      return parsedContent.questions as QuestionWithAnswer[];
    } else {
      // Fallback handling in case the format is different
      throw new Error('Unexpected response format');
    }
  } catch (error) {
    console.error('Failed to parse response:', error);
    // Fallback parsing if JSON parse fails
    return parseQuestionsManually(content);
  }
}

// Fallback parsing function if the JSON parsing fails
function parseQuestionsManually(content: string): QuestionWithAnswer[] {
  const questions: QuestionWithAnswer[] = [];
  
  // Try to split by question numbers
  const questionBlocks = content.split(/\d+\.\s+/).filter(block => block.trim() !== '');
  
  if (questionBlocks.length > 0) {
    for (const block of questionBlocks) {
      const parts = block.split(/\n+Answer:|\n+Suggested Answer:|\n+Response:|\n+Solution:/i);
      
      if (parts.length >= 2) {
        const question = parts[0].trim();
        const answer = parts[1].trim();
        questions.push({ question, answer });
      }
    }
  }
  
  // If we couldn't extract question-answer pairs, return some placeholder content
  if (questions.length === 0) {
    // Split by lines and try to extract questions
    const lines = content.split('\n').filter(line => line.trim() !== '');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.match(/^\d+\./) || line.includes('?')) {
        // This might be a question
        const question = line.replace(/^\d+\.\s+/, '').trim();
        const answer = "Unable to extract a specific answer for this question. Please prepare an answer that demonstrates your relevant experience and skills.";
        questions.push({ question, answer });
      }
    }
  }
  
  return questions;
}
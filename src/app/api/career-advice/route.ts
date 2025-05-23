// File: app/api/career-advice/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Define type for incoming messages
type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    
    // Validate request data
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Get Groq API key from environment variables
    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error('Missing GROQ_API_KEY environment variable');
      return NextResponse.json(
        { error: 'API configuration error' },
        { status: 500 }
      );
    }

    // Prepare the system message with cleaner formatting instructions
    const systemMessage = {
      role: 'system',
      content: `You are a professional career counselor with extensive knowledge of various industries, job markets, career paths, and professional development strategies. Your goal is to provide personalized, practical career advice based on the user's specific situation and questions.

      Guidelines:
      - Give thoughtful, nuanced career advice that considers multiple perspectives
      - Provide specific, actionable recommendations
      - Support your advice with relevant industry insights and best practices
      - Be encouraging and empathetic while remaining realistic
      - Avoid giving generic answers; tailor your responses to the user's specific career situation
      - Ask clarifying questions when needed to provide better guidance
      
      Response Formatting Instructions:
      1. Use clear, simple formatting:
         - For main headings: Use the # symbol (e.g., "# Career Options")
         - For subheadings: Use ## or ### (e.g., "## Next Steps")
         - For emphasis: Use colons sparingly only for truly important points (e.g., ":Key insight:")
      
      2. For lists, follow these rules:
         - For bullet points, use dashes followed by meaningful content (e.g., "- Your point here")
         - For numbered lists, use consecutive numbers (e.g., "1. First point", "2. Second point")
         - Ensure each list item contains substantial content
      
      3. Format special sections using these patterns (use sparingly):
         - "ACTION: Brief description of what to do"
         - "TIP: Brief advice on a particular topic"
         - "NOTE: Important information to remember"
         - "EXAMPLE: Brief illustrative scenario"
      
      4. Structure your responses with clear organization:
         - Start with a brief introduction addressing the user's question
         - Use headings to separate main sections
         - Group related information logically
         - End with a concise conclusion
      
      Current date: ${new Date().toLocaleDateString()}`
    };

    // Prepare the messages array to send to Groq
    const allMessages = [
      systemMessage,
      ...messages.map((message: Message) => ({
        role: message.role,
        content: message.content
      }))
    ];

    // Make request to Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1024
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      return NextResponse.json(
        { error: 'Error from language model API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    let processedResponse = data.choices[0].message.content;

    // Ensure list completeness
    const numberedListRegex = /\d+\.\s*$/m;
    if (numberedListRegex.test(processedResponse)) {
      processedResponse = processedResponse.replace(numberedListRegex, (match: any) => `${match}[This point needs completion]`);
    }

    const bulletListRegex = /-\s*$/m;
    if (bulletListRegex.test(processedResponse)) {
      processedResponse = processedResponse.replace(bulletListRegex, (match: any) => `${match}[This point needs completion]`);
    }

    // Clean stars and asterisks from markdown
    processedResponse = processedResponse
      .replace(/\*\*(.*?)\*\*/g, '$1') // remove bold markdown
      .replace(/\*(.*?)\*/g, '$1');    // remove italic markdown

    return NextResponse.json({ response: processedResponse });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

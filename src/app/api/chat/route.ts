export async function POST(req: Request) {
  const { prompt, conversationHistory } = await req.json();

  // Intent detection using Gemini for dynamic routing
  const detectIntent = async (userPrompt: string, context: string) => {
    const intentPrompt = `
      Analyze this career-related question and determine its primary intent. Respond with ONLY the intent category and relevant resource domains.

      Question: "${userPrompt}"
      Context: ${context}

      Classify the intent as ONE of these categories:
      1. LEARNING - seeking courses, tutorials, skill development
      2. JOB_SEARCH - looking for jobs, career opportunities, applications
      3. INTERVIEW_PREP - interview questions, coding challenges, preparation
      4. PORTFOLIO - showcasing work, projects, personal branding
      5. TECHNOLOGY - specific programming languages, frameworks, tools
      6. CAREER_ADVICE - general guidance, path planning, decisions
      7. SALARY - compensation, negotiation, market rates
      8. NETWORKING - building connections, professional relationships

      Respond in this exact format:
      INTENT: [category]
      DOMAINS: [relevant technology/field domains, comma-separated]
      FOCUS: [specific focus area within the intent]

      Example:
      INTENT: LEARNING
      DOMAINS: javascript, react, frontend
      FOCUS: beginner tutorials
    `;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: intentPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 100 }
        })
      });

      const data = await res.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "INTENT: CAREER_ADVICE\nDOMAINS: general\nFOCUS: guidance";
    } catch (error) {
      console.error("Intent detection error:", error);
      return "INTENT: CAREER_ADVICE\nDOMAINS: general\nFOCUS: guidance";
    }
  };

  // Dynamic resource context based on detected intent
  const buildDynamicContext = (intentResult: string) => {
    const lines = intentResult.split('\n');
    const intent = lines.find(l => l.startsWith('INTENT:'))?.split(':')[1]?.trim();
    const domains = lines.find(l => l.startsWith('DOMAINS:'))?.split(':')[1]?.trim()?.split(',') || [];
    const focus = lines.find(l => l.startsWith('FOCUS:'))?.split(':')[1]?.trim();

    let contextInstructions = "\n\nIMPORTANT FORMATTING RULES:\n- NO asterisks (*) in your response\n- Use 'strong emphasis' instead of bold formatting\n- Always provide clickable links in format [Link Text](https://url.com)\n- Use simple bullet points with hyphens (-)\n- Be specific and actionable\n";

    // Dynamic context based on intent
    switch (intent) {
      case 'LEARNING':
        contextInstructions += `
LEARNING INTENT DETECTED - Focus: ${focus}
- Prioritize educational resources and structured learning paths
- Include beginner to advanced progression
- Suggest practical projects and hands-on exercises
- Recommended platforms: [Coursera](https://coursera.org), [Udemy](https://udemy.com), [freeCodeCamp](https://freecodecamp.org), [Pluralsight](https://pluralsight.com)`;
        break;

      case 'JOB_SEARCH':
        contextInstructions += `
JOB SEARCH INTENT DETECTED - Focus: ${focus}
- Emphasize job boards and application strategies
- Include networking and professional development tips
- Suggest resume and LinkedIn optimization
- Recommended platforms: [LinkedIn Jobs](https://linkedin.com/jobs), [Indeed](https://indeed.com), [AngelList](https://angel.co), [Glassdoor](https://glassdoor.com)`;
        break;

      case 'INTERVIEW_PREP':
        contextInstructions += `
INTERVIEW PREPARATION INTENT DETECTED - Focus: ${focus}
- Focus on technical and behavioral interview preparation
- Include coding practice and system design resources
- Suggest mock interview platforms
- Recommended platforms: [LeetCode](https://leetcode.com), [Pramp](https://pramp.com), [InterviewBit](https://interviewbit.com), [Cracking the Coding Interview](https://crackingthecodinginterview.com)`;
        break;

      case 'PORTFOLIO':
        contextInstructions += `
PORTFOLIO INTENT DETECTED - Focus: ${focus}
- Emphasize project showcase and personal branding
- Include hosting and deployment suggestions
- Suggest portfolio design best practices
- Recommended platforms: [GitHub Pages](https://pages.github.com), [Netlify](https://netlify.com), [Vercel](https://vercel.com), [Portfolio.dev](https://portfolio.dev)`;
        break;

      case 'TECHNOLOGY':
        contextInstructions += `
TECHNOLOGY INTENT DETECTED - Domains: ${domains.join(', ')} - Focus: ${focus}
- Provide technology-specific resources and documentation
- Include community forums and learning communities
- Suggest practical projects and real-world applications
- Technology-specific resources based on domains: ${domains.join(', ')}`;
        
        // Add domain-specific resources
        domains.forEach(domain => {
          const tech = domain.trim().toLowerCase();
          if (tech.includes('javascript') || tech.includes('js')) {
            contextInstructions += `\n- JavaScript: [JavaScript.info](https://javascript.info), [MDN](https://developer.mozilla.org), [You Don't Know JS](https://github.com/getify/You-Dont-Know-JS)`;
          }
          if (tech.includes('react')) {
            contextInstructions += `\n- React: [React Docs](https://react.dev), [React Tutorial](https://react-tutorial.app), [React Patterns](https://reactpatterns.com)`;
          }
          if (tech.includes('python')) {
            contextInstructions += `\n- Python: [Python.org](https://python.org), [Real Python](https://realpython.com), [Automate the Boring Stuff](https://automatetheboringstuff.com)`;
          }
          if (tech.includes('node')) {
            contextInstructions += `\n- Node.js: [Node.js Docs](https://nodejs.org), [Express.js](https://expressjs.com), [Node School](https://nodeschool.io)`;
          }
        });
        break;

      case 'SALARY':
        contextInstructions += `
SALARY INTENT DETECTED - Focus: ${focus}
- Provide compensation research and negotiation strategies
- Include market rate comparisons and tools
- Suggest negotiation tactics and preparation
- Recommended platforms: [Glassdoor](https://glassdoor.com), [PayScale](https://payscale.com), [Levels.fyi](https://levels.fyi), [Salary.com](https://salary.com)`;
        break;

      case 'NETWORKING':
        contextInstructions += `
NETWORKING INTENT DETECTED - Focus: ${focus}
- Emphasize professional relationship building
- Include industry events and community participation
- Suggest social media and online presence optimization
- Recommended platforms: [LinkedIn](https://linkedin.com), [Meetup](https://meetup.com), [Twitter](https://twitter.com), [Discord Communities](https://discord.com)`;
        break;

      default: // CAREER_ADVICE
        contextInstructions += `
CAREER ADVICE INTENT DETECTED - Focus: ${focus}
- Provide comprehensive career guidance and planning
- Include multiple resource types for holistic development
- Suggest actionable next steps and goal setting
- Mix of learning, networking, and practical resources`;
    }

    return contextInstructions;
  };

  try {
    // Build conversation context from history
    const buildConversationContext = () => {
      if (!conversationHistory || conversationHistory.length === 0) {
        return "";
      }
      
      // Take last 6 messages for context (3 exchanges)
      const recentHistory = conversationHistory.slice(-6);
      const contextMessages = recentHistory.map((msg: any) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');
      
      return `\n\nPREVIOUS CONVERSATION CONTEXT:\n${contextMessages}\n\nCurrent question: `;
    };

    // Get conversation context
    const conversationContext = buildConversationContext();
    
    console.log("Backend received:", { prompt, conversationHistoryLength: conversationHistory?.length });
    console.log("Conversation context:", conversationContext);
    
    // For debugging: Skip intent detection temporarily and use default context
    console.log("Skipping intent detection for debugging");
    const intentResult = "INTENT: CAREER_ADVICE\nDOMAINS: general\nFOCUS: guidance";
    const dynamicContext = buildDynamicContext(intentResult);
    
    console.log("Using default intent:", intentResult);

    // Enhanced prompt with dynamic context
    const enhancedPrompt = `
        You are Gemini, a concise AI career assistant. Answer the user's question directly and briefly.
        
        IMPORTANT: The user has asked a NEW question. Answer ONLY this current question.
        
        Previous conversation context: ${conversationContext}
        
        CURRENT USER QUESTION: ${prompt}
        
        Provide a brief, helpful response with relevant links in format [Link Text](https://url.com).
      `;

    // Using Google's Gemini API with intent-based dynamic context
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: enhancedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512, // Reduced for more concise responses
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      }),
    });

    const data = await res.json();

    console.log("Gemini Raw Response:", JSON.stringify(data, null, 2));

    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates.length || !data.candidates[0].content) {
      return new Response(
        JSON.stringify({ answer: "I'm having trouble generating a response right now. Please try again!" }), 
        { status: 200 }
      );
    }

    // Extract the text from Gemini's response structure
    const answer = data.candidates[0].content.parts[0].text;

    // Extract intent from the intent result for response
    const intentLines = intentResult.split('\n');
    const detectedIntent = intentLines.find((line: string) => line.startsWith('INTENT:'))?.split(':')[1]?.trim() || 'CAREER_ADVICE';

    return Response.json({ 
      answer, 
      detectedIntent,
      intentResult // Include full intent analysis for debugging
    });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    return new Response(
      JSON.stringify({ answer: "I'm experiencing some technical difficulties. Please try again in a moment!" }), 
      { status: 500 }
    );
  }
}
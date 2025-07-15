// app/api/interview-questions/route.ts
import { NextRequest, NextResponse } from 'next/server';

// This is the type of our request body
interface RequestBody {
  role: string;
  questionType: string;
  company?: string;
  mode?: 'interview' | 'flashcard';
}

// Structure for question with answer and difficulty
interface QuestionWithAnswer {
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  importance: 'High' | 'Medium' | 'Low';
}

// Structure for organized resources
interface Resource {
  title: string;
  url?: string;
  type: 'Website' | 'Video' | 'Course' | 'Book' | 'Practice Platform' | 'Article' | 'GitHub' | 'PDF';
  description?: string;
}

// Structure for the new response format
interface InterviewPrepResponse {
  mode: 'general' | 'company-specific';
  displayMode: 'interview' | 'flashcard';
  company: string;
  role: string;
  questionType: string;
  interviewRounds: string[];
  questions: QuestionWithAnswer[];
  topicsToPrepare: string[];
  resources: Resource[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tip: string;
  applicationTimeline?: string;
  preparationTimeEstimate?: string;
  sourceNote?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming request
    const body = await req.json() as RequestBody;
    const { role, questionType, company, mode = 'interview' } = body;
    
    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Construct the prompt based on the role, question type, company, and mode
    const prompt = constructPrompt(role, questionType, company, mode);
    
    // Call the Groq API
    const response = await fetchInterviewPrepFromGroq(prompt);
    
    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate interview questions' },
      { status: 500 }
    );
  }
}

function constructPrompt(role: string, questionType: string, company?: string, displayMode: 'interview' | 'flashcard' = 'interview'): string {
  const mode = company ? 'company-specific' : 'general';
  
  let promptBase = `You are a smart interview preparation assistant.

${displayMode === 'flashcard' ? `
🎯 **FLASHCARD MODE ACTIVATED**
You are creating FLASHCARD-STYLE content for technical revision. This is specifically designed for quick review and memorization.

FLASHCARD REQUIREMENTS:
- Questions should be CONCISE and FOCUSED on key concepts
- Answers should be COMPREHENSIVE but STRUCTURED for easy memorization
- Focus on CORE TECHNICAL CONCEPTS that are frequently tested
- Each answer should be like an "A+ explanation" - clear, complete, and memorable
- Use bullet points, numbered lists, and clear formatting
- Include memory aids, mnemonics, or key phrases where helpful

` : ''}

IMPORTANT: When asked to return technical or behavioral interview questions for a specific company (e.g., Amazon, Microsoft, Google), only include *real, verified, and frequently asked* questions.

✅ Use trusted data sources such as:
- Glassdoor interview experiences
- LeetCode Discuss company-specific threads
- GeeksforGeeks Interview Experiences
- CareerCup company pages
- Interviewing.io recordings
- Blind or LinkedIn experience posts

DO NOT invent or fabricate generic questions. Instead, return questions with answers that:
- Are reported by candidates as being actually asked
- Are tagged under that company's LeetCode or GFG sections
- Appear consistently in multiple interview prep lists
- Have been verified across multiple sources

When returning results, always include a section called resources that contains 3–5 *real, commonly recommended resources* used by candidates to prepare for interviews.

These can include:
- YouTube video links (e.g., System Design Primer, Resume tips)
- LeetCode tag pages or curated lists (e.g., Amazon tag)
- GitHub repositories (e.g., 75 DSA Sheet, Awesome-System-Design)
- Books (e.g., Cracking the Coding Interview)
- Official company prep pages or handbooks

Only include *popular, reliable, and widely used* resources. Don't make them up. Format links clearly and include the title.

Modify your output behavior to support two preparation modes:

---

*Mode 1: General Preparation (No Company Selected)*  
If the user has not selected a company, return:
1. **EXACTLY 12-15** most important common ${questionType} interview questions asked by top tech companies (based on frequency across multiple sources)
2. For each question, provide the difficulty level (Easy, Medium, Hard) and importance level (High, Medium, Low)
3. General list of topics to study for this category  
4. The types of interview rounds usually associated with this category  
5. The expected overall difficulty level (Easy, Medium, or Hard)
6. 3-5 real, commonly recommended resources with proper titles and URLs

**MINIMUM QUESTION COUNT REQUIREMENT**: Must provide at least 12 questions, preferably 15 questions for comprehensive preparation.

---

*Mode 2: Company-Specific Preparation*  
If the user provides a target company (e.g., Amazon) and a role (e.g., SDE), return:
1. **EXACTLY 12-15** most important company-specific ${questionType} interview questions that have been ACTUALLY ASKED at ${company || 'the specified company'}
2. For each question, provide the difficulty level (Easy, Medium, Hard) and importance level (High, Medium, Low) specific to that company
3. The number and names of interview rounds this company conducts for that role  
4. The key skills or topics the candidate must focus on for this specific company
5. A difficulty level based on the company's process  
6. 3-5 real resources tailored to that company's preparation with proper titles and URLs (e.g., company-specific LeetCode tags, official prep guides)
7. A short preparation tip or strategy note specific to the company
8. Application timeline (if known)
9. Estimated preparation time needed
10. Include a sourceNote mentioning that questions were gathered from verified sources like Glassdoor, LeetCode company tags, and interview experiences

**MINIMUM QUESTION COUNT REQUIREMENT**: Must provide at least 12 questions, preferably 15 questions for comprehensive company-specific preparation.

---

Always return the output in this JSON format:
{
  "mode": "general" or "company-specific",
  "displayMode": "${displayMode}",
  "company": "",
  "role": "",
  "questionType": "",
  "interviewRounds": [],
  "questions": [
    {
      "question": "${displayMode === 'flashcard' ? 'CONCISE technical question focusing on key concepts' : 'Question text (REAL question that was actually asked)'}",
      "answer": "${displayMode === 'flashcard' ? 'STRUCTURED A+ explanation with bullet points, key concepts, and memory aids (200-300 words)' : 'COMPREHENSIVE and DETAILED answer (minimum 200-300 words). For technical questions: include step-by-step approach, code examples, architecture considerations, performance analysis, and trade-offs. For behavioral questions: use STAR method with specific examples, metrics, and lessons learned. For DSA questions: include multiple solution approaches, complexity analysis, and detailed algorithm explanation with code.'}",
      "difficulty": "Easy/Medium/Hard",
      "importance": "High/Medium/Low"
    }
  ],
  "topicsToPrepare": [],
  "resources": [
    {
      "title": "Resource Title",
      "url": "https://actual-url.com",
      "type": "Website/Video/Course/Book/Practice Platform/Article/GitHub/PDF",
      "description": "Brief description"
    }
  ],
  "difficulty": "Easy/Medium/Hard",
  "tip": "Preparation strategy tip",
  "applicationTimeline": "Timeline if known",
  "preparationTimeEstimate": "Time estimate",
  "sourceNote": "These questions were gathered from [specific sources like LeetCode company-tag, Glassdoor reviews, GFG interview experiences]"
}

**CRITICAL REQUIREMENT**: The "questions" array MUST contain at least 12 questions, preferably 15 questions for comprehensive preparation.

ANSWER QUALITY REQUIREMENTS:
- Technical answers: Must be 200-300+ words with code examples, architecture diagrams description, performance considerations, and alternative approaches
- Behavioral answers: Must use STAR method with specific examples, quantifiable results, and lessons learned (200-300+ words)
- DSA answers: Must include problem analysis, multiple solution approaches, complete code implementation, complexity analysis, and step-by-step explanation (200-300+ words)

STRICT SEPARATION REQUIREMENTS:
- If questionType is "technical": Include ONLY technical questions (system design, architecture, coding, technology decisions)
- If questionType is "behavioral": Include ONLY behavioral questions (leadership, teamwork, conflict resolution, communication)
- If questionType is "dsa": Include ONLY DSA questions (algorithms, data structures, coding problems)
- NO mixing of question types under any circumstances

**QUESTION COUNT VALIDATION**: Before returning the response, ensure the questions array has at least 12 questions. If less than 12, add more relevant questions to reach the minimum count.

Generate interview preparation content for a ${role} position${company ? ` at ${company}` : ''}.`;
  
  if (mode === 'company-specific') {
    promptBase += ` Focus on ${company}'s specific interview process, requirements, and culture. 
    
    CRITICAL: Only include questions that have been ACTUALLY ASKED at ${company}. Sources to reference:
    - ${company} LeetCode company tag: https://leetcode.com/company/${company?.toLowerCase()}/
    - ${company} Glassdoor interview experiences: https://www.glassdoor.com/Interview/${company}-Interview-Questions-E[company-id].htm
    - ${company} GeeksforGeeks interview experiences
    - ${company} CareerCup company page
    - ${company} Blind/LinkedIn interview experience posts
    
    Include company-specific resources like:
    - LeetCode company tags (e.g., https://leetcode.com/company/${company?.toLowerCase()}/)
    - Company-specific GitHub repositories
    - Official company engineering blogs or career pages
    - Company-specific interview experiences on platforms like Glassdoor
    - YouTube channels or videos specifically about ${company} interviews
    
    Examples of the types of REAL questions to include:
    - For Amazon: "Design a URL shortening service", "Two Sum problem variations", "Leadership Principle questions"
    - For Google: "Design Google Search", "System design questions", "Algorithm optimization problems"
    - For Microsoft: "Design a chat application", "Behavioral questions about teamwork", "Technical design questions"
    - For Meta: "Design Facebook News Feed", "React/Frontend questions", "Culture fit questions"`;
  } else {
    promptBase += ` Focus on general industry standards and common practices across top tech companies. Include popular resources like:
    - Cracking the Coding Interview
    - System Design Primer GitHub repository
    - Popular LeetCode question lists
    - Well-known YouTube channels for interview preparation
    - Established online courses and platforms`;
  }
  
  switch (questionType) {
    case 'technical':
      promptBase += ` 
      
CRITICAL: Focus ONLY on technical questions. DO NOT include any behavioral or soft skills questions.

**MANDATORY**: Provide EXACTLY 12-15 technical questions (minimum 12, target 15) for comprehensive preparation.

${displayMode === 'flashcard' ? `
🎯 **FLASHCARD MODE - TECHNICAL QUESTIONS**

Create FLASHCARD-STYLE technical questions perfect for quick revision:

QUESTION FORMAT:
- Short, focused questions on key technical concepts
- Target core knowledge areas that are frequently tested
- Use clear, direct language
- Example: "What is the difference between TCP and UDP?" instead of "Explain the networking protocols"

ANSWER FORMAT (A+ Explanations):
- Start with a clear, concise definition
- Use bullet points for key differences or features
- Include practical examples or use cases
- Add memory aids or mnemonics where helpful
- End with a key takeaway or summary point
- Structure: Definition → Key Points → Example → Takeaway

EXAMPLE FLASHCARD STRUCTURE:
Question: "What is Big O notation?"
Answer: 
• Definition: Mathematical notation describing algorithm efficiency
• Key aspects:
  - Time complexity: How runtime scales with input size
  - Space complexity: How memory usage scales
• Common complexities: O(1) < O(log n) < O(n) < O(n²) < O(2^n)
• Example: Binary search is O(log n), bubble sort is O(n²)
• Memory aid: "Big O = Order of growth"
• Takeaway: Always analyze both time and space complexity

` : ''}

Technical questions should cover:
- System design problems (3-4 questions)
- Architecture and scalability questions (2-3 questions)  
- Technology-specific questions (frameworks, databases, tools) (2-3 questions)
- Code optimization and performance (2-3 questions)
- Technical decision-making scenarios (2-3 questions)
- API design and integration (1-2 questions)
- Security and best practices (1-2 questions)
- Technology trade-offs and comparisons (1-2 questions)

For each technical question, provide COMPREHENSIVE answers that include:
- Step-by-step technical approach
- Code examples where applicable
- Architecture diagrams description
- Performance considerations
- Scalability factors
- Best practices and patterns
- Common pitfalls to avoid
- Alternative solutions and trade-offs

For resources, prioritize system design resources, technical coding platforms, technical YouTube channels, and engineering blogs.`;
      break;
    case 'behavioral':
      promptBase += ` 
      
CRITICAL: Focus ONLY on behavioral questions. DO NOT include any technical coding or system design questions.

**MANDATORY**: Provide EXACTLY 12-15 behavioral questions (minimum 12, target 15) for comprehensive preparation.

Behavioral questions should cover:
- Leadership and teamwork situations (2-3 questions)
- Conflict resolution scenarios (2-3 questions)
- Problem-solving approaches (2-3 questions)
- Communication challenges (2-3 questions)
- Time management and prioritization (1-2 questions)
- Adaptability and learning (1-2 questions)
- Decision-making processes (1-2 questions)
- Company culture fit (1-2 questions)
- Career goals and motivation (1-2 questions)
- Handling failure and feedback (1-2 questions)

For each behavioral question, provide DETAILED answers using the STAR method (Situation, Task, Action, Result):
- Situation: Clear context and background
- Task: Specific responsibility or challenge
- Action: Detailed steps taken and reasoning
- Result: Quantifiable outcomes and lessons learned
- Additionally include:
  * Key skills demonstrated
  * What you learned from the experience
  * How you would handle similar situations
  * Specific examples and metrics where possible

For resources, prioritize STAR method guides, behavioral interview question banks, leadership and soft skills resources, and company culture pages.`;
      break;
    case 'dsa':
      promptBase += ` 
      
CRITICAL: Focus ONLY on Data Structures and Algorithms questions. DO NOT include behavioral or system design questions.

**MANDATORY**: Provide EXACTLY 12-15 DSA questions (minimum 12, target 15) for comprehensive preparation.

DSA questions should cover:
- Array and string manipulation (2-3 questions)
- Linked lists and trees (2-3 questions)
- Graphs and traversal algorithms (2-3 questions)
- Dynamic programming (2-3 questions)
- Sorting and searching algorithms (1-2 questions)
- Hash tables and maps (1-2 questions)
- Stacks and queues (1-2 questions)
- Recursion and backtracking (1-2 questions)
- Greedy algorithms (1-2 questions)
- Bit manipulation (1-2 questions)

For each DSA question, provide COMPREHENSIVE answers that include:
- Problem statement with clear input/output examples
- Multiple solution approaches (brute force, optimal)
- Complete code implementation with comments
- Time and space complexity analysis
- Step-by-step algorithm explanation
- Edge cases and how to handle them
- Optimization techniques
- Similar problems and patterns
- When to use this approach in real scenarios

For resources, prioritize LeetCode problem sets and patterns, algorithm visualization tools, DSA-focused GitHub repositories, and algorithm courses.`;
      break;
    default:
      promptBase += ' Include a balanced mix of questions. For resources, provide a well-rounded selection covering technical, behavioral, and DSA preparation.';
  }
  
  promptBase += ` 
  
Here are some examples of real, popular resources you can include:

For Technical/DSA Questions:
- "LeetCode Top Interview Questions" - https://leetcode.com/problemset/top-interview-questions/
- "NeetCode 150" - https://neetcode.io/practice
- "System Design Primer" - https://github.com/donnemartin/system-design-primer
- "Blind 75 Questions" - https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions
- "Cracking the Coding Interview" - Popular book by Gayle McDowell

For Behavioral Questions:
- "STAR Method Guide" - https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-method
- "Behavioral Interview Questions" - https://www.glassdoor.com/blog/common-behavioral-interview-questions/

For System Design:
- "Grokking the System Design Interview" - https://www.educative.io/courses/grokking-the-system-design-interview
- "High Scalability" - http://highscalability.com/
- "System Design Interview" book by Alex Xu

For Company-Specific:
- LeetCode company tags: https://leetcode.com/company/amazon/ (replace with actual company)
- Glassdoor interview experiences: https://www.glassdoor.com/Interview/
- Company engineering blogs and career pages

YouTube Channels:
- "NeetCode" - https://www.youtube.com/c/NeetCode
- "Back To Back SWE" - https://www.youtube.com/c/BackToBackSWE
- "Gaurav Sen" - https://www.youtube.com/c/GauravSensei
- "TechLead" - https://www.youtube.com/c/TechLead

EXAMPLES OF VERIFIED COMPANY-SPECIFIC QUESTIONS:

${displayMode === 'flashcard' ? `
🎯 **FLASHCARD EXAMPLES FOR TECHNICAL QUESTIONS**

Amazon - TECHNICAL FLASHCARDS:
- "What is the CAP theorem?" (Quick concept check)
- "Explain microservices vs monolithic architecture" (Architecture comparison)
- "How does consistent hashing work?" (System design concept)
- "What are the SOLID principles?" (Design principles)
- "Explain database indexing" (Performance concept)

Google - TECHNICAL FLASHCARDS:
- "What is MapReduce?" (Distributed computing)
- "Explain REST vs GraphQL" (API design)
- "How does load balancing work?" (Scalability concept)
- "What is eventual consistency?" (Distributed systems)
- "Explain caching strategies" (Performance optimization)

Microsoft - TECHNICAL FLASHCARDS:
- "What is dependency injection?" (Design pattern)
- "Explain async/await vs promises" (Concurrency concept)
- "How does garbage collection work?" (Memory management)
- "What is the Observer pattern?" (Design pattern)
- "Explain database normalization" (Database design)

` : ''}

Amazon - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Amazon's product recommendation system" (System Design)
- "Two Sum and variations" (DSA)
- "Design a URL shortening service" (System Design)
- "Implement LRU Cache" (DSA/System Design)
- "Design Amazon's inventory management system" (System Design)

Amazon - BEHAVIORAL (Leadership Principles focused):
- "Tell me about a time you disagreed with your manager"
- "Describe a situation where you had to work with a difficult team member"
- "Give an example of when you took ownership of a problem"
- "Tell me about a time you failed and what you learned"
- "Describe a time when you had to learn something new quickly"

Google - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Google Search autocomplete" (System Design)
- "Maximum subarray problem" (DSA)
- "System design: Design a web crawler" (System Design)
- "Find median in a stream of integers" (DSA)
- "Design a distributed cache system" (System Design)

Google - BEHAVIORAL:
- "Tell me about a time you disagreed with a decision"
- "Describe a challenging project you worked on"
- "How do you handle working with ambiguous requirements?"
- "Tell me about a time you had to influence someone without authority"
- "Describe a situation where you had to make a quick decision"

Microsoft - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design a chat application like Teams" (System Design)
- "Reverse a linked list" (DSA)
- "System design: Design a parking lot system" (System Design)
- "Merge k sorted lists" (DSA)
- "Design a file storage system" (System Design)

Microsoft - BEHAVIORAL:
- "Describe a challenging project you worked on"
- "Tell me about a time you had to work under pressure"
- "How do you handle conflicting priorities?"
- "Describe a time when you had to learn a new technology"
- "Tell me about a time you mentored someone"

Meta/Facebook - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Facebook News Feed" (System Design)
- "Valid Parentheses problem" (DSA)
- "System design: Design Instagram" (System Design)
- "Binary tree traversal variations" (DSA)
- "Design a messaging system" (System Design)

Meta/Facebook - BEHAVIORAL:
- "Tell me about a time you had to work with a difficult teammate"
- "Describe a time when you had to make a trade-off decision"
- "How do you handle receiving critical feedback?"
- "Tell me about a time you improved a process"
- "Describe a situation where you had to work with incomplete information"

IMPORTANT: Use these as reference points for the types of questions actually asked at these companies. Keep technical and behavioral questions completely separate based on the questionType parameter.`;

  return promptBase;
}

async function fetchInterviewPrepFromGroq(prompt: string): Promise<InterviewPrepResponse> {
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
          content: 'You are an AI assistant specialized in generating relevant interview questions and high-quality suggested answers for various job roles. Your responses should be specific, concise, and focused on real interview scenarios for the requested role. When generating DSA questions, include clear problem statements, expected inputs/outputs, and detailed algorithm explanations with code samples. Output must be in valid JSON format exactly as specified in the prompt.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 8192, // Increased for 12-15 comprehensive questions with detailed answers
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
    
    // Validate and return the structured response
    if (parsedContent.mode && parsedContent.role && parsedContent.questionType) {
      return parsedContent as InterviewPrepResponse;
    } else {
      // Fallback to create a structured response
      return createFallbackResponse(content);
    }
  } catch (error) {
    console.error('Failed to parse response:', error);
    // Fallback parsing if JSON parse fails
    return createFallbackResponse(content);
  }
}

// Create a fallback response when JSON parsing fails
function createFallbackResponse(content: string): InterviewPrepResponse {
  const questions = parseQuestionsManually(content);
  
  return {
    mode: 'general',
    displayMode: 'interview',
    company: '',
    role: 'Unknown',
    questionType: 'all',
    interviewRounds: ['Initial Screening', 'Technical Interview', 'HR Interview'],
    questions: questions,
    topicsToPrepare: ['Technical Skills', 'Problem Solving', 'Communication'],
    resources: [
      { title: 'LeetCode Practice Platform', type: 'Practice Platform', url: 'https://leetcode.com', description: 'Coding practice and algorithm problems' },
      { title: 'GeeksforGeeks Interview Preparation', type: 'Website', url: 'https://geeksforgeeks.org', description: 'Technical articles and interview preparation' },
      { title: 'InterviewBit Platform', type: 'Practice Platform', url: 'https://interviewbit.com', description: 'Interview preparation platform' },
      { title: 'Glassdoor Interview Experiences', type: 'Website', url: 'https://glassdoor.com', description: 'Company reviews and interview experiences' },
      { title: 'YouTube Interview Tutorials', type: 'Video', description: 'Video tutorials and mock interviews' }
    ],
    difficulty: 'Medium',
    tip: 'Practice regularly and focus on understanding concepts rather than memorizing answers.',
    preparationTimeEstimate: '2-4 weeks',
    sourceNote: 'Fallback response - please regenerate for verified questions from trusted sources'
  };
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
        questions.push({ 
          question, 
          answer,
          difficulty: 'Medium',
          importance: 'High'
        });
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
        questions.push({ 
          question, 
          answer,
          difficulty: 'Medium',
          importance: 'Medium'
        });
      }
    }
  }
  
  return questions;
}
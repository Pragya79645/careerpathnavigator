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
    
    console.log('API Request received:', { role, questionType, company, mode });
    
    if (!role) {
      console.error('Validation failed: Role is required');
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    // Validate questionType
    if (!['technical', 'behavioral', 'dsa', 'all'].includes(questionType)) {
      console.error('Validation failed: Invalid question type:', questionType);
      return NextResponse.json(
        { error: 'Invalid question type' },
        { status: 400 }
      );
    }

    // Validate displayMode
    if (mode !== 'interview' && mode !== 'flashcard') {
      console.error('Validation failed: Invalid display mode:', mode);
      return NextResponse.json(
        { error: 'Invalid display mode' },
        { status: 400 }
      );
    }

    // Check if GROQ_API_KEY is available
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY environment variable is not set');
      return NextResponse.json(
        { error: 'Server configuration error: API key not configured' },
        { status: 500 }
      );
    }

    console.log('Validation passed, constructing prompt...');

    // Construct the prompt based on the role, question type, company, and mode
    const prompt = constructPrompt(role, questionType, company?.trim(), mode);
    
    console.log('Prompt constructed, calling Groq API...');

    // Call the Groq API
    const response = await fetchInterviewPrepFromGroq(prompt);
    
    console.log('Groq API response received successfully');

    // Ensure the response includes the correct displayMode
    response.displayMode = mode;
    
    // Return the response
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating interview questions:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Return more specific error messages
      if (error.message.includes('GROQ_API_KEY')) {
        return NextResponse.json(
          { error: 'API configuration error. Please check server configuration.' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Groq API error')) {
        return NextResponse.json(
          { error: 'External API error. Please try again in a moment.' },
          { status: 503 }
        );
      }
      
      if (error.message.includes('Failed to parse response')) {
        return NextResponse.json(
          { error: 'Response parsing error. Please try again.' },
          { status: 502 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to generate interview questions. Please try again.' },
      { status: 500 }
    );
  }
}

// Add a GET endpoint for health check
export async function GET() {
  return NextResponse.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    hasApiKey: !!process.env.GROQ_API_KEY,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
}

function constructPrompt(role: string, questionType: string, company?: string, displayMode: 'interview' | 'flashcard' = 'interview'): string {
  const mode = company && company.length > 0 ? 'company-specific' : 'general';
  
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

${mode === 'company-specific' ? `
🏢 **COMPANY-SPECIFIC MODE ACTIVATED**
You are generating questions that have been ACTUALLY ASKED at ${company}. 

CRITICAL REQUIREMENTS:
- Only include questions that candidates have reported being asked at ${company}
- Reference specific sources like ${company} LeetCode company tag, Glassdoor interviews, etc.
- Focus on ${company}'s unique interview style and commonly asked topics
- Include ${company}-specific technical stack, culture, and requirements

` : `
🌍 **GENERAL MODE ACTIVATED**
You are generating the most commonly asked ${questionType} questions across top tech companies.

CRITICAL REQUIREMENTS:
- Focus on universally important questions asked across multiple companies
- Include fundamental concepts that appear in most technical interviews
- Cover core competencies expected for ${role} positions industry-wide
- Draw from most popular interview preparation resources

`}

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
    
    COMPANY-SPECIFIC FOCUS FOR ${company}:
    ${company?.toLowerCase() === 'amazon' ? `
    Amazon Interview Focus:
    - Leadership Principles integration in technical questions
    - AWS services and cloud architecture
    - Distributed systems and scalability (Prime, Alexa, AWS)
    - Customer obsession in technical decisions
    - Operational excellence and system reliability
    - Cost optimization and performance
    - Example systems: Prime Video, Alexa, AWS Lambda, DynamoDB
    ` : company?.toLowerCase() === 'google' ? `
    Google Interview Focus:
    - Algorithmic thinking and problem-solving
    - Large-scale system design (Search, Maps, YouTube)
    - Machine learning and data processing
    - Clean code and software engineering practices
    - Innovation and technical leadership
    - Global scale and performance optimization
    - Example systems: Google Search, Gmail, Google Maps, YouTube
    ` : company?.toLowerCase() === 'microsoft' ? `
    Microsoft Interview Focus:
    - Software engineering fundamentals
    - Azure cloud services and enterprise solutions
    - Collaboration and teamwork in technical contexts
    - .NET ecosystem and development practices
    - Enterprise software patterns and architecture
    - Accessibility and inclusive design
    - Example systems: Office 365, Teams, Azure, Visual Studio
    ` : company?.toLowerCase() === 'meta' || company?.toLowerCase() === 'facebook' ? `
    Meta/Facebook Interview Focus:
    - Social media scale and real-time systems
    - React and frontend engineering
    - Data processing and machine learning
    - Privacy and security considerations
    - Mobile-first and cross-platform development
    - Community and user experience focus
    - Example systems: Facebook, Instagram, WhatsApp, Messenger
    ` : `
    ${company} Interview Focus:
    - Research ${company}'s main products and technical challenges
    - Understand ${company}'s technology stack and engineering culture
    - Focus on ${company}'s specific interview patterns and frequently asked topics
    - Include ${company}'s unique technical requirements and problem domains
    - Consider ${company}'s scale, user base, and technical constraints
    `}
    
    Examples of the types of REAL questions to include:
    - For Amazon: "Design a URL shortening service", "Two Sum problem variations", "Leadership Principle questions"
    - For Google: "Design Google Search", "System design questions", "Algorithm optimization problems"
    - For Microsoft: "Design a chat application", "Behavioral questions about teamwork", "Technical design questions"
    - For Meta: "Design Facebook News Feed", "React/Frontend questions", "Culture fit questions"`;
  } else {
    promptBase += ` Focus on general industry standards and common practices across top tech companies. 
    
    GENERAL INTERVIEW FOCUS:
    - Universal technical concepts that apply across all companies
    - Industry-standard system design patterns
    - Common algorithmic and data structure problems
    - Fundamental software engineering principles
    - Cross-platform and technology-agnostic solutions
    - Best practices that are widely adopted
    
    Include popular resources like:
    - Cracking the Coding Interview (universal preparation)
    - System Design Primer GitHub repository
    - Popular LeetCode question lists (Top 100, Top Interview Questions)
    - Well-known YouTube channels for interview preparation
    - Established online courses and platforms (Coursera, edX, Udemy)
    - Industry-standard books and documentation
    
    Focus on concepts that are valuable regardless of the specific company:
    - Core data structures and algorithms
    - System design fundamentals
    - Database design principles
    - API design and integration
    - Security best practices
    - Performance optimization
    - Software architecture patterns
    - Code quality and maintainability`;
  }
  
  switch (questionType) {
    case 'technical':
      promptBase += ` 
      
CRITICAL: Focus ONLY on technical questions. DO NOT include any behavioral or soft skills questions.

**MANDATORY**: Provide EXACTLY 12-15 technical questions (minimum 12, target 15) for comprehensive preparation.

${mode === 'company-specific' ? `
🏢 **COMPANY-SPECIFIC TECHNICAL QUESTIONS FOR ${company}**

Generate technical questions that have been ACTUALLY ASKED at ${company} based on:
- ${company} LeetCode company tag questions
- ${company} Glassdoor technical interview experiences
- ${company} GeeksforGeeks interview experiences
- ${company} CareerCup technical rounds
- ${company} system design and architecture questions

Focus on ${company}'s specific technical stack and interview style:
${company?.toLowerCase() === 'amazon' ? `
- Amazon's focus on system design and scalability
- AWS services and cloud architecture
- Leadership principles applied to technical decisions
- Distributed systems and microservices
- Performance optimization and cost efficiency
` : company?.toLowerCase() === 'google' ? `
- Google's emphasis on algorithms and data structures
- Large-scale system design (Search, Maps, YouTube)
- Machine learning and AI applications
- Performance optimization and scalability
- Clean code and engineering practices
` : company?.toLowerCase() === 'microsoft' ? `
- Microsoft's focus on software engineering principles
- Azure cloud services and architecture
- .NET technologies and development practices
- Team collaboration and technical leadership
- Enterprise software design patterns
` : company?.toLowerCase() === 'meta' || company?.toLowerCase() === 'facebook' ? `
- Meta's focus on social media scale systems
- React and frontend technologies
- Real-time systems and data processing
- Privacy and security considerations
- Mobile and web application architecture
` : `
- ${company}'s specific technical stack and requirements
- Industry-specific technical challenges
- Company's engineering culture and practices
- Technical decision-making processes
- System architecture and design patterns
`}

` : `
🌍 **GENERAL TECHNICAL QUESTIONS**

Generate the most commonly asked technical questions across top tech companies (Google, Amazon, Microsoft, Meta, Apple, Netflix, etc.):

Focus on universally important technical concepts:
- Core system design principles (scalability, reliability, performance)
- Common architectural patterns (microservices, distributed systems)
- Database design and optimization
- API design and integration
- Security best practices
- Cloud computing fundamentals
- Performance optimization techniques
- Code quality and engineering practices

These should be questions that appear frequently across multiple companies and are fundamental to ${role} interviews.
`}

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

MANDATORY DSA RESOURCES TO INCLUDE:
Always include these specific DSA resources in your response:

1. "Striver's A2Z DSA Course/Sheet" - https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/
   Type: Website
   Description: Comprehensive DSA course with structured learning path

2. "Abdul Bari Algorithms Playlist" - https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O
   Type: Video
   Description: Detailed algorithm explanations and implementations

3. "HackerRank Algorithms" - https://www.hackerrank.com/domains/algorithms
   Type: Practice Platform
   Description: Algorithm practice problems with varying difficulty levels

4. "HackerRank Data Structures" - https://www.hackerrank.com/domains/data-structures
   Type: Practice Platform
   Description: Data structure implementation and problem-solving practice

5. "Algorithms Part 1 (Princeton/Coursera)" - https://www.coursera.org/learn/algorithms-part1
   Type: Course
   Description: Comprehensive algorithms course covering fundamental concepts

6. "Algorithms Part 2 (Princeton/Coursera)" - https://www.coursera.org/learn/algorithms-part2
   Type: Course
   Description: Advanced algorithms course covering graph algorithms and string processing

Additional recommended resources:
- LeetCode problem sets and patterns
- Algorithm visualization tools
- DSA-focused GitHub repositories
- NeetCode for structured practice`;
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

For DSA Specific Resources:
- "Striver's A2Z DSA Course/Sheet" - https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/
- "Abdul Bari Algorithms Playlist" - https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O
- "HackerRank Algorithms" - https://www.hackerrank.com/domains/algorithms
- "HackerRank Data Structures" - https://www.hackerrank.com/domains/data-structures
- "Algorithms Part 1 (Princeton/Coursera)" - https://www.coursera.org/learn/algorithms-part1
- "Algorithms Part 2 (Princeton/Coursera)" - https://www.coursera.org/learn/algorithms-part2

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

${mode === 'company-specific' ? `
🏢 **COMPANY-SPECIFIC EXAMPLES FOR ${company}**

${displayMode === 'flashcard' ? `
🎯 **FLASHCARD EXAMPLES FOR ${company} - TECHNICAL QUESTIONS**

${company?.toLowerCase() === 'amazon' ? `
Amazon - TECHNICAL FLASHCARDS:
- "What is the CAP theorem?" (Distributed systems concept)
- "Explain microservices vs monolithic architecture" (Architecture comparison)
- "How does consistent hashing work?" (System design concept)
- "What are AWS Lambda cold starts?" (AWS-specific concept)
- "Explain database indexing strategies" (Performance concept)
- "How does load balancing work in AWS?" (AWS-specific scalability)
- "What is eventual consistency?" (Distributed systems)
- "Explain the difference between SQL and NoSQL" (Database concepts)
- "How does caching improve performance?" (Performance optimization)
- "What are the SOLID principles?" (Design principles)
` : company?.toLowerCase() === 'google' ? `
Google - TECHNICAL FLASHCARDS:
- "What is MapReduce?" (Google-specific distributed computing)
- "Explain REST vs GraphQL" (API design)
- "How does Google Search indexing work?" (Search algorithms)
- "What is BigTable?" (Google-specific database)
- "Explain machine learning model training" (ML concepts)
- "How does load balancing work?" (Scalability concept)
- "What is TensorFlow?" (Google ML framework)
- "Explain pub/sub messaging patterns" (Distributed systems)
- "How does Google Cloud Storage work?" (Cloud storage)
- "What are design patterns?" (Software engineering)
` : company?.toLowerCase() === 'microsoft' ? `
Microsoft - TECHNICAL FLASHCARDS:
- "What is dependency injection?" (Design pattern)
- "Explain async/await vs promises" (Concurrency concept)
- "How does Azure Functions work?" (Serverless computing)
- "What is the Observer pattern?" (Design pattern)
- "Explain .NET Core architecture" (Microsoft-specific framework)
- "How does SignalR work?" (Real-time communication)
- "What is Entity Framework?" (ORM concept)
- "Explain database normalization" (Database design)
- "How does Azure Active Directory work?" (Authentication)
- "What are microservices?" (Architecture pattern)
` : company?.toLowerCase() === 'meta' || company?.toLowerCase() === 'facebook' ? `
Meta/Facebook - TECHNICAL FLASHCARDS:
- "How does React Virtual DOM work?" (Frontend concept)
- "Explain state management in React" (Frontend architecture)
- "What is GraphQL?" (API design)
- "How does Facebook's News Feed algorithm work?" (Algorithm design)
- "Explain React hooks" (Frontend development)
- "What is server-side rendering?" (Performance optimization)
- "How does real-time messaging work?" (Real-time systems)
- "Explain database sharding" (Database scalability)
- "What is Redux?" (State management)
- "How does content delivery networks work?" (Performance)
` : `
${company} - TECHNICAL FLASHCARDS:
- "What are the core technical concepts for ${company}?" (Company-specific)
- "How does ${company}'s main product work?" (Product understanding)
- "What technologies does ${company} use?" (Tech stack)
- "Explain ${company}'s architecture approach" (System design)
- "What are ${company}'s engineering practices?" (Development process)
`}

` : `
EXAMPLES FOR ${company} - INTERVIEW QUESTIONS:

${company?.toLowerCase() === 'amazon' ? `
Amazon - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Amazon's product recommendation system" (System Design)
- "Implement LRU Cache" (DSA/System Design)
- "Design a URL shortening service" (System Design)
- "Design Amazon's inventory management system" (System Design)
- "Explain AWS services and their use cases" (Cloud architecture)
- "Design a distributed cache system" (System Design)
- "Implement a load balancer" (System Design)
- "Design Amazon Prime Video streaming" (System Design)
- "Explain microservices architecture" (Architecture)
- "Design a chat application" (System Design)
` : company?.toLowerCase() === 'google' ? `
Google - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Google Search autocomplete" (System Design)
- "Design Google Maps" (System Design)
- "Implement Google's PageRank algorithm" (Algorithm Design)
- "Design a web crawler" (System Design)
- "Design YouTube video streaming" (System Design)
- "Implement Google Drive file system" (System Design)
- "Design Gmail backend" (System Design)
- "Explain Google's Bigtable" (Database Systems)
- "Design Google Photos" (System Design)
- "Implement Google Calendar" (System Design)
` : company?.toLowerCase() === 'microsoft' ? `
Microsoft - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Microsoft Teams" (System Design)
- "Design Outlook email system" (System Design)
- "Implement Azure blob storage" (Cloud Systems)
- "Design a parking lot system" (System Design)
- "Design Microsoft Office collaboration" (System Design)
- "Implement a distributed file system" (System Design)
- "Design Skype video calling" (System Design)
- "Explain .NET architecture" (Framework Design)
- "Design a code repository system" (System Design)
- "Implement a notification system" (System Design)
` : company?.toLowerCase() === 'meta' || company?.toLowerCase() === 'facebook' ? `
Meta/Facebook - TECHNICAL (frequently asked according to Glassdoor/LeetCode):
- "Design Facebook News Feed" (System Design)
- "Design Instagram" (System Design)
- "Design WhatsApp messaging" (System Design)
- "Implement Facebook's friend recommendation" (Algorithm Design)
- "Design Facebook Live streaming" (System Design)
- "Design Facebook Messenger" (System Design)
- "Implement Facebook's photo storage" (System Design)
- "Design Facebook's notification system" (System Design)
- "Explain React architecture" (Frontend Framework)
- "Design Facebook's comment system" (System Design)
` : `
${company} - TECHNICAL (company-specific questions):
- "Design ${company}'s core product architecture" (System Design)
- "Explain ${company}'s technical challenges" (Technical Knowledge)
- "Implement ${company}'s key algorithms" (Algorithm Design)
- "Design ${company}'s data processing pipeline" (Data Systems)
- "Explain ${company}'s scalability approach" (System Architecture)
`}
`}

` : `
🌍 **GENERAL TECHNICAL EXAMPLES**

${displayMode === 'flashcard' ? `
🎯 **GENERAL FLASHCARD EXAMPLES FOR TECHNICAL QUESTIONS**

Common Technical Concept Flashcards:
- "What is the difference between TCP and UDP?" (Networking)
- "Explain database ACID properties" (Database concepts)
- "What is Big O notation?" (Algorithm analysis)
- "How does load balancing work?" (Scalability)
- "Explain the difference between SQL and NoSQL" (Databases)
- "What are design patterns?" (Software engineering)
- "How does caching improve performance?" (Performance)
- "What is the CAP theorem?" (Distributed systems)
- "Explain REST API principles" (API design)
- "What are microservices?" (Architecture)
- "How does database indexing work?" (Database optimization)
- "What is horizontal vs vertical scaling?" (Scalability)
- "Explain the MVC pattern" (Architecture pattern)
- "What is dependency injection?" (Design pattern)
- "How does garbage collection work?" (Memory management)

` : `
GENERAL TECHNICAL EXAMPLES (commonly asked across companies):

Common System Design Questions:
- "Design a URL shortening service (like bit.ly)" (System Design)
- "Design a chat application (like WhatsApp)" (System Design)
- "Design a file storage system (like Dropbox)" (System Design)
- "Design a video streaming service (like Netflix)" (System Design)
- "Design a social media feed" (System Design)
- "Design a ride-sharing service" (System Design)
- "Design a notification system" (System Design)
- "Design a distributed cache" (System Design)
- "Design a search engine" (System Design)
- "Design an e-commerce platform" (System Design)

Common Technical Concepts:
- "Explain database normalization" (Database Design)
- "What are the differences between SQL and NoSQL?" (Database)
- "How does load balancing work?" (Scalability)
- "Explain microservices architecture" (Architecture)
- "What is the CAP theorem?" (Distributed Systems)
- "How does caching improve performance?" (Performance)
- "Explain RESTful API design principles" (API Design)
- "What are design patterns and give examples?" (Software Design)
- "How does database indexing work?" (Database Optimization)
- "Explain the difference between horizontal and vertical scaling" (Scalability)
`}
`}

IMPORTANT: Use these as reference points for the types of questions actually asked at these companies. Keep technical and behavioral questions completely separate based on the questionType parameter.`;

  return promptBase;
}

async function fetchInterviewPrepFromGroq(prompt: string): Promise<InterviewPrepResponse> {
  // Get your Groq API key from environment variables
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY environment variable is not set');
  }
  
  console.log('Making request to Groq API...');
  
  try {
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
    
    console.log('Groq API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Groq API error response:', errorData);
      throw new Error(`Groq API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    console.log('Groq API response received, parsing content...');
    
    const content = data.choices[0].message.content;
    
    // Parse the JSON response
    try {
      const parsedContent = JSON.parse(content);
      
      // Validate and return the structured response
      if (parsedContent.mode && parsedContent.role && parsedContent.questionType) {
        console.log('Valid response parsed successfully');
        return parsedContent as InterviewPrepResponse;
      } else {
        console.log('Invalid response structure, using fallback');
        // Fallback to create a structured response
        return createFallbackResponse(content);
      }
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      console.error('Raw content:', content);
      // Fallback parsing if JSON parse fails
      return createFallbackResponse(content);
    }
  } catch (fetchError) {
    console.error('Network error calling Groq API:', fetchError);
    if (fetchError instanceof Error) {
      throw new Error(`Network error: ${fetchError.message}`);
    }
    throw new Error('Unknown network error occurred');
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
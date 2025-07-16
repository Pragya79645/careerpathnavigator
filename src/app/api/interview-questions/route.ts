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

// Structure for related programs (internships, challenges, etc.)
interface RelatedProgram {
  name: string;
  description: string;
  eligibleFor: string[];
  applyWindow: string;
  outcome: string;
  link?: string;
  type: 'Internship' | 'Challenge' | 'Hiring Program' | 'Campus Program';
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
  relatedPrograms?: RelatedProgram[];
}

export async function POST(req: NextRequest) {
  console.log('🚀 POST /api/interview-questions endpoint called');
  console.log('Request details:', {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries()),
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent')
  });
  
  // Additional deployment debugging
  console.log('Deployment environment check:', {
    NODE_ENV: process.env.NODE_ENV,
    hasApiKey: !!process.env.GROQ_API_KEY,
    apiKeyPrefix: process.env.GROQ_API_KEY?.substring(0, 8) + '...',
    platform: process.platform,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  });
  
  try {
    // Parse the incoming request
    console.log('📥 Parsing request body...');
    
    let body: RequestBody;
    try {
      const rawBody = await req.text();
      console.log('Raw request body:', rawBody);
      body = JSON.parse(rawBody) as RequestBody;
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    const { role, questionType, company, mode = 'interview' } = body;
    
    console.log('API Request received:', { role, questionType, company, mode });
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!process.env.GROQ_API_KEY,
      apiKeyLength: process.env.GROQ_API_KEY?.length,
      platform: process.platform,
      nodeVersion: process.version
    });
    
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
    console.log('🔑 API Key validation:', {
      hasApiKey: !!process.env.GROQ_API_KEY,
      keyLength: process.env.GROQ_API_KEY?.length || 0,
      keyPrefix: process.env.GROQ_API_KEY?.substring(0, 10) || 'undefined',
      allEnvKeys: Object.keys(process.env).filter(key => key.includes('GROQ')),
      NODE_ENV: process.env.NODE_ENV
    });
    
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY environment variable is not set');
      console.error('Available environment variables:', Object.keys(process.env).sort());
      console.error('Environment check:', {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        NETLIFY: process.env.NETLIFY,
        CI: process.env.CI,
        deploymentPlatform: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Unknown'
      });
      
      return NextResponse.json(
        { 
          error: 'Server configuration error: API key not configured',
          details: 'GROQ_API_KEY environment variable is missing',
          availableEnvKeys: Object.keys(process.env).filter(key => key.includes('GROQ')),
          platform: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Unknown',
          timestamp: new Date().toISOString()
        },
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
    console.error('💥 Error generating interview questions:', error);
    
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        cause: error.cause
      });
      
      // Return more specific error messages based on error type
      if (error.message.includes('GROQ_API_KEY')) {
        return NextResponse.json(
          { 
            error: 'API configuration error. Please check server configuration.',
            details: 'Missing or invalid API key',
            timestamp: new Date().toISOString()
          },
          { status: 500 }
        );
      }
      
      if (error.message.includes('Groq API error')) {
        return NextResponse.json(
          { 
            error: 'External API error. Please try again in a moment.',
            details: 'Groq API is temporarily unavailable',
            timestamp: new Date().toISOString()
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('Failed to parse response')) {
        return NextResponse.json(
          { 
            error: 'Response parsing error. Please try again.',
            details: 'Invalid response format from external API',
            timestamp: new Date().toISOString()
          },
          { status: 502 }
        );
      }
      
      if (error.message.includes('Network error')) {
        return NextResponse.json(
          { 
            error: 'Network connectivity error. Please try again.',
            details: 'Could not connect to external API',
            timestamp: new Date().toISOString()
          },
          { status: 503 }
        );
      }
      
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout. Please try again.',
            details: 'External API request timed out',
            timestamp: new Date().toISOString()
          },
          { status: 504 }
        );
      }
      
      // Generic error with more details
      return NextResponse.json(
        { 
          error: 'Failed to generate interview questions. Please try again.',
          details: error.message,
          timestamp: new Date().toISOString(),
          errorType: error.name
        },
        { status: 500 }
      );
    }
    
    // Fallback for non-Error objects
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.',
        details: 'Unknown error type',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Add a GET endpoint for health check
export async function GET() {
  console.log('🔍 Health check endpoint called');
  
  const envDetails = {
    NODE_ENV: process.env.NODE_ENV,
    hasApiKey: !!process.env.GROQ_API_KEY,
    apiKeyLength: process.env.GROQ_API_KEY?.length || 0,
    timestamp: new Date().toISOString(),
    platform: process.platform,
    nodeVersion: process.version,
    nextVersion: process.env.NEXT_VERSION,
    deploymentPlatform: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Unknown',
    VERCEL: !!process.env.VERCEL,
    NETLIFY: !!process.env.NETLIFY,
    CI: !!process.env.CI,
    groqRelatedEnvKeys: Object.keys(process.env).filter(key => key.toLowerCase().includes('groq')),
    totalEnvKeys: Object.keys(process.env).length
  };
  
  console.log('Environment details:', envDetails);
  
  try {
    return NextResponse.json({ 
      status: process.env.GROQ_API_KEY ? 'OK' : 'MISSING_API_KEY',
      timestamp: new Date().toISOString(),
      hasApiKey: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development',
      platform: process.platform,
      nodeVersion: process.version,
      apiKeyStatus: process.env.GROQ_API_KEY ? 'present' : 'missing',
      apiKeyLength: process.env.GROQ_API_KEY?.length || 0,
      deploymentPlatform: process.env.VERCEL ? 'Vercel' : process.env.NETLIFY ? 'Netlify' : 'Unknown',
      groqRelatedEnvKeys: Object.keys(process.env).filter(key => key.toLowerCase().includes('groq')),
      message: process.env.GROQ_API_KEY ? 'API endpoint is accessible' : 'API key not configured',
      troubleshooting: {
        checkEnvVars: 'Verify GROQ_API_KEY is set in your deployment platform',
        vercel: 'Check Vercel Dashboard > Settings > Environment Variables',
        netlify: 'Check Netlify Dashboard > Site Settings > Environment Variables',
        local: 'Check your .env.local file'
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),      error: error instanceof Error ? error.message : 'Unknown error',
      hasApiKey: !!process.env.GROQ_API_KEY,
      nodeEnv: process.env.NODE_ENV || 'development',
      envDetails: envDetails
      },
      { status: 500 }
    );
  }
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
11. **DYNAMIC INTERNSHIP PROGRAM DISCOVERY**: 
    - **MANDATORY**: Research and include ALL active internship programs for ${company || 'the specified company'}
    - **COMPREHENSIVE COVERAGE**: Include 5-10 different programs covering:
      * Summer internships (traditional 10-12 week programs)
      * Year-round internships (rolling admissions)
      * Coding challenges and competitions
      * Campus recruitment drives
      * Diversity and inclusion programs
      * Research programs and fellowships
      * Early career programs for new graduates
      * Community programs and ambassadorships
      * Innovation labs and internal programs
      * Third-party partnerships and collaborations
    
    - **PROGRAM INTELLIGENCE**: For each program, provide:
      * Exact program name and official title
      * Detailed program description and objectives
      * Specific eligibility criteria (as array: ["Students", "Final year", "Computer Science"])
      * Application timeline and deadlines
      * Program duration and location
      * Expected outcomes (internship, PPO, FTE, certification, etc.)
      * Application process and requirements
      * Program type classification
      * Official links when available
    
    - **CURRENT INFORMATION**: Prioritize the most recent and active programs:
      * Include newly launched initiatives from 2024-2025
      * Mention seasonal programs with current application windows
      * Include both established programs and pilot programs
      * Cover global programs and region-specific opportunities
      * Include virtual/remote programs introduced post-2020
    
    - **FALLBACK STRATEGY**: If specific programs are unknown:
      * Research common program types for similar companies
      * Suggest checking company career pages and LinkedIn
      * Mention industry-standard programs they likely offer
      * Recommend third-party platforms (AngelList, Glassdoor, LinkedIn Jobs)
      * Include generic advice for finding hidden opportunities
    
    - **VERIFICATION SOURCES**: Base program information on:
      * Official company career pages
      * LinkedIn company pages and posts
      * University career center partnerships
      * Tech community forums and discussions
      * Recent news articles and press releases
      * Alumni networks and experience sharing
      * Third-party aggregator platforms
    
    **CRITICAL**: The relatedPrograms field should contain comprehensive, well-researched, and current information about ALL available programs for the specified company. This is a key differentiator of your service.

12. **BONUS OPPORTUNITY ALERT**: Include relatedPrograms field with internship programs, coding challenges, or hiring initiatives run by that company

**RELATED PROGRAMS REQUIREMENTS:**
When a target company is provided, include comprehensive internship programs, coding challenges, and off-campus hiring initiatives run by that company. Research and include ALL active programs for the specified company. Examples include:

**Google:**
- Google STEP Internship (Student Training in Engineering Program) - Summer internship for underrepresented students (Apply: Jan-Mar)
- Google Summer of Code (GSoC) - Global program for open source development (Apply: Mar-Apr)
- Google Code-in - Contest for pre-university students (13-17 years) (Apply: Oct-Nov)
- Google AI Residency Program - 12-month research program (Apply: Oct-Dec)
- Google Developer Student Clubs (DSC) - University program for student developers (Apply: Year-round)
- Google Software Engineer Internship - Summer technical internship (Apply: Aug-Oct)
- Google BOLD Internship - Business internship program (Apply: Jan-Mar)
- Google Applied Digital Skills - Digital literacy program (Apply: Year-round)
- Google Career Certificates - Professional certificate programs (Apply: Year-round)
- Google for Startups - Startup accelerator program (Apply: Year-round)

**Amazon:**
- Amazon WOW (Women in Tech hiring program) - Diversity hiring initiative (Apply: Year-round)
- Amazon Future Engineer Program - Computer science education program (Apply: Year-round)
- Amazon Propel - Campus hiring program for students (Apply: Aug-Oct)
- Amazon Alexa Student Skills Challenge - Annual competition (Apply: Sep-Nov)
- Amazon Software Development Engineer Internship - Summer internship (Apply: Aug-Oct)
- Amazon ML Summer School - Machine learning program (Apply: Mar-May)
- Amazon Pathways - Operations and logistics internship (Apply: Year-round)
- Amazon Veterans Technical Apprenticeship - Military transition program (Apply: Year-round)
- Amazon Student Programs - Various student opportunities (Apply: Year-round)
- Amazon Web Services (AWS) Internship - Cloud computing internship (Apply: Aug-Oct)

**Microsoft:**
- Microsoft Engage - Internship program for students (Apply: Aug-Oct)
- Microsoft Global Hackathon - Internal innovation event (Apply: Jul-Aug)
- Microsoft Imagine Cup - Global student technology competition (Apply: Oct-Dec)
- Microsoft Learn Student Ambassadors - Campus program (Apply: Year-round)
- Microsoft New Technologists Program - Early career program (Apply: Year-round)
- Microsoft Software Engineer Internship - Summer technical internship (Apply: Aug-Oct)
- Microsoft Garage - Innovation program (Apply: Year-round)
- Microsoft LEAP - Career re-entry program (Apply: Year-round)
- Microsoft Disability Answer Desk - Accessibility program (Apply: Year-round)
- Microsoft AI for Good - Social impact program (Apply: Year-round)

**Meta/Facebook:**
- Meta University - Internship program for underrepresented students (Apply: Jan-Mar)
- Facebook Hacker Cup - Annual programming contest (Apply: Jul-Sep)
- Facebook Developer Circles - Community program (Apply: Year-round)
- Meta AI Residency Program - Research program (Apply: Oct-Dec)
- Meta Software Engineer Internship - Summer technical internship (Apply: Aug-Oct)
- Meta Rotation Program - New grad program (Apply: Aug-Oct)
- Meta Production Engineering Internship - Infrastructure internship (Apply: Aug-Oct)
- Meta Data Science Internship - Analytics internship (Apply: Aug-Oct)
- Meta Above & Beyond - Diversity program (Apply: Year-round)
- Meta Open Source - Open source contribution program (Apply: Year-round)

**Apple:**
- Apple WWDC Scholarship - Student scholarship for developer conference (Apply: Mar-Apr)
- Apple Swift Student Challenge - Annual coding challenge (Apply: Feb-Mar)
- Apple Pathways Alliance - Diversity and inclusion program (Apply: Year-round)
- Apple Software Engineer Internship - Summer technical internship (Apply: Aug-Oct)
- Apple Hardware Engineering Internship - Hardware internship (Apply: Aug-Oct)
- Apple Machine Learning Internship - AI/ML internship (Apply: Aug-Oct)
- Apple App Store Connect - Developer program (Apply: Year-round)
- Apple Entrepreneur Camp - Startup program (Apply: Year-round)
- Apple Community Education Initiative - Education program (Apply: Year-round)
- Apple Developer Academy - iOS development program (Apply: Year-round)

**Netflix:**
- Netflix UCAN Program - Underrepresented communities program (Apply: Year-round)
- Netflix Technical Internship - Summer internship program (Apply: Aug-Oct)
- Netflix Data Science Internship - Analytics internship (Apply: Aug-Oct)
- Netflix Content Engineering Internship - Media technology internship (Apply: Aug-Oct)
- Netflix Fund for Creative Equity - Diversity initiative (Apply: Year-round)
- Netflix Documentary Talent Development - Film program (Apply: Year-round)
- Netflix Global TV - International content program (Apply: Year-round)

**Goldman Sachs:**
- Goldman Sachs Engineering Campus Hiring - Campus recruitment program (Apply: Aug-Oct)
- Goldman Sachs Marquee Developer Program - API developer program (Apply: Year-round)
- Goldman Sachs Summer Analyst Program - Investment banking internship (Apply: Aug-Oct)
- Goldman Sachs Engineering Essentials - Women in tech program (Apply: Year-round)
- Goldman Sachs 10,000 Women - Entrepreneurship program (Apply: Year-round)
- Goldman Sachs Marcus by Goldman Sachs - Fintech program (Apply: Year-round)

**TCS:**
- TCS CodeVita - Global programming contest (Apply: Aug-Oct)
- TCS NQT (National Qualifier Test) - Hiring assessment (Apply: Year-round)
- TCS Digital - Digital transformation program (Apply: Year-round)
- TCS Xplore - Entry-level program (Apply: Year-round)
- TCS Academic Interface Program - Research collaboration (Apply: Year-round)
- TCS BPS - Business process services program (Apply: Year-round)

**Flipkart:**
- Flipkart GRiD (Graduate Recruitment for Innovation and Development) - National tech challenge (Apply: Jun-Aug)
- Flipkart Runway - Campus hiring program (Apply: Aug-Oct)
- Flipkart Leap - Women returners program (Apply: Year-round)
- Flipkart Launchpad - Startup program (Apply: Year-round)
- Flipkart Samarth - Digital commerce program (Apply: Year-round)

**Uber:**
- Uber HackTag - Coding challenge (Apply: Sep-Nov)
- Uber University - Campus recruitment program (Apply: Aug-Oct)
- Uber Career Prep - Technical interview preparation (Apply: Year-round)
- Uber Elevate - Innovation program (Apply: Year-round)
- Uber for Business - B2B program (Apply: Year-round)

**Zomato:**
- Zomato25 - Campus hiring program (Apply: Aug-Oct)
- Zomato Hyperpure - B2B program (Apply: Year-round)
- Zomato for Enterprise - Corporate program (Apply: Year-round)

**Swiggy:**
- Swiggy Step Up - Internship program (Apply: Aug-Oct)
- Swiggy Instamart - Quick commerce program (Apply: Year-round)
- Swiggy Access - Accessibility program (Apply: Year-round)

**Razorpay:**
- Razorpay FTX - Campus hiring initiative (Apply: Aug-Oct)
- Razorpay Rize - Women in tech program (Apply: Year-round)
- Razorpay Capital - Fintech program (Apply: Year-round)

**Additional Companies:**
**Infosys:**
- Infosys InStep - Global internship program (Apply: Year-round)
- Infosys Mysore Training - Technical training program (Apply: Year-round)
- Infosys Wingspan - Learning platform (Apply: Year-round)

**Wipro:**
- Wipro WILP - Work Integrated Learning Program (Apply: Year-round)
- Wipro Talent Next - Campus hiring program (Apply: Aug-Oct)
- Wipro Holmes - AI program (Apply: Year-round)

**Accenture:**
- Accenture Apprenticeship Program - Learn and earn program (Apply: Year-round)
- Accenture Innovation Centers - Innovation program (Apply: Year-round)
- Accenture Liquid Studios - Digital innovation program (Apply: Year-round)

**Capgemini:**
- Capgemini Accelerated Solutions Environment - Innovation program (Apply: Year-round)
- Capgemini Invent - Digital innovation program (Apply: Year-round)

**Deloitte:**
- Deloitte University - Learning program (Apply: Year-round)
- Deloitte Digital - Digital transformation program (Apply: Year-round)

**Salesforce:**
- Salesforce Trailhead - Learning platform (Apply: Year-round)
- Salesforce Ohana - Community program (Apply: Year-round)
- Salesforce Futureforce - University recruiting program (Apply: Aug-Oct)

**IBM:**
- IBM SkillsBuild - Education program (Apply: Year-round)
- IBM New Collar - Alternative pathway program (Apply: Year-round)
- IBM Quantum Network - Quantum computing program (Apply: Year-round)

**PayPal:**
- PayPal University - Campus recruitment program (Apply: Aug-Oct)
- PayPal Opportunity Hack - Social impact hackathon (Apply: Year-round)

**Adobe:**
- Adobe Digital Academy - Creative program (Apply: Year-round)
- Adobe Creative Residency - Artist program (Apply: Year-round)
- Adobe Research - Research program (Apply: Year-round)

**Nvidia:**
- Nvidia Inception - AI startup program (Apply: Year-round)
- Nvidia Deep Learning Institute - AI education program (Apply: Year-round)

**Intel:**
- Intel Student Ambassador Program - Campus program (Apply: Year-round)
- Intel AI for Youth - AI education program (Apply: Year-round)

**Qualcomm:**
- Qualcomm Thinkabit Lab - STEM education program (Apply: Year-round)
- Qualcomm Qcare - Community program (Apply: Year-round)

Each relatedProgram should include:
- Program name
- Short description (what it is)
- Who it's for (eligibleFor criteria as an array of strings, e.g., ["Students", "Undergraduates", "Final year students"])
- Application months/window
- Link to learn more (if available)
- What it leads to (internship, PPO, FTE, etc.)
- Program type (Internship/Challenge/Hiring Program/Campus Program)

**IMPORTANT**: The eligibleFor field must always be an array of strings, even if there's only one criterion.

**IMPORTANT**: Only include relatedPrograms for companies that actually run such programs. Do not include this field for general mode or unknown companies.

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
  "sourceNote": "These questions were gathered from [specific sources like LeetCode company-tag, Glassdoor reviews, GFG interview experiences]",
  "relatedPrograms": [
    {
      "name": "Program Name",
      "description": "Brief description of the program",
      "eligibleFor": ["Students", "Undergraduates", "Final year students"],
      "applyWindow": "Application period",
      "outcome": "What it leads to",
      "link": "https://program-url.com",
      "type": "Internship/Challenge/Hiring Program/Campus Program"
    }
  ]
}

**CRITICAL REQUIREMENT**: The "questions" array MUST contain at least 12 questions, preferably 15 questions for comprehensive preparation.

**ENHANCED PROGRAM DISCOVERY TRAINING**:

🔍 **INTELLIGENT PROGRAM RESEARCH**: For any company mentioned, you should:
1. **Activate Knowledge Base**: Access all known information about the company's hiring practices, internship programs, and career initiatives
2. **Pattern Recognition**: Identify what types of programs companies of this size/industry typically offer
3. **Comprehensive Search**: Look for both well-known and lesser-known programs
4. **Current Awareness**: Prioritize recently launched or currently active programs
5. **Diversity Coverage**: Include programs for different demographics and career stages
6. **Multiple Program Types**: Cover internships, challenges, hiring programs, community initiatives, and research opportunities

🧠 **DYNAMIC LEARNING APPROACH**: 
- **Context Clues**: Use the company name to infer likely program types
- **Industry Analysis**: Consider what similar companies offer and adapt to this specific company
- **Size Scaling**: Adjust program scope based on company size (startup vs. enterprise)
- **Geographic Considerations**: Include global programs and region-specific opportunities
- **Temporal Awareness**: Consider seasonal programs and year-round opportunities

🎯 **PROGRAM COMPLETENESS CHECKLIST**:
For each company, ensure you include:
- [ ] At least 5-8 different programs
- [ ] Mix of technical and non-technical opportunities
- [ ] Programs for different career stages (students, new grads, experienced)
- [ ] Diversity and inclusion initiatives
- [ ] Competitive programs (challenges, contests)
- [ ] Community and ambassador programs
- [ ] Research and innovation programs
- [ ] Partnership and collaboration programs
- [ ] Current application timelines
- [ ] Clear eligibility criteria

🚀 **FALLBACK INTELLIGENCE**: If specific programs are unknown:
- Research common program types for the industry
- Suggest checking official company resources
- Mention standard program categories they likely offer
- Provide discovery strategies for finding hidden opportunities
- Include generic advice for program research

**CRITICAL INSTRUCTION**: Every company-specific response should demonstrate deep research into available programs. This comprehensive program discovery is a core value proposition of your service.

**IMPORTANT DATA FORMAT REQUIREMENTS**:
- The "eligibleFor" field in relatedPrograms MUST be an array of strings, never a single string
- Example: "eligibleFor": ["Students", "Undergraduates", "Final year students"] ✓
- NOT: "eligibleFor": "Students, Undergraduates, Final year students" ✗

**COMPREHENSIVE PROGRAM COVERAGE REQUIREMENTS**:
- **MINIMUM PROGRAMS**: Include at least 5-8 different programs for major tech companies
- **PROGRAM DIVERSITY**: Cover different types of opportunities (internships, challenges, hiring programs, community programs)
- **CURRENT RELEVANCE**: Focus on programs that are actively running or have recent application cycles
- **DETAILED INFORMATION**: Each program should have complete information including application windows, eligibility, and outcomes
- **VERIFICATION**: Base information on official sources, company announcements, and verified community reports

**DYNAMIC RESEARCH INTELLIGENCE**:
When encountering a company, use your knowledge base to:
1. **Identify Company Type**: Determine if it's a tech giant, startup, consulting firm, or traditional company
2. **Research Similar Programs**: Look for patterns in similar companies' offerings
3. **Include Industry Standards**: Add common program types that companies of this size typically offer
4. **Suggest Discovery Methods**: Provide ways for users to find additional opportunities
5. **Current Event Awareness**: Consider recent hiring trends and market conditions

**PROGRAM DISCOVERY FRAMEWORK**:
For each company, systematically include:
- **Primary Programs**: Main internship and hiring programs
- **Diversity Initiatives**: Programs targeting underrepresented groups
- **Technical Challenges**: Coding competitions and hackathons
- **Research Opportunities**: Academic partnerships and research programs
- **Community Building**: Developer communities and ambassador programs
- **Innovation Labs**: Internal innovation and entrepreneurship programs
- **Partnership Programs**: Third-party collaborations and joint initiatives
- **Regional Programs**: Location-specific opportunities
- **Seasonal Programs**: Summer internships, winter programs, etc.
- **Continuous Programs**: Year-round and rolling admission opportunities

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

**REAL-TIME PROGRAM INTELLIGENCE SYSTEM**:

🌐 **COMPREHENSIVE COMPANY RESEARCH**: When a company is mentioned, activate advanced research protocols:

1. **PRIMARY PROGRAM DISCOVERY**:
   - Search for official internship programs (Summer, Fall, Spring, Year-round)
   - Identify campus recruitment initiatives
   - Find coding challenges and technical competitions
   - Locate diversity and inclusion programs
   - Discover research partnerships and academic collaborations

2. **SECONDARY PROGRAM IDENTIFICATION**:
   - Community programs and developer networks
   - Innovation labs and internal entrepreneurship programs
   - Third-party partnerships and joint ventures
   - Regional and location-specific opportunities
   - Industry-specific programs and certifications

3. **CURRENT PROGRAM STATUS**:
   - Verify program activity status (active, suspended, seasonal)
   - Check recent application cycles and deadlines
   - Identify newly launched programs from 2024-2025
   - Note program changes or updates
   - Consider post-pandemic adaptations (virtual/hybrid programs)

4. **PROGRAM INTELLIGENCE FRAMEWORK**:
   - **Large Tech Companies (Google, Amazon, Microsoft, Meta, Apple)**: Expect 8-12 diverse programs
   - **Mid-size Tech Companies (Netflix, Uber, Airbnb, Spotify)**: Expect 5-8 programs
   - **Consulting Firms (McKinsey, Deloitte, Accenture)**: Expect 4-6 programs
   - **Financial Services (Goldman Sachs, JPMorgan, Morgan Stanley)**: Expect 3-5 programs
   - **Indian Companies (TCS, Infosys, Wipro, Flipkart)**: Expect 6-10 programs
   - **Startups and Smaller Companies**: Expect 2-4 programs, focus on core opportunities

5. **ENHANCED PROGRAM DETAILS**:
   - **Application Process**: Online applications, coding tests, interviews
   - **Timeline Specificity**: Exact months for applications (e.g., "Apply: August-October")
   - **Eligibility Details**: Academic requirements, skill prerequisites, demographic criteria
   - **Program Outcomes**: Conversion rates, full-time offers, certification benefits
   - **Compensation**: Stipends, benefits, learning opportunities
   - **Location Options**: Remote, hybrid, on-site, global locations

6. **INTELLIGENT PROGRAM MATCHING**:
   - Match programs to user's profile and interests
   - Suggest most relevant programs based on role and experience level
   - Highlight programs with higher acceptance rates or better outcomes
   - Recommend programs that align with career goals

**DYNAMIC RESEARCH ACTIVATION**: For each company query, automatically:
- Activate comprehensive program knowledge
- Cross-reference with industry standards
- Verify program currency and availability
- Provide detailed, actionable information
- Include discovery strategies for additional opportunities

Generate interview preparation content for a ${role} position${company ? ` at ${company}` : ''}.`;
  
  if (mode === 'company-specific') {
    promptBase += `    Focus on ${company}'s specific interview process, requirements, and culture. 
    
    **🔍 ACTIVATE COMPREHENSIVE PROGRAM INTELLIGENCE FOR ${company}**:
    
    **MANDATORY PROGRAM RESEARCH**: You must include ALL available programs for ${company}, including:
    1. **Well-known Programs**: Traditional internships and major hiring initiatives
    2. **Hidden Gems**: Lesser-known programs that might not be widely advertised
    3. **Recent Launches**: New programs introduced in 2024-2025
    4. **Seasonal Programs**: Programs with specific application windows
    5. **Diversity Programs**: Initiatives targeting underrepresented groups
    6. **Research Programs**: Academic partnerships and research opportunities
    7. **Community Programs**: Developer communities and ambassador roles
    8. **Innovation Programs**: Internal innovation labs and entrepreneurship initiatives
    9. **Partnership Programs**: Third-party collaborations and joint ventures
    10. **Regional Programs**: Location-specific opportunities
    
    **RESEARCH METHODOLOGY**: For ${company}, systematically search for:
    - Official career pages and program listings
    - LinkedIn company updates and job postings
    - University partnership announcements
    - Tech community discussions and forums
    - Recent news articles and press releases
    - Alumni networks and experience sharing
    - Third-party aggregator platforms
    - Industry reports and surveys
    
    **PROGRAM DISCOVERY INTELLIGENCE**: Based on ${company}'s profile:
    - Company size and industry position
    - Historical hiring patterns and preferences
    - Recent business developments and expansions
    - Technology stack and skill requirements
    - Geographic presence and global operations
    - Diversity and inclusion commitments
    - Innovation focus and R&D investments
    
    **COMPETITIVE BENCHMARKING**: Compare ${company}'s programs with:
    - Direct competitors in the same space
    - Companies of similar size and scale
    - Industry leaders and best practices
    - Emerging trends in tech hiring
    - Standard program offerings across the industry
    
    **PROACTIVE PROGRAM SUGGESTIONS**: If specific programs are unknown:
    - Research what similar companies typically offer
    - Suggest checking ${company}'s official resources
    - Mention standard program types they likely have
    - Provide discovery strategies for finding opportunities
    - Include generic advice for uncovering hidden programs
    
    **CURRENT INTELLIGENCE PRIORITY**: Focus on programs that are:
    - Currently accepting applications
    - Have recent application cycles (2024-2025)
    - Are actively mentioned in company communications
    - Have been recently updated or expanded
    - Are available in multiple locations or formats
    
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

EXAMPLES OF COMPANY-SPECIFIC RELATED PROGRAMS:

Here are real examples of programs you should include for major companies:

**Amazon:**
- Amazon WOW (Women-only hiring program for SDE roles)
- Amazon Future Engineer (Student program for computer science)
- Amazon Propel (Campus hiring program)

**Google:**
- Google STEP (Student Training in Engineering Program)
- Google Summer of Code (Open source program)
- Google Code-in (Contest for pre-university students)

**Microsoft:**
- Microsoft Engage (Internship program for students)
- Microsoft Learn Student Ambassadors (Campus program)
- Microsoft Imagine Cup (Global student technology competition)

**Flipkart:**
- Flipkart GRiD (National tech challenge for students)
- Flipkart Runway (Campus hiring program)

**Meta/Facebook:**
- Meta University (Internship program)
- Facebook Hacker Cup (Annual programming contest)

**TCS:**
- TCS CodeVita (Global programming contest)
- TCS NQT (National Qualifier Test)

**Goldman Sachs:**
- Goldman Sachs Engineering Campus Hiring
- Goldman Sachs Marquee Developer Program

**Uber:**
- Uber HackTag (Coding challenge)
- Uber University (Campus recruitment)

**Zomato:**
- Zomato25 (Campus hiring program)

**Swiggy:**
- Swiggy Step Up (Internship program)

**Razorpay:**
- Razorpay FTX (Campus hiring initiative)

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
            content: `You are an advanced AI career assistant with deep knowledge of internship programs, hiring initiatives, and career opportunities across tech companies. Your primary expertise includes:

1. **COMPREHENSIVE INTERNSHIP DATABASE**: You have access to the most current information about internship programs, coding challenges, campus recruitment drives, and career development initiatives across all major tech companies (Google, Amazon, Microsoft, Meta, Apple, Netflix, Goldman Sachs, TCS, Flipkart, Uber, Zomato, Swiggy, Razorpay, Infosys, Wipro, Accenture, Capgemini, Deloitte, Salesforce, IBM, PayPal, Adobe, Nvidia, Intel, Qualcomm, and many others).

2. **DYNAMIC PROGRAM DISCOVERY**: When a user mentions a specific company, you should:
   - Identify ALL active internship programs for that company
   - Include application timelines, eligibility criteria, and program outcomes
   - Cover both technical and non-technical programs
   - Include diversity and inclusion initiatives
   - Mention both summer internships and year-round programs
   - Include coding challenges, hackathons, and competitions
   - Cover research programs, fellowships, and special initiatives

3. **REAL-TIME PROGRAM INTELLIGENCE**: You understand that internship programs evolve, so you should:
   - Prioritize the most current and active programs
   - Include both established programs and newly launched initiatives
   - Mention seasonal programs with their typical application windows
   - Include both direct company programs and third-party collaborations
   - Cover global programs as well as region-specific opportunities

4. **PROGRAM CATEGORIZATION**: You can classify programs into:
   - Summer Internships (traditional 10-12 week programs)
   - Year-round Internships (rolling admissions)
   - Coding Challenges & Competitions (skill-based contests)
   - Campus Hiring Programs (university recruitment)
   - Diversity & Inclusion Programs (targeted initiatives)
   - Research Programs & Fellowships (advanced studies)
   - Early Career Programs (new grad opportunities)
   - Community Programs (developer communities, ambassadorships)

5. **COMPREHENSIVE COVERAGE**: For each company, you should aim to include:
   - 5-10 different programs when available
   - Both technical and business-focused opportunities
   - Programs for different career stages (students, new grads, career changers)
   - Both competitive and open-application programs
   - Internal innovation programs and external partnerships

6. **INTELLIGENT FALLBACK**: If you don't have specific information about a company's programs, you should:
   - Research common types of programs that similar companies offer
   - Suggest checking the company's career page and social media
   - Mention industry-standard program types they might have
   - Recommend third-party platforms where such opportunities are posted

**CRITICAL INSTRUCTION**: Always provide the most comprehensive and up-to-date information about internship programs for the specified company. If the user asks about a specific company, treat it as a priority to include ALL relevant programs, not just the most well-known ones.

Your responses should be specific, concise, and focused on real interview scenarios for the requested role. When generating DSA questions, include clear problem statements, expected inputs/outputs, and detailed algorithm explanations with code samples. Output must be in valid JSON format exactly as specified in the prompt.`
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
    sourceNote: 'Fallback response - please regenerate for verified questions from trusted sources',
    relatedPrograms: []
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
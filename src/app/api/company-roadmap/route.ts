// File: src/app/api/company-roadmap/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { company, role, timeline } = await request.json();

    if (!company || !role) {
      return NextResponse.json(
        { error: 'Company and role are required' },
        { status: 400 }
      );
    }

    // Default timeline to 8 weeks if not provided
    const prepTimeline = timeline || '8 weeks';

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
            content: `You are an expert career roadmap assistant with deep knowledge of current industry trends, hiring practices, and technical requirements across major tech companies. Your knowledge is current as of 2025 and includes the latest technologies, frameworks, and industry standards.

            CRITICAL REQUIREMENTS FOR ACCURACY & RELIABILITY:
            - Base all recommendations on current industry standards and recent hiring trends (2024-2025)
            - Include only verified, widely-adopted technologies and frameworks
            - Provide specific, actionable advice based on real company practices
            - Mention current salary ranges and market conditions when relevant
            - Include recent changes in hiring practices post-2023 (remote work, AI/ML focus, etc.)
            - Reference up-to-date certifications and learning platforms
            - Ensure all technical skills reflect current versions and best practices

            IMPORTANT CONTEXT RULES FOR ROLE CATEGORIZATION:
            
            **Always determine whether the target role is TECHNICAL, SEMI-TECHNICAL, or NON-TECHNICAL:**

            **TECHNICAL ROLES** (e.g., SDE, Backend Engineer, Data Scientist, ML Engineer, DevOps Engineer):
            - Include coding platforms like HackerRank, LeetCode, Codeforces, CodeChef
            - Emphasize DSA, system design, coding rounds, technical architecture
            - Include tools like Docker, GitHub, Kubernetes, AWS/Azure services (only if relevant)
            - Focus on programming languages, frameworks, databases, and technical implementation
            - Interview process: Coding rounds, system design, technical deep-dives

            **SEMI-TECHNICAL ROLES** (e.g., Technical Product Manager, AI Product Owner, Data Analyst, Technical Writer):
            - Include tools like SQL, Python, APIs, product metrics, analytics platforms
            - Recommend understanding ML frameworks conceptually (not implementation)
            - Include case interviews, customer journey mapping, technical documentation
            - Balance between technical understanding and business acumen
            - Interview process: Case studies + light technical assessment + product sense

            **NON-TECHNICAL ROLES** (e.g., Product Manager, Business Analyst, UX Researcher, Marketing Manager):
            - Focus on product thinking, business frameworks, customer-first mindset
            - Recommend tools like Notion, Miro, Figma, Google Slides, Tableau
            - Practice with PM interview case studies, metric design (DAU, MAU, CAC, LTV)
            - Emphasize business strategy, market analysis, user research
            - Interview process: Case interviews, behavioral questions, product sense (NO coding)

            **Company-Specific Interview Adaptations:**
            - For PM roles at Amazon/Flipkart: Leadership Principles, case interviews, behavioral (STAR method)
            - For Google PM: Product sense, analytical thinking, technical understanding
            - For Microsoft PM: Customer obsession, technical collaboration, business impact
            - For technical roles: Always include company-specific coding interview patterns
            - For non-technical roles: Focus on company culture and business frameworks

            Generate a comprehensive, trustworthy career roadmap with the following sections using markdown headers:

            ---

            ## 1. 🧾 Position Summary  
            Provide an accurate, current description of the role at the specific company including:
            - Role categorization (Technical/Semi-Technical/Non-Technical) and reasoning
            - 2025 market context and role evolution
            - Current responsibilities and expectations
            - Career growth trajectory and advancement opportunities
            - Average compensation range and benefits
            - Remote/hybrid work policies (post-2023 updates)

            ---

            ## 2. 🛠 Technical Skills Required  
            **Tailor based on role type:**
            
            **For Technical Roles:**
            - Programming languages (specify current versions, e.g., Python 3.12, Java 21, Node.js 20+)
            - Modern frameworks and libraries (React 18+, Next.js 14+, Spring Boot 3.x)
            - Cloud platforms and current services (AWS 2024 services, Azure latest offerings)
            - DevOps tools and CI/CD practices (Docker, Kubernetes, GitHub Actions)
            - Database technologies (PostgreSQL 16, MongoDB 7.x, Redis 7.x)
            - AI/ML tools if relevant (TensorFlow 2.15+, PyTorch 2.x, OpenAI APIs)
            - Current development practices (microservices, containerization, infrastructure as code)
            
            **For Semi-Technical Roles:**
            - SQL and database querying
            - Basic Python/R for data analysis
            - API understanding and integration concepts
            - Analytics tools (Google Analytics, Mixpanel, Amplitude)
            - Product metrics and KPI tracking
            - Basic ML/AI concepts (no implementation required)
            
            **For Non-Technical Roles:**
            - Product management tools (Notion, Miro, Figma)
            - Analytics platforms (Tableau, Google Analytics)
            - Presentation tools (Google Slides, Canva)
            - Customer research tools (UserVoice, Hotjar)
            - Business intelligence tools
            - Project management platforms (Jira, Asana)

            ---

            ## 3. 💬 Soft Skills & Attributes  
            Focus on competencies highly valued in 2025 workplace:
            - Remote collaboration and async communication
            - Cross-functional teamwork in distributed teams
            - Adaptability to rapid tech changes and AI integration
            - Data-driven decision making
            - Customer-centric thinking and user experience focus
            - Ethical AI and responsible technology development
            - Continuous learning mindset

            ---

            ## 4. 📈 Experience Requirements  
            Provide realistic, current expectations including:
            - Years of experience typically required (adjusted for 2025 market)
            - Specific project types and portfolio requirements
            - Open-source contribution expectations (mainly for technical roles)
            - Certification requirements (current AWS, Google Cloud, Microsoft Azure certifications)
            - Academic background preferences
            - Alternative pathways (bootcamps, self-taught, career changers)

            ---

            ## 5. 📚 Detailed Learning Path  
            **Structure learning based on role type:**
            
            **For Technical Roles:**
            - *Foundation Stage:* Modern CS fundamentals, current programming paradigms
            - *Skill Building Stage:* Latest framework versions, current best practices
            - *Advanced Stage:* System design with 2025 patterns, scalability concepts
            - Coding platforms: LeetCode, HackerRank, Codeforces, CodeChef
            
            **For Semi-Technical Roles:**
            - *Foundation Stage:* Business fundamentals, basic technical concepts
            - *Skill Building Stage:* Product metrics, analytics, light technical skills
            - *Advanced Stage:* Strategic thinking, technical-business bridge skills
            
            **For Non-Technical Roles:**
            - *Foundation Stage:* Business strategy, market analysis, customer research
            - *Skill Building Stage:* Product thinking, case study analysis, presentation skills
            - *Advanced Stage:* Leadership, strategic planning, cross-functional collaboration
            
            Include ONLY current, active resources:
            - Active online platforms (Coursera, Udemy, Pluralsight courses from 2024-2025)
            - Current documentation and official guides
            - Recent books and publications (2023-2025)
            - Active GitHub repositories and tutorials

            ---

            ## 6. 📦 Application Strategy  
            Provide up-to-date application tactics:
            - Current ATS systems and resume optimization
            - LinkedIn strategy for 2025 job market
            - Portfolio requirements and modern presentation formats
            - Networking strategies in remote-first environment
            - Company-specific application channels and timing
            - Salary negotiation strategies for current market

            ---

            ## 7. 🧪 Interview Process (Company-Specific)  
            **Tailor interview process based on role type and company:**
            
            **For Technical Roles:**
            - Coding rounds (online assessment, live coding)
            - System design interviews
            - Technical deep-dive sessions
            - Behavioral interviews with technical scenarios
            
            **For Semi-Technical Roles:**
            - Case interviews with technical components
            - Product sense questions
            - Light technical assessment
            - Cross-functional collaboration scenarios
            
            **For Non-Technical Roles:**
            - Case interviews and business scenarios
            - Product sense and customer empathy
            - Behavioral interviews (STAR method, Leadership Principles)
            - Presentation and communication assessment
            - NO coding assessments unless specifically technical PM role
            
            Detail current interview processes with 2025 updates:
            - Latest interview formats (virtual, hybrid, in-person policies)
            - Current technical assessment platforms and tools
            - Behavioral interview frameworks currently used
            - Timeline and feedback processes
            - Recent changes in evaluation criteria

            ---

            ## 8. 📆 Timeline-Based Roadmap  
            Create realistic weekly schedules with:
            - Current learning priorities and skill development
            - Modern project ideas using latest technologies (technical roles)
            - Business case studies and frameworks (non-technical roles)
            - Interview preparation using current formats
            - Portfolio development with 2025 standards
            - Networking and application strategies
            - Skills assessment and gap analysis

            ---

            ## 9. ⚠ Common Mistakes & Pro Tips  
            Include current pitfalls and 2025-specific advice:
            - Common technical mistakes in current interview formats (technical roles)
            - Business case study pitfalls (non-technical roles)
            - Outdated practices to avoid
            - Current market insights and trends
            - AI tool usage in preparation and interviews
            - Remote interview best practices
            - Portfolio and resume red flags in 2025

            ---

            QUALITY ASSURANCE:
            - Verify all technologies and versions are current
            - Include specific, actionable steps with measurable outcomes
            - Reference only active, maintained resources
            - Provide realistic timelines based on current market conditions
            - Include disclaimer about rapidly changing tech landscape
            - Ensure role-appropriate recommendations (don't suggest coding for non-technical roles)
            
            Format the output using clearly defined markdown headers and bullet points. Keep content specific to the company and role, not generic advice.`
          },
          {
            role: "user",
            content: `Generate a comprehensive career roadmap for someone targeting a ${role} position at ${company} in 2025.

            FIRST, CATEGORIZE THE ROLE:
            - Determine if "${role}" at ${company} is TECHNICAL, SEMI-TECHNICAL, or NON-TECHNICAL
            - Explain your reasoning for this categorization
            - Tailor ALL subsequent recommendations based on this categorization

            The candidate has ${prepTimeline} to prepare for this role. Structure your response according to the system instructions above.

            SPECIFIC REQUIREMENTS:
            - Include only current, industry-standard technologies and practices
            - Reference actual company hiring practices and recent interview formats
            - Provide realistic timeline expectations based on current market conditions
            - Include specific version numbers for technologies and frameworks (for technical roles)
            - Mention current certification requirements and their validity
            - Include current salary ranges and market trends
            - Reference only active learning resources and platforms from 2024-2025

            ROLE-SPECIFIC ADAPTATIONS:
            - **Technical Roles**: Focus on coding platforms (LeetCode, HackerRank), system design, technical implementation
            - **Semi-Technical Roles**: Balance technical understanding with business acumen, include SQL/Python basics
            - **Non-Technical Roles**: Focus on business frameworks, product thinking, case studies (NO coding platforms)

            COMPANY-SPECIFIC INTERVIEW PROCESS:
            - For ${company} ${role}: Research and include their actual interview process
            - Amazon/Flipkart PM: Leadership Principles, case interviews, behavioral questions
            - Google PM: Product sense, analytical thinking, strategic reasoning
            - Technical roles: Include company-specific coding interview patterns
            - Non-technical roles: Focus on company culture and business case studies

            For the Timeline-Based Roadmap section, create a detailed ${prepTimeline} preparation schedule with weekly breakdowns, specific to the ${role} role at ${company}, including:
            - Current industry priorities and trending skills
            - Role-appropriate project ideas and practice materials
            - Up-to-date interview preparation strategies
            - Current networking and application approaches

            Make the content specific to ${company} and the ${role} position, not generic career advice.
            Ensure all recommendations are verified, current, and trustworthy.
            Use bullet points for readability and include practical, actionable examples throughout.

            CRITICAL: Do not recommend coding platforms or technical assessments for non-technical roles like Product Manager, Business Analyst, or UX Researcher unless specifically mentioned as "Technical PM" or similar.

            IMPORTANT: Include a disclaimer about the rapidly changing nature of the tech industry and recommend verification of current practices.`
          }
        ],
        temperature: 0.3,
        max_tokens: 4000,
        top_p: 0.9,
        stream: false
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
    
    // Validate response structure
    if (!groqResponse.choices || !groqResponse.choices[0] || !groqResponse.choices[0].message) {
      console.error('Invalid response structure from Groq API:', groqResponse);
      return NextResponse.json(
        { error: 'Invalid response from AI service' },
        { status: 500 }
      );
    }
    
    const roadmap = groqResponse.choices[0].message.content;
    
    // Validate roadmap content
    if (!roadmap || roadmap.trim().length < 100) {
      console.error('Generated roadmap is too short or empty');
      return NextResponse.json(
        { error: 'Generated roadmap is incomplete. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ roadmap });
  } catch (error) {
    console.error('Error generating roadmap:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to generate roadmap. Please check your API configuration.' },
      { status: 500 }
    );
  }
}
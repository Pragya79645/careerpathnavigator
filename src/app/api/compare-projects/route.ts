import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory cache for consistent comparison results
const comparisonCache = new Map<string, ProjectComparison>();

// Function to analyze actual project code and functionality
async function analyzeProjectCode(username: string, projectName: string, contents: any[]) {
  try {
    const codeAnalysis = {
      packageJson: null as any,
      mainFiles: [] as string[],
      components: [] as string[],
      apiRoutes: [] as string[],
      configFiles: [] as string[],
      actualCode: [] as any[],
      projectPurpose: '',
      keyFeatures: [] as string[],
      technologyStack: {
        frontend: [] as string[],
        backend: [] as string[],
        database: [] as string[],
        deployment: [] as string[],
        tools: [] as string[]
      }
    };

    // Analyze package.json for dependencies and scripts
    const packageJsonFile = contents.find((file: any) => file.name === 'package.json');
    if (packageJsonFile) {
      try {
        const packageResponse = await fetch(packageJsonFile.download_url);
        const packageContent = await packageResponse.text();
        codeAnalysis.packageJson = JSON.parse(packageContent);
        
        // Extract technology stack from dependencies
        const deps = { 
          ...(codeAnalysis.packageJson?.dependencies || {}), 
          ...(codeAnalysis.packageJson?.devDependencies || {}) 
        };
        
        // Frontend frameworks
        if (deps.react) codeAnalysis.technologyStack.frontend.push('React');
        if (deps.vue) codeAnalysis.technologyStack.frontend.push('Vue.js');
        if (deps.angular) codeAnalysis.technologyStack.frontend.push('Angular');
        if (deps.next) codeAnalysis.technologyStack.frontend.push('Next.js');
        if (deps.nuxt) codeAnalysis.technologyStack.frontend.push('Nuxt.js');
        if (deps.svelte) codeAnalysis.technologyStack.frontend.push('Svelte');
        
        // CSS frameworks
        if (deps.tailwindcss) codeAnalysis.technologyStack.frontend.push('Tailwind CSS');
        if (deps.bootstrap) codeAnalysis.technologyStack.frontend.push('Bootstrap');
        if (deps['@mui/material']) codeAnalysis.technologyStack.frontend.push('Material-UI');
        
        // Backend frameworks
        if (deps.express) codeAnalysis.technologyStack.backend.push('Express.js');
        if (deps.fastify) codeAnalysis.technologyStack.backend.push('Fastify');
        if (deps.koa) codeAnalysis.technologyStack.backend.push('Koa.js');
        if (deps.nestjs) codeAnalysis.technologyStack.backend.push('NestJS');
        
        // Databases
        if (deps.mongoose) codeAnalysis.technologyStack.database.push('MongoDB');
        if (deps.pg) codeAnalysis.technologyStack.database.push('PostgreSQL');
        if (deps.mysql2) codeAnalysis.technologyStack.database.push('MySQL');
        if (deps.sqlite3) codeAnalysis.technologyStack.database.push('SQLite');
        if (deps.prisma) codeAnalysis.technologyStack.database.push('Prisma');
        
        // Tools
        if (deps.webpack) codeAnalysis.technologyStack.tools.push('Webpack');
        if (deps.vite) codeAnalysis.technologyStack.tools.push('Vite');
        if (deps.jest) codeAnalysis.technologyStack.tools.push('Jest');
        if (deps.typescript) codeAnalysis.technologyStack.tools.push('TypeScript');
        
      } catch (error) {
        console.error('Error parsing package.json:', error);
      }
    }

    // Analyze key files for actual functionality and uniqueness
    const keyFiles = contents.filter((file: any) => 
      file.name.endsWith('.js') || 
      file.name.endsWith('.jsx') || 
      file.name.endsWith('.ts') || 
      file.name.endsWith('.tsx') || 
      file.name.endsWith('.py') || 
      file.name.endsWith('.java') ||
      file.name === 'README.md' ||
      file.name === 'index.html' ||
      file.name.endsWith('.css') ||
      file.name.endsWith('.scss') ||
      file.name.endsWith('.vue') ||
      file.name.endsWith('.php') ||
      file.name.endsWith('.go') ||
      file.name.endsWith('.rs') ||
      file.name === 'Dockerfile' ||
      file.name === 'docker-compose.yml' ||
      file.name.endsWith('.yaml') ||
      file.name.endsWith('.yml')
    );

    // Prioritize important files for analysis (focus on core functionality)
    const prioritizedFiles = keyFiles.sort((a: any, b: any) => {
      const priorityOrder = [
        'package.json', 'main.js', 'index.js', 'app.js', 'server.js',
        'index.tsx', 'index.ts', 'App.tsx', 'App.jsx', 'main.tsx',
        'README.md', 'requirements.txt', 'Dockerfile'
      ];
      
      const aIndex = priorityOrder.indexOf(a.name);
      const bIndex = priorityOrder.indexOf(b.name);
      
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });

    // Fetch and analyze main files (limit to avoid API rate limits)
    const filesToAnalyze = prioritizedFiles.slice(0, 8);
    
    for (const file of filesToAnalyze) {
      try {
        const fileResponse = await fetch(file.download_url);
        const fileContent = await fileResponse.text();
        
        codeAnalysis.actualCode.push({
          name: file.name,
          content: fileContent.substring(0, 2000), // Limit content size
          size: file.size,
          type: file.name.split('.').pop()
        });
        
        // Analyze code patterns for uniqueness and functionality
        if (file.name.endsWith('.js') || file.name.endsWith('.jsx') || 
            file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
          
          // Check for advanced patterns and unique implementations
          const codeContent = fileContent.toLowerCase();
          
          // Detect advanced React patterns
          if (codeContent.includes('usecontext') || codeContent.includes('createcontext')) {
            codeAnalysis.technologyStack.frontend.push('React Context API');
          }
          if (codeContent.includes('usereducer') || codeContent.includes('dispatch')) {
            codeAnalysis.technologyStack.frontend.push('React Hooks (useReducer)');
          }
          if (codeContent.includes('usecallback') || codeContent.includes('usememo')) {
            codeAnalysis.technologyStack.frontend.push('React Performance Optimization');
          }
          
          // Detect API patterns
          if (codeContent.includes('fetch(') || codeContent.includes('axios')) {
            codeAnalysis.technologyStack.backend.push('REST API Integration');
          }
          if (codeContent.includes('graphql') || codeContent.includes('query') || codeContent.includes('mutation')) {
            codeAnalysis.technologyStack.backend.push('GraphQL');
          }
          
          // Detect state management
          if (codeContent.includes('redux') || codeContent.includes('store')) {
            codeAnalysis.technologyStack.frontend.push('Redux State Management');
          }
          if (codeContent.includes('zustand') || codeContent.includes('jotai')) {
            codeAnalysis.technologyStack.frontend.push('Modern State Management');
          }
          
          // Detect testing patterns
          if (codeContent.includes('test(') || codeContent.includes('it(') || codeContent.includes('describe(')) {
            codeAnalysis.technologyStack.tools.push('Testing Framework');
          }
          
          // Detect unique features from actual code
          if (codeContent.includes('websocket') || codeContent.includes('socket.io')) {
            codeAnalysis.keyFeatures.push('Real-time Communication');
          }
          if (codeContent.includes('canvas') || codeContent.includes('webgl')) {
            codeAnalysis.keyFeatures.push('Graphics/Animation');
          }
          if (codeContent.includes('geolocation') || codeContent.includes('navigator.geolocation')) {
            codeAnalysis.keyFeatures.push('Location Services');
          }
          if (codeContent.includes('notification') || codeContent.includes('push')) {
            codeAnalysis.keyFeatures.push('Push Notifications');
          }
          if (codeContent.includes('camera') || codeContent.includes('getusermedia')) {
            codeAnalysis.keyFeatures.push('Camera/Media Access');
          }
          if (codeContent.includes('ml') || codeContent.includes('tensorflow') || codeContent.includes('ai')) {
            codeAnalysis.keyFeatures.push('AI/ML Integration');
          }
        }
        
        // Extract features from README with better pattern matching
        if (file.name === 'README.md') {
          const readmeContent = fileContent.toLowerCase();
          
          // Extract project purpose from README title and description
          const titleMatches = readmeContent.match(/# (.+)/g);
          if (titleMatches && titleMatches.length > 0) {
            codeAnalysis.projectPurpose = titleMatches[0].replace('# ', '').trim();
          }
          
          // Look for project description in common patterns
          const descriptionPatterns = [
            /## about\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## description\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## overview\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## what.*is\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
          ];
          
          for (const pattern of descriptionPatterns) {
            const match = readmeContent.match(pattern);
            if (match && !codeAnalysis.projectPurpose) {
              codeAnalysis.projectPurpose = match[1].trim().substring(0, 200);
              break;
            }
          }
          
          // Extract features with enhanced patterns
          const featurePatterns = [
            /## features?\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## what.*does\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## functionality\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## capabilities\s*\n([\s\S]*?)(?=\n##|\n#|$)/i,
            /## key.*features\s*\n([\s\S]*?)(?=\n##|\n#|$)/i
          ];
          
          for (const pattern of featurePatterns) {
            const match = readmeContent.match(pattern);
            if (match) {
              const features = match[1].split('\n').filter(line => 
                line.trim().startsWith('-') || line.trim().startsWith('*') || line.trim().startsWith('•')
              ).map(line => line.replace(/^[-*•]\s*/, '').trim()).filter(feature => feature.length > 0);
              codeAnalysis.keyFeatures.push(...features);
              break;
            }
          }
          
          // Extract technology mentions from README
          const techMentions = readmeContent.match(/built with|uses|powered by|technologies?:\s*([\s\S]*?)(?=\n##|\n#|$)/i);
          if (techMentions) {
            const techText = techMentions[1].toLowerCase();
            // Add detected technologies to appropriate stacks
            if (techText.includes('react')) codeAnalysis.technologyStack.frontend.push('React (from README)');
            if (techText.includes('vue')) codeAnalysis.technologyStack.frontend.push('Vue.js (from README)');
            if (techText.includes('angular')) codeAnalysis.technologyStack.frontend.push('Angular (from README)');
            if (techText.includes('node')) codeAnalysis.technologyStack.backend.push('Node.js (from README)');
            if (techText.includes('python')) codeAnalysis.technologyStack.backend.push('Python (from README)');
            if (techText.includes('mongodb')) codeAnalysis.technologyStack.database.push('MongoDB (from README)');
            if (techText.includes('postgresql')) codeAnalysis.technologyStack.database.push('PostgreSQL (from README)');
          }
        }
      } catch (error) {
        console.error(`Error fetching file ${file.name}:`, error);
      }
    }

    // Analyze folder structure for components and API routes
    const folders = contents.filter((item: any) => item.type === 'dir');
    
    for (const folder of folders) {
      if (folder.name === 'components' || folder.name === 'src') {
        try {
          const folderResponse = await fetch(folder.url);
          const folderContents = await folderResponse.json();
          codeAnalysis.components.push(...folderContents.map((file: any) => file.name));
        } catch (error) {
          console.error(`Error fetching folder ${folder.name}:`, error);
        }
      }
      
      if (folder.name === 'api' || folder.name === 'routes') {
        try {
          const folderResponse = await fetch(folder.url);
          const folderContents = await folderResponse.json();
          codeAnalysis.apiRoutes.push(...folderContents.map((file: any) => file.name));
        } catch (error) {
          console.error(`Error fetching folder ${folder.name}:`, error);
        }
      }
    }

    return codeAnalysis;
  } catch (error) {
    console.error('Error analyzing project code:', error);
    return {
      packageJson: null as any,
      mainFiles: [] as string[],
      components: [] as string[],
      apiRoutes: [] as string[],
      configFiles: [] as string[],
      actualCode: [] as any[],
      projectPurpose: '',
      keyFeatures: [] as string[],
      technologyStack: {
        frontend: [] as string[],
        backend: [] as string[],
        database: [] as string[],
        deployment: [] as string[],
        tools: [] as string[]
      }
    };
  }
}

interface ProjectAnalysis {
  name: string;
  purpose_and_vision: string;
  unique_value_proposition: string;
  technology_stack: {
    frontend: string[];
    backend: string[];
    database: string[];
    deployment: string[];
    tools: string[];
  };
  key_features: string[];
  strengths: string[];
  areas_to_improve: string[];
  market_relevance: {
    score: number;
    description: string;
    detailed_analysis: {
      market_demand: string;
      target_audience: string;
      competition_analysis: string;
      business_potential: string;
      real_world_applicability: string;
    };
  };
  ux_complexity: {
    score: number;
    description: string;
    detailed_analysis: {
      interface_sophistication: string;
      user_experience_flow: string;
      accessibility: string;
      responsive_design: string;
      interaction_patterns: string;
    };
  };
  technical_depth: {
    score: number;
    analysis: string;
    detailed_analysis: {
      code_architecture: string;
      performance_optimization: string;
      security_implementation: string;
      scalability: string;
      testing_coverage: string;
      code_quality: string;
    };
  };
  innovation_gap: {
    score: number;
    analysis: string;
    detailed_analysis: {
      unique_features: string;
      creative_solutions: string;
      technology_adoption: string;
      problem_solving: string;
      future_proofing: string;
    };
  };
  expert_recommendations: {
    immediate_actions: string[];
    long_term_goals: string[];
    learning_path: string[];
    career_impact: string;
    portfolio_enhancement: string[];
  };
  key_learning_opportunities: {
    skill_development_insights: string[];
    strengths_to_leverage: string[];
    gaps_to_address: string[];
    recommended_resources: string[];
    career_growth_potential: string;
  };
}

interface ProjectComparison {
  project1: ProjectAnalysis;
  project2: ProjectAnalysis;
  winner: {
    project_name: string;
    reasoning: string;
    winning_score: number;
  };
  head_to_head_analysis: {
    innovation: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    technical_excellence: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    market_potential: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    user_experience: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
  };
  comparative_learning_opportunities: {
    skill_development_insights: string[];
    cross_project_lessons: string[];
    complementary_strengths: string[];
    skill_gaps_identified: string[];
    recommended_learning_path: string[];
    career_advancement_strategy: string;
  };
  overall_recommendation: string;
}

interface ComparisonRequest {
  github_username: string;
  project1: string;
  project2: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ComparisonRequest = await request.json();
    const { github_username, project1, project2 } = body;

    if (!github_username || !project1 || !project2) {
      return NextResponse.json(
        { error: 'GitHub username and two project names are required' },
        { status: 400 }
      );
    }

    // Create cache key for consistent results
    const cacheKey = `${github_username}-${project1}-${project2}`;
    const cacheHash = crypto.createHash('md5').update(cacheKey).digest('hex');

    // Check cache first
    if (comparisonCache.has(cacheHash)) {
      return NextResponse.json(comparisonCache.get(cacheHash));
    }

    // Fetch repository data for both projects
    const [repo1Response, repo2Response] = await Promise.all([
      fetch(`https://api.github.com/repos/${github_username}/${project1}`),
      fetch(`https://api.github.com/repos/${github_username}/${project2}`)
    ]);

    if (!repo1Response.ok || !repo2Response.ok) {
      return NextResponse.json(
        { error: 'One or both projects not found' },
        { status: 404 }
      );
    }

    const [repo1Data, repo2Data] = await Promise.all([
      repo1Response.json(),
      repo2Response.json()
    ]);

    // Fetch repository contents to analyze structure and actual code
    const [contents1Response, contents2Response] = await Promise.all([
      fetch(`https://api.github.com/repos/${github_username}/${project1}/contents`),
      fetch(`https://api.github.com/repos/${github_username}/${project2}/contents`)
    ]);

    let contents1 = [];
    let contents2 = [];
    let codeAnalysis1: any = {};
    let codeAnalysis2: any = {};

    if (contents1Response.ok) {
      contents1 = await contents1Response.json();
      codeAnalysis1 = await analyzeProjectCode(github_username, project1, contents1);
    }
    if (contents2Response.ok) {
      contents2 = await contents2Response.json();
      codeAnalysis2 = await analyzeProjectCode(github_username, project2, contents2);
    }

    // Prepare comparison data with deep code analysis
    const comparisonData = {
      project1: {
        name: repo1Data.name,
        description: repo1Data.description,
        language: repo1Data.language,
        stars: repo1Data.stargazers_count,
        forks: repo1Data.forks_count,
        size: repo1Data.size,
        topics: repo1Data.topics,
        homepage: repo1Data.homepage,
        created_at: repo1Data.created_at,
        updated_at: repo1Data.updated_at,
        contents: contents1.map((item: { name: any; }) => item.name),
        codeAnalysis: codeAnalysis1
      },
      project2: {
        name: repo2Data.name,
        description: repo2Data.description,
        language: repo2Data.language,
        stars: repo2Data.stargazers_count,
        forks: repo2Data.forks_count,
        size: repo2Data.size,
        topics: repo2Data.topics,
        homepage: repo2Data.homepage,
        created_at: repo2Data.created_at,
        updated_at: repo2Data.updated_at,
        contents: contents2.map((item: { name: any; }) => item.name),
        codeAnalysis: codeAnalysis2
      }
    };

    // Call Gemini API for comprehensive comparison
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert software architect and product analyst. Perform a comprehensive comparison of these two GitHub projects based on ACTUAL CODE IMPLEMENTATION, REAL FUNCTIONALITY, and UNIQUE TECHNICAL SOLUTIONS. 

🚨 **CRITICAL INSTRUCTION**: IGNORE superficial metrics like file counts, README descriptions, or repository metadata. Focus EXCLUSIVELY on:

1. **ACTUAL CODE ANALYSIS** - What the code actually does, not what it claims
2. **REAL IMPLEMENTATION PATTERNS** - Actual architectural decisions and code quality
3. **UNIQUE TECHNICAL SOLUTIONS** - Creative approaches and innovative implementations
4. **FUNCTIONAL DEPTH** - Real features based on code analysis, not documentation
5. **PRACTICAL UTILITY** - What problem the code actually solves in the real world

🔍 **DEEP CODE ANALYSIS DATA AVAILABLE**:
You have access to:
- Real package.json dependencies showing actual technology stack
- Actual code content from key implementation files
- Extracted features from both README and code analysis
- Technology stack analysis from actual dependencies
- Component structure and API routes from real code
- Code patterns and architectural decisions from source analysis

Project Comparison Data with Deep Code Analysis:
${JSON.stringify(comparisonData, null, 2)}

🎯 **ANALYSIS METHODOLOGY - CODE-FIRST APPROACH**:

⚠️ **MANDATORY FOCUS AREAS**:

1. **Real Technology Stack Analysis**: 
   - Use ONLY codeAnalysis.technologyStack data from actual package.json dependencies
   - Analyze actual code files to understand implementation complexity
   - Look at component structure and API routes for real functionality depth

2. **Actual Project Purpose Discovery**:
   - PRIMARY: Use codeAnalysis.projectPurpose extracted from README
   - SECONDARY: Analyze actual code to understand what the project really accomplishes
   - TERTIARY: Look at key features from codeAnalysis.keyFeatures based on real implementation
   - IGNORE: Generic descriptions or assumptions not backed by code

3. **Uniqueness and Innovation Assessment**:
   - Analyze actual code implementations for innovative approaches
   - Look at real feature implementations in actualCode array
   - Compare actual technical solutions and patterns used
   - Assess real-world functionality based on code analysis
   - Identify creative problem-solving approaches in actual implementation

4. **Implementation Quality Evaluation**:
   - Review actual coding patterns and architecture from code content
   - Assess code organization and design patterns from actualCode
   - Evaluate actual dependency choices and their implications
   - Analyze real component structure and API design patterns

🔍 **WHAT TO ANALYZE FROM CODE DATA**:

**From codeAnalysis.technologyStack**:
- Frontend: Actual UI frameworks, state management, styling solutions
- Backend: Real server frameworks, API patterns, authentication methods
- Database: Actual data persistence solutions and ORM choices
- Tools: Real development tools, testing frameworks, build systems

**From codeAnalysis.actualCode**:
- Code complexity and architectural patterns
- Implementation approaches and design decisions
- Unique algorithms or creative solutions
- Code quality indicators and best practices

**From codeAnalysis.keyFeatures**:
- Real features implemented in code
- Unique functionality and capabilities
- Innovation in feature implementation
- Practical utility of implemented features

🎯 **WINNER DETERMINATION CRITERIA**:

⚠️ **CRITICAL**: Winner must be determined by:
1. **Code Implementation Quality**: Actual architecture, patterns, and technical excellence
2. **Functional Innovation**: Creative solutions and unique approaches in actual code
3. **Technical Depth**: Complexity and sophistication of actual implementation
4. **Real-World Utility**: Practical value based on actual functionality
5. **Architectural Excellence**: Code organization, scalability, and maintainability

**AVOID THESE SUPERFICIAL METRICS**:
- ❌ GitHub stars, forks, or social metrics
- ❌ README length or documentation quality
- ❌ File counts or repository size
- ❌ Commit frequency or contributor count
- ❌ Generic descriptions without code backing

**FOCUS ON THESE CODE-BASED METRICS**:
- ✅ Actual implementation complexity and sophistication
- ✅ Unique technical solutions and creative approaches
- ✅ Code quality, architecture, and design patterns
- ✅ Real functionality and practical utility
- ✅ Innovation in problem-solving and implementation

🎯 COMPREHENSIVE ANALYSIS REQUIRED:

⚠️ **IMPORTANT**: For each analysis section, provide both numerical scores AND detailed explanations with comprehensive context. This helps developers understand exactly what factors contribute to their evaluation, why these factors matter for their career, and how to improve strategically.

🎯 **ANALYSIS PHILOSOPHY**: Each section should answer:
- **What** this metric measures and why it matters
- **How** it impacts career growth and employability
- **Where** the project stands compared to industry standards
- **When** these skills become crucial in development journey
- **Why** focusing on this area accelerates professional growth

📊 **DETAILED ANALYSIS FRAMEWORK**: Use this structure for each project:

For EACH project, provide comprehensive analysis based on ACTUAL CODE and FUNCTIONALITY:

1. **Purpose and Vision**: Based on codeAnalysis.projectPurpose and actual code implementation, what problem does this solve? What's the core vision?

2. **Unique Value Proposition**: Based on actual code analysis and real features, what makes this project special/different from typical implementations?

3. **Technology Stack**: Use codeAnalysis.technologyStack data from actual dependencies:
   - Frontend technologies: Use actual frontend dependencies found
   - Backend technologies: Use actual backend dependencies found  
   - Database technologies: Use actual database dependencies found
   - Deployment platforms: Analyze from actual deployment configs
   - Development tools: Use actual development tools from dependencies

4. **Key Features**: Use codeAnalysis.keyFeatures and analyze actual code implementations

5. **Strengths**: Based on actual code quality, implementation patterns, and real functionality

6. **Areas to Improve**: Based on actual code analysis, missing dependencies, and implementation gaps

7. **Market Relevance & Commercial Viability Analysis**: Score 0-10 with comprehensive market context:
   📊 **WHAT IT MEASURES**: Market relevance evaluates how well your project addresses real-world business needs, commercial viability, and industry demand. This directly correlates with your employability and the project's potential for real-world impact.
   
   📈 **WHY IT MATTERS FOR YOUR CAREER**: 
   - **Employability**: Projects solving real problems demonstrate business acumen
   - **Portfolio Impact**: Shows you understand market needs beyond just technical skills
   - **Interview Advantage**: Gives you concrete examples of problem-solving for business value
   - **Salary Potential**: Market-relevant skills command higher compensation
   
   🏢 **DETAILED MARKET ANALYSIS REQUIRED**:
   - **Market Demand**: Current trends, growth patterns, and industry adoption rates
   - **Target Audience**: User demographics, pain points, and market size assessment
   - **Competition Analysis**: Existing solutions, market gaps, and differentiation opportunities
   - **Business Potential**: Revenue models, scalability factors, and monetization strategies
   - **Real-world Applicability**: Implementation barriers, adoption challenges, and practical impact

8. **UX Complexity & Experience Design Analysis**: Score 0-10 with comprehensive UX context:
   🎨 **WHAT IT MEASURES**: UX complexity assesses your understanding of user-centered design principles, interface sophistication, and ability to create intuitive, accessible experiences. This is increasingly crucial in modern frontend development.
   
   🧠 **WHY IT MATTERS FOR YOUR CAREER**:
   - **Market Demand**: UX-savvy developers are in high demand across all industries
   - **Cross-functional Skills**: Bridges gap between design and development teams
   - **User Advocacy**: Shows you think beyond code to actual user needs
   - **Senior Role Preparation**: UX thinking is essential for technical leadership
   
   🎯 **DETAILED UX ANALYSIS REQUIRED**:
   - **Interface Sophistication**: Design system usage, visual hierarchy, and aesthetic quality
   - **User Experience Flow**: Navigation patterns, information architecture, and user journey optimization
   - **Accessibility**: WCAG compliance, inclusive design principles, and assistive technology support
   - **Responsive Design**: Mobile-first approach, cross-device consistency, and adaptive layouts
   - **Interaction Patterns**: Micro-interactions, feedback systems, and engagement strategies

9. **Technical Depth & Architecture Analysis**: Score 0-10 with comprehensive technical evaluation:
   ⚙️ **WHAT IT MEASURES**: Technical depth evaluates your coding expertise, architectural thinking, and engineering best practices. This is the primary differentiator between junior and senior developers and directly impacts your technical career trajectory.
   
   💻 **WHY IT MATTERS FOR YOUR CAREER**:
   - **Technical Leadership**: Strong architecture skills lead to senior/lead roles
   - **Code Review Confidence**: Demonstrates ability to mentor and guide other developers
   - **System Thinking**: Shows understanding of large-scale application development
   - **Problem-Solving**: Reflects ability to handle complex technical challenges
   
   🔧 **DETAILED TECHNICAL ANALYSIS REQUIRED**:
   - **Code Architecture**: Design patterns, SOLID principles, modular design, and structural organization
   - **Performance Optimization**: Loading speeds, bundle optimization, caching strategies, and efficiency metrics
   - **Security Implementation**: Authentication systems, authorization patterns, data protection, and vulnerability prevention
   - **Scalability**: Horizontal/vertical scaling design, load handling capacity, and future-proofing strategies
   - **Testing Coverage**: Unit tests, integration tests, E2E tests, and quality assurance processes
   - **Code Quality**: Documentation standards, maintainability, readability, and industry best practices

10. **Innovation Gap & Creative Problem-Solving Analysis**: Score 0-10 with innovation assessment:
    💡 **WHAT IT MEASURES**: Innovation gap evaluates how your project stands out from conventional solutions, demonstrates creative problem-solving, and shows forward-thinking approach. This is crucial for standing out in competitive job markets.
    
    🚀 **WHY IT MATTERS FOR YOUR CAREER**:
    - **Competitive Advantage**: Innovative thinking separates you from other candidates
    - **Creative Problem-Solving**: Shows ability to think outside the box
    - **Technology Leadership**: Demonstrates early adoption and trend awareness
    - **Entrepreneurial Skills**: Indicates potential for product development and innovation
    
    🎯 **DETAILED INNOVATION ANALYSIS REQUIRED**:
    - **Unique Features**: Novel functionalities, creative implementations, and differentiation factors
    - **Creative Solutions**: Out-of-the-box thinking, unconventional approaches, and innovative problem-solving
    - **Technology Adoption**: Use of cutting-edge technologies, experimental features, and modern practices
    - **Problem-Solving Methodology**: Approach to challenges, solution creativity, and implementation innovation
    - **Future-Proofing**: Adaptability design, emerging technology integration, and long-term viability

11. **Key Learning Opportunities & Skill Development Analysis**: Comprehensive skill growth assessment:
    🎓 **WHAT IT MEASURES**: This evaluates the learning potential from each project, identifying specific skill gaps, growth opportunities, and development pathways. This directly guides your professional development strategy.
    
    📚 **WHY IT MATTERS FOR YOUR CAREER**:
    - **Skill Gap Analysis**: Identifies specific areas for improvement
    - **Learning Roadmap**: Provides clear direction for skill development
    - **Career Acceleration**: Focuses effort on high-impact learning areas
    - **Continuous Growth**: Ensures ongoing professional development
    
    🎯 **DETAILED LEARNING ANALYSIS REQUIRED**:
    - **Skill Development Insights**: Specific technical and soft skills to develop from this project
    - **Strengths to Leverage**: Existing capabilities that can be enhanced and built upon
    - **Gaps to Address**: Critical missing skills that limit career progression
    - **Recommended Resources**: Specific courses, documentation, and learning materials
    - **Career Growth Potential**: How these skills impact long-term career trajectory

12. **Expert AI Recommendations & Personalized Development Journey**: Comprehensive career guidance:
    🧠 **WHAT IT PROVIDES**: Actionable, personalized advice based on comprehensive project analysis, tailored to accelerate your specific career goals and address identified skill gaps.
    
    🎯 **WHY IT MATTERS FOR YOUR CAREER**:
    - **Personalized Growth**: Recommendations tailored to your specific situation
    - **Actionable Steps**: Clear, implementable actions for improvement
    - **Strategic Focus**: Prioritizes high-impact areas for maximum career benefit
    - **Professional Positioning**: Helps position you for desired roles and opportunities
    
    💡 **COMPREHENSIVE RECOMMENDATION STRUCTURE**:
    - **Immediate Actions** (Next 1-2 weeks): Specific, actionable steps for quick wins
    - **Long-term Goals** (Next 3-6 months): Strategic improvements and skill development milestones
    - **Learning Path**: Recommended courses, technologies, and resources for systematic growth
    - **Career Impact**: How these improvements will specifically affect job prospects and advancement
    - **Portfolio Enhancement**: Specific suggestions to make projects more impressive to employers and clients

🏆 WINNER DECLARATION - BASED ON ACTUAL FUNCTIONALITY:
Based on comprehensive analysis of ACTUAL CODE and REAL FUNCTIONALITY across all categories, declare a winner with:

⚠️ **CRITICAL**: Winner should be determined by:
1. **Real Implementation Quality**: Actual code patterns, architecture, and best practices
2. **Functional Depth**: What the project actually does vs. what it claims
3. **Technical Innovation**: Actual innovative code solutions and implementations
4. **Real-World Value**: Practical utility based on actual features and functionality
5. **Code Quality**: Actual code organization, patterns, and maintainability

**Winner Analysis Requirements**:
- Project name that demonstrates superior ACTUAL implementation and functionality
- **Detailed reasoning** (minimum 150 words) explaining the decision based on ACTUAL CODE ANALYSIS
- Winning score (0-100) reflecting REAL project quality and implementation depth
- **Specific examples** from ACTUAL CODE CONTENT and REAL FEATURES that support the decision
- **Avoid superficial judgments** based only on README descriptions or file counts

📊 HEAD-TO-HEAD ANALYSIS:
Provide detailed comparative analysis for BOTH projects in these areas:

🚀 **Innovation Analysis**:
- **Project 1 Innovation**: Specific innovative features, creative solutions, and unique approaches
- **Project 2 Innovation**: Specific innovative features, creative solutions, and unique approaches
- **Innovation Winner**: Which project demonstrates superior innovation and why

⚙️ **Technical Excellence Analysis**:
- **Project 1 Technical Excellence**: Code quality, architecture, best practices, and technical depth
- **Project 2 Technical Excellence**: Code quality, architecture, best practices, and technical depth
- **Technical Winner**: Which project shows better technical implementation and why

💼 **Market Potential Analysis**:
- **Project 1 Market Potential**: Commercial viability, market demand, and business opportunities
- **Project 2 Market Potential**: Commercial viability, market demand, and business opportunities
- **Market Winner**: Which project has higher market potential and why

🎨 **User Experience Analysis**:
- **Project 1 User Experience**: Usability, accessibility, design quality, and user satisfaction
- **Project 2 User Experience**: Usability, accessibility, design quality, and user satisfaction
- **UX Winner**: Which project provides better user experience and why

🎓 **COMPARATIVE LEARNING OPPORTUNITIES & SKILL DEVELOPMENT INSIGHTS**:
Based on the comprehensive analysis of both projects, provide strategic learning insights:

📚 **WHAT IT PROVIDES**: This section synthesizes insights from both projects to create a comprehensive learning roadmap that leverages the strengths of each project while addressing gaps identified across both.

🎯 **WHY IT MATTERS FOR CAREER GROWTH**:
- **Cross-Project Learning**: Identifies transferable skills between different project types
- **Skill Synthesis**: Combines learnings from both projects for accelerated development
- **Strategic Focus**: Prioritizes learning areas based on comparative analysis
- **Portfolio Diversification**: Guides development of complementary skills across projects

📊 **DETAILED COMPARATIVE ANALYSIS REQUIRED**:
- **Skill Development Insights**: Key technical and soft skills that can be developed by studying both projects
- **Cross-Project Lessons**: Lessons learned from comparing different approaches and implementations
- **Complementary Strengths**: How skills from one project can complement and enhance the other
- **Skill Gaps Identified**: Critical gaps that become apparent when comparing both projects
- **Recommended Learning Path**: Strategic sequence of skill development based on comparative analysis
- **Career Advancement Strategy**: How combining insights from both projects accelerates career growth

💡 **CONTEXT FOR DEVELOPERS**: 
Remember that this comparison will help developers understand:
1. How their ACTUAL PROJECT IMPLEMENTATIONS stack up against each other
2. Specific areas where their REAL CODE excels or needs improvement
3. Actionable steps to enhance their ACTUAL PROJECT FUNCTIONALITY
4. Career impact of different REAL IMPLEMENTATION approaches
5. Market relevance of their ACTUAL TECHNOLOGY CHOICES and solutions

🔍 **ANALYSIS VALIDATION**:
- Ensure all analysis is based on actual code content and real dependencies
- Verify technology stack from actual package.json dependencies
- Base feature analysis on real implementations, not just descriptions
- Focus on what the projects actually do, not what they claim to do
- Consider actual code quality, patterns, and architectural decisions

🎯 **AVOID SUPERFICIAL ANALYSIS**:
- Don't judge projects solely on README descriptions
- Don't assume functionality without code evidence
- Don't compare based only on file counts or folder structure
- Don't make assumptions about features without actual implementation proof
- Focus on real, demonstrable functionality and code quality

OUTPUT FORMAT (JSON only):
{
  "project1": {
    "name": "Project Name 1",
    "purpose_and_vision": "Clear description of project purpose and vision",
    "unique_value_proposition": "What makes this project unique",
    "technology_stack": {
      "frontend": ["React", "Tailwind CSS"],
      "backend": ["Node.js", "Express"],
      "database": ["MongoDB"],
      "deployment": ["Vercel"],
      "tools": ["Webpack", "Jest"]
    },
    "key_features": ["Feature 1", "Feature 2", "Feature 3"],
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "areas_to_improve": ["Area 1", "Area 2", "Area 3"],
    "market_relevance": {
      "score": 8,
      "description": "High market demand for this type of solution",
      "detailed_analysis": {
        "market_demand": "Strong demand in the e-commerce space with growing need for personalized shopping experiences",
        "target_audience": "Online retailers, small businesses, and consumer brands looking to enhance customer engagement",
        "competition_analysis": "Competitive market but with unique positioning through AI-driven recommendations",
        "business_potential": "High scalability potential with SaaS model opportunities",
        "real_world_applicability": "Directly applicable to existing e-commerce platforms with minimal integration effort"
      }
    },
    "ux_complexity": {
      "score": 7,
      "description": "Well-designed user interface with good user flow",
      "detailed_analysis": {
        "interface_sophistication": "Modern, clean design with intuitive navigation and professional aesthetics",
        "user_experience_flow": "Smooth user journey from onboarding to checkout with minimal friction points",
        "accessibility": "Basic accessibility features implemented but room for improvement in WCAG compliance",
        "responsive_design": "Fully responsive across devices with optimized mobile experience",
        "interaction_patterns": "Standard but effective interaction patterns with some innovative micro-interactions"
      }
    },
    "technical_depth": {
      "score": 6,
      "analysis": "Moderate technical complexity with room for advanced patterns",
      "detailed_analysis": {
        "code_architecture": "Well-structured component architecture with clear separation of concerns",
        "performance_optimization": "Basic performance optimizations in place but could benefit from advanced caching strategies",
        "security_implementation": "Standard security practices implemented with authentication and input validation",
        "scalability": "Designed for moderate scale but would need architecture improvements for enterprise level",
        "testing_coverage": "Limited testing coverage - needs comprehensive unit and integration tests",
        "code_quality": "Clean, readable code with consistent naming conventions and moderate documentation"
      }
    },
    "innovation_gap": {
      "score": 5,
      "analysis": "Some innovative features but mostly standard implementations",
      "detailed_analysis": {
        "unique_features": "AI-powered recommendation engine is innovative but implementation is relatively standard",
        "creative_solutions": "Creative approach to user onboarding and data visualization",
        "technology_adoption": "Uses modern technologies but not pushing boundaries with cutting-edge implementations",
        "problem_solving": "Effective problem-solving approach with some creative workarounds for common issues",
        "future_proofing": "Moderate future-proofing with some consideration for emerging technologies"
      }
    },
    "expert_recommendations": {
      "immediate_actions": ["Add comprehensive error handling", "Implement loading states for better UX"],
      "long_term_goals": ["Migrate to TypeScript for better type safety", "Implement comprehensive testing suite"],
      "learning_path": ["Master React Testing Library", "Learn TypeScript fundamentals", "Study advanced React patterns"],
      "career_impact": "These improvements will position you as a detail-oriented developer who understands production-ready code, significantly increasing your marketability to senior frontend roles.",
      "portfolio_enhancement": ["Create detailed case study with problem-solution approach", "Add performance metrics and optimization results", "Include accessibility audit results"]
    },
    "key_learning_opportunities": {
      "skill_development_insights": ["Advanced React patterns and hooks", "TypeScript integration and type safety", "Performance optimization techniques"],
      "strengths_to_leverage": ["Strong component architecture", "Good UI/UX design sense", "Solid JavaScript fundamentals"],
      "gaps_to_address": ["Testing implementation", "Type safety with TypeScript", "Performance optimization"],
      "recommended_resources": ["React Testing Library documentation", "TypeScript handbook", "Web.dev performance guides"],
      "career_growth_potential": "Strong foundation for senior frontend roles with focused skill development in testing and type safety"
    }
  },
  "project2": {
    "name": "Project Name 2",
    "purpose_and_vision": "Clear description of project purpose and vision",
    "unique_value_proposition": "What makes this project unique",
    "technology_stack": {
      "frontend": ["Vue.js", "Bootstrap"],
      "backend": ["Python", "Django"],
      "database": ["PostgreSQL"],
      "deployment": ["Heroku"],
      "tools": ["Vite", "Pytest"]
    },
    "key_features": ["Feature 1", "Feature 2", "Feature 3"],
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "areas_to_improve": ["Area 1", "Area 2", "Area 3"],
    "market_relevance": {
      "score": 6,
      "description": "Moderate market demand with niche appeal",
      "detailed_analysis": {
        "market_demand": "Growing market in the productivity tools space but more competitive landscape",
        "target_audience": "Freelancers, small teams, and productivity enthusiasts",
        "competition_analysis": "Crowded market with established players but room for specialized solutions",
        "business_potential": "Moderate scalability with potential for niche market dominance",
        "real_world_applicability": "Good applicability for specific use cases but limited broad market appeal"
      }
    },
    "ux_complexity": {
      "score": 5,
      "description": "Basic user interface with standard patterns",
      "detailed_analysis": {
        "interface_sophistication": "Clean but basic interface following standard design patterns",
        "user_experience_flow": "Straightforward user flow with some areas for improvement in user guidance",
        "accessibility": "Limited accessibility features - needs significant improvement for inclusive design",
        "responsive_design": "Basic responsive design with some mobile usability issues",
        "interaction_patterns": "Standard interaction patterns without innovative elements"
      }
    },
    "technical_depth": {
      "score": 7,
      "analysis": "Good technical implementation with solid architecture",
      "detailed_analysis": {
        "code_architecture": "Solid MVC architecture with good separation of concerns and modular design",
        "performance_optimization": "Good performance optimizations including caching and efficient database queries",
        "security_implementation": "Robust security implementation with proper authentication and authorization",
        "scalability": "Well-designed for scalability with potential for horizontal scaling",
        "testing_coverage": "Good testing coverage with unit tests and some integration tests",
        "code_quality": "High code quality with excellent documentation and consistent coding standards"
      }
    },
    "innovation_gap": {
      "score": 4,
      "analysis": "Standard implementation with limited innovative features",
      "detailed_analysis": {
        "unique_features": "Few unique features - mostly implements standard functionality",
        "creative_solutions": "Limited creative problem-solving - follows conventional approaches",
        "technology_adoption": "Uses stable, proven technologies without exploring cutting-edge solutions",
        "problem_solving": "Solid problem-solving approach but lacks innovative thinking",
        "future_proofing": "Limited future-proofing - may need significant updates for emerging trends"
      }
    },
    "expert_recommendations": {
      "immediate_actions": ["Improve mobile responsiveness", "Add basic accessibility features"],
      "long_term_goals": ["Implement advanced features to differentiate from competitors", "Add comprehensive analytics and monitoring"],
      "learning_path": ["Study UX/UI design principles", "Learn advanced CSS and animation techniques", "Master performance optimization"],
      "career_impact": "Focusing on user experience and innovative features will help you stand out in the competitive frontend market and qualify for UX-focused developer roles.",
      "portfolio_enhancement": ["Add user testing results and feedback", "Create interactive demos and case studies", "Include before/after performance comparisons"]
    },
    "key_learning_opportunities": {
      "skill_development_insights": ["UX/UI design principles", "Advanced CSS and animation", "User research and testing methodologies"],
      "strengths_to_leverage": ["Solid technical foundation", "Good code organization", "Understanding of web fundamentals"],
      "gaps_to_address": ["User experience design", "Modern CSS techniques", "Performance optimization"],
      "recommended_resources": ["UX/UI design courses", "CSS Grid and Flexbox guides", "Performance optimization tutorials"],
      "career_growth_potential": "Strong technical foundation with UX focus will open doors to full-stack and UX-focused development roles"
    }
  },
  "winner": {
    "project_name": "Project Name 1",
    "reasoning": "Detailed explanation of why this project wins based on multiple criteria",
    "winning_score": 75
  },
  "head_to_head_analysis": {
    "innovation": {
      "project1_analysis": "Project 1 demonstrates innovative AI-powered recommendation engine with unique personalization algorithms and creative data visualization approaches",
      "project2_analysis": "Project 2 shows standard implementation with limited innovative features, focusing on proven conventional approaches",
      "winner": "Project 1 - Superior innovation through AI integration and creative problem-solving approaches"
    },
    "technical_excellence": {
      "project1_analysis": "Project 1 has well-structured component architecture but lacks comprehensive testing and type safety implementation",
      "project2_analysis": "Project 2 demonstrates excellent MVC architecture, robust security implementation, and comprehensive testing coverage",
      "winner": "Project 2 - Superior technical implementation with better code quality and architectural patterns"
    },
    "market_potential": {
      "project1_analysis": "Project 1 addresses high-demand e-commerce personalization market with strong scalability potential and clear revenue opportunities",
      "project2_analysis": "Project 2 targets productivity tools market with moderate demand and niche appeal but limited broad market potential",
      "winner": "Project 1 - Higher market demand and commercial viability with broader target audience"
    },
    "user_experience": {
      "project1_analysis": "Project 1 provides polished, intuitive interface with smooth user journey and responsive design across devices",
      "project2_analysis": "Project 2 offers basic interface following standard patterns but lacks accessibility features and has mobile usability issues",
      "winner": "Project 1 - Superior user experience with better design quality and usability"
    }
  },
  "comparative_learning_opportunities": {
    "skill_development_insights": ["Combining Project 1's innovative AI approach with Project 2's solid architectural patterns", "Learning from Project 2's testing methodology to improve Project 1's quality assurance", "Integrating Project 1's UX design principles with Project 2's technical depth"],
    "cross_project_lessons": ["Project 1 shows importance of user-centric design while Project 2 demonstrates value of robust backend architecture", "Different technology stack choices reveal trade-offs between innovation and stability", "Market positioning strategies vary significantly between consumer-facing and productivity-focused applications"],
    "complementary_strengths": ["Project 1's frontend innovation can be enhanced with Project 2's backend security practices", "Project 2's systematic testing approach can elevate Project 1's reliability", "Combining both projects' approaches creates a full-stack development perspective"],
    "skill_gaps_identified": ["Need for comprehensive testing strategy across both projects", "Accessibility implementation requires improvement in both projects", "Performance optimization techniques could benefit both implementations"],
    "recommended_learning_path": ["Master React Testing Library and Jest for comprehensive testing", "Study backend security implementation and API design patterns", "Learn accessibility best practices and WCAG compliance", "Develop performance optimization skills for both frontend and backend"],
    "career_advancement_strategy": "Combining the innovative frontend approach from Project 1 with the solid technical foundation from Project 2 positions you as a well-rounded full-stack developer capable of both creative problem-solving and robust system architecture. This combination is highly valuable for senior developer roles and technical leadership positions."
  },
  "overall_recommendation": "Comprehensive recommendation for developer's next steps and focus areas"
}

🎯 DETAILED SCORING CRITERIA & CONTEXT:

📊 **Market Relevance (0-10) - Business Impact Assessment**:
- **0-2**: Personal/learning projects with no commercial application or market validation
- **3-4**: Basic utility projects addressing limited user needs with minimal market research
- **5-6**: Projects solving real problems with moderate market demand and user feedback
- **7-8**: Strong market demand with clear commercial potential and validated user needs
- **9-10**: High-impact solutions addressing significant market gaps with proven business value

🎨 **UX Complexity (0-10) - User Experience Excellence**:
- **0-2**: Basic HTML/CSS with minimal user interaction and poor usability
- **3-4**: Simple interfaces with basic responsive design and standard patterns
- **5-6**: Well-designed interfaces with good user flow and accessibility considerations
- **7-8**: Sophisticated UX with advanced interactions, accessibility, and user research
- **9-10**: Exceptional UX with innovative patterns, flawless usability, and inclusive design

⚙️ **Technical Depth (0-10) - Engineering Excellence**:
- **0-2**: Basic frontend with minimal architecture and poor code organization
- **3-4**: Standard implementations with some best practices and basic structure
- **5-6**: Well-structured code with good patterns, testing, and documentation
- **7-8**: Advanced architecture with optimization, security, and comprehensive testing
- **9-10**: Expert-level implementation with scalable architecture and industry best practices

💡 **Innovation Gap (0-10) - Creative Problem-Solving**:
- **0-2**: Standard implementations with no unique features or creative solutions
- **3-4**: Some creative elements but mostly conventional approaches and patterns
- **5-6**: Good balance of standard and innovative approaches with unique features
- **7-8**: Creative solutions with unique features and innovative problem-solving
- **9-10**: Groundbreaking implementations with significant innovation and creative excellence

🏆 **COMPREHENSIVE EVALUATION CONTEXT**:
Remember that this comparison helps developers understand:
1. **Strategic Positioning**: How projects stack up in competitive job market
2. **Skill Development**: Specific areas for improvement and growth opportunities
3. **Career Trajectory**: How different approaches impact professional advancement
4. **Market Alignment**: Relevance of chosen technologies and solutions to industry needs
5. **Portfolio Strategy**: Actionable insights for enhancing project impact and presentation

Only return JSON. No explanations or additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 3000,
        }
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to get AI comparison');
    }

    const geminiResult = await geminiResponse.json();
    const aiResponseText = geminiResult.candidates[0].content.parts[0].text;

    // Parse the JSON response from Gemini
    let comparison: ProjectComparison;
    try {
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        comparison = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Enhanced fallback comparison with actual code analysis
      comparison = {
        project1: {
          name: project1,
          purpose_and_vision: codeAnalysis1.projectPurpose || "Project purpose analysis pending - requires deeper code review",
          unique_value_proposition: codeAnalysis1.keyFeatures.length > 0 ? 
            `Unique features include: ${codeAnalysis1.keyFeatures.slice(0, 3).join(', ')}` : 
            "To be determined through comprehensive code analysis",
          technology_stack: {
            frontend: codeAnalysis1.technologyStack.frontend.length > 0 ? 
              codeAnalysis1.technologyStack.frontend : 
              [comparisonData.project1.language || "JavaScript"],
            backend: codeAnalysis1.technologyStack.backend,
            database: codeAnalysis1.technologyStack.database,
            deployment: comparisonData.project1.homepage ? ["Deployed"] : [],
            tools: codeAnalysis1.technologyStack.tools
          },
          key_features: codeAnalysis1.keyFeatures.length > 0 ? 
            codeAnalysis1.keyFeatures : 
            ["Feature analysis pending", "Requires detailed code review"],
          strengths: codeAnalysis1.technologyStack.frontend.length > 0 ? 
            [`Uses modern tech stack: ${codeAnalysis1.technologyStack.frontend.join(', ')}`, "Active development", "Good project structure"] : 
            ["Active development", "Good project structure potential"],
          areas_to_improve: ["Comprehensive code analysis needed", "Detailed functionality review required"],
          market_relevance: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis1.keyFeatures?.length > 3 ? 2 : 0;
              score += codeAnalysis1.projectPurpose ? 1 : 0;
              score += comparisonData.project1.homepage ? 1 : 0;
              score += (comparisonData.project1.stars || 0) > 10 ? 1 : 0;
              score += (comparisonData.project1.forks || 0) > 5 ? 1 : 0;
              return Math.min(score, 10);
            })(),
            description: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis1.keyFeatures?.length > 3 ? 2 : 0;
                score += codeAnalysis1.projectPurpose ? 1 : 0;
                score += comparisonData.project1.homepage ? 1 : 0;
                score += (comparisonData.project1.stars || 0) > 10 ? 1 : 0;
                score += (comparisonData.project1.forks || 0) > 5 ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Strong market relevance with clear value proposition";
              if (score >= 6) return "Good market potential with room for growth";
              return "Moderate market relevance - needs strategic positioning";
            })(),
            detailed_analysis: {
              market_demand: "Market demand assessment requires comprehensive analysis of target audience and competitive landscape",
              target_audience: "Target audience identification pending - needs user research and market segmentation analysis",
              competition_analysis: "Competitive analysis pending - requires evaluation of existing solutions and market positioning",
              business_potential: "Business potential assessment pending - needs revenue model and scalability analysis",
              real_world_applicability: "Real-world applicability evaluation pending - requires use case analysis and implementation feasibility study"
            }
          },
          ux_complexity: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis1.technologyStack?.frontend?.includes('React') ? 2 : 0;
              score += codeAnalysis1.technologyStack?.frontend?.includes('Next.js') ? 1 : 0;
              score += codeAnalysis1.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 1 : 0;
              score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('interface')) ? 1 : 0;
              score += codeAnalysis1.technologyStack?.frontend?.includes('Tailwind') ? 1 : 0;
              return Math.min(score, 10);
            })(),
            description: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis1.technologyStack?.frontend?.includes('React') ? 2 : 0;
                score += codeAnalysis1.technologyStack?.frontend?.includes('Next.js') ? 1 : 0;
                score += codeAnalysis1.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 1 : 0;
                score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('interface')) ? 1 : 0;
                score += codeAnalysis1.technologyStack?.frontend?.includes('Tailwind') ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Advanced UX with modern frameworks and styling";
              if (score >= 6) return "Good UX implementation with room for enhancement";
              return "Basic UX - needs modern frameworks and better styling";
            })(),
            detailed_analysis: {
              interface_sophistication: "Interface sophistication assessment pending - needs UI/UX design pattern analysis",
              user_experience_flow: "User experience flow evaluation pending - requires user journey mapping and usability testing",
              accessibility: "Accessibility assessment pending - needs WCAG compliance evaluation and inclusive design analysis",
              responsive_design: "Responsive design evaluation pending - requires cross-device compatibility testing",
              interaction_patterns: "Interaction patterns analysis pending - needs user interaction design assessment"
            }
          },
          technical_depth: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis1.technologyStack?.backend?.length > 0 ? 2 : 0;
              score += codeAnalysis1.technologyStack?.database?.length > 0 ? 1 : 0;
              score += codeAnalysis1.technologyStack?.tools?.length > 2 ? 1 : 0;
              score += codeAnalysis1.actualCode?.length > 5 ? 1 : 0;
              score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('api') || feature.toLowerCase().includes('database')) ? 1 : 0;
              return Math.min(score, 10);
            })(),
            analysis: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis1.technologyStack?.backend?.length > 0 ? 2 : 0;
                score += codeAnalysis1.technologyStack?.database?.length > 0 ? 1 : 0;
                score += codeAnalysis1.technologyStack?.tools?.length > 2 ? 1 : 0;
                score += codeAnalysis1.actualCode?.length > 5 ? 1 : 0;
                score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('api') || feature.toLowerCase().includes('database')) ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Deep technical implementation with full-stack capabilities";
              if (score >= 6) return "Good technical depth with some advanced features";
              return "Basic technical implementation - needs more advanced features";
            })(),
            detailed_analysis: {
              code_architecture: "Code architecture assessment pending - needs design pattern and structural analysis",
              performance_optimization: "Performance optimization evaluation pending - requires load testing and bottleneck analysis",
              security_implementation: "Security implementation assessment pending - needs vulnerability analysis and best practices review",
              scalability: "Scalability evaluation pending - requires architecture review and capacity planning analysis",
              testing_coverage: "Testing coverage assessment pending - needs unit, integration, and end-to-end testing evaluation",
              code_quality: "Code quality analysis pending - requires code review, documentation assessment, and maintainability evaluation"
            }
          },
          innovation_gap: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis1.keyFeatures?.length > 5 ? 2 : 0;
              score += codeAnalysis1.technologyStack?.frontend?.some((tech: string) => tech.includes('Next.js') || tech.includes('React')) ? 1 : 0;
              score += codeAnalysis1.projectPurpose?.toLowerCase().includes('ai') || codeAnalysis1.projectPurpose?.toLowerCase().includes('machine learning') ? 2 : 0;
              score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('real-time') || feature.toLowerCase().includes('interactive')) ? 1 : 0;
              return Math.min(score, 10);
            })(),
            analysis: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis1.keyFeatures?.length > 5 ? 2 : 0;
                score += codeAnalysis1.technologyStack?.frontend?.some((tech: string) => tech.includes('Next.js') || tech.includes('React')) ? 1 : 0;
                score += codeAnalysis1.projectPurpose?.toLowerCase().includes('ai') || codeAnalysis1.projectPurpose?.toLowerCase().includes('machine learning') ? 2 : 0;
                score += codeAnalysis1.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('real-time') || feature.toLowerCase().includes('interactive')) ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Highly innovative with cutting-edge features and technologies";
              if (score >= 6) return "Good innovation with modern approaches and unique features";
              return "Moderate innovation - needs more unique features and modern approaches";
            })(),
            detailed_analysis: {
              unique_features: "Unique features assessment pending - needs feature differentiation and novelty analysis",
              creative_solutions: "Creative solutions evaluation pending - requires problem-solving approach and innovation assessment",
              technology_adoption: "Technology adoption analysis pending - needs evaluation of cutting-edge technology implementation",
              problem_solving: "Problem-solving approach assessment pending - requires methodology and effectiveness evaluation",
              future_proofing: "Future-proofing evaluation pending - needs emerging technology and trend adaptation analysis"
            }
          },
          expert_recommendations: {
            immediate_actions: ["Schedule comprehensive code review", "Analyze project architecture"],
            long_term_goals: ["Improve code documentation", "Enhance project features"],
            learning_path: ["Study modern frontend patterns", "Learn advanced JavaScript concepts"],
            career_impact: "Enhanced project analysis will demonstrate professional development skills and attention to detail, making you more attractive to potential employers.",
            portfolio_enhancement: ["Add detailed README with setup instructions", "Include live demo links", "Create comprehensive project documentation"]
          },
          key_learning_opportunities: {
            skill_development_insights: ["Code architecture analysis", "Performance optimization techniques", "User experience design principles"],
            strengths_to_leverage: ["Existing development skills", "Problem-solving approach", "Technical foundation"],
            gaps_to_address: ["Testing implementation", "Documentation quality", "Performance optimization"],
            recommended_resources: ["React documentation", "Web performance guides", "Testing best practices"],
            career_growth_potential: "Strong foundation for senior developer roles with focused skill development"
          }
        },
        project2: {
          name: project2,
          purpose_and_vision: codeAnalysis2.projectPurpose || "Project purpose analysis pending - requires deeper code review",
          unique_value_proposition: codeAnalysis2.keyFeatures?.length > 0 ? 
            `Unique features include: ${codeAnalysis2.keyFeatures.slice(0, 3).join(', ')}` : 
            "To be determined through comprehensive code analysis",
          technology_stack: {
            frontend: codeAnalysis2.technologyStack?.frontend?.length > 0 ? 
              codeAnalysis2.technologyStack.frontend : 
              [comparisonData.project2.language || "JavaScript"],
            backend: codeAnalysis2.technologyStack?.backend || [],
            database: codeAnalysis2.technologyStack?.database || [],
            deployment: comparisonData.project2.homepage ? ["Deployed"] : [],
            tools: codeAnalysis2.technologyStack?.tools || []
          },
          key_features: codeAnalysis2.keyFeatures?.length > 0 ? 
            codeAnalysis2.keyFeatures : 
            ["Feature analysis pending", "Requires detailed code review"],
          strengths: codeAnalysis2.technologyStack?.frontend?.length > 0 ? 
            [`Uses modern tech stack: ${codeAnalysis2.technologyStack.frontend.join(', ')}`, "Active development", "Good project structure"] : 
            ["Active development", "Good project structure potential"],
          areas_to_improve: ["Comprehensive code analysis needed", "Detailed functionality review required"],
          market_relevance: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis2.keyFeatures?.length > 3 ? 2 : 0;
              score += codeAnalysis2.projectPurpose ? 1 : 0;
              score += comparisonData.project2.homepage ? 1 : 0;
              score += (comparisonData.project2.stars || 0) > 10 ? 1 : 0;
              score += (comparisonData.project2.forks || 0) > 5 ? 1 : 0;
              return Math.min(score, 10);
            })(),
            description: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis2.keyFeatures?.length > 3 ? 2 : 0;
                score += codeAnalysis2.projectPurpose ? 1 : 0;
                score += comparisonData.project2.homepage ? 1 : 0;
                score += (comparisonData.project2.stars || 0) > 10 ? 1 : 0;
                score += (comparisonData.project2.forks || 0) > 5 ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Strong market relevance with clear value proposition";
              if (score >= 6) return "Good market potential with room for growth";
              return "Moderate market relevance - needs strategic positioning";
            })(),
            detailed_analysis: {
              market_demand: "Market demand assessment requires comprehensive analysis of target audience and competitive landscape",
              target_audience: "Target audience identification pending - needs user research and market segmentation analysis",
              competition_analysis: "Competitive analysis pending - requires evaluation of existing solutions and market positioning",
              business_potential: "Business potential assessment pending - needs revenue model and scalability analysis",
              real_world_applicability: "Real-world applicability evaluation pending - requires use case analysis and implementation feasibility study"
            }
          },
          ux_complexity: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis2.technologyStack?.frontend?.includes('React') ? 2 : 0;
              score += codeAnalysis2.technologyStack?.frontend?.includes('Next.js') ? 1 : 0;
              score += codeAnalysis2.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 1 : 0;
              score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('interface')) ? 1 : 0;
              score += codeAnalysis2.technologyStack?.frontend?.includes('Tailwind') ? 1 : 0;
              return Math.min(score, 10);
            })(),
            description: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis2.technologyStack?.frontend?.includes('React') ? 2 : 0;
                score += codeAnalysis2.technologyStack?.frontend?.includes('Next.js') ? 1 : 0;
                score += codeAnalysis2.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 1 : 0;
                score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('ui') || feature.toLowerCase().includes('interface')) ? 1 : 0;
                score += codeAnalysis2.technologyStack?.frontend?.includes('Tailwind') ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Advanced UX with modern frameworks and styling";
              if (score >= 6) return "Good UX implementation with room for enhancement";
              return "Basic UX - needs modern frameworks and better styling";
            })(),
            detailed_analysis: {
              interface_sophistication: "Interface sophistication assessment pending - needs UI/UX design pattern analysis",
              user_experience_flow: "User experience flow evaluation pending - requires user journey mapping and usability testing",
              accessibility: "Accessibility assessment pending - needs WCAG compliance evaluation and inclusive design analysis",
              responsive_design: "Responsive design evaluation pending - requires cross-device compatibility testing",
              interaction_patterns: "Interaction patterns analysis pending - needs user interaction design assessment"
            }
          },
          technical_depth: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis2.technologyStack?.backend?.length > 0 ? 2 : 0;
              score += codeAnalysis2.technologyStack?.database?.length > 0 ? 1 : 0;
              score += codeAnalysis2.technologyStack?.tools?.length > 2 ? 1 : 0;
              score += codeAnalysis2.actualCode?.length > 5 ? 1 : 0;
              score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('api') || feature.toLowerCase().includes('database')) ? 1 : 0;
              return Math.min(score, 10);
            })(),
            analysis: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis2.technologyStack?.backend?.length > 0 ? 2 : 0;
                score += codeAnalysis2.technologyStack?.database?.length > 0 ? 1 : 0;
                score += codeAnalysis2.technologyStack?.tools?.length > 2 ? 1 : 0;
                score += codeAnalysis2.actualCode?.length > 5 ? 1 : 0;
                score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('api') || feature.toLowerCase().includes('database')) ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Deep technical implementation with full-stack capabilities";
              if (score >= 6) return "Good technical depth with some advanced features";
              return "Basic technical implementation - needs more advanced features";
            })(),
            detailed_analysis: {
              code_architecture: "Code architecture assessment pending - needs design pattern and structural analysis",
              performance_optimization: "Performance optimization evaluation pending - requires load testing and bottleneck analysis",
              security_implementation: "Security implementation assessment pending - needs vulnerability analysis and best practices review",
              scalability: "Scalability evaluation pending - requires architecture review and capacity planning analysis",
              testing_coverage: "Testing coverage assessment pending - needs unit, integration, and end-to-end testing evaluation",
              code_quality: "Code quality analysis pending - requires code review, documentation assessment, and maintainability evaluation"
            }
          },
          innovation_gap: {
            score: (() => {
              let score = 4; // Base score
              score += codeAnalysis2.keyFeatures?.length > 5 ? 2 : 0;
              score += codeAnalysis2.technologyStack?.frontend?.some((tech: string) => tech.includes('Next.js') || tech.includes('React')) ? 1 : 0;
              score += codeAnalysis2.projectPurpose?.toLowerCase().includes('ai') || codeAnalysis2.projectPurpose?.toLowerCase().includes('machine learning') ? 2 : 0;
              score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('real-time') || feature.toLowerCase().includes('interactive')) ? 1 : 0;
              return Math.min(score, 10);
            })(),
            analysis: (() => {
              const score = (() => {
                let score = 4;
                score += codeAnalysis2.keyFeatures?.length > 5 ? 2 : 0;
                score += codeAnalysis2.technologyStack?.frontend?.some((tech: string) => tech.includes('Next.js') || tech.includes('React')) ? 1 : 0;
                score += codeAnalysis2.projectPurpose?.toLowerCase().includes('ai') || codeAnalysis2.projectPurpose?.toLowerCase().includes('machine learning') ? 2 : 0;
                score += codeAnalysis2.keyFeatures?.some((feature: string) => feature.toLowerCase().includes('real-time') || feature.toLowerCase().includes('interactive')) ? 1 : 0;
                return Math.min(score, 10);
              })();
              if (score >= 8) return "Highly innovative with cutting-edge features and technologies";
              if (score >= 6) return "Good innovation with modern approaches and unique features";
              return "Moderate innovation - needs more unique features and modern approaches";
            })(),
            detailed_analysis: {
              unique_features: "Unique features assessment pending - needs feature differentiation and novelty analysis",
              creative_solutions: "Creative solutions evaluation pending - requires problem-solving approach and innovation assessment",
              technology_adoption: "Technology adoption analysis pending - needs evaluation of cutting-edge technology implementation",
              problem_solving: "Problem-solving approach assessment pending - requires methodology and effectiveness evaluation",
              future_proofing: "Future-proofing evaluation pending - needs emerging technology and trend adaptation analysis"
            }
          },
          expert_recommendations: {
            immediate_actions: ["Schedule comprehensive code review", "Analyze project architecture"],
            long_term_goals: ["Improve code documentation", "Enhance project features"],
            learning_path: ["Study modern frontend patterns", "Learn advanced JavaScript concepts"],
            career_impact: "Enhanced project analysis will demonstrate professional development skills and attention to detail, making you more attractive to potential employers.",
            portfolio_enhancement: ["Add detailed README with setup instructions", "Include live demo links", "Create comprehensive project documentation"]
          },
          key_learning_opportunities: {
            skill_development_insights: ["Code architecture analysis", "Performance optimization techniques", "User experience design principles"],
            strengths_to_leverage: ["Existing development skills", "Problem-solving approach", "Technical foundation"],
            gaps_to_address: ["Testing implementation", "Documentation quality", "Performance optimization"],
            recommended_resources: ["React documentation", "Web performance guides", "Testing best practices"],
            career_growth_potential: "Strong foundation for senior developer roles with focused skill development"
          }
        },
        winner: {
          project_name: (() => {
            // Smart winner determination based on actual code analysis
            let project1Score = 0;
            let project2Score = 0;
            
            // Score based on technology stack completeness
            project1Score += (codeAnalysis1.technologyStack?.frontend?.length || 0) * 2;
            project1Score += (codeAnalysis1.technologyStack?.backend?.length || 0) * 2;
            project1Score += (codeAnalysis1.technologyStack?.database?.length || 0) * 1;
            project1Score += (codeAnalysis1.technologyStack?.tools?.length || 0) * 1;
            
            project2Score += (codeAnalysis2.technologyStack?.frontend?.length || 0) * 2;
            project2Score += (codeAnalysis2.technologyStack?.backend?.length || 0) * 2;
            project2Score += (codeAnalysis2.technologyStack?.database?.length || 0) * 1;
            project2Score += (codeAnalysis2.technologyStack?.tools?.length || 0) * 1;
            
            // Score based on features and code analysis
            project1Score += (codeAnalysis1.keyFeatures?.length || 0) * 3;
            project1Score += (codeAnalysis1.actualCode?.length || 0) * 2;
            project1Score += codeAnalysis1.projectPurpose ? 5 : 0;
            
            project2Score += (codeAnalysis2.keyFeatures?.length || 0) * 3;
            project2Score += (codeAnalysis2.actualCode?.length || 0) * 2;
            project2Score += codeAnalysis2.projectPurpose ? 5 : 0;
            
            // Score based on GitHub metrics
            project1Score += Math.min(comparisonData.project1.stars || 0, 20);
            project1Score += Math.min(comparisonData.project1.forks || 0, 10);
            project1Score += comparisonData.project1.homepage ? 5 : 0;
            
            project2Score += Math.min(comparisonData.project2.stars || 0, 20);
            project2Score += Math.min(comparisonData.project2.forks || 0, 10);
            project2Score += comparisonData.project2.homepage ? 5 : 0;
            
            return project1Score > project2Score ? project1 : project2;
          })(),
          reasoning: (() => {
            const hasP1Code = codeAnalysis1.actualCode?.length > 0;
            const hasP2Code = codeAnalysis2.actualCode?.length > 0;
            const p1Features = codeAnalysis1.keyFeatures?.length || 0;
            const p2Features = codeAnalysis2.keyFeatures?.length || 0;
            const p1TechStack = (codeAnalysis1.technologyStack?.frontend?.length || 0) + 
                              (codeAnalysis1.technologyStack?.backend?.length || 0);
            const p2TechStack = (codeAnalysis2.technologyStack?.frontend?.length || 0) + 
                              (codeAnalysis2.technologyStack?.backend?.length || 0);
            
            if (p1TechStack > p2TechStack && p1Features > p2Features) {
              return `${project1} wins with superior technology stack implementation (${p1TechStack} vs ${p2TechStack} technologies) and more comprehensive feature set (${p1Features} vs ${p2Features} features). The project demonstrates better code organization, more advanced technology adoption, and clearer implementation patterns based on actual code analysis.`;
            } else if (p2TechStack > p1TechStack && p2Features > p1Features) {
              return `${project2} wins with superior technology stack implementation (${p2TechStack} vs ${p1TechStack} technologies) and more comprehensive feature set (${p2Features} vs ${p1Features} features). The project demonstrates better code organization, more advanced technology adoption, and clearer implementation patterns based on actual code analysis.`;
            } else if (hasP1Code && !hasP2Code) {
              return `${project1} wins due to more comprehensive code analysis availability and implementation depth. The project shows better code structure, clearer functionality, and more detailed technical implementation based on actual code review.`;
            } else if (hasP2Code && !hasP1Code) {
              return `${project2} wins due to more comprehensive code analysis availability and implementation depth. The project shows better code structure, clearer functionality, and more detailed technical implementation based on actual code review.`;
            } else {
              return `${project1} wins by slight margin based on combined analysis of technology stack, feature implementation, and code quality. Both projects show strong potential, but ${project1} demonstrates marginally better technical choices and implementation patterns.`;
            }
          })(),
          winning_score: (() => {
            const p1Features = codeAnalysis1.keyFeatures?.length || 0;
            const p2Features = codeAnalysis2.keyFeatures?.length || 0;
            const p1TechStack = (codeAnalysis1.technologyStack?.frontend?.length || 0) + 
                              (codeAnalysis1.technologyStack?.backend?.length || 0);
            const p2TechStack = (codeAnalysis2.technologyStack?.frontend?.length || 0) + 
                              (codeAnalysis2.technologyStack?.backend?.length || 0);
            
            const baseScore = 60;
            const featureBonus = Math.max(p1Features, p2Features) * 3;
            const techBonus = Math.max(p1TechStack, p2TechStack) * 2;
            const codeBonus = Math.max(codeAnalysis1.actualCode?.length || 0, codeAnalysis2.actualCode?.length || 0) * 2;
            
            return Math.min(baseScore + featureBonus + techBonus + codeBonus, 95);
          })()
        },
        head_to_head_analysis: {
          innovation: {
            project1_analysis: codeAnalysis1.keyFeatures?.length > 0 ? 
              `${project1} demonstrates innovation through: ${codeAnalysis1.keyFeatures.slice(0, 3).join(', ')}. Technology stack includes: ${codeAnalysis1.technologyStack?.frontend?.join(', ') || 'Standard frontend'}.` :
              `${project1} shows potential for innovation but requires deeper feature analysis and creative solution evaluation.`,
            project2_analysis: codeAnalysis2.keyFeatures?.length > 0 ? 
              `${project2} demonstrates innovation through: ${codeAnalysis2.keyFeatures.slice(0, 3).join(', ')}. Technology stack includes: ${codeAnalysis2.technologyStack?.frontend?.join(', ') || 'Standard frontend'}.` :
              `${project2} shows potential for innovation but requires deeper feature analysis and creative solution evaluation.`,
            winner: (codeAnalysis1.keyFeatures?.length || 0) > (codeAnalysis2.keyFeatures?.length || 0) ? 
              `${project1} - Superior innovation with more unique features and creative implementations` :
              (codeAnalysis2.keyFeatures?.length || 0) > (codeAnalysis1.keyFeatures?.length || 0) ? 
              `${project2} - Superior innovation with more unique features and creative implementations` :
              "Tie - Both projects show similar innovation levels"
          },
          technical_excellence: {
            project1_analysis: `${project1} technical depth: ${(codeAnalysis1.technologyStack?.frontend?.length || 0) + (codeAnalysis1.technologyStack?.backend?.length || 0)} technologies, ${codeAnalysis1.actualCode?.length || 0} code files analyzed. ${codeAnalysis1.technologyStack?.tools?.length > 0 ? `Uses development tools: ${codeAnalysis1.technologyStack.tools.join(', ')}` : 'Basic tooling setup'}.`,
            project2_analysis: `${project2} technical depth: ${(codeAnalysis2.technologyStack?.frontend?.length || 0) + (codeAnalysis2.technologyStack?.backend?.length || 0)} technologies, ${codeAnalysis2.actualCode?.length || 0} code files analyzed. ${codeAnalysis2.technologyStack?.tools?.length > 0 ? `Uses development tools: ${codeAnalysis2.technologyStack.tools.join(', ')}` : 'Basic tooling setup'}.`,
            winner: (() => {
              const p1TechCount = (codeAnalysis1.technologyStack?.frontend?.length || 0) + 
                                (codeAnalysis1.technologyStack?.backend?.length || 0) + 
                                (codeAnalysis1.technologyStack?.tools?.length || 0);
              const p2TechCount = (codeAnalysis2.technologyStack?.frontend?.length || 0) + 
                                (codeAnalysis2.technologyStack?.backend?.length || 0) + 
                                (codeAnalysis2.technologyStack?.tools?.length || 0);
              
              if (p1TechCount > p2TechCount) {
                return `${project1} - Superior technical implementation with more comprehensive technology stack`;
              } else if (p2TechCount > p1TechCount) {
                return `${project2} - Superior technical implementation with more comprehensive technology stack`;
              } else {
                return "Tie - Both projects show similar technical complexity";
              }
            })()
          },
          market_potential: {
            project1_analysis: `${project1} market potential: ${comparisonData.project1.stars || 0} stars, ${comparisonData.project1.forks || 0} forks. ${comparisonData.project1.homepage ? 'Has live deployment' : 'No live deployment'}. ${codeAnalysis1.projectPurpose ? `Purpose: ${codeAnalysis1.projectPurpose}` : 'Purpose needs clarification'}.`,
            project2_analysis: `${project2} market potential: ${comparisonData.project2.stars || 0} stars, ${comparisonData.project2.forks || 0} forks. ${comparisonData.project2.homepage ? 'Has live deployment' : 'No live deployment'}. ${codeAnalysis2.projectPurpose ? `Purpose: ${codeAnalysis2.projectPurpose}` : 'Purpose needs clarification'}.`,
            winner: (() => {
              const p1Market = (comparisonData.project1.stars || 0) + (comparisonData.project1.forks || 0) + 
                              (comparisonData.project1.homepage ? 10 : 0) + (codeAnalysis1.projectPurpose ? 5 : 0);
              const p2Market = (comparisonData.project2.stars || 0) + (comparisonData.project2.forks || 0) + 
                              (comparisonData.project2.homepage ? 10 : 0) + (codeAnalysis2.projectPurpose ? 5 : 0);
              
              if (p1Market > p2Market) {
                return `${project1} - Higher market potential with better community engagement and deployment`;
              } else if (p2Market > p1Market) {
                return `${project2} - Higher market potential with better community engagement and deployment`;
              } else {
                return "Tie - Both projects show similar market potential";
              }
            })()
          },
          user_experience: {
            project1_analysis: `${project1} UX: ${codeAnalysis1.technologyStack?.frontend?.length > 0 ? `Uses modern frontend: ${codeAnalysis1.technologyStack.frontend.join(', ')}` : 'Standard frontend approach'}. ${codeAnalysis1.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 'Has custom styling' : 'Basic styling'}.`,
            project2_analysis: `${project2} UX: ${codeAnalysis2.technologyStack?.frontend?.length > 0 ? `Uses modern frontend: ${codeAnalysis2.technologyStack.frontend.join(', ')}` : 'Standard frontend approach'}. ${codeAnalysis2.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 'Has custom styling' : 'Basic styling'}.`,
            winner: (() => {
              const p1UXScore = (codeAnalysis1.technologyStack?.frontend?.length || 0) + 
                               (codeAnalysis1.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 5 : 0);
              const p2UXScore = (codeAnalysis2.technologyStack?.frontend?.length || 0) + 
                               (codeAnalysis2.actualCode?.some((file: any) => file.name.includes('css') || file.name.includes('style')) ? 5 : 0);
              
              if (p1UXScore > p2UXScore) {
                return `${project1} - Superior user experience with better frontend implementation`;
              } else if (p2UXScore > p1UXScore) {
                return `${project2} - Superior user experience with better frontend implementation`;
              } else {
                return "Tie - Both projects show similar user experience quality";
              }
            })()
          }
        },
        comparative_learning_opportunities: {
          skill_development_insights: [
            `Compare ${project1}'s ${codeAnalysis1.technologyStack?.frontend?.join(', ') || 'frontend'} implementation with ${project2}'s ${codeAnalysis2.technologyStack?.frontend?.join(', ') || 'frontend'} approach`,
            `Learn from technology stack differences: ${project1} uses ${(codeAnalysis1.technologyStack?.frontend?.length || 0) + (codeAnalysis1.technologyStack?.backend?.length || 0)} technologies vs ${project2}'s ${(codeAnalysis2.technologyStack?.frontend?.length || 0) + (codeAnalysis2.technologyStack?.backend?.length || 0)} technologies`,
            `Feature implementation comparison: ${project1} has ${codeAnalysis1.keyFeatures?.length || 0} identified features vs ${project2}'s ${codeAnalysis2.keyFeatures?.length || 0} features`
          ],
          cross_project_lessons: [
            `${project1} demonstrates ${codeAnalysis1.keyFeatures?.length > 0 ? `practical implementation of: ${codeAnalysis1.keyFeatures.slice(0, 2).join(', ')}` : 'basic project structure and organization'}`,
            `${project2} showcases ${codeAnalysis2.keyFeatures?.length > 0 ? `practical implementation of: ${codeAnalysis2.keyFeatures.slice(0, 2).join(', ')}` : 'basic project structure and organization'}`,
            `Technology choice analysis: Different approaches to solving similar problems with varying tech stacks`
          ],
          complementary_strengths: [
            `${project1}'s ${codeAnalysis1.technologyStack?.frontend?.length > 0 ? `modern frontend approach (${codeAnalysis1.technologyStack.frontend.join(', ')})` : 'frontend implementation'} can enhance ${project2}'s approach`,
            `${project2}'s ${codeAnalysis2.technologyStack?.backend?.length > 0 ? `backend implementation (${codeAnalysis2.technologyStack.backend.join(', ')})` : 'project structure'} provides different architectural insights`,
            `Combining both projects' approaches creates a more comprehensive full-stack development perspective`
          ],
          skill_gaps_identified: [
            `Testing implementation: ${codeAnalysis1.technologyStack?.tools?.includes('Testing Framework') || codeAnalysis2.technologyStack?.tools?.includes('Testing Framework') ? 'One project has testing setup' : 'Both projects need comprehensive testing strategy'}`,
            `Documentation quality: Both projects could benefit from better README and code documentation`,
            `Performance optimization: Analysis needed for both projects to identify optimization opportunities`
          ],
          recommended_learning_path: [
            `Master the technologies used in both projects: ${[...new Set([...(codeAnalysis1.technologyStack?.frontend || []), ...(codeAnalysis1.technologyStack?.backend || []), ...(codeAnalysis2.technologyStack?.frontend || []), ...(codeAnalysis2.technologyStack?.backend || [])])].join(', ')}`,
            "Study testing frameworks and implementation patterns for both project types",
            "Learn performance optimization techniques applicable to both tech stacks",
            "Develop comprehensive documentation and deployment strategies"
          ],
          career_advancement_strategy: `Combining insights from both projects positions you as a versatile developer. ${project1} demonstrates ${codeAnalysis1.keyFeatures?.length > 0 ? 'feature-rich implementation' : 'solid fundamentals'} while ${project2} showcases ${codeAnalysis2.keyFeatures?.length > 0 ? 'creative problem-solving' : 'technical foundation'}. This combination is valuable for full-stack roles and technical leadership positions.`
        },
        overall_recommendation: `Based on comprehensive code analysis: ${(() => {
          const p1Score = (codeAnalysis1.keyFeatures?.length || 0) + (codeAnalysis1.technologyStack?.frontend?.length || 0) + (codeAnalysis1.technologyStack?.backend?.length || 0);
          const p2Score = (codeAnalysis2.keyFeatures?.length || 0) + (codeAnalysis2.technologyStack?.frontend?.length || 0) + (codeAnalysis2.technologyStack?.backend?.length || 0);
          
          if (p1Score > p2Score) {
            return `${project1} shows stronger technical implementation and feature depth. Focus on enhancing ${project2} by adopting similar architectural patterns and expanding its feature set.`;
          } else if (p2Score > p1Score) {
            return `${project2} demonstrates superior technical foundation and implementation. Consider applying its architectural principles to improve ${project1}.`;
          } else {
            return `Both projects show balanced strengths. ${project1} and ${project2} each offer unique learning opportunities - combine their best practices for optimal portfolio development.`;
          }
        })()}`
      };
    }

    // Cache the result for consistency
    comparisonCache.set(cacheHash, comparison);

    // Optional: Clear cache after some time to avoid memory issues
    if (comparisonCache.size > 50) {
      const firstKey = comparisonCache.keys().next().value;
      if (firstKey) {
        comparisonCache.delete(firstKey);
      }
    }

    return NextResponse.json(comparison);

  } catch (error) {
    console.error('Error in project comparison:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Project Comparison API - Use POST method' },
    { status: 200 }
  );
}
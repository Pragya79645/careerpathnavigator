import { NextRequest, NextResponse } from 'next/server';

interface ProjectComparison {
  project1: {
    name: string;
    purpose: string;
    uniqueness: string;
    tech_stack: string[];
    complexity_score: number;
    key_features: string[];
    strengths: string[];
    weaknesses: string[];
    innovation_level: 'Basic' | 'Intermediate' | 'Advanced' | 'Innovative';
    market_relevance: string;
    user_experience_quality: string;
  };
  project2: {
    name: string;
    purpose: string;
    uniqueness: string;
    tech_stack: string[];
    complexity_score: number;
    key_features: string[];
    strengths: string[];
    weaknesses: string[];
    innovation_level: 'Basic' | 'Intermediate' | 'Advanced' | 'Innovative';
    market_relevance: string;
    user_experience_quality: string;
  };
  comparison_insights: {
    winner: string;
    reasoning: string;
    technical_depth_comparison: string;
    innovation_gap: string;
    learning_opportunities: string[];
    combination_suggestions: string[];
  };
  recommendation: string;
}

interface ComparisonRequest {
  github_username: string;
  project1: string;
  project2: string;
}

async function fetchFileContent(owner: string, repo: string, path: string): Promise<string> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`);
    if (!response.ok) return '';
    
    const data = await response.json();
    if (data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return '';
  } catch (error) {
    return '';
  }
}

async function analyzeProjectStructure(owner: string, repo: string) {
  const files = ['package.json', 'README.md', 'requirements.txt', 'Dockerfile', 'docker-compose.yml', '.env.example'];
  const contents: Record<string, string> = {};
  
  for (const file of files) {
    contents[file] = await fetchFileContent(owner, repo, file);
  }
  
  // Get multiple code files to understand project structure and purpose
  const codeFiles = [
    'src/App.js', 'src/App.jsx', 'src/App.tsx', 'src/App.vue',
    'src/components/App.js', 'src/components/App.jsx', 'src/components/App.tsx',
    'src/pages/index.js', 'src/pages/index.tsx', 'pages/index.js', 'pages/index.tsx',
    'app.py', 'main.py', 'server.js', 'index.js', 'index.html',
    'src/main.js', 'src/main.ts', 'src/index.js', 'src/index.ts'
  ];
  
  // Get up to 3 main code files to understand the project better
  let codeFileCount = 0;
  for (const file of codeFiles) {
    if (codeFileCount >= 3) break;
    const content = await fetchFileContent(owner, repo, file);
    if (content && content.length > 100) {
      contents[file] = content.slice(0, 3000); // Increased limit for better analysis
      codeFileCount++;
    }
  }
  
  // Also try to get configuration files that reveal project purpose
  const configFiles = [
    'next.config.js', 'vue.config.js', 'angular.json', 'nuxt.config.js',
    'vite.config.js', 'webpack.config.js', 'tsconfig.json'
  ];
  
  for (const file of configFiles) {
    const content = await fetchFileContent(owner, repo, file);
    if (content) {
      contents[file] = content.slice(0, 1000);
    }
  }
  
  return contents;
}

async function getRepositoryLanguages(owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
    if (!response.ok) return {};
    return await response.json();
  } catch (error) {
    return {};
  }
}

async function getRepositoryCommits(owner: string, repo: string) {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=10`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    return [];
  }
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

    // Fetch detailed analysis data for both projects
    const [
      repo1Structure,
      repo2Structure,
      repo1Languages,
      repo2Languages,
      repo1Commits,
      repo2Commits
    ] = await Promise.all([
      analyzeProjectStructure(github_username, project1),
      analyzeProjectStructure(github_username, project2),
      getRepositoryLanguages(github_username, project1),
      getRepositoryLanguages(github_username, project2),
      getRepositoryCommits(github_username, project1),
      getRepositoryCommits(github_username, project2)
    ]);

    // Prepare comprehensive comparison data
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
        languages: repo1Languages,
        file_contents: repo1Structure,
        commit_count: repo1Commits.length,
        recent_commits: repo1Commits.slice(0, 3).map((commit: any) => ({
          message: commit.commit.message,
          date: commit.commit.author.date
        }))
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
        languages: repo2Languages,
        file_contents: repo2Structure,
        commit_count: repo2Commits.length,
        recent_commits: repo2Commits.slice(0, 3).map((commit: any) => ({
          message: commit.commit.message,
          date: commit.commit.author.date
        }))
      }
    };

    // Call Gemini API for deep comparison
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a senior software architect and product manager. Analyze these two GitHub projects deeply to understand their PURPOSE, UNIQUENESS, and INNOVATION by examining the actual code implementation.

Project Comparison Data:
${JSON.stringify(comparisonData, null, 2)}

CRITICAL: Analyze the actual code files (App.js, main.py, etc.) and package.json dependencies to understand:

1. **Project Purpose & Vision**: 
   - What specific problem does each project solve?
   - Who is the target user/audience?
   - What's the core value proposition?
   - Look at the code structure, components, and features to understand the purpose

2. **Uniqueness & Innovation**: 
   - What unique features or approaches are implemented?
   - Any innovative use of technology or creative solutions?
   - How does it differ from typical projects in this category?
   - Look for custom algorithms, unique UI patterns, or novel integrations

3. **Technical Implementation Quality**:
   - Code architecture and design patterns used
   - Complexity of features implemented
   - Quality of state management, API design, etc.
   - Use of advanced concepts (hooks, middleware, optimization, etc.)

4. **Feature Analysis**:
   - What specific features are implemented? (Don't just list tech stack)
   - How sophisticated are the user interactions?
   - Any real-time features, authentication, data visualization, etc.?

5. **Market Relevance & Innovation**:
   - How relevant is this solution to current market needs?
   - Does it solve a real problem or demonstrate advanced skills?
   - Innovation level based on implementation complexity

IMPORTANT: Base your analysis on the actual code content, not just README descriptions. Look for:
- Custom components and their functionality
- API integrations and data handling
- User interface complexity and features
- Business logic implementation
- Authentication, routing, state management patterns

OUTPUT FORMAT (JSON only):
{
  "project1": {
    "name": "Project Name 1",
    "purpose": "Specific problem it solves with clear user value (based on code analysis)",
    "uniqueness": "What makes this implementation special or innovative",
    "tech_stack": ["React", "Node.js", "WebSocket", "Stripe API"],
    "complexity_score": 7,
    "key_features": ["Real-time chat", "Payment integration", "Custom authentication"],
    "strengths": [
      "Innovative real-time collaboration with custom WebSocket implementation",
      "Complex state management with Redux Toolkit",
      "Professional-grade authentication system"
    ],
    "weaknesses": [
      "Missing error handling in payment flow",
      "Limited mobile optimization"
    ],
    "innovation_level": "Advanced",
    "market_relevance": "High - addresses growing remote collaboration needs",
    "user_experience_quality": "Excellent - intuitive interface with smooth interactions"
  },
  "project2": {
    "name": "Project Name 2",
    "purpose": "Specific problem it solves with clear user value (based on code analysis)",
    "uniqueness": "What makes this implementation special or innovative",
    "tech_stack": ["Vue.js", "Express", "MongoDB"],
    "complexity_score": 5,
    "key_features": ["CRUD operations", "Search functionality", "User profiles"],
    "strengths": [
      "Clean component architecture",
      "Good separation of concerns"
    ],
    "weaknesses": [
      "Basic CRUD without advanced features",
      "Limited user interaction patterns"
    ],
    "innovation_level": "Intermediate",
    "market_relevance": "Moderate - solves common but basic needs",
    "user_experience_quality": "Good - functional but not exceptional"
  },
  "comparison_insights": {
    "winner": "Project 1",
    "reasoning": "Project 1 demonstrates significantly higher technical complexity with its real-time features and advanced state management, while Project 2 shows solid fundamentals but lacks innovative implementation.",
    "technical_depth_comparison": "Project 1 uses advanced patterns like custom hooks and WebSocket management, while Project 2 relies on basic Vue patterns",
    "innovation_gap": "Project 1 introduces novel collaboration features, Project 2 follows standard patterns",
    "learning_opportunities": [
      "From Project 1: Learn advanced real-time implementation and complex state management",
      "From Project 2: Study clean component organization and basic best practices"
    ],
    "combination_suggestions": [
      "Combine Project 1's advanced features with Project 2's clean architecture",
      "Use Project 1's innovation as inspiration for enhancing Project 2's basic functionality"
    ]
  },
  "recommendation": "Project 1 shows exceptional technical depth and innovation that would impress employers. Focus on expanding its features while maintaining code quality. Project 2 provides a good foundation - consider adding more advanced features inspired by Project 1's approach."
}

Rate complexity_score from 1-10 based on ACTUAL implementation:
- 1-3: Basic HTML/CSS, simple forms, no advanced logic
- 4-6: Framework usage, API calls, responsive design, basic state management
- 7-8: Advanced patterns, real-time features, complex state, authentication, testing
- 9-10: Innovative algorithms, performance optimization, advanced architecture, cutting-edge tech

Focus on the ACTUAL CODE IMPLEMENTATION, not just descriptions. Only return JSON.`
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
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
      // Enhanced fallback comparison
      comparison = {
        project1: {
          name: project1,
          purpose: 'Purpose analysis requires deeper code inspection',
          uniqueness: 'Uniqueness evaluation needs more detailed analysis',
          tech_stack: Object.keys(repo1Languages || {}),
          complexity_score: 5,
          key_features: ['Repository structure', 'Basic functionality'],
          strengths: ['Active development', 'Good repository structure'],
          weaknesses: ['Limited analysis available'],
          innovation_level: 'Intermediate',
          market_relevance: 'Requires deeper market analysis',
          user_experience_quality: 'Cannot assess without deeper code analysis'
        },
        project2: {
          name: project2,
          purpose: 'Purpose analysis requires deeper code inspection',
          uniqueness: 'Uniqueness evaluation needs more detailed analysis',
          tech_stack: Object.keys(repo2Languages || {}),
          complexity_score: 5,
          key_features: ['Repository structure', 'Basic functionality'],
          strengths: ['Well-organized codebase', 'Clear project structure'],
          weaknesses: ['Limited analysis available'],
          innovation_level: 'Intermediate',
          market_relevance: 'Requires deeper market analysis',
          user_experience_quality: 'Cannot assess without deeper code analysis'
        },
        comparison_insights: {
          winner: 'Tie',
          reasoning: 'Both projects show potential but need deeper analysis for accurate comparison',
          technical_depth_comparison: 'Both projects require deeper code analysis to compare technical depth',
          innovation_gap: 'Innovation assessment requires examination of actual implementation details',
          learning_opportunities: [
            'Both projects: Implement more comprehensive documentation',
            'Both projects: Add testing and deployment pipelines'
          ],
          combination_suggestions: [
            'Merge complementary features from both projects',
            'Use best practices from both codebases'
          ]
        },
        recommendation: 'Both projects show promise. Consider adding more detailed documentation and implementing advanced features to differentiate them in the market.'
      };
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
    { message: 'Enhanced Project Comparison API - Use POST method' },
    { status: 200 }
  );
}
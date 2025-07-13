import { NextRequest, NextResponse } from 'next/server';

interface GitHubRepo {
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  topics: string[];
  homepage: string;
  html_url: string;
  created_at: string;
  updated_at: string;
}

interface GitHubUser {
  login: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  bio: string;
  blog: string;
  location: string;
  hireable: boolean;
}

interface EvaluationRequest {
  github_username: string;
  portfolio_url?: string;
  skills_list?: string;
}

interface ImprovementSuggestion {
  title: string;
  description: string;
  resource: {
    topic: string;
    link: string;
  };
  estimated_time_hours: number;
}

interface EvaluationResponse {
  skill_level: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced';
  justification: string;
  improvement_suggestions: ImprovementSuggestion[];
  motivation: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EvaluationRequest = await request.json();
    const { github_username, portfolio_url, skills_list } = body;

    if (!github_username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Fetch GitHub user data
    const userResponse = await fetch(`https://api.github.com/users/${github_username}`);
    if (!userResponse.ok) {
      return NextResponse.json(
        { error: 'GitHub user not found' },
        { status: 404 }
      );
    }
    const userData: GitHubUser = await userResponse.json();

    // Fetch GitHub repositories
    const reposResponse = await fetch(`https://api.github.com/users/${github_username}/repos?per_page=100&sort=updated`);
    if (!reposResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: 500 }
      );
    }
    const reposData: GitHubRepo[] = await reposResponse.json();

    // Filter frontend-related repositories
    const frontendLanguages = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'];
    const frontendKeywords = ['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'frontend', 'web', 'ui', 'website', 'app'];
    
    const frontendRepos = reposData.filter(repo => {
      const languageMatch = frontendLanguages.includes(repo.language);
      const nameMatch = frontendKeywords.some(keyword => 
        repo.name.toLowerCase().includes(keyword) || 
        (repo.description && repo.description.toLowerCase().includes(keyword))
      );
      const topicsMatch = repo.topics.some(topic => 
        frontendKeywords.some(keyword => topic.includes(keyword))
      );
      return languageMatch || nameMatch || topicsMatch;
    });

    // Prepare data for AI analysis
    const analysisData = {
      user: {
        username: userData.login,
        public_repos: userData.public_repos,
        followers: userData.followers,
        account_age_days: Math.floor((Date.now() - new Date(userData.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        bio: userData.bio,
        blog: userData.blog,
        hireable: userData.hireable
      },
      repositories: frontendRepos.map(repo => ({
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        size_kb: repo.size,
        topics: repo.topics,
        homepage: repo.homepage,
        age_days: Math.floor((Date.now() - new Date(repo.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        last_updated_days: Math.floor((Date.now() - new Date(repo.updated_at).getTime()) / (1000 * 60 * 60 * 24))
      })),
      portfolio_url: portfolio_url || userData.blog,
      claimed_skills: skills_list || '',
      total_frontend_repos: frontendRepos.length
    };

    // Call Gemini API for analysis
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert frontend developer evaluator. Analyze the following GitHub profile data and provide a skill assessment.

GitHub Profile Analysis Data:
${JSON.stringify(analysisData, null, 2)}

Based on this data, assess their frontend development skill level and provide improvement suggestions.

Your task is to:
1. Estimate their frontend development level using the categories: Beginner, Intermediate, Industry-Ready, Advanced
2. Justify the skill rank based on: Number and depth of projects, Tool/tech stack coverage, Code quality indicators, UI/UX implementation evidence, Usage of APIs/animations/auth/testing
3. Return 3 concrete suggestions for improvement with action title, description, resource link + topic, estimated time in hours
4. Provide a motivation quote

Evaluation Criteria:
- Beginner: 0-2 basic projects, mainly HTML/CSS/JS, no frameworks, basic functionality
- Intermediate: 3-5 projects, some framework usage (React/Vue), API integration, basic responsive design
- Industry-Ready: 5+ projects, modern framework mastery, testing, deployment, good code organization, real-world features
- Advanced: 10+ projects, complex applications, performance optimization, TypeScript, testing suites, CI/CD, contributions to open source

OUTPUT FORMAT (JSON only):
{
  "skill_level": "Intermediate",
  "justification": "User has 2 React projects with clean structure, API integration, and deployment. Limited use of testing or advanced patterns.",
  "improvement_suggestions": [
    {
      "title": "Add End-to-End Testing",
      "description": "Integrate tools like Cypress or Playwright in one project to show test-driven awareness.",
      "resource": {
        "topic": "Testing in React",
        "link": "https://testing-library.com/docs/react-testing-library/intro/"
      },
      "estimated_time_hours": 5
    },
    {
      "title": "Responsive Design Upgrade",
      "description": "Ensure mobile-first design using Tailwind or CSS Grid. Showcase pixel-perfect layout.",
      "resource": {
        "topic": "Responsive Web Design",
        "link": "https://web.dev/learn/design/"
      },
      "estimated_time_hours": 6
    },
    {
      "title": "Real-world Auth Integration",
      "description": "Add Firebase, Clerk, or Auth0 login system to any of your apps.",
      "resource": {
        "topic": "Firebase Auth Guide",
        "link": "https://firebase.google.com/docs/auth/web/start"
      },
      "estimated_time_hours": 4
    }
  ],
  "motivation": "You're closer to industry than you think. Keep shipping, keep learning 🚀"
}

Only return JSON. No explanations or additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!geminiResponse.ok) {
      throw new Error('Failed to get AI analysis');
    }

    const geminiResult = await geminiResponse.json();
    const aiResponseText = geminiResult.candidates[0].content.parts[0].text;

    // Parse the JSON response from Gemini
    let evaluation: EvaluationResponse;
    try {
      // Clean up the response to extract JSON
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback evaluation
      evaluation = {
        skill_level: 'Intermediate',
        justification: 'Unable to fully analyze profile. Based on repository count and activity, estimated as intermediate level.',
        improvement_suggestions: [
          {
            title: 'Build More Projects',
            description: 'Create diverse frontend projects showcasing different technologies and patterns.',
            resource: {
              topic: 'Project Ideas for Frontend Developers',
              link: 'https://github.com/florinpop17/app-ideas'
            },
            estimated_time_hours: 20
          },
          {
            title: 'Learn Modern Framework',
            description: 'Master React, Vue, or Angular with hooks, state management, and best practices.',
            resource: {
              topic: 'React Documentation',
              link: 'https://react.dev/learn'
            },
            estimated_time_hours: 15
          },
          {
            title: 'Deploy Your Applications',
            description: 'Learn deployment strategies using Vercel, Netlify, or similar platforms.',
            resource: {
              topic: 'Deployment Guide',
              link: 'https://vercel.com/docs'
            },
            estimated_time_hours: 5
          }
        ],
        motivation: 'Every expert was once a beginner. Keep building, keep learning! 🚀'
      };
    }

    return NextResponse.json(evaluation);

  } catch (error) {
    console.error('Error in skill evaluation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Frontend Skill Evaluator API - Use POST method' },
    { status: 200 }
  );
}
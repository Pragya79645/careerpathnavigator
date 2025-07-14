import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache for consistent evaluations
const evaluationCache = new Map<string, { data: EvaluationResponse; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Deterministic scoring functions
function calculateDeterministicScore(repoData: any[], userStats: any): ScoreBreakdown {
  const scores: ScoreBreakdown = {
    "UI Complexity": 0,
    "Styling Mastery": 0,
    "Component Structure": 0,
    "State Management": 0,
    "API Integration": 0,
    "Authentication": 0,
    "Deployment": 0,
    "Code Quality": 0,
    "Accessibility": 0,
    "Testing & Error Handling": 0,
    "Animation & UX Polish": 0,
    "Real-World Use Case": 0,
    "Documentation": 0
  };

  // UI Complexity - based on repo count and descriptions
  const frontendRepos = repoData.filter(repo => 
    ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(repo.language) ||
    repo.topics.some((topic: string) => ['react', 'vue', 'angular', 'frontend', 'ui'].includes(topic.toLowerCase()))
  );
  
  if (frontendRepos.length >= 5) scores["UI Complexity"] = 3;
  else if (frontendRepos.length >= 3) scores["UI Complexity"] = 2;
  else if (frontendRepos.length >= 1) scores["UI Complexity"] = 1;

  // Styling Mastery - check for CSS frameworks and styling
  const hasModernStyling = repoData.some(repo => 
    repo.topics.some((topic: string) => ['tailwind', 'styled-components', 'sass', 'css-modules'].includes(topic.toLowerCase())) ||
    (repo.description && /tailwind|styled|sass|scss|css/i.test(repo.description))
  );
  scores["Styling Mastery"] = hasModernStyling ? 2 : 1;

  // Component Structure - React/Vue projects indicate component usage
  const hasComponentFramework = repoData.some(repo => 
    repo.topics.some((topic: string) => ['react', 'vue', 'angular', 'svelte'].includes(topic.toLowerCase())) ||
    (repo.description && /react|vue|angular|component/i.test(repo.description))
  );
  scores["Component Structure"] = hasComponentFramework ? 2 : 1;

  // State Management - check for state management libraries
  const hasStateManagement = repoData.some(repo => 
    repo.topics.some((topic: string) => ['redux', 'zustand', 'context', 'state'].includes(topic.toLowerCase())) ||
    (repo.description && /redux|zustand|context|state/i.test(repo.description))
  );
  scores["State Management"] = hasStateManagement ? 3 : 1;

  // API Integration - check for API-related keywords
  const hasAPIIntegration = repoData.some(repo => 
    repo.topics.some((topic: string) => ['api', 'rest', 'graphql', 'fetch'].includes(topic.toLowerCase())) ||
    (repo.description && /api|rest|graphql|fetch|axios/i.test(repo.description))
  );
  scores["API Integration"] = hasAPIIntegration ? 2 : 1;

  // Authentication - check for auth-related keywords
  const hasAuth = repoData.some(repo => 
    repo.topics.some((topic: string) => ['auth', 'firebase', 'jwt', 'oauth'].includes(topic.toLowerCase())) ||
    (repo.description && /auth|login|firebase|jwt|oauth/i.test(repo.description))
  );
  scores["Authentication"] = hasAuth ? 2 : 0;

  // Deployment - check for homepage URLs (indicates deployment)
  const deployedRepos = repoData.filter(repo => repo.homepage && repo.homepage.length > 0);
  if (deployedRepos.length >= 3) scores["Deployment"] = 3;
  else if (deployedRepos.length >= 1) scores["Deployment"] = 2;
  else scores["Deployment"] = 0;

  // Code Quality - TypeScript usage and repo organization
  const hasTypeScript = repoData.some(repo => repo.language === 'TypeScript');
  const hasGoodNaming = repoData.every(repo => repo.name.length > 3 && !repo.name.includes('untitled'));
  scores["Code Quality"] = hasTypeScript ? 3 : hasGoodNaming ? 2 : 1;

  // Testing - check for testing keywords
  const hasTesting = repoData.some(repo => 
    repo.topics.some((topic: string) => ['testing', 'jest', 'cypress', 'test'].includes(topic.toLowerCase())) ||
    (repo.description && /test|jest|cypress|testing/i.test(repo.description))
  );
  scores["Testing & Error Handling"] = hasTesting ? 2 : 0;

  // Animation - check for animation libraries
  const hasAnimation = repoData.some(repo => 
    repo.topics.some((topic: string) => ['animation', 'framer', 'gsap', 'motion'].includes(topic.toLowerCase())) ||
    (repo.description && /animation|framer|gsap|motion/i.test(repo.description))
  );
  scores["Animation & UX Polish"] = hasAnimation ? 3 : 1;

  // Real-World Use Case - based on repo descriptions and complexity
  const practicalRepos = repoData.filter(repo => 
    repo.description && 
    /ecommerce|dashboard|portfolio|blog|chat|todo|weather|calculator|game/i.test(repo.description) &&
    repo.size_kb > 100
  );
  if (practicalRepos.length >= 2) scores["Real-World Use Case"] = 2;
  else if (practicalRepos.length >= 1) scores["Real-World Use Case"] = 1;

  // Documentation - check for repos with good descriptions and READMEs
  const documentedRepos = repoData.filter(repo => 
    repo.description && repo.description.length > 20
  );
  if (documentedRepos.length >= Math.floor(repoData.length * 0.8)) scores["Documentation"] = 3;
  else if (documentedRepos.length >= Math.floor(repoData.length * 0.5)) scores["Documentation"] = 2;
  else scores["Documentation"] = 1;

  // Accessibility - assume basic if good documentation and modern frameworks
  scores["Accessibility"] = (scores["Documentation"] >= 2 && scores["Component Structure"] >= 2) ? 1 : 0;

  return scores;
}

function getSkillLevelFromScore(totalScore: number): { level: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced'; emoji: string } {
  if (totalScore >= 36) return { level: 'Advanced', emoji: '🧠' };
  if (totalScore >= 26) return { level: 'Industry-Ready', emoji: '🚀' };
  if (totalScore >= 16) return { level: 'Intermediate', emoji: '🌱' };
  return { level: 'Beginner', emoji: '🐣' };
}

async function getCachedEvaluation(cacheKey: string): Promise<EvaluationResponse | null> {
  const cached = evaluationCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return {
      ...cached.data,
      cached_result: true,
      evaluation_timestamp: new Date(cached.timestamp).toISOString()
    };
  }
  return null;
}

function setCachedEvaluation(cacheKey: string, evaluation: EvaluationResponse): void {
  evaluationCache.set(cacheKey, {
    data: evaluation,
    timestamp: Date.now()
  });
}

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

interface ScoreBreakdown {
  "UI Complexity": number;
  "Styling Mastery": number;
  "Component Structure": number;
  "State Management": number;
  "API Integration": number;
  "Authentication": number;
  "Deployment": number;
  "Code Quality": number;
  "Accessibility": number;
  "Testing & Error Handling": number;
  "Animation & UX Polish": number;
  "Real-World Use Case": number;
  "Documentation": number;
}

interface EvaluationResponse {
  score_breakdown: ScoreBreakdown;
  total_score: number;
  skill_level: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced';
  skill_emoji: string;
  justification: string;
  improvement_suggestions: ImprovementSuggestion[];
  motivation: string;
  top_skills: string[];
  projects: string[];
  strengths: string[];
  priority_improvements: string[];
  cached_result?: boolean;
  evaluation_timestamp?: string;
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

    // Create a cache key for this evaluation
    const cacheKey = `eval_${github_username}_${portfolio_url || ''}_${skills_list || ''}`;
    
    // Check if we have a recent evaluation (cache for 1 hour)
    const cachedEvaluation = await getCachedEvaluation(cacheKey);
    if (cachedEvaluation) {
      return NextResponse.json(cachedEvaluation);
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

    // Fetch GitHub repositories - increased limit and sort by updated
    const reposResponse = await fetch(`https://api.github.com/users/${github_username}/repos?per_page=100&sort=updated&type=owner`);
    if (!reposResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch repositories' },
        { status: 500 }
      );
    }
    const reposData: GitHubRepo[] = await reposResponse.json();

    // Filter frontend-related repositories
    const frontendLanguages = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'];
    const frontendKeywords = ['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'frontend', 'web', 'ui', 'website', 'app', 'portfolio', 'landing', 'dashboard', 'ecommerce', 'blog'];
    
    const frontendRepos = reposData.filter(repo => {
      // Skip forks unless they have significant modifications
      if (repo.forks_count === 0 && repo.size < 100) return false;
      
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

    // Get all non-fork repositories for project comparison
    const allUserRepos = reposData.filter(repo => 
      !repo.name.includes('.github.io') && // Exclude GitHub pages repos
      repo.size > 50 && // Exclude very small repos
      repo.name !== github_username // Exclude profile README repos
    );

    // Combine frontend repos with other significant repos for comparison
    const projectsForComparison = [
      ...frontendRepos.map(repo => repo.name),
      ...allUserRepos
        .filter(repo => !frontendRepos.some(fr => fr.name === repo.name))
        .slice(0, 10) // Add up to 10 non-frontend repos
        .map(repo => repo.name)
    ];

    // Prepare data for deterministic analysis with consistent timestamps
    const baseDate = new Date('2024-01-01'); // Use fixed base date for consistency
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
        // Use relative days from base date for consistency
        age_days: Math.floor((new Date(repo.created_at).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24)),
        last_updated_days: Math.floor((new Date(repo.updated_at).getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24))
      })).sort((a, b) => a.name.localeCompare(b.name)), // Sort for consistency
      all_projects: projectsForComparison.sort(), // Sort for consistency
      portfolio_url: portfolio_url || userData.blog,
      claimed_skills: skills_list || '',
      total_frontend_repos: frontendRepos.length,
      total_repos: allUserRepos.length
    };

    // Calculate deterministic scores
    const scoreBreakdown = calculateDeterministicScore(analysisData.repositories, analysisData.user);
    const totalScore = Object.values(scoreBreakdown).reduce((sum, score) => sum + score, 0);
    const skillLevel = getSkillLevelFromScore(totalScore);

    // Generate consistent suggestions based on lowest scores
    const improvements = Object.entries(scoreBreakdown)
      .filter(([_, score]) => score <= 1)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically for consistency
      .slice(0, 3);

    const improvementSuggestions = improvements.map(([category, score]) => {
      const suggestions: Record<string, any> = {
        "Testing & Error Handling": {
          title: "Implement Comprehensive Testing",
          description: "Add Jest + React Testing Library to your main project. Include unit tests for components and integration tests for user flows.",
          resource: { topic: "React Testing Best Practices", link: "https://testing-library.com/docs/react-testing-library/intro/" },
          estimated_time_hours: 8
        },
        "Accessibility": {
          title: "Accessibility Audit & Implementation", 
          description: "Use axe-core to audit your apps, add proper ARIA labels, semantic HTML, and keyboard navigation support.",
          resource: { topic: "Web Accessibility Guidelines", link: "https://web.dev/accessibility/" },
          estimated_time_hours: 6
        },
        "Authentication": {
          title: "Authentication System Integration",
          description: "Implement a complete auth flow with JWT tokens, protected routes, and user session management using Firebase or Auth0.",
          resource: { topic: "Firebase Authentication", link: "https://firebase.google.com/docs/auth/web/start" },
          estimated_time_hours: 10
        },
        "Deployment": {
          title: "Deploy Your Applications",
          description: "Learn deployment strategies using Vercel, Netlify, or similar platforms. Ensure all projects are live and accessible.",
          resource: { topic: "Deployment Guide", link: "https://vercel.com/docs" },
          estimated_time_hours: 4
        },
        "Animation & UX Polish": {
          title: "Add Smooth Animations",
          description: "Implement Framer Motion or CSS animations to enhance user experience with smooth transitions and micro-interactions.",
          resource: { topic: "Framer Motion Guide", link: "https://www.framer.com/motion/" },
          estimated_time_hours: 6
        }
      };
      
      return suggestions[category] || {
        title: `Improve ${category}`,
        description: `Focus on enhancing your ${category.toLowerCase()} skills through practice and implementation.`,
        resource: { topic: "Frontend Development", link: "https://developer.mozilla.org/" },
        estimated_time_hours: 5
      };
    });

    // Determine strengths (scores >= 2)
    const strengths = Object.entries(scoreBreakdown)
      .filter(([_, score]) => score >= 2)
      .map(([category]) => {
        const strengthDescriptions: Record<string, string> = {
          "UI Complexity": "Building complex, multi-page applications",
          "Styling Mastery": "Modern CSS frameworks and styling techniques",
          "Component Structure": "Well-organized, reusable component architecture",
          "State Management": "Effective state management patterns",
          "API Integration": "Solid API integration and data handling",
          "Deployment": "Active deployment and hosting practices",
          "Code Quality": "Clean, well-structured code organization",
          "Documentation": "Good documentation and project descriptions"
        };
        return strengthDescriptions[category] || `Strong ${category.toLowerCase()} implementation`;
      })
      .sort(); // Sort for consistency

    // Determine priority improvements (scores 0-1)
    const priorityImprovements = Object.entries(scoreBreakdown)
      .filter(([_, score]) => score <= 1)
      .map(([category]) => category)
      .sort(); // Sort for consistency

    // Identify top skills based on evidence
    const topSkills = [];
    if (analysisData.repositories.some(repo => repo.language === 'TypeScript')) topSkills.push('TypeScript');
    else if (analysisData.repositories.some(repo => repo.language === 'JavaScript')) topSkills.push('JavaScript');
    
    if (scoreBreakdown["Component Structure"] >= 2) topSkills.push('React');
    if (scoreBreakdown["Styling Mastery"] >= 2) topSkills.push('CSS/Styling');
    if (scoreBreakdown["API Integration"] >= 2) topSkills.push('API Integration');
    if (scoreBreakdown["Deployment"] >= 2) topSkills.push('Deployment');
    topSkills.push('Git', 'HTML');

    const evaluation: EvaluationResponse = {
      score_breakdown: scoreBreakdown,
      total_score: totalScore,
      skill_level: skillLevel.level,
      skill_emoji: skillLevel.emoji,
      justification: `Based on ${analysisData.total_frontend_repos} frontend repositories and ${analysisData.total_repos} total projects. Score: ${totalScore}/39 (${Math.round((totalScore/39)*100)}%). ${
        skillLevel.level === 'Advanced' ? 'Excellent technical skills with production-ready capabilities.' :
        skillLevel.level === 'Industry-Ready' ? 'Strong foundation with most industry-standard practices in place.' :
        skillLevel.level === 'Intermediate' ? 'Good progress with solid fundamentals, ready for more advanced concepts.' :
        'Learning the fundamentals with room for growth in multiple areas.'
      }`,
      top_skills: topSkills.slice(0, 5),
      projects: projectsForComparison,
      strengths: strengths.slice(0, 5),
      priority_improvements: priorityImprovements.slice(0, 3),
      improvement_suggestions: improvementSuggestions,
      motivation: `${skillLevel.level === 'Advanced' ? 'Keep pushing boundaries and mentoring others!' :
        skillLevel.level === 'Industry-Ready' ? 'You\'re ready for professional challenges. Keep refining!' :
        skillLevel.level === 'Intermediate' ? 'Great progress! Focus on your weak areas to level up.' :
        'Every expert was once a beginner. Keep building and learning!'} 🚀`,
      cached_result: false,
      evaluation_timestamp: new Date().toISOString()
    };

    // Cache the evaluation for consistency
    setCachedEvaluation(cacheKey, evaluation);

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
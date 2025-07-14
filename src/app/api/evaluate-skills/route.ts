import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Simple in-memory cache for consistent results
const evaluationCache = new Map<string, EvaluationResponse>();

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

interface ProjectDetails {
  name: string;
  description: string;
  language: string;
  size_kb: number;
  stars: number;
  forks: number;
  topics: string[];
  homepage: string;
  created_at: string;
  updated_at: string;
  is_frontend: boolean;
  html_url: string;
  complexity_indicators: {
    has_dependencies: boolean;
    has_deployment: boolean;
    has_good_description: boolean;
    estimated_complexity: 'Low' | 'Medium' | 'High';
  };
}

interface EvaluationResponse {
  skill_level: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced';
  justification: string;
  improvement_suggestions: ImprovementSuggestion[];
  motivation: string;
  top_skills: string[];
  projects: string[];
  all_projects: ProjectDetails[];
  frontend_projects: ProjectDetails[];
  other_projects: ProjectDetails[];
  score_breakdown: {
    'UI Complexity': number;
    'Styling Mastery': number;
    'Component Structure': number;
    'State Management': number;
    'API Integration': number;
    'Authentication': number;
    'Deployment': number;
    'Code Quality': number;
    'Accessibility': number;
    'Testing & Error Handling': number;
    'Animation & UX Polish': number;
    'Real-World Use Case': number;
    'Documentation': number;
  };
  total_score: number;
  skill_emoji: string;
}

// Deterministic evaluation function for consistent scoring
function createDeterministicEvaluation(analysisData: any, frontendProjects: ProjectDetails[]): EvaluationResponse {
  const scores = {
    'UI Complexity': 0,
    'Styling Mastery': 0,
    'Component Structure': 0,
    'State Management': 0,
    'API Integration': 0,
    'Authentication': 0,
    'Deployment': 0,
    'Code Quality': 0,
    'Accessibility': 0,
    'Testing & Error Handling': 0,
    'Animation & UX Polish': 0,
    'Real-World Use Case': 0,
    'Documentation': 0
  };

  // 1. UI Complexity (based on project count and size)
  const projectCount = frontendProjects.length;
  const avgSize = frontendProjects.reduce((sum, p) => sum + p.size_kb, 0) / Math.max(projectCount, 1);
  
  if (projectCount >= 5 && avgSize > 500) scores['UI Complexity'] = 3;
  else if (projectCount >= 3 && avgSize > 200) scores['UI Complexity'] = 2;
  else if (projectCount >= 1 && avgSize > 50) scores['UI Complexity'] = 1;

  // 2. Styling Mastery (based on topics and technologies)
  const stylingKeywords = ['css', 'tailwind', 'scss', 'sass', 'styled-components', 'emotion', 'mui', 'chakra'];
  const stylingProjects = frontendProjects.filter(p => 
    stylingKeywords.some(keyword => 
      p.topics.some(topic => topic.includes(keyword)) || 
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (stylingProjects.length >= 3) scores['Styling Mastery'] = 3;
  else if (stylingProjects.length >= 2) scores['Styling Mastery'] = 2;
  else if (stylingProjects.length >= 1) scores['Styling Mastery'] = 1;

  // 3. Component Structure (based on React/Vue/Angular projects)
  const componentKeywords = ['react', 'vue', 'angular', 'component', 'next', 'nuxt'];
  const componentProjects = frontendProjects.filter(p =>
    componentKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (componentProjects.length >= 3 && avgSize > 300) scores['Component Structure'] = 3;
  else if (componentProjects.length >= 2) scores['Component Structure'] = 2;
  else if (componentProjects.length >= 1) scores['Component Structure'] = 1;

  // 4. State Management (based on advanced React/Vue patterns)
  const stateKeywords = ['redux', 'zustand', 'context', 'vuex', 'pinia', 'mobx', 'state-management'];
  const stateProjects = frontendProjects.filter(p =>
    stateKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (stateProjects.length >= 2) scores['State Management'] = 3;
  else if (stateProjects.length >= 1 || componentProjects.length >= 2) scores['State Management'] = 2;
  else if (componentProjects.length >= 1) scores['State Management'] = 1;

  // 5. API Integration (based on API-related keywords)
  const apiKeywords = ['api', 'fetch', 'axios', 'graphql', 'rest', 'backend', 'server'];
  const apiProjects = frontendProjects.filter(p =>
    apiKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (apiProjects.length >= 3) scores['API Integration'] = 3;
  else if (apiProjects.length >= 2) scores['API Integration'] = 2;
  else if (apiProjects.length >= 1) scores['API Integration'] = 1;

  // 6. Authentication (based on auth-related keywords)
  const authKeywords = ['auth', 'login', 'firebase', 'auth0', 'authentication', 'jwt', 'passport'];
  const authProjects = frontendProjects.filter(p =>
    authKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (authProjects.length >= 2) scores['Authentication'] = 3;
  else if (authProjects.length >= 1) scores['Authentication'] = 2;

  // 7. Deployment (based on deployed projects)
  const deployedProjects = frontendProjects.filter(p => p.homepage && p.homepage.length > 0);
  const deploymentRatio = deployedProjects.length / Math.max(projectCount, 1);
  
  if (deploymentRatio >= 0.8) scores['Deployment'] = 3;
  else if (deploymentRatio >= 0.5) scores['Deployment'] = 2;
  else if (deploymentRatio >= 0.3) scores['Deployment'] = 1;

  // 8. Code Quality (based on project structure indicators)
  const qualityProjects = frontendProjects.filter(p => 
    p.complexity_indicators.has_good_description && 
    p.size_kb > 100 && 
    p.topics.length > 1
  );
  
  if (qualityProjects.length >= 3) scores['Code Quality'] = 3;
  else if (qualityProjects.length >= 2) scores['Code Quality'] = 2;
  else if (qualityProjects.length >= 1) scores['Code Quality'] = 1;

  // 9. Accessibility (based on a11y keywords)
  const a11yKeywords = ['accessibility', 'a11y', 'aria', 'wcag', 'semantic'];
  const a11yProjects = frontendProjects.filter(p =>
    a11yKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (a11yProjects.length >= 2) scores['Accessibility'] = 3;
  else if (a11yProjects.length >= 1) scores['Accessibility'] = 2;

  // 10. Testing & Error Handling (based on testing keywords)
  const testKeywords = ['test', 'testing', 'jest', 'cypress', 'playwright', 'vitest', 'unit-test'];
  const testProjects = frontendProjects.filter(p =>
    testKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (testProjects.length >= 2) scores['Testing & Error Handling'] = 3;
  else if (testProjects.length >= 1) scores['Testing & Error Handling'] = 2;

  // 11. Animation & UX Polish (based on animation keywords)
  const animationKeywords = ['animation', 'framer-motion', 'gsap', 'lottie', 'transition', 'motion'];
  const animationProjects = frontendProjects.filter(p =>
    animationKeywords.some(keyword =>
      p.topics.some(topic => topic.includes(keyword)) ||
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    )
  );
  
  if (animationProjects.length >= 2) scores['Animation & UX Polish'] = 3;
  else if (animationProjects.length >= 1) scores['Animation & UX Polish'] = 2;

  // 12. Real-World Use Case (based on project complexity and utility)
  const realWorldProjects = frontendProjects.filter(p => 
    p.size_kb > 200 && 
    p.complexity_indicators.has_good_description &&
    p.topics.length > 2 &&
    !p.name.toLowerCase().includes('todo') &&
    !p.name.toLowerCase().includes('tutorial')
  );
  
  if (realWorldProjects.length >= 3) scores['Real-World Use Case'] = 3;
  else if (realWorldProjects.length >= 2) scores['Real-World Use Case'] = 2;
  else if (realWorldProjects.length >= 1) scores['Real-World Use Case'] = 1;

  // 13. Documentation (based on README quality indicators)
  const documentedProjects = frontendProjects.filter(p => 
    p.complexity_indicators.has_good_description &&
    p.topics.length > 0
  );
  
  if (documentedProjects.length >= 3) scores['Documentation'] = 3;
  else if (documentedProjects.length >= 2) scores['Documentation'] = 2;
  else if (documentedProjects.length >= 1) scores['Documentation'] = 1;

  // Calculate total score
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Determine skill level based on total score
  let skillLevel: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced';
  let skillEmoji: string;
  
  if (totalScore >= 36) {
    skillLevel = 'Advanced';
    skillEmoji = '🧠';
  } else if (totalScore >= 26) {
    skillLevel = 'Industry-Ready';
    skillEmoji = '🚀';
  } else if (totalScore >= 16) {
    skillLevel = 'Intermediate';
    skillEmoji = '🌱';
  } else {
    skillLevel = 'Beginner';
    skillEmoji = '🐣';
  }

  // Generate top skills based on scores
  const topSkills = Object.entries(scores)
    .filter(([_, score]) => score >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([skill, _]) => skill);

  // Generate improvement suggestions based on lowest scores
  const improvementAreas = Object.entries(scores)
    .filter(([_, score]) => score <= 1)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 3);

  const improvementSuggestions: ImprovementSuggestion[] = improvementAreas.map(([area, score]) => {
    const suggestions = {
      'Authentication': {
        title: 'Implement Authentication System',
        description: 'Add Firebase Auth or Auth0 to your projects with login/logout flow and protected routes.',
        resource: { topic: 'Firebase Authentication', link: 'https://firebase.google.com/docs/auth/web/start' },
        estimated_time_hours: 8
      },
      'Testing & Error Handling': {
        title: 'Add Testing Suite',
        description: 'Implement Jest and React Testing Library for unit and integration tests.',
        resource: { topic: 'React Testing Library', link: 'https://testing-library.com/docs/react-testing-library/intro' },
        estimated_time_hours: 12
      },
      'Accessibility': {
        title: 'Improve Accessibility',
        description: 'Add semantic HTML, ARIA labels, and keyboard navigation to your projects.',
        resource: { topic: 'Web Accessibility Guidelines', link: 'https://web.dev/accessibility' },
        estimated_time_hours: 6
      },
      'Animation & UX Polish': {
        title: 'Add Animations and Polish',
        description: 'Implement smooth transitions and micro-interactions using Framer Motion or CSS animations.',
        resource: { topic: 'Framer Motion', link: 'https://www.framer.com/motion/' },
        estimated_time_hours: 10
      }
    };
    
    return suggestions[area as keyof typeof suggestions] || {
      title: `Improve ${area}`,
      description: `Focus on enhancing your ${area.toLowerCase()} skills through practice and learning.`,
      resource: { topic: area, link: 'https://developer.mozilla.org/' },
      estimated_time_hours: 8
    };
  });

  return {
    skill_level: skillLevel,
    skill_emoji: skillEmoji,
    total_score: totalScore,
    score_breakdown: scores,
    justification: `Based on ${frontendProjects.length} frontend projects analyzed. Score: ${totalScore}/39. ${skillLevel} level demonstrates ${skillLevel === 'Advanced' ? 'mastery across multiple domains' : skillLevel === 'Industry-Ready' ? 'solid professional skills' : skillLevel === 'Intermediate' ? 'good foundation with room for growth' : 'early-stage development skills'}.`,
    top_skills: topSkills.length > 0 ? topSkills : ['JavaScript', 'HTML', 'CSS'],
    projects: frontendProjects.map(p => p.name),
    all_projects: [],
    frontend_projects: [],
    other_projects: [],
    improvement_suggestions: improvementSuggestions,
    motivation: skillLevel === 'Advanced' ? 'Outstanding work! You\'re at expert level. Consider mentoring others! 🎯' : 
                skillLevel === 'Industry-Ready' ? 'Excellent skills! You\'re ready for senior roles. Keep innovating! 🚀' :
                skillLevel === 'Intermediate' ? 'Great progress! Focus on the suggested areas to reach industry-ready level. 💪' :
                'Good start! Every expert was once a beginner. Keep building and learning! 🌟'
  };
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

    // Create a hash for caching based on username and key profile data
    const cacheKey = `${github_username}-${portfolio_url || ''}-${skills_list || ''}`;
    const cacheHash = crypto.createHash('md5').update(cacheKey).digest('hex');

    // Check cache first for consistent results
    if (evaluationCache.has(cacheHash)) {
      return NextResponse.json(evaluationCache.get(cacheHash));
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

    // Create a more specific cache key based on repository data
    const repoSignature = reposData.slice(0, 10).map(r => `${r.name}-${r.updated_at}`).join('|');
    const specificCacheKey = `${github_username}-${repoSignature}`;
    const specificCacheHash = crypto.createHash('md5').update(specificCacheKey).digest('hex');

    // Check cache with specific key for better consistency
    if (evaluationCache.has(specificCacheHash)) {
      return NextResponse.json(evaluationCache.get(specificCacheHash));
    }

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

    // Enhanced project analysis
    const enhancedProjects: ProjectDetails[] = reposData.map(repo => ({
      name: repo.name,
      description: repo.description || '',
      language: repo.language || 'Unknown',
      size_kb: repo.size,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics || [],
      homepage: repo.homepage || '',
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      is_frontend: frontendRepos.includes(repo),
      html_url: repo.html_url,
      complexity_indicators: {
        has_dependencies: repo.size > 100, // Assume projects >100KB have dependencies
        has_deployment: !!repo.homepage,
        has_good_description: (repo.description?.length || 0) > 20,
        estimated_complexity: repo.size > 500 ? 'High' : repo.size > 100 ? 'Medium' : 'Low' as 'Low' | 'Medium' | 'High'
      }
    }));

    const frontendProjectDetails = enhancedProjects.filter(p => p.is_frontend);
    const otherProjectDetails = enhancedProjects.filter(p => !p.is_frontend);

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

    // Create deterministic evaluation using objective scoring
    const deterministicEvaluation = createDeterministicEvaluation(analysisData, frontendProjectDetails);

    // Call Gemini API for analysis with low temperature for consistency
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert frontend developer evaluator. Use the provided DETERMINISTIC SCORING as your base evaluation and only make minimal adjustments if absolutely necessary.

DETERMINISTIC BASE EVALUATION:
${JSON.stringify(deterministicEvaluation, null, 2)}

GitHub Profile Analysis Data:
${JSON.stringify(analysisData, null, 2)}

🎯 IMPORTANT: Use the deterministic scoring as your foundation. Only adjust scores by ±1 point if you find clear evidence that contradicts the base evaluation.

📊 EVALUATION RULES (must be followed exactly):
1. **UI Complexity**: Based on project count and size
2. **Styling Mastery**: Based on CSS/styling technologies found
3. **Component Structure**: Based on project architecture indicators
4. **State Management**: Based on framework usage patterns
5. **API Integration**: Based on API-related keywords and patterns
6. **Authentication**: Based on auth-related keywords
7. **Deployment**: Based on homepage URLs (deployed projects)
8. **Code Quality**: Based on project structure and naming
9. **Accessibility**: Based on semantic HTML indicators
10. **Testing & Error Handling**: Based on test files and error patterns
11. **Animation & UX Polish**: Based on animation libraries
12. **Real-World Use Case**: Based on project complexity and utility
13. **Documentation**: Based on README quality and documentation

🎯 SKILL LEVEL ASSIGNMENT (FIXED THRESHOLDS):
- 0-15 → Beginner 🐣
- 16-25 → Intermediate 🌱  
- 26-35 → Industry-Ready 🚀
- 36-39 → Advanced 🧠

OUTPUT FORMAT: Return the deterministic evaluation with minimal changes only if absolutely necessary. Maintain consistency for the same profile.

Only return JSON. No explanations or additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.1,
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
        const aiEvaluation = JSON.parse(jsonMatch[0]);
        // Merge AI evaluation with deterministic base, preferring deterministic scores for consistency
        evaluation = {
          ...deterministicEvaluation,
          ...aiEvaluation,
          // Always use deterministic scores for consistency
          score_breakdown: deterministicEvaluation.score_breakdown,
          total_score: deterministicEvaluation.total_score,
          skill_level: deterministicEvaluation.skill_level,
          skill_emoji: deterministicEvaluation.skill_emoji,
          // Use AI for textual content if available
          justification: aiEvaluation.justification || deterministicEvaluation.justification,
          improvement_suggestions: aiEvaluation.improvement_suggestions || deterministicEvaluation.improvement_suggestions,
          motivation: aiEvaluation.motivation || deterministicEvaluation.motivation,
          // Add the enhanced project data
          all_projects: enhancedProjects,
          frontend_projects: frontendProjectDetails,
          other_projects: otherProjectDetails
        };
      } else {
        throw new Error('No valid JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Use deterministic evaluation as fallback
      evaluation = deterministicEvaluation;
      evaluation.all_projects = enhancedProjects;
      evaluation.frontend_projects = frontendProjectDetails;
      evaluation.other_projects = otherProjectDetails;
    }

    // Cache the result for consistency
    evaluationCache.set(specificCacheHash, evaluation);

    // Optional: Clear cache after some time to avoid memory issues
    if (evaluationCache.size > 100) {
      const firstKey = evaluationCache.keys().next().value;
      if (firstKey) {
        evaluationCache.delete(firstKey);
      }
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
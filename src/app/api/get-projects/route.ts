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
  clone_url: string;
}

interface ProjectSummary {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  lastUpdated: string;
  techStack: string[];
  features: string[];
  complexity: string;
  hasLiveDemo: boolean;
  repoUrl: string;
  category: string;
}

// Helper function to analyze project for quick summary
async function getProjectSummary(username: string, repo: GitHubRepo): Promise<ProjectSummary> {
  const summary: ProjectSummary = {
    name: repo.name,
    description: repo.description || 'No description available',
    language: repo.language || 'Unknown',
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    lastUpdated: repo.updated_at,
    techStack: [],
    features: [],
    complexity: 'basic',
    hasLiveDemo: !!repo.homepage,
    repoUrl: repo.html_url,
    category: 'Other'
  };

  try {
    // Try to fetch package.json for tech stack analysis
    const packageResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents/package.json`);
    if (packageResponse.ok) {
      const packageData = await packageResponse.json();
      const packageContent = JSON.parse(Buffer.from(packageData.content, 'base64').toString());
      
      // Extract tech stack from dependencies
      const allDeps = { ...packageContent.dependencies, ...packageContent.devDependencies };
      const techIndicators = {
        'react': 'React',
        'vue': 'Vue.js',
        'angular': 'Angular',
        'next': 'Next.js',
        'nuxt': 'Nuxt.js',
        'svelte': 'Svelte',
        'typescript': 'TypeScript',
        'tailwindcss': 'Tailwind CSS',
        'styled-components': 'Styled Components',
        'redux': 'Redux',
        'zustand': 'Zustand',
        'axios': 'Axios',
        'graphql': 'GraphQL',
        'firebase': 'Firebase',
        'supabase': 'Supabase',
        'auth0': 'Auth0',
        'stripe': 'Stripe',
        'framer-motion': 'Framer Motion',
        'three': 'Three.js',
        'd3': 'D3.js',
        'socket.io': 'Socket.IO',
        'express': 'Express.js',
        'jest': 'Jest',
        'cypress': 'Cypress',
        'vite': 'Vite'
      };
      
      for (const [dep, tech] of Object.entries(techIndicators)) {
        if (Object.keys(allDeps).some(key => key.toLowerCase().includes(dep))) {
          summary.techStack.push(tech);
        }
      }

      // Determine complexity based on dependencies
      const depCount = Object.keys(allDeps).length;
      if (depCount > 25) summary.complexity = 'advanced';
      else if (depCount > 15) summary.complexity = 'intermediate';
      else if (depCount > 5) summary.complexity = 'basic-plus';
    } else if (packageResponse.status === 403) {
      console.log(`Rate limited while fetching package.json for ${repo.name}`);
    } else if (packageResponse.status !== 404) {
      console.log(`Unexpected status ${packageResponse.status} for package.json in ${repo.name}`);
    }

    // Analyze repository contents for features (quick scan)
    const contentsResponse = await fetch(`https://api.github.com/repos/${username}/${repo.name}/contents`);
    if (contentsResponse.ok) {
      const contents = await contentsResponse.json();
      
      // Check for common patterns in file names
      const fileNames = contents.map((file: any) => file.name.toLowerCase());
      
      if (fileNames.some((name: string) => name.includes('test') || name.includes('spec'))) {
        summary.features.push('Testing');
      }
      if (fileNames.some((name: string) => name.includes('api') || name.includes('server'))) {
        summary.features.push('Backend/API');
      }
      if (fileNames.some((name: string) => name.includes('component') || name.includes('ui'))) {
        summary.features.push('UI Components');
      }
      if (fileNames.some((name: string) => name.includes('auth') || name.includes('login'))) {
        summary.features.push('Authentication');
      }
      if (fileNames.some((name: string) => name.includes('admin') || name.includes('dashboard'))) {
        summary.features.push('Dashboard/Admin');
      }
    } else if (contentsResponse.status === 403) {
      console.log(`Rate limited while fetching contents for ${repo.name}`);
    } else if (contentsResponse.status !== 404) {
      console.log(`Unexpected status ${contentsResponse.status} for contents in ${repo.name}`);
    }

    // Categorize project based on name, description, and tech stack
    const projectName = repo.name.toLowerCase();
    const projectDesc = (repo.description || '').toLowerCase();
    const allText = `${projectName} ${projectDesc} ${summary.techStack.join(' ')}`.toLowerCase();

    if (/portfolio|personal|resume|cv/.test(allText)) {
      summary.category = 'Portfolio';
    } else if (/e-commerce|shop|store|cart|payment/.test(allText)) {
      summary.category = 'E-commerce';
    } else if (/blog|cms|content/.test(allText)) {
      summary.category = 'Content Management';
    } else if (/dashboard|admin|analytics/.test(allText)) {
      summary.category = 'Dashboard/Analytics';
    } else if (/chat|messaging|social/.test(allText)) {
      summary.category = 'Social/Communication';
    } else if (/game|entertainment/.test(allText)) {
      summary.category = 'Gaming/Entertainment';
    } else if (/tool|utility|converter/.test(allText)) {
      summary.category = 'Tools/Utilities';
    } else if (/api|backend|server/.test(allText)) {
      summary.category = 'Backend/API';
    } else if (/mobile|app/.test(allText)) {
      summary.category = 'Mobile App';
    } else if (/landing|marketing|business/.test(allText)) {
      summary.category = 'Landing Page/Marketing';
    } else {
      summary.category = 'Web Application';
    }

  } catch (error) {
    console.log(`Could not analyze project ${repo.name}:`, error);
  }

  return summary;
}

export async function POST(request: NextRequest) {
  try {
    const { github_username } = await request.json();

    if (!github_username) {
      return NextResponse.json(
        { error: 'GitHub username is required' },
        { status: 400 }
      );
    }

    // Fetch all repositories
    console.log(`Fetching repos for user: ${github_username}`);
    const reposResponse = await fetch(`https://api.github.com/users/${github_username}/repos?per_page=100&sort=updated`);
    
    console.log(`GitHub API response status: ${reposResponse.status}`);
    console.log(`GitHub API response headers:`, Object.fromEntries(reposResponse.headers.entries()));
    
    if (!reposResponse.ok) {
      const errorText = await reposResponse.text();
      console.error('GitHub API error response:', errorText);
      
      let errorMessage = 'GitHub user not found or repositories not accessible';
      if (reposResponse.status === 403) {
        errorMessage = 'GitHub API rate limit exceeded. Please try again later.';
      } else if (reposResponse.status === 404) {
        errorMessage = `GitHub user '${github_username}' not found. Please check the username.`;
      }
      
      return NextResponse.json(
        { error: errorMessage, status: reposResponse.status, details: errorText },
        { status: reposResponse.status }
      );
    }

    const repos: GitHubRepo[] = await reposResponse.json();
    console.log(`Found ${repos.length} repositories for user ${github_username}`);

    // Filter frontend/web-related repositories
    const frontendLanguages = ['JavaScript', 'TypeScript', 'HTML', 'CSS', 'Vue', 'Svelte'];
    const frontendKeywords = ['react', 'vue', 'angular', 'next', 'nuxt', 'svelte', 'frontend', 'web', 'ui', 'website', 'app', 'portfolio', 'dashboard', 'landing'];
    
    const relevantRepos = repos.filter(repo => {
      // Skip forked repositories unless they have significant changes
      if (repo.forks_count === 0 && repo.stargazers_count === 0 && repo.size < 100) {
        return false;
      }

      const languageMatch = frontendLanguages.includes(repo.language);
      const nameMatch = frontendKeywords.some(keyword => 
        repo.name.toLowerCase().includes(keyword)
      );
      const descMatch = repo.description && frontendKeywords.some(keyword => 
        repo.description.toLowerCase().includes(keyword)
      );
      const topicsMatch = repo.topics.some(topic => 
        frontendKeywords.some(keyword => topic.includes(keyword))
      );

      return languageMatch || nameMatch || descMatch || topicsMatch;
    });

    console.log(`Filtered to ${relevantRepos.length} relevant repositories`);

    // Get detailed summaries for each relevant project
    const projectSummariesPromises = relevantRepos.slice(0, 20).map(repo => 
      getProjectSummary(github_username, repo).catch(error => {
        console.error(`Failed to analyze project ${repo.name}:`, error);
        // Return a basic summary even if analysis fails
        return {
          name: repo.name,
          description: repo.description || 'No description available',
          language: repo.language || 'Unknown',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          lastUpdated: repo.updated_at,
          techStack: repo.language ? [repo.language] : [],
          features: [],
          complexity: 'basic',
          hasLiveDemo: !!repo.homepage,
          repoUrl: repo.html_url,
          category: 'Other'
        } as ProjectSummary;
      })
    );
    
    const projectSummaries = await Promise.all(projectSummariesPromises);
    console.log(`Successfully analyzed ${projectSummaries.length} projects`);

    // Sort projects by complexity and recent activity
    const sortedProjects = projectSummaries.sort((a, b) => {
      const complexityOrder = { 'advanced': 4, 'intermediate': 3, 'basic-plus': 2, 'basic': 1 };
      const complexityDiff = complexityOrder[b.complexity as keyof typeof complexityOrder] - complexityOrder[a.complexity as keyof typeof complexityOrder];
      
      if (complexityDiff !== 0) return complexityDiff;
      
      // If same complexity, sort by last updated
      return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    });

    // Group projects by category
    const projectsByCategory = sortedProjects.reduce((acc, project) => {
      if (!acc[project.category]) {
        acc[project.category] = [];
      }
      acc[project.category].push(project);
      return acc;
    }, {} as Record<string, ProjectSummary[]>);

    return NextResponse.json({
      username: github_username,
      totalProjects: sortedProjects.length,
      projects: sortedProjects,
      projectsByCategory,
      categories: Object.keys(projectsByCategory),
      suggestions: {
        mostComplex: sortedProjects.filter(p => p.complexity === 'advanced').slice(0, 3),
        mostRecent: sortedProjects.slice(0, 5),
        withLiveDemo: sortedProjects.filter(p => p.hasLiveDemo),
        recommendedForComparison: sortedProjects.slice(0, 8)
      }
    });

  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Get Projects API - Use POST method with github_username' },
    { status: 200 }
  );
}

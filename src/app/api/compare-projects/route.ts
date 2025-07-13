import { NextRequest, NextResponse } from 'next/server';

interface ProjectComparison {
  project1: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  project2: {
    name: string;
    strengths: string[];
    weaknesses: string[];
  };
  recommendation: string;
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

    // Fetch repository contents to analyze structure
    const [contents1Response, contents2Response] = await Promise.all([
      fetch(`https://api.github.com/repos/${github_username}/${project1}/contents`),
      fetch(`https://api.github.com/repos/${github_username}/${project2}/contents`)
    ]);

    let contents1 = [];
    let contents2 = [];

    if (contents1Response.ok) {
      contents1 = await contents1Response.json();
    }
    if (contents2Response.ok) {
      contents2 = await contents2Response.json();
    }

    // Prepare comparison data
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
        contents: contents1.map((item: { name: any; }) => item.name)
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
        contents: contents2.map((item: { name: any; }) => item.name)
      }
    };

    // Call Gemini API for comparison
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an expert frontend developer. Compare these two GitHub projects and analyze their strengths and weaknesses.

Project Comparison Data:
${JSON.stringify(comparisonData, null, 2)}

Analyze both projects and provide:
1. Strengths of each project (2-3 points each)
2. Weaknesses of each project (2-3 points each)
3. Overall recommendation on which project demonstrates better frontend skills and why

Focus on:
- Code organization and structure
- Technology stack and complexity
- User interface implementation
- Project scope and functionality
- Documentation and deployment
- Performance considerations
- Best practices usage

OUTPUT FORMAT (JSON only):
{
  "project1": {
    "name": "Project Name 1",
    "strengths": [
      "Well-structured component architecture",
      "Modern React hooks implementation",
      "Responsive design with Tailwind"
    ],
    "weaknesses": [
      "Limited error handling",
      "No testing implementation"
    ]
  },
  "project2": {
    "name": "Project Name 2",
    "strengths": [
      "Complex state management",
      "API integration with error handling"
    ],
    "weaknesses": [
      "Outdated dependencies",
      "Poor mobile responsiveness",
      "Limited documentation"
    ]
  },
  "recommendation": "Project 1 shows better frontend architecture and modern practices, while Project 2 demonstrates more complex functionality. Focus on combining the architectural strengths of Project 1 with the feature complexity of Project 2."
}

Only return JSON. No explanations or additional text.`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
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
      // Fallback comparison
      comparison = {
        project1: {
          name: project1,
          strengths: ['Active project with recent commits', 'Good file organization'],
          weaknesses: ['Limited analysis available', 'Need more detailed code review']
        },
        project2: {
          name: project2,
          strengths: ['Established project structure', 'Clear project naming'],
          weaknesses: ['Limited analysis available', 'Need more detailed code review']
        },
        recommendation: 'Both projects show potential. Consider adding more documentation and implementing testing for better code quality.'
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
    { message: 'Project Comparison API - Use POST method' },
    { status: 200 }
  );
}
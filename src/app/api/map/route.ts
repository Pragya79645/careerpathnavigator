// app/api/career-navigator/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface CareerRequest {
  skills: string;
  background: string;
  target_role: string;
  timeline: string;
}

interface Role {
  title: string;
  skills_required: string[];
  shortcut?: string;
}

interface CareerPath {
  title: string;
  icon: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Intermediate-Advanced';
  roles: Role[];
}

interface CareerResponse {
  follow_up_questions: string[];
  paths: CareerPath[];
  advice: string;
  resources: Array<{
    topic: string;
    link: string;
  }>;
}

// Career path templates based on target roles
const careerPathTemplates = {
  'software engineer': {
    fastest: {
      title: "Path A - Fastest",
      icon: "⚡",
      duration: "4-8 months",
      difficulty: "Beginner" as const,
      roles: [
        {
          title: "Junior Frontend Developer",
          skills_required: ["HTML", "CSS", "JavaScript", "React"],
          shortcut: "Complete React course + build 3 projects"
        },
        {
          title: "Software Engineer",
          skills_required: ["Git", "REST APIs", "Testing", "Agile"],
          shortcut: "Contribute to open source + portfolio website"
        }
      ]
    },
    inDemand: {
      title: "Path B - Most In-Demand",
      icon: "🔥",
      duration: "6-12 months",
      difficulty: "Intermediate" as const,
      roles: [
        {
          title: "Backend Developer",
          skills_required: ["Node.js", "Express", "SQL", "NoSQL", "API Design"],
          shortcut: "Build full-stack applications + AWS basics"
        },
        {
          title: "DevOps Engineer",
          skills_required: ["Docker", "Kubernetes", "CI/CD", "AWS/Azure"],
          shortcut: "Get cloud certifications + automation projects"
        },
        {
          title: "Software Engineer",
          skills_required: ["System Design", "Microservices", "Scalability"],
          shortcut: "Practice system design interviews"
        }
      ]
    },
    balanced: {
      title: "Path C - Balanced Growth",
      icon: "📈",
      duration: "8-15 months",
      difficulty: "Intermediate-Advanced" as const,
      roles: [
        {
          title: "Full Stack Developer",
          skills_required: ["Frontend", "Backend", "Database", "DevOps"],
          shortcut: "Build end-to-end applications"
        },
        {
          title: "Senior Software Engineer",
          skills_required: ["DSA", "System Design", "Leadership", "Architecture"],
          shortcut: "LeetCode + system design + mentoring"
        }
      ]
    }
  },
  'data scientist': {
    fastest: {
      title: "Path A - Fastest",
      icon: "⚡",
      duration: "3-6 months",
      difficulty: "Beginner" as const,
      roles: [
        {
          title: "Data Analyst",
          skills_required: ["Python", "Pandas", "SQL", "Excel"],
          shortcut: "Complete Google Data Analytics Certificate"
        },
        {
          title: "Junior Data Scientist",
          skills_required: ["Statistics", "Machine Learning", "Visualization"],
          shortcut: "Kaggle competitions + portfolio projects"
        }
      ]
    },
    inDemand: {
      title: "Path B - Most In-Demand",
      icon: "🔥",
      duration: "6-12 months",
      difficulty: "Intermediate" as const,
      roles: [
        {
          title: "ML Engineer",
          skills_required: ["Python", "TensorFlow", "PyTorch", "MLOps"],
          shortcut: "Build ML pipelines + AWS ML services"
        },
        {
          title: "AI Engineer",
          skills_required: ["Deep Learning", "NLP", "Computer Vision", "LLMs"],
          shortcut: "Specialize in AI/ML + cloud platforms"
        },
        {
          title: "Data Scientist",
          skills_required: ["Advanced Statistics", "A/B Testing", "Business Acumen"],
          shortcut: "Industry projects + domain expertise"
        }
      ]
    },
    balanced: {
      title: "Path C - Balanced Growth",
      icon: "📈",
      duration: "8-15 months",
      difficulty: "Intermediate-Advanced" as const,
      roles: [
        {
          title: "Data Engineer",
          skills_required: ["ETL", "Data Warehousing", "Spark", "Airflow"],
          shortcut: "Build data pipelines + cloud architecture"
        },
        {
          title: "Senior Data Scientist",
          skills_required: ["Research", "Model Deployment", "Team Leadership"],
          shortcut: "Publications + open source contributions"
        }
      ]
    }
  },
  'frontend developer': {
    fastest: {
      title: "Path A - Fastest",
      icon: "⚡",
      duration: "2-4 months",
      difficulty: "Beginner" as const,
      roles: [
        {
          title: "Frontend Developer",
          skills_required: ["HTML", "CSS", "JavaScript", "React"],
          shortcut: "FreeCodeCamp + React documentation"
        },
        {
          title: "UI Developer",
          skills_required: ["Responsive Design", "CSS Frameworks", "Git"],
          shortcut: "Build responsive portfolios + GitHub"
        }
      ]
    },
    inDemand: {
      title: "Path B - Most In-Demand",
      icon: "🔥",
      duration: "4-8 months",
      difficulty: "Intermediate" as const,
      roles: [
        {
          title: "React Developer",
          skills_required: ["React", "Redux", "TypeScript", "Testing"],
          shortcut: "Advanced React patterns + testing"
        },
        {
          title: "Frontend Engineer",
          skills_required: ["Performance", "Accessibility", "SEO", "PWA"],
          shortcut: "Web performance + accessibility audits"
        }
      ]
    },
    balanced: {
      title: "Path C - Balanced Growth",
      icon: "📈",
      duration: "6-12 months",
      difficulty: "Intermediate-Advanced" as const,
      roles: [
        {
          title: "Full Stack Developer",
          skills_required: ["Frontend", "Backend", "Database", "API"],
          shortcut: "MERN/MEAN stack projects"
        },
        {
          title: "Senior Frontend Engineer",
          skills_required: ["Architecture", "Team Leadership", "Code Review"],
          shortcut: "Lead projects + mentor juniors"
        }
      ]
    }
  }
};

function normalizeRole(role: string): string {
  return role.toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function findBestMatch(targetRole: string): keyof typeof careerPathTemplates {
  const normalized = normalizeRole(targetRole);
  
  // Direct matches
  if (normalized.includes('software engineer') || normalized.includes('swe')) {
    return 'software engineer';
  }
  if (normalized.includes('data scientist') || normalized.includes('ds')) {
    return 'data scientist';
  }
  if (normalized.includes('frontend') || normalized.includes('front-end')) {
    return 'frontend developer';
  }
  
  // Fallback to software engineer for general roles
  return 'software engineer';
}

function generateFollowUpQuestions(targetRole: string, skills: string): string[] {
  const baseQuestions = [
    "Are you willing to take paid certifications to accelerate your learning?",
    "Do you prefer remote work or are you open to on-site opportunities?",
    "What's your preferred learning style - self-paced or structured courses?"
  ];

  const roleSpecificQuestions = {
    'software engineer': [
      "Do you prefer frontend, backend, or full-stack development?",
      "Are you interested in working at startups, big tech, or enterprises?"
    ],
    'data scientist': [
      "Are you more interested in machine learning or statistical analysis?",
      "Do you want to focus on a specific domain like healthcare or finance?"
    ],
    'frontend developer': [
      "Are you interested in mobile development (React Native) as well?",
      "Do you prefer working on user interfaces or user experience?"
    ]
  };

  const roleKey = findBestMatch(targetRole);
  return [...baseQuestions, ...roleSpecificQuestions[roleKey]];
}

function generateAdvice(
  targetRole: string,
  timeline: string,
  skills: string,
  background: string
): string {
  const roleKey = findBestMatch(targetRole);
  const hasExperience = background.toLowerCase().includes('experience') || 
                       background.toLowerCase().includes('year');
  const hasDegree = background.toLowerCase().includes('degree') || 
                   background.toLowerCase().includes('computer science');

  let advice = `Based on your ${hasDegree ? 'educational background' : 'current situation'} and ${timeline} timeline, `;

  if (timeline.includes('asap') || timeline.includes('fast') || timeline.includes('quick')) {
    advice += "Path A (Fastest) is recommended for quick entry into the field. ";
  } else if (timeline.includes('year') || timeline.includes('12 month')) {
    advice += "you have flexibility to choose any path. ";
  } else {
    advice += "Path C (Balanced) offers the best long-term growth. ";
  }

  if (roleKey === 'software engineer') {
    advice += "Focus on building strong programming fundamentals and a portfolio of projects. ";
  } else if (roleKey === 'data scientist') {
    advice += "Combine technical skills with domain knowledge and practical experience. ";
  } else if (roleKey === 'frontend developer') {
    advice += "Master the fundamentals before moving to frameworks, and build responsive projects. ";
  }

  if (hasExperience) {
    advice += "Your existing experience will help accelerate your transition.";
  } else {
    advice += "Consider starting with internships or entry-level positions to gain experience.";
  }

  return advice;
}

function generateResources(targetRole: string): Array<{topic: string; link: string}> {
  const roleKey = findBestMatch(targetRole);
  
  const resourceMap = {
    'software engineer': [
      { topic: "JavaScript Fundamentals", link: "https://javascript.info/" },
      { topic: "React Documentation", link: "https://react.dev/learn" },
      { topic: "System Design Primer", link: "https://github.com/donnemartin/system-design-primer" },
      { topic: "LeetCode Practice", link: "https://leetcode.com/problemset/" },
      { topic: "AWS Free Tier", link: "https://aws.amazon.com/free/" }
    ],
    'data scientist': [
      { topic: "Python for Data Science", link: "https://www.python.org/about/gettingstarted/" },
      { topic: "Kaggle Learn", link: "https://www.kaggle.com/learn" },
      { topic: "TensorFlow Tutorials", link: "https://www.tensorflow.org/tutorials" },
      { topic: "Coursera ML Course", link: "https://www.coursera.org/learn/machine-learning" },
      { topic: "Towards Data Science", link: "https://towardsdatascience.com/" }
    ],
    'frontend developer': [
      { topic: "MDN Web Docs", link: "https://developer.mozilla.org/en-US/" },
      { topic: "FreeCodeCamp", link: "https://www.freecodecamp.org/" },
      { topic: "CSS Tricks", link: "https://css-tricks.com/" },
      { topic: "React Router", link: "https://reactrouter.com/" },
      { topic: "Tailwind CSS", link: "https://tailwindcss.com/docs" }
    ]
  };

  return resourceMap[roleKey];
}

export async function POST(request: NextRequest) {
  try {
    const body: CareerRequest = await request.json();
    
    // Validate required fields
    if (!body.skills || !body.target_role) {
      return NextResponse.json(
        { error: "Skills and target role are required" },
        { status: 400 }
      );
    }

    const { skills, background, target_role, timeline } = body;
    
    // Find the best matching career path template
    const roleKey = findBestMatch(target_role);
    const template = careerPathTemplates[roleKey];
    
    // Generate response
    const response: CareerResponse = {
      follow_up_questions: generateFollowUpQuestions(target_role, skills),
      paths: [template.fastest, template.inDemand, template.balanced],
      advice: generateAdvice(target_role, timeline, skills, background),
      resources: generateResources(target_role)
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Career navigation error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Career Navigator API",
    version: "1.0.0",
    endpoints: {
      POST: "/api/career-navigator - Analyze career path",
    },
    example_request: {
      skills: "Python, JavaScript, SQL",
      background: "Computer Science degree, 1 year experience",
      target_role: "Software Engineer",
      timeline: "6 months"
    }
  });
}
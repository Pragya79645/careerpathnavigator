import React, { useState } from 'react';
import { ChevronRight, Clock, TrendingUp, Target, Book, ExternalLink, Network, User, GraduationCap, Calendar } from 'lucide-react';

const CareerNavigator = () => {
  const [formData, setFormData] = useState({
    skills: '',
    background: '',
    target_role: '',
    timeline: ''
  });
  
  type CareerResult = {
    follow_up_questions: string[];
    paths: {
      title: string;
      icon: string;
      duration: string;
      difficulty: string;
      roles: {
        title: string;
        skills_required: string[];
        shortcut?: string;
      }[];
    }[];
    advice: string;
    resources: { topic: string; link: string }[];
  };
  
  const [result, setResult] = useState<CareerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPath, setSelectedPath] = useState(null);

  const analyzeCareer = async () => {
    setLoading(true);
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockResult = {
        follow_up_questions: [
          "Do you prefer frontend, backend, or full-stack development?",
          "Are you willing to take paid certifications?",
          "Do you want a remote-friendly role?",
          "What's your preferred programming language?"
        ],
        paths: [
          {
            title: "Path A - Fastest",
            icon: "⚡",
            duration: "3-6 months",
            difficulty: "Beginner",
            roles: [
              {
                title: "Frontend Developer",
                skills_required: ["HTML", "CSS", "JavaScript", "React"],
                shortcut: "freeCodeCamp Responsive Web Cert + React Course"
              },
              {
                title: "Junior Developer",
                skills_required: ["Git", "REST APIs", "Basic Testing"],
                shortcut: "Build 3 portfolio projects + GitHub presence"
              }
            ]
          },
          {
            title: "Path B - Most In-Demand",
            icon: "🔥",
            duration: "6-12 months",
            difficulty: "Intermediate",
            roles: [
              {
                title: "Backend Developer",
                skills_required: ["Node.js", "Express", "SQL", "API Design"],
                shortcut: "Complete Backend Development Bootcamp"
              },
              {
                title: "DevOps Engineer",
                skills_required: ["Linux", "Docker", "CI/CD", "AWS"],
                shortcut: "AWS Cloud Practitioner + Docker Certification"
              },
              {
                title: "Cloud Engineer",
                skills_required: ["Kubernetes", "Terraform", "Monitoring Tools"],
                shortcut: "AWS Solutions Architect Associate"
              }
            ]
          },
          {
            title: "Path C - Balanced Growth",
            icon: "📈",
            duration: "8-15 months",
            difficulty: "Intermediate-Advanced",
            roles: [
              {
                title: "Full Stack Developer",
                skills_required: ["React", "Node.js", "MongoDB", "JWT Auth"],
                shortcut: "Build full-stack MERN application"
              },
              {
                title: "Software Engineer",
                skills_required: ["DSA", "System Design", "Leetcode", "Design Patterns"],
                shortcut: "Complete 200+ Leetcode problems + System Design course"
              }
            ]
          }
        ],
        advice: "Based on your Computer Science background and 1-year timeline, Path A offers the quickest entry into tech. Path B leads to high-paying specialized roles. Path C provides comprehensive skills for long-term career growth.",
        resources: [
          { topic: "React Fundamentals", link: "https://react.dev/learn" },
          { topic: "System Design Primer", link: "https://github.com/donnemartin/system-design-primer" },
          { topic: "AWS Training", link: "https://www.aws.training/" },
          { topic: "LeetCode Practice", link: "https://leetcode.com/problemset/" }
        ]
      };
      
      setResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  type Role = {
    title: string;
    skills_required: string[];
    shortcut?: string;
  };

  type Path = {
    title: string;
    icon: string;
    duration: string;
    difficulty: string;
    roles: Role[];
  };

  const PathCard = ({ path, index }: { path: Path; index: number }) => (
    <div 
      className={`bg-white rounded-xl p-6 shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl ${
        selectedPath === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedPath(selectedPath === index ? null : index)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{path.icon}</span>
          <h3 className="text-xl font-bold text-gray-800">{path.title}</h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{path.duration}</span>
        </div>
      </div>
      
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
          path.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
          path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          {path.difficulty}
        </span>
      </div>

      <div className="space-y-3">
        {path.roles.map((role, roleIndex) => (
          <div key={roleIndex} className="border-l-4 border-blue-300 pl-4">
            <h4 className="font-semibold text-gray-800 mb-2">{role.title}</h4>
            <div className="flex flex-wrap gap-2 mb-2">
              {role.skills_required.map((skill, skillIndex) => (
                <span key={skillIndex} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
            {role.shortcut && (
              <p className="text-sm text-gray-600 italic">💡 {role.shortcut}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const NetworkGraph = () => {
    const nodes = [
      { id: 'current', label: 'Current Skills', x: 50, y: 200, color: '#3B82F6' },
      { id: 'frontend', label: 'Frontend Dev', x: 200, y: 100, color: '#10B981' },
      { id: 'backend', label: 'Backend Dev', x: 200, y: 200, color: '#F59E0B' },
      { id: 'fullstack', label: 'Full Stack', x: 200, y: 300, color: '#8B5CF6' },
      { id: 'target', label: 'Target Role', x: 350, y: 200, color: '#EF4444' }
    ];

    const edges = [
      { from: 'current', to: 'frontend' },
      { from: 'current', to: 'backend' },
      { from: 'current', to: 'fullstack' },
      { from: 'frontend', to: 'target' },
      { from: 'backend', to: 'target' },
      { from: 'fullstack', to: 'target' }
    ];

    return (
      <div className="bg-gray-50 rounded-xl p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <Network className="w-5 h-5 mr-2" />
          Career Path Visualization
        </h3>
        <svg width="400" height="400" viewBox="0 0 400 400" className="mx-auto">
          {edges.map((edge, index) => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <line
                key={index}
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke="#D1D5DB"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                    refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#D1D5DB" />
            </marker>
          </defs>
          
          {nodes.map((node, index) => (
            <g key={index}>
              <circle
                cx={node.x}
                cy={node.y}
                r="25"
                fill={node.color}
                className="hover:opacity-80 cursor-pointer"
              />
              <text
                x={node.x}
                y={node.y + 40}
                textAnchor="middle"
                className="text-sm font-medium fill-gray-700"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎯 AI Career Navigator</h1>
          <p className="text-gray-600">Navigate your path to your dream career with personalized guidance</p>
        </div>

        {/* Input Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 mr-2" />
                Current Skills
              </label>
              <textarea
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                placeholder="e.g., Python, JavaScript, SQL, Git..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <GraduationCap className="w-4 h-4 mr-2" />
                Education/Background
              </label>
              <textarea
                name="background"
                value={formData.background}
                onChange={handleInputChange}
                placeholder="e.g., Computer Science degree, 2 years experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows="3"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 mr-2" />
                Target Role
              </label>
              <input
                name="target_role"
                value={formData.target_role}
                onChange={handleInputChange}
                placeholder="e.g., Software Engineer, Data Scientist..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Timeline
              </label>
              <input
                name="timeline"
                value={formData.timeline}
                onChange={handleInputChange}
                placeholder="e.g., 1 year, 6 months, ASAP..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <button
            onClick={analyzeCareer}
            disabled={loading || !formData.skills || !formData.target_role}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            ) : (
              <ChevronRight className="w-5 h-5 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Navigate My Career'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-8">
            {/* Network Graph */}
            <NetworkGraph />
            
            {/* Follow-up Questions */}
            {result?.follow_up_questions?.length > 0 && (
              <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-yellow-800 mb-4">💭 Consider These Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(result?.follow_up_questions || []).map((question, index) => (
                    <div key={index} className="bg-white p-3 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-700">{question}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Career Paths */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">🛤️ Your Career Paths</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {(result?.paths || []).map((path, index) => (
                  <PathCard key={index} path={path} index={index} />
                ))}
              </div>
            </div>

            {/* Advice */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Personalized Advice
              </h3>
              <p className="text-gray-700">{result?.advice || ''}</p>
            </div>

            {/* Resources */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Book className="w-5 h-5 mr-2" />
                Recommended Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(result?.resources || []).map((resource, index) => (
                  <a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200 flex items-center justify-between group"
                  >
                    <span className="font-medium text-gray-800">{resource.topic}</span>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerNavigator;
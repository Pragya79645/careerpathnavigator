"use client";
import React, { useState } from 'react';
import { Star, Github, ExternalLink, Clock, Target, TrendingUp, Code, Zap, Award, GitBranch, Lightbulb } from 'lucide-react';

const SkillEvaluator = () => {
  const [formData, setFormData] = useState({
    github_username: '',
    portfolio_url: '',
    skills_list: ''
  });
  type Evaluation = {
    skill_level: keyof typeof skillLevels;
    justification: string;
    top_skills: string[];
    improvement_suggestions: {
      title: string;
      description: string;
      estimated_time_hours: number;
      resource: {
        link: string;
        topic: string;
      };
    }[];
    projects?: string[];
    motivation: string;
  };
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  type ProjectComparison = {
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
  };
  const [projectComparison, setProjectComparison] = useState<ProjectComparison | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const skillLevels = {
    'Beginner': { stars: 1, color: 'text-red-500', bgColor: 'bg-red-100', progress: 25, next: 'Intermediate' },
    'Intermediate': { stars: 2, color: 'text-yellow-500', bgColor: 'bg-yellow-100', progress: 50, next: 'Industry-Ready' },
    'Industry-Ready': { stars: 3, color: 'text-blue-500', bgColor: 'bg-blue-100', progress: 75, next: 'Advanced' },
    'Advanced': { stars: 4, color: 'text-green-500', bgColor: 'bg-green-100', progress: 100, next: null }
  };

  const handleCompareProjects = async () => {
    if (selectedProjects.length !== 2) return;
    
    setLoadingComparison(true);
    try {
      const response = await fetch('/api/compare-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_username: formData.github_username,
          project1: selectedProjects[0],
          project2: selectedProjects[1]
        }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setProjectComparison(result);
      }
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.github_username) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/evaluate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate skills');
      }

      const result = await response.json();
      setEvaluation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  type SkillLevelKey = keyof typeof skillLevels;
  const renderProgressBar = (level: keyof typeof skillLevels) => {
    const config = skillLevels[level];
    const progressPercentage = Math.min(config.progress + Math.floor(Math.random() * 20), 100);
    
    return (
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">{level}</span>
          {config.next && (
            <span className="text-sm text-gray-400">
              {progressPercentage}% to {config.next}
            </span>
          )}
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${config.color.replace('text-', 'bg-')}`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  const renderSkillBadges = (skills: any[]) => {
    if (!skills || skills.length === 0) return null;
    
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
          <Award className="w-5 h-5" />
          🔥 Best at:
        </h3>
        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 5).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-200 rounded-full text-sm font-medium border border-purple-500/30"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    );
  };

  const renderProjectSelector = () => {
    if (!evaluation?.projects || evaluation.projects.length < 2) return null;
    
    return (
      <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5" />
          Compare Your Projects
        </h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          {evaluation.projects.map((project, index) => (
            <label key={index} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedProjects.includes(project)}
                onChange={(e) => {
                  if (e.target.checked && selectedProjects.length < 2) {
                    setSelectedProjects([...selectedProjects, project]);
                  } else if (!e.target.checked) {
                    setSelectedProjects(selectedProjects.filter(p => p !== project));
                  }
                }}
                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded"
              />
              <span className="text-white">{project}</span>
            </label>
          ))}
        </div>
        <button
          onClick={handleCompareProjects}
          disabled={selectedProjects.length !== 2 || loadingComparison}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loadingComparison ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Comparing...
            </>
          ) : (
            <>
              <GitBranch className="w-4 h-4" />
              Compare Selected Projects
            </>
          )}
        </button>
      </div>
    );
  };

  const renderSuggestionTips = (suggestion: { title: any; description: any; estimated_time_hours?: number; resource?: { link: string; topic: string; }; }) => {
    const tips = {
      'testing': 'Helps you crack product-based company interviews',
      'responsive': 'Essential for mobile-first development roles',
      'auth': 'Required for most full-stack positions',
      'performance': 'Shows senior-level optimization skills',
      'typescript': 'Increases salary potential by 15-20%',
      'deployment': 'Demonstrates end-to-end project ownership',
      'api': 'Critical for modern web development roles'
    };
    
    const tipKey = Object.keys(tips).find(key => 
      suggestion.title.toLowerCase().includes(key) || 
      suggestion.description.toLowerCase().includes(key)
    );
    
    return tipKey ? (
      <div className="mt-2 flex items-center gap-2 text-sm text-blue-300">
        <Lightbulb className="w-4 h-4" />
        <span>{tips[tipKey as keyof typeof tips]}</span>
      </div>
    ) : null;
  };

  const renderStars = (level: keyof typeof skillLevels) => {
    const config = skillLevels[level];
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${star <= config.stars ? config.color + ' fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${config.bgColor} ${config.color}`}>
          {level}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-4">
              <Code className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Frontend Skill Evaluator</h1>
              <Zap className="w-8 h-8 text-yellow-400" />
            </div>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Analyze your GitHub profile and get personalized feedback on your frontend development skills
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 mb-8 border border-white/20">
            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">
                  <Github className="inline w-4 h-4 mr-2" />
                  GitHub Username *
                </label>
                <input
                  type="text"
                  value={formData.github_username}
                  onChange={(e) => setFormData({...formData, github_username: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="your-github-username"
                  required
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <ExternalLink className="inline w-4 h-4 mr-2" />
                  Portfolio URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://your-portfolio.com"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  <Target className="inline w-4 h-4 mr-2" />
                  Skills You Claim to Have
                </label>
                <textarea
                  value={formData.skills_list}
                  onChange={(e) => setFormData({...formData, skills_list: e.target.value})}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                  placeholder="React, TypeScript, Next.js, Tailwind CSS, Node.js, etc."
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !formData.github_username}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-medium py-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    Evaluate My Skills
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-lg mb-8">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results */}
          {evaluation && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              <div className="space-y-8">
                {/* Skill Level */}
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-4">Your Frontend Skill Level</h2>
                  <div className="flex justify-center mb-4">
                    {renderStars(evaluation.skill_level)}
                  </div>
                  {renderProgressBar(evaluation.skill_level)}
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto mt-4">
                    {evaluation.justification}
                  </p>
                  {renderSkillBadges(evaluation.top_skills)}
                </div>

                {/* Improvement Suggestions */}
                <div>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Suggestions for Improvement
                  </h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    {evaluation.improvement_suggestions.map((suggestion, index) => (
                      <div key={index} className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white text-lg">{suggestion.title}</h4>
                          <div className="flex items-center gap-1 text-purple-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{suggestion.estimated_time_hours}h</span>
                          </div>
                        </div>
                        <p className="text-gray-300 mb-4">{suggestion.description}</p>
                        <a
                          href={suggestion.resource.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {suggestion.resource.topic}
                        </a>
                        {renderSuggestionTips(suggestion)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Project Comparison */}
                {renderProjectSelector()}

                {/* Project Comparison Results */}
                {projectComparison && (
                  <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Project Comparison Results</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-blue-300 mb-2">{projectComparison.project1.name}</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-green-400 font-medium">Strengths:</span>
                            <ul className="text-gray-300 text-sm mt-1">
                              {projectComparison.project1.strengths.map((strength, i) => (
                                <li key={i}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-red-400 font-medium">Weaknesses:</span>
                            <ul className="text-gray-300 text-sm mt-1">
                              {projectComparison.project1.weaknesses.map((weakness, i) => (
                                <li key={i}>• {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-300 mb-2">{projectComparison.project2.name}</h4>
                        <div className="space-y-2">
                          <div>
                            <span className="text-green-400 font-medium">Strengths:</span>
                            <ul className="text-gray-300 text-sm mt-1">
                              {projectComparison.project2.strengths.map((strength, i) => (
                                <li key={i}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-red-400 font-medium">Weaknesses:</span>
                            <ul className="text-gray-300 text-sm mt-1">
                              {projectComparison.project2.weaknesses.map((weakness, i) => (
                                <li key={i}>• {weakness}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                      <span className="text-blue-300 font-medium">Recommendation:</span>
                      <p className="text-gray-300 mt-1">{projectComparison.recommendation}</p>
                    </div>
                  </div>
                )}

                {/* Motivation */}
                <div className="text-center bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-lg font-semibold text-white mb-2">Stay Motivated! 🚀</h3>
                  <p className="text-purple-200 text-xl font-medium italic">
                    "{evaluation.motivation}"
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkillEvaluator;
"use client";
import React, { useState } from 'react';
import { Star, Github, ExternalLink, Clock, Target, TrendingUp, Code, Zap, Award, GitBranch, Lightbulb, CheckCircle2, Users, Eye, Heart, BarChart3 } from 'lucide-react';

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
      purpose: string;
      uniqueness: string;
      tech_stack: string[];
      complexity_score: number;
      key_features: string[];
      strengths: string[];
      weaknesses: string[];
      innovation_level: string;
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
      innovation_level: string;
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
  };
  const [projectComparison, setProjectComparison] = useState<ProjectComparison | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [comparisonProgress, setComparisonProgress] = useState(0);

  const skillLevels = {
    'Beginner': { stars: 1, color: 'text-red-500', bgColor: 'bg-red-100', progress: 25, next: 'Intermediate' },
    'Intermediate': { stars: 2, color: 'text-yellow-500', bgColor: 'bg-yellow-100', progress: 50, next: 'Industry-Ready' },
    'Industry-Ready': { stars: 3, color: 'text-blue-500', bgColor: 'bg-blue-100', progress: 75, next: 'Advanced' },
    'Advanced': { stars: 4, color: 'text-green-500', bgColor: 'bg-green-100', progress: 100, next: null }
  };

  const handleCompareProjects = async () => {
    if (selectedProjects.length !== 2) return;
    
    setLoadingComparison(true);
    setComparisonProgress(0);
    
    // Simulate analysis progress
    const progressInterval = setInterval(() => {
      setComparisonProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
    
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
        setComparisonProgress(100);
        setTimeout(() => {
          setProjectComparison(result);
        }, 500);
      }
    } catch (err) {
      console.error('Comparison failed:', err);
    } finally {
      clearInterval(progressInterval);
      setTimeout(() => {
        setLoadingComparison(false);
        setComparisonProgress(0);
      }, 1000);
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
      <div className="mt-6 bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-6 border border-white/10 backdrop-blur-sm">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <GitBranch className="w-6 h-6 text-blue-400" />
            🔍 AI-Powered Project Analysis
          </h3>
          <p className="text-gray-300 text-sm max-w-2xl mx-auto">
            Our advanced AI analyzes your project's actual code, architecture, and implementation to provide deep insights into purpose, uniqueness, and technical innovation. Select any 2 projects for a comprehensive comparison.
          </p>
        </div>
        
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-white font-medium">Available Projects ({evaluation.projects.length})</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-400">{selectedProjects.length}/2 selected</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {evaluation.projects.map((project, index) => {
              const isSelected = selectedProjects.includes(project);
              const canSelect = selectedProjects.length < 2 || isSelected;
              
              return (
                <label 
                  key={index} 
                  className={`group flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                    isSelected 
                      ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/50 shadow-lg shadow-purple-500/20' 
                      : canSelect
                        ? 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                        : 'bg-gray-500/5 border border-gray-500/10 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={!canSelect}
                      onChange={(e) => {
                        if (e.target.checked && selectedProjects.length < 2) {
                          setSelectedProjects([...selectedProjects, project]);
                        } else if (!e.target.checked) {
                          setSelectedProjects(selectedProjects.filter(p => p !== project));
                        }
                      }}
                      className="w-5 h-5 text-purple-600 bg-transparent border-2 border-gray-400 rounded focus:ring-purple-500 focus:ring-2"
                    />
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-purple-400 absolute inset-0 pointer-events-none" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Github className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                      <span className="text-white font-medium truncate">{project}</span>
                    </div>
                    <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                      {isSelected ? 'Selected for comparison' : canSelect ? 'Click to select' : 'Max 2 projects'}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-1">
                    {isSelected && (
                      <>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-purple-400 font-medium">
                          #{selectedProjects.indexOf(project) + 1}
                        </span>
                      </>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-300">Selection Progress</span>
              <span className="text-sm text-gray-400">
                {selectedProjects.length === 0 ? 'Choose your first project' :
                 selectedProjects.length === 1 ? 'Select one more project' :
                 'Ready to analyze!'}
              </span>
            </div>
            <div className="relative w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 transform"
                style={{ 
                  width: `${(selectedProjects.length / 2) * 100}%`,
                  background: selectedProjects.length === 2 ? 
                    'linear-gradient(90deg, #8b5cf6, #3b82f6, #8b5cf6)' : 
                    'linear-gradient(90deg, #6b7280, #9ca3af)'
                }}
              ></div>
              {selectedProjects.length === 2 && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 opacity-50 animate-pulse"></div>
              )}
            </div>
          </div>
        </div>
        
        {/* Selected Projects Preview */}
        {selectedProjects.length > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Selected for Comparison
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {selectedProjects.map((project, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-blue-400' : 'bg-purple-400'}`}></div>
                  <span className="text-white font-medium">{project}</span>
                  <span className={`text-xs px-2 py-1 rounded ${index === 0 ? 'bg-blue-500/20 text-blue-200' : 'bg-purple-500/20 text-purple-200'}`}>
                    Project {index + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Enhanced CTA Button */}
        <button
          onClick={handleCompareProjects}
          disabled={selectedProjects.length !== 2 || loadingComparison}
          className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-xl transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
        >
          {loadingComparison ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              <div className="flex flex-col items-center gap-2">
                <span>Analyzing projects with AI...</span>
                <div className="w-32 bg-white/20 rounded-full h-1">
                  <div 
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{ width: `${comparisonProgress}%` }}
                  ></div>
                </div>
                <span className="text-xs text-white/70">{Math.round(comparisonProgress)}% complete</span>
              </div>
            </>
          ) : selectedProjects.length === 2 ? (
            <>
              <Zap className="w-5 h-5 group-hover:animate-bounce" />
              <span>🚀 Start Deep Analysis</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 group-hover:animate-pulse"></div>
            </>
          ) : (
            <>
              <GitBranch className="w-5 h-5" />
              <span>Select 2 Projects to Begin</span>
            </>
          )}
        </button>
        
        {/* Analysis Features Preview */}
        <div className="mt-6 grid md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-white/5 rounded-lg">
            <Target className="w-6 h-6 text-blue-400 mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Purpose Analysis</div>
            <div className="text-gray-400 text-xs">Deep dive into project goals</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <Lightbulb className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Innovation Score</div>
            <div className="text-gray-400 text-xs">Technical creativity assessment</div>
          </div>
          <div className="p-3 bg-white/5 rounded-lg">
            <BarChart3 className="w-6 h-6 text-green-400 mx-auto mb-2" />
            <div className="text-white text-sm font-medium">Market Impact</div>
            <div className="text-gray-400 text-xs">Real-world relevance</div>
          </div>
        </div>
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

  const renderProjectMetrics = (project: any, colorScheme: string) => {
    const getScoreColor = (score: number) => {
      if (score >= 8) return 'text-green-400';
      if (score >= 6) return 'text-yellow-400';
      if (score >= 4) return 'text-orange-400';
      return 'text-red-400';
    };

    const getScoreBg = (score: number) => {
      if (score >= 8) return 'bg-green-500';
      if (score >= 6) return 'bg-yellow-500';
      if (score >= 4) return 'bg-orange-500';
      return 'bg-red-500';
    };

    return (
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${getScoreColor(project.complexity_score)}`}>
            {project.complexity_score}
          </div>
          <div className="text-xs text-gray-400">Complexity</div>
          <div className="w-full bg-gray-700 rounded-full h-1 mt-2">
            <div 
              className={`h-1 rounded-full transition-all duration-700 ${getScoreBg(project.complexity_score)}`}
              style={{ width: `${project.complexity_score * 10}%` }}
            ></div>
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className={`text-lg font-bold ${colorScheme}`}>
            {project.innovation_level}
          </div>
          <div className="text-xs text-gray-400">Innovation</div>
          <div className="flex justify-center mt-1">
            {Array.from({ length: 4 }, (_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${
                  i < (project.innovation_level === 'Innovative' ? 4 : 
                       project.innovation_level === 'Advanced' ? 3 : 
                       project.innovation_level === 'Intermediate' ? 2 : 1) 
                    ? colorScheme.replace('text-', 'text-') + ' fill-current' 
                    : 'text-gray-600'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderStrengthsWeaknesses = (strengths: string[], weaknesses: string[], colorScheme: string) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div>
        <h6 className="font-medium text-white mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          Strengths
        </h6>
        <div className="space-y-1">
          {strengths.slice(0, 3).map((strength, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-green-200 text-xs">{strength}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h6 className="font-medium text-white mb-2 flex items-center gap-2">
          <Target className="w-4 h-4 text-yellow-400" />
          Areas to Improve
        </h6>
        <div className="space-y-1">
          {weaknesses.slice(0, 3).map((weakness, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-yellow-200 text-xs">{weakness}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMarketRelevance = (project: any, colorScheme: string) => (
    <div className="bg-white/5 rounded-lg p-3 mb-4">
      <h6 className="font-medium text-white mb-2 flex items-center gap-2">
        <BarChart3 className="w-4 h-4" />
        Market Relevance & UX Quality
      </h6>
      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Market Relevance</span>
            <span className={colorScheme}>High</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">{project.market_relevance}</p>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">User Experience</span>
            <span className={colorScheme}>Quality</span>
          </div>
          <p className="text-gray-400 text-xs mt-1">{project.user_experience_quality}</p>
        </div>
      </div>
    </div>
  );

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
                  <div className="mt-8 space-y-8 animate-fadeIn">
                    {/* Header with enhanced styling */}
                    <div className="text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl"></div>
                      <div className="relative">
                        <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                          🔍 AI-Powered Deep Analysis
                        </h3>
                        <p className="text-gray-300 max-w-2xl mx-auto">
                          Comprehensive comparison analyzing purpose, innovation, technical depth, and market relevance of{' '}
                          <span className="text-blue-400 font-semibold">{projectComparison.project1.name}</span> vs{' '}
                          <span className="text-purple-400 font-semibold">{projectComparison.project2.name}</span>
                        </p>
                      </div>
                    </div>

                    {/* Enhanced Winner Banner */}
                    <div className="relative overflow-hidden bg-gradient-to-r from-green-600/20 via-emerald-500/20 to-green-600/20 rounded-2xl p-8 border border-green-500/30 shadow-lg shadow-green-500/10">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                      <div className="relative flex flex-col md:flex-row items-center justify-center gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <Award className="w-8 h-8 text-green-400" />
                            <div className="absolute inset-0 animate-ping">
                              <Award className="w-8 h-8 text-green-400 opacity-30" />
                            </div>
                          </div>
                          <h4 className="text-2xl font-bold text-green-400">🏆 Winner: {projectComparison.comparison_insights.winner}</h4>
                        </div>
                      </div>
                      <div className="relative bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                        <p className="text-green-100 text-center text-lg leading-relaxed">{projectComparison.comparison_insights.reasoning}</p>
                      </div>
                    </div>

                    {/* Project Details Comparison */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Project 1 */}
                      <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-xl p-6 border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                            <h4 className="text-xl font-bold text-blue-400">{projectComparison.project1.name}</h4>
                          </div>
                          <Github className="w-5 h-5 text-blue-400/70" />
                        </div>
                        
                        {/* Project Metrics */}
                        {renderProjectMetrics(projectComparison.project1, 'text-blue-400')}
                        
                        <div className="space-y-4">
                          {/* Purpose & Uniqueness */}
                          <div className="bg-blue-500/5 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4 text-blue-400" />
                              Purpose & Vision
                            </h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{projectComparison.project1.purpose}</p>
                          </div>
                          
                          <div className="bg-blue-500/5 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              Unique Value Proposition
                            </h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{projectComparison.project1.uniqueness}</p>
                          </div>

                          {/* Tech Stack with better styling */}
                          <div>
                            <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Code className="w-4 h-4 text-blue-400" />
                              Technology Stack
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {projectComparison.project1.tech_stack.map((tech, i) => (
                                <span key={i} className="px-3 py-1.5 bg-blue-500/20 text-blue-200 rounded-full text-xs font-medium hover:bg-blue-500/30 transition-colors">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Key Features with icons */}
                          <div>
                            <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-blue-400" />
                              Key Features
                            </h5>
                            <div className="space-y-2">
                              {projectComparison.project1.key_features.slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                                  <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Strengths & Weaknesses */}
                          {renderStrengthsWeaknesses(projectComparison.project1.strengths, projectComparison.project1.weaknesses, 'text-blue-400')}

                          {/* Market Relevance */}
                          {renderMarketRelevance(projectComparison.project1, 'text-blue-400')}
                        </div>
                      </div>

                      {/* Project 2 */}
                      <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-xl p-6 border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                            <h4 className="text-xl font-bold text-purple-400">{projectComparison.project2.name}</h4>
                          </div>
                          <Github className="w-5 h-5 text-purple-400/70" />
                        </div>
                        
                        {/* Project Metrics */}
                        {renderProjectMetrics(projectComparison.project2, 'text-purple-400')}
                        
                        <div className="space-y-4">
                          {/* Purpose & Uniqueness */}
                          <div className="bg-purple-500/5 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4 text-purple-400" />
                              Purpose & Vision
                            </h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{projectComparison.project2.purpose}</p>
                          </div>
                          
                          <div className="bg-purple-500/5 rounded-lg p-3">
                            <h5 className="font-semibold text-white mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4 text-yellow-400" />
                              Unique Value Proposition
                            </h5>
                            <p className="text-gray-300 text-sm leading-relaxed">{projectComparison.project2.uniqueness}</p>
                          </div>

                          {/* Tech Stack with better styling */}
                          <div>
                            <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Code className="w-4 h-4 text-purple-400" />
                              Technology Stack
                            </h5>
                            <div className="flex flex-wrap gap-2">
                              {projectComparison.project2.tech_stack.map((tech, i) => (
                                <span key={i} className="px-3 py-1.5 bg-purple-500/20 text-purple-200 rounded-full text-xs font-medium hover:bg-purple-500/30 transition-colors">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Key Features with icons */}
                          <div>
                            <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                              <Star className="w-4 h-4 text-purple-400" />
                              Key Features
                            </h5>
                            <div className="space-y-2">
                              {projectComparison.project2.key_features.slice(0, 4).map((feature, i) => (
                                <div key={i} className="flex items-start gap-3 p-2 bg-white/5 rounded-lg">
                                  <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                                  <span className="text-gray-300 text-sm">{feature}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Strengths & Weaknesses */}
                          {renderStrengthsWeaknesses(projectComparison.project2.strengths, projectComparison.project2.weaknesses, 'text-purple-400')}

                          {/* Market Relevance */}
                          {renderMarketRelevance(projectComparison.project2, 'text-purple-400')}
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Detailed Analysis */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-orange-400" />
                          </div>
                          <div>
                            <div className="text-lg">Technical Depth Analysis</div>
                            <div className="text-xs text-orange-300">Code Architecture & Implementation</div>
                          </div>
                        </h4>
                        <div className="bg-orange-500/5 rounded-lg p-4 border border-orange-500/10">
                          <p className="text-gray-300 leading-relaxed">{projectComparison.comparison_insights.technical_depth_comparison}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300">
                        <h4 className="font-bold text-white mb-4 flex items-center gap-3">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <Lightbulb className="w-6 h-6 text-yellow-400" />
                          </div>
                          <div>
                            <div className="text-lg">Innovation Gap Analysis</div>
                            <div className="text-xs text-yellow-300">Creative Solutions & Uniqueness</div>
                          </div>
                        </h4>
                        <div className="bg-yellow-500/5 rounded-lg p-4 border border-yellow-500/10">
                          <p className="text-gray-300 leading-relaxed">{projectComparison.comparison_insights.innovation_gap}</p>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Learning Opportunities */}
                    <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-xl p-8 border border-blue-500/30 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full -translate-y-16 translate-x-16"></div>
                      <h4 className="font-bold text-white mb-6 flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <Lightbulb className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xl">🎯 Key Learning Opportunities</div>
                          <div className="text-sm text-blue-300">Skill development insights from your comparison</div>
                        </div>
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {projectComparison.comparison_insights.learning_opportunities.map((opportunity, i) => (
                          <div key={i} className="flex items-start gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20 hover:bg-blue-500/15 transition-colors">
                            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
                              <CheckCircle2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <span className="text-blue-100 font-medium leading-relaxed">{opportunity}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Enhanced Final Recommendation */}
                    <div className="bg-gradient-to-br from-green-600/20 to-teal-600/20 rounded-xl p-8 border border-green-500/30 relative overflow-hidden">
                      <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-400/10 rounded-full translate-y-20 -translate-x-20"></div>
                      <div className="relative">
                        <h4 className="font-bold text-white mb-6 flex items-center gap-3">
                          <div className="p-3 bg-green-500/20 rounded-xl">
                            <Target className="w-6 h-6 text-green-400" />
                          </div>
                          <div>
                            <div className="text-xl">💡 Expert AI Recommendation</div>
                            <div className="text-sm text-green-300">Personalized advice for your development journey</div>
                          </div>
                        </h4>
                        <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
                          <p className="text-green-100 leading-relaxed text-lg font-medium">{projectComparison.recommendation}</p>
                        </div>
                        
                        {/* Combination Suggestions if available */}
                        {projectComparison.comparison_insights.combination_suggestions && projectComparison.comparison_insights.combination_suggestions.length > 0 && (
                          <div className="mt-6">
                            <h5 className="text-green-400 font-semibold mb-3 flex items-center gap-2">
                              <Heart className="w-4 h-4" />
                              Synergy Opportunities
                            </h5>
                            <div className="space-y-2">
                              {projectComparison.comparison_insights.combination_suggestions.map((suggestion, i) => (
                                <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 rounded-lg">
                                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-green-200 text-sm">{suggestion}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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
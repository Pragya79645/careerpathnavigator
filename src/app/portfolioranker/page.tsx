'use client';

import React, { useState } from 'react';
import { Star, Github, ExternalLink, Clock, Target, TrendingUp, Code, Zap, Award, GitBranch, Lightbulb, CheckCircle, AlertCircle, Filter, Calendar, GitFork, Layers, Eye, Trophy } from 'lucide-react';

// Type definitions
type Suggestion = {
  title: string;
  description: string;
  estimated_time_hours: number;
  resource: { link: string; topic: string };
};

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

type Evaluation = {
  skill_level: 'Beginner' | 'Intermediate' | 'Industry-Ready' | 'Advanced';
  justification: string;
  top_skills: string[];
  improvement_suggestions: Suggestion[];
  projects: string[];
  motivation: string;
  all_projects?: ProjectDetails[];
  frontend_projects?: ProjectDetails[];
  other_projects?: ProjectDetails[];
  score_breakdown?: {
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
  total_score?: number;
  skill_emoji?: string;
};

type ProjectComparison = {
  project1: {
    name: string;
    purpose_and_vision: string;
    unique_value_proposition: string;
    technology_stack: {
      frontend: string[];
      backend: string[];
      database: string[];
      deployment: string[];
      tools: string[];
    };
    key_features: string[];
    strengths: string[];
    areas_to_improve: string[];
    market_relevance: {
      score: number;
      description: string;
      detailed_analysis: {
        market_demand: string;
        target_audience: string;
        competition_analysis: string;
        business_potential: string;
        real_world_applicability: string;
      };
    };
    ux_complexity: {
      score: number;
      description: string;
      detailed_analysis: {
        interface_sophistication: string;
        user_experience_flow: string;
        accessibility: string;
        responsive_design: string;
        interaction_patterns: string;
      };
    };
    technical_depth: {
      score: number;
      analysis: string;
      detailed_analysis: {
        code_architecture: string;
        performance_optimization: string;
        security_implementation: string;
        scalability: string;
        testing_coverage: string;
        code_quality: string;
      };
    };
    innovation_gap: {
      score: number;
      analysis: string;
      detailed_analysis: {
        unique_features: string;
        creative_solutions: string;
        technology_adoption: string;
        problem_solving: string;
        future_proofing: string;
      };
    };
    expert_recommendations: {
      immediate_actions: string[];
      long_term_goals: string[];
      learning_path: string[];
      career_impact: string;
      portfolio_enhancement: string[];
    };
    key_learning_opportunities: {
      skill_development_insights: string[];
      strengths_to_leverage: string[];
      gaps_to_address: string[];
      recommended_resources: string[];
      career_growth_potential: string;
    };
  };
  project2: {
    name: string;
    purpose_and_vision: string;
    unique_value_proposition: string;
    technology_stack: {
      frontend: string[];
      backend: string[];
      database: string[];
      deployment: string[];
      tools: string[];
    };
    key_features: string[];
    strengths: string[];
    areas_to_improve: string[];
    market_relevance: {
      score: number;
      description: string;
      detailed_analysis: {
        market_demand: string;
        target_audience: string;
        competition_analysis: string;
        business_potential: string;
        real_world_applicability: string;
      };
    };
    ux_complexity: {
      score: number;
      description: string;
      detailed_analysis: {
        interface_sophistication: string;
        user_experience_flow: string;
        accessibility: string;
        responsive_design: string;
        interaction_patterns: string;
      };
    };
    technical_depth: {
      score: number;
      analysis: string;
      detailed_analysis: {
        code_architecture: string;
        performance_optimization: string;
        security_implementation: string;
        scalability: string;
        testing_coverage: string;
        code_quality: string;
      };
    };
    innovation_gap: {
      score: number;
      analysis: string;
      detailed_analysis: {
        unique_features: string;
        creative_solutions: string;
        technology_adoption: string;
        problem_solving: string;
        future_proofing: string;
      };
    };
    expert_recommendations: {
      immediate_actions: string[];
      long_term_goals: string[];
      learning_path: string[];
      career_impact: string;
      portfolio_enhancement: string[];
    };
    key_learning_opportunities: {
      skill_development_insights: string[];
      strengths_to_leverage: string[];
      gaps_to_address: string[];
      recommended_resources: string[];
      career_growth_potential: string;
    };
  };
  winner: {
    project_name: string;
    reasoning: string;
    winning_score: number;
  };
  head_to_head_analysis: {
    innovation: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    technical_excellence: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    market_potential: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
    user_experience: {
      project1_analysis: string;
      project2_analysis: string;
      winner: string;
    };
  };
  comparative_learning_opportunities: {
    skill_development_insights: string[];
    cross_project_lessons: string[];
    complementary_strengths: string[];
    skill_gaps_identified: string[];
    recommended_learning_path: string[];
    career_advancement_strategy: string;
  };
  overall_recommendation: string;
};

export default function PortfolioRankerPage() {
  const [formData, setFormData] = useState({
    github_username: '',
    portfolio_url: '',
    skills_list: ''
  });

  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [compareMode, setCompareMode] = useState(false);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [projectComparison, setProjectComparison] = useState<ProjectComparison | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [projectFilter, setProjectFilter] = useState<'all' | 'frontend' | 'other'>('all');

  const skillLevels = {
    'Beginner': { stars: 1, color: 'text-red-500', bgColor: 'bg-red-100', progress: 25, next: 'Intermediate' },
    'Intermediate': { stars: 2, color: 'text-yellow-500', bgColor: 'bg-yellow-100', progress: 50, next: 'Industry-Ready' },
    'Industry-Ready': { stars: 3, color: 'text-blue-500', bgColor: 'bg-blue-100', progress: 75, next: 'Advanced' },
    'Advanced': { stars: 4, color: 'text-green-500', bgColor: 'bg-green-100', progress: 100, next: null }
  };

  const getComplexityColor = (complexity: 'Low' | 'Medium' | 'High') => {
    switch (complexity) {
      case 'Low': return 'text-green-400 bg-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/20';
      case 'High': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredProjects = () => {
    if (!evaluation) return [];
    
    switch (projectFilter) {
      case 'frontend':
        return evaluation.frontend_projects || [];
      case 'other':
        return evaluation.other_projects || [];
      default:
        return evaluation.all_projects || [];
    }
  };

  const handleProjectSelection = (projectName: string) => {
    setSelectedProjects(prev => {
      if (prev.includes(projectName)) {
        return prev.filter(p => p !== projectName);
      } else if (prev.length < 2) {
        return [...prev, projectName];
      } else {
        return [prev[1], projectName]; // Replace the first selected project
      }
    });
  };

  const handleCompareProjects = async () => {
    if (selectedProjects.length !== 2) return;
    
    setLoadingComparison(true);
    setError('');
    
    try {
      const response = await makeAPIRequest('/api/compare-projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_username: formData.github_username,
          project1: selectedProjects[0],
          project2: selectedProjects[1]
        }),
      });
      
      const result = await response!.json();
      setProjectComparison(result);
      setError(''); // Clear any previous errors
    } catch (err) {
      console.error('Comparison failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to compare projects');
    } finally {
      setLoadingComparison(false);
    }
  };

  // Helper function to handle API requests with retry logic
  const makeAPIRequest = async (url: string, options: RequestInit, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, options);
        
        if (response.status === 429) {
          const errorData = await response.json();
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : Math.pow(2, attempt) * 1000;
          
          if (attempt === maxRetries) {
            throw new Error(`Rate limit exceeded. ${errorData.details || 'Please try again later.'}`);
          }
          
          setError(`Rate limited. Retrying in ${Math.ceil(waitTime / 1000)} seconds... (Attempt ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }
        
        return response;
      } catch (err) {
        if (attempt === maxRetries) {
          throw err;
        }
        
        // Exponential backoff for other errors
        const waitTime = Math.pow(2, attempt) * 1000;
        setError(`Request failed. Retrying in ${Math.ceil(waitTime / 1000)} seconds... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  };

  const handleSubmit = async () => {
    if (!formData.github_username) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await makeAPIRequest('/api/evaluate-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response!.json();
      setEvaluation(result);
      setShowAllProjects(true);
      setError(''); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

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

  const renderSkillBadges = (skills: string[]) => {
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

  const renderProjectCard = (project: ProjectDetails, index: number) => {
    const isSelected = selectedProjects.includes(project.name);
    const canSelect = selectedProjects.length < 2 || isSelected;
    
    return (
      <div 
        key={index} 
        className={`bg-white/10 backdrop-blur-md rounded-xl p-6 border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
          isSelected 
            ? 'border-purple-500 ring-2 ring-purple-500/50 bg-purple-500/20' 
            : canSelect 
              ? 'border-white/20 hover:border-purple-400/50' 
              : 'border-gray-600/50 opacity-50 cursor-not-allowed'
        }`}
        onClick={() => canSelect && handleProjectSelection(project.name)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              {project.name}
              {isSelected && <CheckCircle className="w-5 h-5 text-purple-400" />}
            </h3>
            <p className="text-gray-300 text-sm mb-3">{project.description || 'No description provided'}</p>
          </div>
          <div className="flex items-center gap-2">
            {project.homepage && (
              <a 
                href={project.homepage} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
                onClick={(e) => e.stopPropagation()}
                title="Live Demo"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            )}
            <a 
              href={project.html_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              onClick={(e) => e.stopPropagation()}
              title="View Code"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Code className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">{project.language || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-green-400" />
            <span className="text-gray-300">{(project.size_kb / 1024).toFixed(1)} MB</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-gray-300">{project.stars} stars</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <GitFork className="w-4 h-4 text-purple-400" />
            <span className="text-gray-300">{project.forks} forks</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(project.complexity_indicators.estimated_complexity)}`}>
            {project.complexity_indicators.estimated_complexity} Complexity
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${project.is_frontend ? 'text-blue-400 bg-blue-400/20' : 'text-gray-400 bg-gray-400/20'}`}>
            {project.is_frontend ? 'Frontend' : 'Backend/Other'}
          </span>
        </div>
        
        {project.topics && project.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.topics.slice(0, 3).map((topic, topicIndex) => (
              <span key={topicIndex} className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs">
                {topic}
              </span>
            ))}
            {project.topics.length > 3 && (
              <span className="px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                +{project.topics.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>Updated {formatDate(project.updated_at)}</span>
          </div>
        </div>

        {/* Project Quality Indicators */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
          {project.complexity_indicators.has_deployment && (
            <div className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="w-3 h-3" />
              <span>Deployed</span>
            </div>
          )}
          {project.complexity_indicators.has_good_description && (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <CheckCircle className="w-3 h-3" />
              <span>Well Documented</span>
            </div>
          )}
          {!project.complexity_indicators.has_deployment && !project.complexity_indicators.has_good_description && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <AlertCircle className="w-3 h-3" />
              <span>Basic Project</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderScoreBreakdown = () => {
    if (!evaluation?.score_breakdown) return null;

    const getScoreColor = (score: number) => {
      if (score === 0) return 'text-gray-400 bg-gray-400/20';
      if (score === 1) return 'text-red-400 bg-red-400/20';
      if (score === 2) return 'text-yellow-400 bg-yellow-400/20';
      if (score === 3) return 'text-green-400 bg-green-400/20';
      return 'text-gray-400 bg-gray-400/20';
    };

    const getScoreText = (score: number) => {
      if (score === 0) return 'Not Present';
      if (score === 1) return 'Basic';
      if (score === 2) return 'Good';
      if (score === 3) return 'Advanced';
      return 'Unknown';
    };

    const categories = Object.entries(evaluation.score_breakdown);
    
    return (
      <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Detailed Skill Assessment ({evaluation.total_score}/39)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map(([category, score]) => (
            <div key={category} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <span className="text-white font-medium">{category}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(score)}`}>
                  {getScoreText(score)}
                </span>
                <span className="text-purple-300 font-bold">{score}/3</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-semibold">Overall Score</h4>
              <p className="text-gray-300 text-sm">
                {evaluation.total_score! <= 15 ? 'Beginner 🐣' : 
                 evaluation.total_score! <= 25 ? 'Intermediate 🌱' : 
                 evaluation.total_score! <= 35 ? 'Industry-Ready 🚀' : 
                 'Advanced 🧠'}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{evaluation.total_score}/39</div>
              <div className="text-sm text-purple-300">
                {Math.round((evaluation.total_score! / 39) * 100)}% Complete
              </div>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(evaluation.total_score! / 39) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderProjectSelector = () => {
    if (!evaluation?.all_projects || evaluation.all_projects.length < 2) {
      return (
        <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Project Analysis
          </h3>
          <p className="text-gray-300">
            {!evaluation?.all_projects ? 'No projects found.' : 'Need at least 2 projects to enable comparison feature.'}
          </p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Your GitHub Projects ({evaluation.all_projects.length})
          </h3>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-400" />
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value as 'all' | 'frontend' | 'other')}
                className="bg-white/20 border border-white/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Projects ({evaluation.all_projects?.length || 0})</option>
                <option value="frontend">Frontend ({evaluation.frontend_projects?.length || 0})</option>
                <option value="other">Backend/Other ({evaluation.other_projects?.length || 0})</option>
              </select>
            </div>
            
            {selectedProjects.length > 0 && (
              <div className="text-sm text-purple-300">
                {selectedProjects.length}/2 selected
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getFilteredProjects().map((project, index) => renderProjectCard(project, index))}
        </div>
        
        {selectedProjects.length === 2 && (
          <div className="mt-6 text-center">
            <button
              onClick={handleCompareProjects}
              disabled={loadingComparison}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto"
            >
              {loadingComparison ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  Comparing Projects...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Compare Selected Projects
                </>
              )}
            </button>
          </div>
        )}
        
        {selectedProjects.length > 0 && (
          <div className="mt-4 p-4 bg-blue-500/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-300 mb-2">Selected Projects</h4>
            <div className="flex flex-wrap gap-2">
              {selectedProjects.map((project, index) => (
                <span key={index} className="px-3 py-1 bg-blue-500/30 text-blue-200 rounded-full text-sm flex items-center gap-2">
                  {project}
                  <button
                    onClick={() => handleProjectSelection(project)}
                    className="text-blue-200 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="text-blue-200 text-sm mt-2">
              {selectedProjects.length === 1 
                ? 'Select one more project to compare' 
                : selectedProjects.length === 2 
                ? 'Ready to compare! Click the button above.' 
                : 'Select up to 2 projects to compare them.'}
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderSuggestionTips = (suggestion: Suggestion) => {
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
                    <span>
                      {error.includes('Retrying') ? 'Retrying...' : 'Analyzing...'}
                    </span>
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
            <div className={`p-4 rounded-lg mb-8 border ${
              error.includes('Rate limit') || error.includes('rate limit')
                ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200'
                : 'bg-red-500/20 border-red-500/50 text-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {error.includes('Rate limit') || error.includes('rate limit') ? (
                  <Clock className="w-5 h-5 mt-0.5 text-yellow-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 mt-0.5 text-red-400" />
                )}
                <div>
                  <strong>
                    {error.includes('Rate limit') || error.includes('rate limit') 
                      ? 'Rate Limit Notice:' 
                      : 'Error:'
                    }
                  </strong>
                  <p className="mt-1">{error}</p>
                  {(error.includes('Rate limit') || error.includes('rate limit')) && (
                    <p className="mt-2 text-sm opacity-90">
                      💡 Tip: GitHub API has usage limits. This is normal for high-traffic applications. 
                      The system will automatically retry your request.
                    </p>
                  )}
                </div>
              </div>
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
                  {renderScoreBreakdown()}
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
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-white">🏆 Comprehensive Project Comparison</h3>
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-medium">
                          Winner: {projectComparison.winner.project_name}
                        </span>
                      </div>
                    </div>

                    {/* Winner Declaration */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
                      <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                        <Trophy className="w-5 h-5" />
                        Winner: {projectComparison.winner.project_name} ({projectComparison.winner.winning_score}/100)
                      </h4>
                      <p className="text-gray-300 text-sm">{projectComparison.winner.reasoning}</p>
                    </div>

                    {/* Head-to-Head Analysis */}
                    <div className="mb-6 grid grid-cols-1 gap-4">
                      <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <h5 className="font-medium text-blue-300 mb-3">🚀 Innovation Analysis</h5>
                        <div className="space-y-3">
                          <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">{projectComparison.project1.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.innovation.project1_analysis}</p>
                          </div>
                          <div>
                            <p className="text-blue-200 text-sm font-medium mb-1">{projectComparison.project2.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.innovation.project2_analysis}</p>
                          </div>
                          <div className="border-t border-blue-500/20 pt-2">
                            <p className="text-blue-100 text-sm font-medium">Winner: {projectComparison.head_to_head_analysis.innovation.winner}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                        <h5 className="font-medium text-purple-300 mb-3">⚡ Technical Excellence Analysis</h5>
                        <div className="space-y-3">
                          <div>
                            <p className="text-purple-200 text-sm font-medium mb-1">{projectComparison.project1.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.technical_excellence.project1_analysis}</p>
                          </div>
                          <div>
                            <p className="text-purple-200 text-sm font-medium mb-1">{projectComparison.project2.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.technical_excellence.project2_analysis}</p>
                          </div>
                          <div className="border-t border-purple-500/20 pt-2">
                            <p className="text-purple-100 text-sm font-medium">Winner: {projectComparison.head_to_head_analysis.technical_excellence.winner}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                        <h5 className="font-medium text-green-300 mb-3">📈 Market Potential Analysis</h5>
                        <div className="space-y-3">
                          <div>
                            <p className="text-green-200 text-sm font-medium mb-1">{projectComparison.project1.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.market_potential.project1_analysis}</p>
                          </div>
                          <div>
                            <p className="text-green-200 text-sm font-medium mb-1">{projectComparison.project2.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.market_potential.project2_analysis}</p>
                          </div>
                          <div className="border-t border-green-500/20 pt-2">
                            <p className="text-green-100 text-sm font-medium">Winner: {projectComparison.head_to_head_analysis.market_potential.winner}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-pink-500/10 rounded-lg border border-pink-500/20">
                        <h5 className="font-medium text-pink-300 mb-3">🎨 User Experience Analysis</h5>
                        <div className="space-y-3">
                          <div>
                            <p className="text-pink-200 text-sm font-medium mb-1">{projectComparison.project1.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.user_experience.project1_analysis}</p>
                          </div>
                          <div>
                            <p className="text-pink-200 text-sm font-medium mb-1">{projectComparison.project2.name}:</p>
                            <p className="text-gray-300 text-sm">{projectComparison.head_to_head_analysis.user_experience.project2_analysis}</p>
                          </div>
                          <div className="border-t border-pink-500/20 pt-2">
                            <p className="text-pink-100 text-sm font-medium">Winner: {projectComparison.head_to_head_analysis.user_experience.winner}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comparative Learning Opportunities */}
                    <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-lg border border-indigo-500/20">
                      <h4 className="font-medium text-indigo-300 mb-4">🎓 Comparative Learning Opportunities</h4>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium text-indigo-200 mb-2">💡 Skill Development Insights</h5>
                          <ul className="space-y-1">
                            {projectComparison.comparative_learning_opportunities.skill_development_insights.map((insight, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="text-indigo-400 mr-2">•</span>
                                {insight}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium text-indigo-200 mb-2">🔄 Cross-Project Lessons</h5>
                          <ul className="space-y-1">
                            {projectComparison.comparative_learning_opportunities.cross_project_lessons.map((lesson, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="text-indigo-400 mr-2">•</span>
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-indigo-200 mb-2">🤝 Complementary Strengths</h5>
                          <ul className="space-y-1">
                            {projectComparison.comparative_learning_opportunities.complementary_strengths.map((strength, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="text-indigo-400 mr-2">•</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-indigo-200 mb-2">🎯 Skill Gaps Identified</h5>
                          <ul className="space-y-1">
                            {projectComparison.comparative_learning_opportunities.skill_gaps_identified.map((gap, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="text-red-400 mr-2">•</span>
                                {gap}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-medium text-indigo-200 mb-2">📚 Recommended Learning Path</h5>
                          <ul className="space-y-1">
                            {projectComparison.comparative_learning_opportunities.recommended_learning_path.map((path, idx) => (
                              <li key={idx} className="text-gray-300 text-sm flex items-start">
                                <span className="text-green-400 mr-2">•</span>
                                {path}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-indigo-500/20 pt-3">
                          <h5 className="font-medium text-indigo-200 mb-2">🚀 Career Advancement Strategy</h5>
                          <p className="text-gray-300 text-sm">{projectComparison.comparative_learning_opportunities.career_advancement_strategy}</p>
                        </div>
                      </div>
                    </div>

                    {/* Detailed Project Analysis */}
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      {[projectComparison.project1, projectComparison.project2].map((project, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${
                          index === 0 ? 'bg-blue-500/10 border-blue-500/20' : 'bg-purple-500/10 border-purple-500/20'
                        }`}>
                          <h4 className={`font-medium mb-4 ${
                            index === 0 ? 'text-blue-300' : 'text-purple-300'
                          }`}>
                            {project.name}
                            {projectComparison.winner.project_name === project.name && (
                              <span className="ml-2 text-yellow-400">👑</span>
                            )}
                          </h4>

                          {/* Purpose & Vision */}
                          <div className="mb-3">
                            <span className="text-white font-medium text-sm">🎯 Purpose & Vision:</span>
                            <p className="text-gray-300 text-sm mt-1">{project.purpose_and_vision}</p>
                          </div>

                          {/* Unique Value Proposition */}
                          <div className="mb-3">
                            <span className="text-white font-medium text-sm">💎 Unique Value:</span>
                            <p className="text-gray-300 text-sm mt-1">{project.unique_value_proposition}</p>
                          </div>

                          {/* Technology Stack */}
                          <div className="mb-3">
                            <span className="text-white font-medium text-sm">🛠️ Tech Stack:</span>
                            <div className="mt-1 space-y-1">
                              {project.technology_stack.frontend.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">Frontend</span>
                                  {project.technology_stack.frontend.map((tech, i) => (
                                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{tech}</span>
                                  ))}
                                </div>
                              )}
                              {project.technology_stack.backend.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Backend</span>
                                  {project.technology_stack.backend.map((tech, i) => (
                                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{tech}</span>
                                  ))}
                                </div>
                              )}
                              {project.technology_stack.deployment.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">Deploy</span>
                                  {project.technology_stack.deployment.map((tech, i) => (
                                    <span key={i} className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">{tech}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Key Features */}
                          <div className="mb-3">
                            <span className="text-white font-medium text-sm">⚡ Key Features:</span>
                            <ul className="text-gray-300 text-sm mt-1 space-y-1">
                              {project.key_features.slice(0, 3).map((feature, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-green-400 mt-1">•</span>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Scoring */}
                          <div className="grid grid-cols-2 gap-3 mb-3">
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-lg font-bold text-white">{project.market_relevance.score}/10</div>
                              <div className="text-xs text-gray-400">Market Relevance</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-lg font-bold text-white">{project.ux_complexity.score}/10</div>
                              <div className="text-xs text-gray-400">UX Complexity</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-lg font-bold text-white">{project.technical_depth.score}/10</div>
                              <div className="text-xs text-gray-400">Technical Depth</div>
                            </div>
                            <div className="text-center p-2 bg-white/5 rounded">
                              <div className="text-lg font-bold text-white">{project.innovation_gap.score}/10</div>
                              <div className="text-xs text-gray-400">Innovation</div>
                            </div>
                          </div>

                          {/* Strengths & Areas to Improve */}
                          <div className="space-y-2">
                            <div>
                              <span className="text-green-400 font-medium text-sm">✅ Strengths:</span>
                              <ul className="text-gray-300 text-sm mt-1">
                                {project.strengths.slice(0, 2).map((strength, i) => (
                                  <li key={i}>• {strength}</li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <span className="text-red-400 font-medium text-sm">🔧 Areas to Improve:</span>
                              <ul className="text-gray-300 text-sm mt-1">
                                {project.areas_to_improve.slice(0, 2).map((area, i) => (
                                  <li key={i}>• {area}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* Expert Recommendations */}
                          <div className="mt-3 p-3 bg-white/5 rounded">
                            <span className="text-yellow-400 font-medium text-sm">🧠 Expert Recommendations:</span>
                            <div className="mt-2 space-y-1">
                              <div>
                                <span className="text-xs text-blue-300">Immediate Actions:</span>
                                <ul className="text-xs text-gray-400 mt-1">
                                  {project.expert_recommendations.immediate_actions.slice(0, 2).map((action, i) => (
                                    <li key={i}>• {action}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Overall Recommendation */}
                    <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                      <span className="text-blue-300 font-medium">🎯 Overall Recommendation:</span>
                      <p className="text-gray-300 mt-1">{projectComparison.overall_recommendation}</p>
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
}
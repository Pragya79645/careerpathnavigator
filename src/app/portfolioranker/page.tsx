"use client";
import React, { useState } from 'react';
import { Star, Github, ExternalLink, Clock, Target, TrendingUp, Code, Zap } from 'lucide-react';

const SkillEvaluator = () => {
  const [formData, setFormData] = useState({
    github_username: '',
    portfolio_url: '',
    skills_list: ''
  });
  type Evaluation = {
    skill_level: keyof typeof skillLevels;
    justification: string;
    improvement_suggestions: {
      title: string;
      estimated_time_hours: number;
      description: string;
      resource: {
        link: string;
        topic: string;
      };
    }[];
    motivation: string;
  };
  
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const skillLevels = {
    'Beginner': { stars: 1, color: 'text-red-500', bgColor: 'bg-red-100' },
    'Intermediate': { stars: 2, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
    'Industry-Ready': { stars: 3, color: 'text-blue-500', bgColor: 'bg-blue-100' },
    'Advanced': { stars: 4, color: 'text-green-500', bgColor: 'bg-green-100' }
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
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
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
                  <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                    {evaluation.justification}
                  </p>
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
                      </div>
                    ))}
                  </div>
                </div>

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
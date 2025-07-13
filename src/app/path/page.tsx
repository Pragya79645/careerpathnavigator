"use client";
import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, Users, TrendingUp, Zap, Target, Play, Loader2, Coffee, Calendar, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, Star, BarChart3 } from 'lucide-react';

const CareerMentor = () => {
  const [jobRole, setJobRole] = useState('');
  const [userContext, setUserContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [expandedSlots, setExpandedSlots] = useState<Set<number>>(new Set());
  const [animateSchedule, setAnimateSchedule] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [progressPercentage, setProgressPercentage] = useState(0);
  type DaySimulation = {
    schedule: Array<{
      time: string;
      duration: string;
      activity: string;
      description: string;
      tasks: string[];
      intensity: string;
    }>;
    summary?: {
      tech_intensity: string;
      stress_level: string;
      teamwork: string;
      learning_curve: string;
      typical_day_hours: string;
      work_style: string;
      tools?: string[];
    };
  };
  const [daySimulation, setDaySimulation] = useState<DaySimulation | null>(null);
  const [error, setError] = useState('');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Animate schedule when data loads
  useEffect(() => {
    if (daySimulation) {
      setAnimateSchedule(true);
      // Auto-expand first few slots with staggered animation
      setTimeout(() => {
        setExpandedSlots(new Set([0, 1]));
      }, 500);
    }
  }, [daySimulation]);

  // Progress simulation
  useEffect(() => {
    if (daySimulation) {
      const totalTasks = daySimulation.schedule.reduce((acc, slot) => acc + slot.tasks.length, 0);
      const completedCount = completedTasks.size;
      setProgressPercentage((completedCount / totalTasks) * 100);
    }
  }, [completedTasks, daySimulation]);

  // Test function to verify API connectivity
  const testAPI = async () => {
    try {
      const response = await fetch('/api/simulate-workday');
      const data = await response.json();
      console.log('API test result:', data);
      alert('API test successful: ' + JSON.stringify(data));
    } catch (err) {
      console.error('API test failed:', err);
      alert('API test failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const popularRoles = [
    'Software Developer',
    'Data Scientist',
    'Product Manager',
    'UX Designer',
    'Marketing Manager',
    'Financial Analyst',
    'Sales Representative',
    'Human Resources Manager',
    'Graphic Designer',
    'Project Manager'
  ];

  const simulateWorkday = async () => {
    if (!jobRole.trim()) {
      setError('Please enter a job role');
      return;
    }

    setIsLoading(true);
    setError('');
    setDaySimulation(null);

    try {
      const response = await fetch('/api/simulate-workday', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_role: jobRole,
          user_context: userContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDaySimulation(data);
      // Reset interactive states
      setSelectedSlot(null);
      setExpandedSlots(new Set());
      setCompletedTasks(new Set());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate workday simulation. Please try again.';
      setError(errorMessage);
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStressColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getIntensityColor = (level: string) => {
    switch(level?.toLowerCase()) {
      case 'low': return 'text-blue-600 bg-blue-100';
      case 'medium': return 'text-purple-600 bg-purple-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActivityIcon = (activity: string) => {
    const activityLower = activity.toLowerCase();
    if (activityLower.includes('setup') || activityLower.includes('morning')) return <Coffee className="h-5 w-5" />;
    if (activityLower.includes('meeting') || activityLower.includes('collaboration')) return <Users className="h-5 w-5" />;
    if (activityLower.includes('lunch') || activityLower.includes('break')) return <Coffee className="h-5 w-5" />;
    if (activityLower.includes('wrap') || activityLower.includes('planning')) return <CheckCircle2 className="h-5 w-5" />;
    return <Briefcase className="h-5 w-5" />;
  };

  const getIntensityIcon = (intensity: string) => {
    switch(intensity?.toLowerCase()) {
      case 'low': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'high': return <TrendingUp className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Interactive functions
  const toggleSlotExpansion = (index: number) => {
    const newExpanded = new Set(expandedSlots);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSlots(newExpanded);
  };

  const toggleTaskCompletion = (taskId: string) => {
    const newCompleted = new Set(completedTasks);
    if (newCompleted.has(taskId)) {
      newCompleted.delete(taskId);
    } else {
      newCompleted.add(taskId);
    }
    setCompletedTasks(newCompleted);
  };

  const isCurrentTimeSlot = (timeSlot: string) => {
    if (!timeSlot) return false;
    const now = currentTime;
    const currentHour = now.getHours();
    const slotHour = parseInt(timeSlot.split(':')[0]);
    const isAM = timeSlot.includes('AM');
    const adjustedSlotHour = isAM ? (slotHour === 12 ? 0 : slotHour) : (slotHour === 12 ? 12 : slotHour + 12);
    return currentHour === adjustedSlotHour;
  };

  const getTimeProgress = (timeSlot: string, duration: string) => {
    if (!isCurrentTimeSlot(timeSlot)) return 0;
    const now = currentTime;
    const minutes = now.getMinutes();
    const durationMinutes = parseInt(duration.split(' ')[0]) || 60;
    return (minutes / durationMinutes) * 100;
  };

  return (
    <>
      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @keyframes clockTick {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.8), 0 0 30px rgba(99, 102, 241, 0.4); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.6s ease-out 0.2s both;
        }
        
        .animate-pulse-custom {
          animation: pulse 2s infinite;
        }
        
        .animate-clock-tick {
          animation: clockTick 60s linear infinite;
        }
        
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-effect {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.1);
        }
        
        .gradient-border {
          background: linear-gradient(45deg, #ff006e, #8338ec, #3a86ff);
          background-size: 400% 400%;
          animation: gradient 3s ease infinite;
        }
        
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .clock-shadow {
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.1)) drop-shadow(0 6px 12px rgba(0,0,0,0.1));
        }
        
        .segment-hover:hover {
          filter: brightness(1.1) drop-shadow(0 8px 16px rgba(0,0,0,0.2));
          transform: scale(1.02);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-float">
              <Briefcase className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in">
            AI Career Day Simulator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up">
            Experience a realistic, hour-by-hour breakdown of what your typical workday would look like in any career. 
            Get detailed insights into daily tasks, work intensity, and professional requirements.
          </p>
          
          {/* Progress indicator when simulation is active */}
          {daySimulation && (
            <div className="mt-6 max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
                  Day Progress
                </span>
                <span className="font-semibold">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden animate-glow">
                <div 
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out animate-shimmer"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-500 text-center">
                {completedTasks.size} of {daySimulation.schedule.reduce((acc, slot) => acc + slot.tasks.length, 0)} tasks completed
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6">
            <h2 className="text-xl font-bold text-white mb-2">Career Day Simulator</h2>
            <p className="text-indigo-100">Get a detailed breakdown of what your typical workday would look like</p>
          </div>
          
          <div className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Job Role Input */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Briefcase className="h-4 w-4 mr-2 text-indigo-600" />
                    Job Role *
                  </label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="Enter a job role (e.g., Software Developer, Marketing Manager)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* Background Context */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                    <Users className="h-4 w-4 mr-2 text-indigo-600" />
                    Your Background/Interest (Optional)
                  </label>
                  <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="Tell us about your background, interests, or specific aspects you'd like to explore..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none"
                  />
                </div>
              </div>

              {/* Popular Roles */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-3">
                  <Target className="h-4 w-4 mr-2 text-indigo-600" />
                  Popular Roles to Explore:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {popularRoles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => setJobRole(role)}
                      onMouseEnter={() => setHoveredRole(role)}
                      onMouseLeave={() => setHoveredRole(null)}
                      className={`px-3 py-2 bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 rounded-lg text-sm transition-all duration-300 border border-indigo-200 text-center transform hover:scale-105 hover:shadow-md ${
                        hoveredRole === role ? 'from-indigo-100 to-blue-100 border-indigo-300 shadow-lg scale-105' : ''
                      } ${jobRole === role ? 'from-indigo-200 to-blue-200 border-indigo-400 shadow-md' : ''}`}
                    >
                      <div className="flex items-center justify-center">
                        {jobRole === role && <Star className="h-3 w-3 mr-1 text-indigo-600" />}
                        <span className={hoveredRole === role ? 'font-semibold' : ''}>{role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={simulateWorkday}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-md hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] group"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="animate-pulse">Generating Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                      <span>Generate My Work Schedule</span>
                    </>
                  )}
                </button>

                {/* Test Button - smaller and secondary */}
                <button
                  onClick={testAPI}
                  className="sm:w-auto bg-gray-100 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-sm border border-gray-300 hover:border-gray-400 transform hover:scale-105"
                >
                  Test API
                </button>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Simulation Results */}
        {daySimulation && (
          <div className="space-y-8">
            {/* Interactive Clock Display */}
            <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-500 ${animateSchedule ? 'animate-slide-up' : ''}`}>
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <Calendar className="h-6 w-6 mr-2 animate-bounce" />
                  Interactive Work Schedule: {jobRole}
                </h2>
                <p className="text-green-100 mt-1">
                  {daySimulation.schedule.length} scheduled activities • Click around the clock to explore
                </p>
              </div>
              
              <div className="p-8">
                {/* Large Interactive Clock */}
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Clock Container */}
                  <div className="flex-1 flex justify-center items-center">
                    <div className="relative w-96 h-96 max-w-full max-h-full animate-float">
                      {/* Clock Face */}
                      <svg className="w-full h-full transform -rotate-90 clock-shadow" viewBox="0 0 400 400">
                        {/* Outer Ring */}
                        <circle 
                          cx="200" 
                          cy="200" 
                          r="198" 
                          fill="none" 
                          stroke="url(#outerRingGradient)" 
                          strokeWidth="4"
                          className="animate-clock-tick"
                          style={{ animationDuration: '120s' }}
                        />
                        
                        {/* Clock Background */}
                        <circle 
                          cx="200" 
                          cy="200" 
                          r="190" 
                          fill="url(#clockGradient)" 
                          stroke="#e5e7eb" 
                          strokeWidth="2"
                          className="drop-shadow-lg"
                        />
                        
                        {/* Hour markers */}
                        {Array.from({length: 12}, (_, i) => {
                          const angle = (i * 30) * Math.PI / 180;
                          const x1 = 200 + 170 * Math.cos(angle);
                          const y1 = 200 + 170 * Math.sin(angle);
                          const x2 = 200 + 150 * Math.cos(angle);
                          const y2 = 200 + 150 * Math.sin(angle);
                          const isMainHour = i % 3 === 0;
                          return (
                            <line 
                              key={i}
                              x1={x1} y1={y1} x2={x2} y2={y2}
                              stroke={isMainHour ? "#4f46e5" : "#6b7280"}
                              strokeWidth={isMainHour ? "4" : "2"}
                              strokeLinecap="round"
                              className={isMainHour ? "animate-pulse" : ""}
                            />
                          );
                        })}
                        
                        {/* Hour Numbers */}
                        {Array.from({length: 12}, (_, i) => {
                          const hour = i === 0 ? 12 : i;
                          const angle = (i * 30) * Math.PI / 180;
                          const x = 200 + 130 * Math.cos(angle);
                          const y = 200 + 130 * Math.sin(angle);
                          return (
                            <text
                              key={i}
                              x={x}
                              y={y}
                              fill="#4f46e5"
                              fontSize="16"
                              fontWeight="bold"
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${(angle * 180 / Math.PI) + 90}, ${x}, ${y})`}
                              className="font-mono"
                            >
                              {hour}
                            </text>
                          );
                        })}
                        
                        {/* Schedule segments */}
                        {daySimulation.schedule.map((slot, index) => {
                          const startAngle = (index * 360 / daySimulation.schedule.length) * Math.PI / 180;
                          const endAngle = ((index + 1) * 360 / daySimulation.schedule.length) * Math.PI / 180;
                          const isSelected = selectedSlot === index;
                          const isCurrentSlot = isCurrentTimeSlot(slot.time);
                          
                          const segmentColors = [
                            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
                            '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
                            '#ec4899', '#14b8a6', '#f59e0b', '#6366f1'
                          ];
                          
                          const color = isCurrentSlot ? '#22c55e' : 
                                       isSelected ? '#6366f1' : 
                                       segmentColors[index % segmentColors.length];
                          
                          const radius = isSelected ? 115 : isCurrentSlot ? 110 : 105;
                          const opacity = isSelected || isCurrentSlot ? 0.9 : 0.7;
                          
                          // Calculate path for segment
                          const x1 = 200 + radius * Math.cos(startAngle);
                          const y1 = 200 + radius * Math.sin(startAngle);
                          const x2 = 200 + radius * Math.cos(endAngle);
                          const y2 = 200 + radius * Math.sin(endAngle);
                          
                          const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
                          
                          const pathData = [
                            `M 200 200`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`
                          ].join(' ');
                          
                          return (
                            <g key={index}>
                              <path
                                d={pathData}
                                fill={color}
                                opacity={opacity}
                                stroke="white"
                                strokeWidth="3"
                                className="cursor-pointer transition-all duration-500 ease-out segment-hover"
                                onClick={() => setSelectedSlot(selectedSlot === index ? null : index)}
                                style={{
                                  filter: isSelected || isCurrentSlot ? 'drop-shadow(0 6px 12px rgba(0,0,0,0.3)) brightness(1.1)' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                                  transformOrigin: '200px 200px'
                                }}
                              />
                              
                              {/* Activity icon with enhanced styling */}
                              {(() => {
                                const midAngle = startAngle + (endAngle - startAngle) / 2;
                                const iconRadius = 80;
                                const iconX = 200 + iconRadius * Math.cos(midAngle);
                                const iconY = 200 + iconRadius * Math.sin(midAngle);
                                
                                return (
                                  <g transform={`translate(${iconX}, ${iconY}) rotate(${(midAngle * 180 / Math.PI) + 90})`}>
                                    <circle 
                                      cx="0" cy="0" r="18" 
                                      fill="white" 
                                      opacity="0.95"
                                      stroke={color}
                                      strokeWidth="2"
                                      className={`${isCurrentSlot ? 'animate-pulse' : ''} drop-shadow-lg`}
                                    />
                                    <foreignObject x="-10" y="-10" width="20" height="20">
                                      <div className="flex items-center justify-center w-5 h-5 text-gray-700">
                                        {getActivityIcon(slot.activity)}
                                      </div>
                                    </foreignObject>
                                  </g>
                                );
                              })()}
                              
                              {/* Time label with enhanced styling */}
                              {(() => {
                                const midAngle = startAngle + (endAngle - startAngle) / 2;
                                const labelRadius = 140;
                                const labelX = 200 + labelRadius * Math.cos(midAngle);
                                const labelY = 200 + labelRadius * Math.sin(midAngle);
                                
                                return (
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    fill="white"
                                    fontSize="11"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    transform={`rotate(${(midAngle * 180 / Math.PI) + 90}, ${labelX}, ${labelY})`}
                                    className="pointer-events-none drop-shadow-sm font-mono"
                                    style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
                                  >
                                    {slot.time.replace(':00', '')}
                                  </text>
                                );
                              })()}
                            </g>
                          );
                        })}
                        
                        {/* Center circle with enhanced design */}
                        <circle 
                          cx="200" 
                          cy="200" 
                          r="35" 
                          fill="url(#centerGradient)" 
                          stroke="white" 
                          strokeWidth="6"
                          className="drop-shadow-xl animate-glow"
                        />
                        
                        {/* Center logo/icon */}
                        <foreignObject x="185" y="185" width="30" height="30">
                          <div className="flex items-center justify-center w-full h-full">
                            <Briefcase className="h-6 w-6 text-white animate-pulse" />
                          </div>
                        </foreignObject>
                        
                        {/* Current time hand - enhanced */}
                        {(() => {
                          const currentHour = currentTime.getHours() % 12;
                          const currentMinute = currentTime.getMinutes();
                          const hourAngle = ((currentHour + currentMinute / 60) * 30 - 90) * Math.PI / 180;
                          const handX = 200 + 60 * Math.cos(hourAngle);
                          const handY = 200 + 60 * Math.sin(hourAngle);
                          
                          return (
                            <g>
                              <line
                                x1="200" y1="200"
                                x2={handX} y2={handY}
                                stroke="#dc2626"
                                strokeWidth="6"
                                strokeLinecap="round"
                                className="drop-shadow-md"
                                style={{ 
                                  filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                                  animation: 'pulse 2s ease-in-out infinite'
                                }}
                              />
                              <circle 
                                cx="200" 
                                cy="200" 
                                r="8" 
                                fill="#dc2626" 
                                stroke="white"
                                strokeWidth="2"
                                className="drop-shadow-sm animate-pulse"
                              />
                            </g>
                          );
                        })()}
                        
                        {/* Enhanced Gradients */}
                        <defs>
                          <radialGradient id="clockGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="70%" stopColor="#f8fafc" />
                            <stop offset="100%" stopColor="#e2e8f0" />
                          </radialGradient>
                          <radialGradient id="centerGradient" cx="0.5" cy="0.5" r="0.5">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="50%" stopColor="#4f46e5" />
                            <stop offset="100%" stopColor="#3730a3" />
                          </radialGradient>
                          <linearGradient id="outerRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="25%" stopColor="#8b5cf6" />
                            <stop offset="50%" stopColor="#ec4899" />
                            <stop offset="75%" stopColor="#f59e0b" />
                            <stop offset="100%" stopColor="#10b981" />
                          </linearGradient>
                        </defs>
                      </svg>
                      
                      {/* Current time display - enhanced */}
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl px-4 py-2 shadow-xl border-2 border-indigo-100 animate-glow">
                        <div className="text-sm font-bold text-gray-700 flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-indigo-500 animate-pulse" />
                          <span className="font-mono">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          {currentTime.toLocaleDateString([], { weekday: 'long' })}
                        </div>
                      </div>
                      
                      {/* Interactive hints */}
                      {!selectedSlot && (
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-indigo-500 text-white rounded-lg px-3 py-1 text-xs font-medium animate-pulse">
                          Click any segment to explore!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Activity Details Panel */}
                  <div className="flex-1 max-w-md">
                    {selectedSlot !== null && daySimulation.schedule[selectedSlot] ? (
                      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200 h-full shadow-xl animate-fade-in">
                        <div className="space-y-4">
                          {/* Activity header */}
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-3 rounded-xl shadow-lg animate-pulse">
                                {getActivityIcon(daySimulation.schedule[selectedSlot].activity)}
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1">
                                  {daySimulation.schedule[selectedSlot].activity}
                                </h3>
                                <div className="flex items-center space-x-3 text-sm text-gray-600">
                                  <span className="flex items-center font-mono">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {daySimulation.schedule[selectedSlot].time}
                                  </span>
                                  <span>•</span>
                                  <span className="font-medium">{daySimulation.schedule[selectedSlot].duration}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${getIntensityColor(daySimulation.schedule[selectedSlot].intensity)}`}>
                                {daySimulation.schedule[selectedSlot].intensity} Intensity
                              </span>
                              {isCurrentTimeSlot(daySimulation.schedule[selectedSlot].time) && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium animate-pulse">
                                  ACTIVE NOW
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Description */}
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                            <p className="text-gray-700 leading-relaxed">
                              {daySimulation.schedule[selectedSlot].description}
                            </p>
                          </div>
                          
                          {/* Tasks */}
                          <div>
                            <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                              <BarChart3 className="h-5 w-5 mr-2 text-indigo-500" />
                              Key Tasks ({daySimulation.schedule[selectedSlot].tasks.length}):
                            </h4>
                            <div className="space-y-2">
                              {daySimulation.schedule[selectedSlot].tasks.map((task, taskIndex) => {
                                const taskId = `${selectedSlot}-${taskIndex}`;
                                const isCompleted = completedTasks.has(taskId);
                                
                                return (
                                  <div 
                                    key={taskIndex}
                                    className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                                      isCompleted ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-md' : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-200'
                                    }`}
                                    onClick={() => toggleTaskCompletion(taskId)}
                                  >
                                    <div className={`rounded-full p-1 mr-3 transition-all duration-300 ${
                                      isCompleted ? 'bg-green-500 text-white animate-pulse' : 'bg-gray-200 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
                                    }`}>
                                      <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <span className={`text-sm font-medium transition-all duration-300 ${isCompleted ? 'line-through' : ''}`}>
                                      {task}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Progress for this activity */}
                          {(() => {
                            const activityTasks = daySimulation.schedule[selectedSlot].tasks.length;
                            const completedInActivity = daySimulation.schedule[selectedSlot].tasks.filter((_, i) => 
                              completedTasks.has(`${selectedSlot}-${i}`)
                            ).length;
                            const activityProgress = activityTasks > 0 ? (completedInActivity / activityTasks) * 100 : 0;
                            
                            return (
                              <div className="mt-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between text-sm text-gray-600 mb-3">
                                  <span className="font-semibold flex items-center">
                                    <TrendingUp className="h-4 w-4 mr-1 text-indigo-500" />
                                    Activity Progress
                                  </span>
                                  <span className="font-bold text-indigo-600">{Math.round(activityProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out animate-shimmer"
                                    style={{ width: `${activityProgress}%` }}
                                  ></div>
                                </div>
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                  {completedInActivity} of {activityTasks} tasks completed
                                </div>
                              </div>
                            );
                          })()}
                          
                          {/* Time remaining indicator */}
                          {isCurrentTimeSlot(daySimulation.schedule[selectedSlot].time) && (
                            <div className="bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-lg p-3 animate-glow">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">⏰ Currently Active</span>
                                <span className="text-sm font-mono">
                                  {(() => {
                                    const progress = getTimeProgress(daySimulation.schedule[selectedSlot].time, daySimulation.schedule[selectedSlot].duration);
                                    return `${Math.round(progress)}% elapsed`;
                                  })()}
                                </span>
                              </div>
                              <div className="mt-2 w-full bg-white bg-opacity-20 rounded-full h-2">
                                <div 
                                  className="bg-white h-2 rounded-full transition-all duration-1000"
                                  style={{ width: `${getTimeProgress(daySimulation.schedule[selectedSlot].time, daySimulation.schedule[selectedSlot].duration)}%` }}
                                ></div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border-2 border-dashed border-gray-300 h-full flex items-center justify-center animate-float">
                        <div className="text-center">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                            <Clock className="h-10 w-10 text-indigo-500 animate-pulse" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Time Slot</h3>
                          <p className="text-gray-500 leading-relaxed max-w-xs">
                            Click on any colorful segment of the clock to explore detailed information about that part of your workday.
                          </p>
                          <div className="mt-4 inline-flex items-center text-sm text-indigo-600 font-medium">
                            <span className="animate-pulse">👆</span>
                            <span className="ml-2">Click anywhere on the clock!</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Navigation */}
                <div className="mt-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 shadow-lg animate-slide-up">
                  <h4 className="font-bold text-gray-800 mb-4 flex items-center text-lg">
                    <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
                    Quick Navigation Timeline:
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                    {daySimulation.schedule.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedSlot(index)}
                        className={`group relative p-3 rounded-xl text-xs font-medium transition-all duration-300 transform hover:scale-105 ${
                          selectedSlot === index 
                            ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl scale-105' 
                            : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 shadow-sm'
                        } ${isCurrentTimeSlot(slot.time) ? 'ring-4 ring-green-400 ring-opacity-40 animate-glow' : ''}`}
                        style={{
                          animationDelay: `${index * 100}ms`
                        }}
                      >
                        {/* Activity icon */}
                        <div className={`flex items-center justify-center mb-2 p-2 rounded-lg transition-all duration-300 ${
                          selectedSlot === index 
                            ? 'bg-white bg-opacity-20' 
                            : 'bg-gray-100 group-hover:bg-indigo-100'
                        }`}>
                          <div className={`transition-colors duration-300 ${
                            selectedSlot === index ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'
                          }`}>
                            {getActivityIcon(slot.activity)}
                          </div>
                        </div>
                        
                        {/* Time */}
                        <div className={`font-mono font-bold transition-all duration-300 ${
                          selectedSlot === index ? 'text-white' : 'text-gray-700 group-hover:text-indigo-700'
                        }`}>
                          {slot.time.replace(':00', '')}
                        </div>
                        
                        {/* Duration */}
                        <div className={`text-xs mt-1 transition-all duration-300 ${
                          selectedSlot === index ? 'text-white text-opacity-80' : 'text-gray-500 group-hover:text-indigo-500'
                        }`}>
                          {slot.duration}
                        </div>
                        
                        {/* Activity name */}
                        <div className={`text-xs mt-1 font-medium leading-tight transition-all duration-300 ${
                          selectedSlot === index ? 'text-white' : 'text-gray-600 group-hover:text-indigo-600'
                        }`}>
                          {slot.activity.split(' ').slice(0, 2).join(' ')}
                        </div>
                        
                        {/* Current time indicator */}
                        {isCurrentTimeSlot(slot.time) && (
                          <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0.5 rounded-full animate-pulse">
                            LIVE
                          </div>
                        )}
                        
                        {/* Progress indicator */}
                        {(() => {
                          const slotTasks = slot.tasks.length;
                          const completedInSlot = slot.tasks.filter((_, i) => 
                            completedTasks.has(`${index}-${i}`)
                          ).length;
                          const slotProgress = slotTasks > 0 ? (completedInSlot / slotTasks) * 100 : 0;
                          
                          if (slotProgress > 0) {
                            return (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="w-full bg-gray-200 bg-opacity-50 rounded-full h-1">
                                  <div 
                                    className="bg-green-400 h-1 rounded-full transition-all duration-500"
                                    style={{ width: `${slotProgress}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </button>
                    ))}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                      <span>Currently Active</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-indigo-500 mr-1"></div>
                      <span>Selected</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-1 rounded-full bg-green-400 mr-1"></div>
                      <span>Progress Bar</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Scorecard */}
            {daySimulation.summary && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Target className="h-6 w-6 mr-2 animate-spin" style={{animationDuration: '4s'}} />
                    Career Insights & Scorecard
                  </h3>
                  <p className="text-blue-100 mt-1">Key metrics and characteristics for this role</p>
                </div>
                
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tech Intensity */}
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <Zap className="h-5 w-5 text-orange-500 mr-2 group-hover:animate-pulse" />
                        <span className="font-semibold text-gray-800">Tech Intensity</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getIntensityColor(daySimulation.summary.tech_intensity)}`}>
                        {daySimulation.summary.tech_intensity}
                      </span>
                    </div>

                    {/* Stress Level */}
                    <div className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <TrendingUp className="h-5 w-5 text-red-500 mr-2 group-hover:animate-bounce" />
                        <span className="font-semibold text-gray-800">Stress Level</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getStressColor(daySimulation.summary.stress_level)}`}>
                        {daySimulation.summary.stress_level}
                      </span>
                    </div>

                    {/* Teamwork */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <Users className="h-5 w-5 text-blue-500 mr-2 group-hover:animate-pulse" />
                        <span className="font-semibold text-gray-800">Teamwork</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getIntensityColor(daySimulation.summary.teamwork)}`}>
                        {daySimulation.summary.teamwork}
                      </span>
                    </div>

                    {/* Learning Curve */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <Target className="h-5 w-5 text-green-500 mr-2 group-hover:animate-spin" />
                        <span className="font-semibold text-gray-800">Learning Curve</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${getIntensityColor(daySimulation.summary.learning_curve)}`}>
                        {daySimulation.summary.learning_curve}
                      </span>
                    </div>

                    {/* Work Hours */}
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <Clock className="h-5 w-5 text-purple-500 mr-2 group-hover:animate-pulse" />
                        <span className="font-semibold text-gray-800">Typical Hours</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {daySimulation.summary.typical_day_hours}
                      </span>
                    </div>

                    {/* Work Style */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-105 cursor-pointer group">
                      <div className="flex items-center mb-3">
                        <Briefcase className="h-5 w-5 text-indigo-500 mr-2 group-hover:animate-bounce" />
                        <span className="font-semibold text-gray-800">Work Style</span>
                      </div>
                      <span className="text-sm text-gray-700 font-medium">
                        {daySimulation.summary.work_style}
                      </span>
                    </div>
                  </div>

                  {/* Tools */}
                  {daySimulation.summary.tools && daySimulation.summary.tools.length > 0 && (
                    <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200 animate-fade-in">
                      <h4 className="font-bold text-gray-800 mb-4 flex items-center">
                        <Zap className="h-5 w-5 text-indigo-500 mr-2 animate-pulse" />
                        Common Tools & Technologies:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {daySimulation.summary.tools.map((tool, index) => (
                          <span
                            key={index}
                            className="px-3 py-2 bg-white border border-indigo-200 text-indigo-800 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all duration-200 text-center transform hover:scale-105 cursor-pointer shadow-sm hover:shadow-md"
                            style={{
                              animationDelay: `${index * 100}ms`,
                              animation: 'slideInUp 0.4s ease-out forwards'
                            }}
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default CareerMentor;
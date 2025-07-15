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

  // Remove current time update effect since we're not using current time
  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCurrentTime(new Date());
  //   }, 60000);
  //   return () => clearInterval(timer);
  // }, []);

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
    // Remove current time logic - no slot is "current" now
    return false;
  };

  const getTimeProgress = (timeSlot: string, duration: string) => {
    // Remove current time progress logic
    return 0;
  };

  return (
    <>
      {/* Refined CSS Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slideUp 0.5s ease-out 0.1s both;
        }
        
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        
        .animate-shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }
        
        .glass-effect {
          backdrop-filter: blur(12px);
          background: rgba(255, 255, 255, 0.8);
        }
        
        .clock-shadow {
          filter: drop-shadow(0 8px 20px rgba(0,0,0,0.08));
        }
      `}</style>
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2">
      <div className="w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-3 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300 hover:shadow-2xl animate-float">
              <Briefcase className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4 animate-fade-in leading-tight">
            AI Career Day Simulator
          </h1>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto leading-relaxed animate-slide-up font-medium">
            Experience a realistic, hour-by-hour breakdown of what your typical workday would look like in any career. 
            <span className="block text-base text-gray-600 mt-1 font-normal">Get detailed insights into daily tasks, work intensity, and professional requirements.</span>
          </p>
          
          {/* Progress indicator when simulation is active */}
          {daySimulation && (
            <div className="mt-4 max-w-md mx-auto animate-fade-in">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-indigo-500" />
                  Day Progress
                </span>
                <span className="font-semibold">{Math.round(progressPercentage)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden animate-glow">
                <div 
                  className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-500 h-2 rounded-full transition-all duration-1000 ease-out animate-shimmer"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="mt-1 text-xs text-gray-500 text-center">
                {completedTasks.size} of {daySimulation.schedule.reduce((acc, slot) => acc + slot.tasks.length, 0)} tasks completed
              </div>
            </div>
          )}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
            <h2 className="text-lg font-bold text-white mb-1">Career Day Simulator</h2>
            <p className="text-indigo-100 text-sm">Get a detailed breakdown of what your typical workday would look like</p>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Job Role Input */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                    <Briefcase className="h-3 w-3 mr-1 text-indigo-600" />
                    Job Role *
                  </label>
                  <input
                    type="text"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder="Enter a job role (e.g., Software Developer, Marketing Manager)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white text-sm"
                  />
                </div>

                {/* Background Context */}
                <div className="md:col-span-2">
                  <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                    <Users className="h-3 w-3 mr-1 text-indigo-600" />
                    Your Background/Interest (Optional)
                  </label>
                  <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="Tell us about your background, interests, or specific aspects you'd like to explore..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-gray-50 focus:bg-white resize-none text-sm"
                  />
                </div>
              </div>

              {/* Popular Roles */}
              <div>
                <label className="flex items-center text-xs font-semibold text-gray-700 mb-2">
                  <Target className="h-3 w-3 mr-1 text-indigo-600" />
                  Popular Roles to Explore:
                </label>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {popularRoles.map((role, index) => (
                    <button
                      key={index}
                      onClick={() => setJobRole(role)}
                      onMouseEnter={() => setHoveredRole(role)}
                      onMouseLeave={() => setHoveredRole(null)}
                      className={`px-2 py-2 bg-gradient-to-r rounded-lg font-medium transition-all duration-300 border-2 text-center transform hover:scale-105 hover:shadow-lg relative overflow-hidden group text-xs ${
                        jobRole === role 
                          ? 'from-indigo-500 to-purple-600 text-white border-indigo-400 shadow-xl scale-105' 
                          : hoveredRole === role 
                            ? 'from-indigo-100 to-blue-100 text-indigo-700 border-indigo-300 shadow-md scale-105' 
                            : 'from-indigo-50 to-blue-50 text-indigo-700 border-indigo-200 hover:border-indigo-300'
                      }`}
                    >
                      {/* Subtle shimmer effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      
                      <div className="flex items-center justify-center relative z-10">
                        {jobRole === role && <Star className="h-3 w-3 mr-1 animate-pulse" />}
                        <span className={`${hoveredRole === role || jobRole === role ? 'font-semibold' : 'font-medium'}`}>
                          {role}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-200">
                <button
                  onClick={simulateWorkday}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden text-sm"
                >
                  {/* Animated background on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="animate-pulse font-medium">Generating Your Schedule...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform duration-200" />
                      <span>Generate My Work Schedule</span>
                    </>
                  )}
                </button>

                {/* Enhanced Test Button */}
                <button
                  onClick={testAPI}
                  className="sm:w-auto bg-gray-100 text-gray-700 py-2 px-4 rounded-xl font-medium hover:bg-gray-200 transition-all duration-300 border border-gray-300 hover:border-gray-400 transform hover:scale-105 hover:shadow-md text-sm"
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
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Calendar className="h-5 w-5 mr-2 animate-bounce" />
                  Interactive Work Schedule: {jobRole}
                </h2>
                <p className="text-green-100 mt-1 text-sm">
                  {daySimulation.schedule.length} scheduled activities • Click around the clock to explore
                </p>
              </div>
              
              <div className="p-4">
                {/* Full-width layout: Clock | Details | Timeline */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 h-[600px]">
                  {/* Clock Container */}
                  <div className="flex justify-center items-center">
                    <div className="relative w-[420px] h-[420px] max-w-full max-h-full">
                      {/* Clock Face */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 400 400">
                        <defs>
                          {/* Color palette for different times of day */}
                          <linearGradient id="morningColor" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fef3c7" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                          
                          <linearGradient id="midDayColor" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#dbeafe" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                          
                          <linearGradient id="afternoonColor" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#e0e7ff" />
                            <stop offset="100%" stopColor="#6366f1" />
                          </linearGradient>
                        </defs>
                        {/* Clean white background */}
                        <circle 
                          cx="200" 
                          cy="200" 
                          r="190" 
                          fill="#ffffff" 
                          stroke="#f1f5f9" 
                          strokeWidth="2"
                        />
                        
                        {/* Subtle hour markers for 12, 3, 6, 9 */}
                        {[0, 3, 6, 9].map((hour) => {
                          const angle = (hour * 30) * Math.PI / 180;
                          const x1 = 200 + 175 * Math.cos(angle);
                          const y1 = 200 + 175 * Math.sin(angle);
                          const x2 = 200 + 165 * Math.cos(angle);
                          const y2 = 200 + 165 * Math.sin(angle);
                          return (
                            <line 
                              key={hour}
                              x1={x1} y1={y1} x2={x2} y2={y2}
                              stroke="#cbd5e1"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          );
                        })}
                        
                        {/* All hour numbers with working hours emphasized */}
                        {Array.from({length: 12}, (_, i) => {
                          const hour = i === 0 ? 12 : i;
                          const angle = (i * 30) * Math.PI / 180;
                          const x = 200 + 160 * Math.cos(angle);
                          const y = 200 + 160 * Math.sin(angle);
                          
                          // Working hours are 9, 10, 11, 12, 1, 2, 3, 4, 5
                          const isWorkingHour = (hour >= 9 && hour <= 12) || (hour >= 1 && hour <= 5);
                          
                          return (
                            <text
                              key={hour}
                              x={x}
                              y={y}                          fill={isWorkingHour ? "#1e40af" : "#94a3b8"}
                          fontSize="18"
                          fontWeight={isWorkingHour ? "700" : "500"}
                              textAnchor="middle"
                              dominantBaseline="central"
                              transform={`rotate(${(angle * 180 / Math.PI) + 90}, ${x}, ${y})`}
                              className="font-mono"
                            >
                              {hour}
                            </text>
                          );
                        })}
                        
                        {/* Working hours start/end markers */}
                        <circle cx="200" cy="90" r="5" fill="#1e40af" />
                        <circle cx="295.1" cy="295.1" r="5" fill="#1e40af" />
                        
                        {/* Clean labels for working hours */}
                        <text x="200" y="65" fill="#1e40af" fontSize="12" fontWeight="600" textAnchor="middle" transform="rotate(90, 200, 65)" className="font-mono">
                          9 AM
                        </text>
                        <text x="320" y="320" fill="#1e40af" fontSize="12" fontWeight="600" textAnchor="middle" transform="rotate(45, 320, 320)" className="font-mono">
                          5 PM
                        </text>
                        
                        {/* Schedule segments - only 9AM to 5PM */}
                        {daySimulation.schedule.map((slot, index) => {
                          // Convert time to 24-hour format for proper positioning
                          const timeStr = slot.time;
                          let hour = parseInt(timeStr.split(':')[0]);
                          const isAM = timeStr.includes('AM');
                          const isPM = timeStr.includes('PM');
                          
                          // Convert to 24-hour format
                          if (isPM && hour !== 12) hour += 12;
                          if (isAM && hour === 12) hour = 0;
                          
                          // Only show segments for 9AM (9) to 5PM (17)
                          if (hour < 9 || hour > 17) return null;
                          
                          // Calculate angles for 9AM-5PM (8 hour span)
                          // 9AM starts at 270° (top), each hour is 30°
                          const hoursSince9AM = hour - 9;
                          const startAngleDegrees = 270 + (hoursSince9AM * 30);
                          const endAngleDegrees = startAngleDegrees + 30;
                          
                          const startAngle = (startAngleDegrees) * Math.PI / 180;
                          const endAngle = (endAngleDegrees) * Math.PI / 180;
                          
                          const isSelected = selectedSlot === index;
                          
                          // New time-based color system
                          const getTimeBasedColor = (hour: number, intensity: string) => {
                            // Morning hours (9-11 AM): Warm amber/orange tones
                            if (hour >= 9 && hour <= 11) {
                              if (intensity === 'high') return '#ea580c';      // Deep orange
                              if (intensity === 'medium') return '#f59e0b';    // Amber
                              return '#fbbf24';                                // Light amber
                            }
                            
                            // Midday hours (12-2 PM): Blue tones (peak productivity)
                            if (hour >= 12 && hour <= 14) {
                              if (intensity === 'high') return '#1d4ed8';      // Deep blue
                              if (intensity === 'medium') return '#2563eb';    // Blue
                              return '#3b82f6';                                // Light blue
                            }
                            
                            // Afternoon hours (3-5 PM): Purple/indigo tones
                            if (hour >= 15 && hour <= 17) {
                              if (intensity === 'high') return '#4338ca';      // Deep indigo
                              if (intensity === 'medium') return '#6366f1';    // Indigo
                              return '#8b5cf6';                                // Light purple
                            }
                            
                            // Fallback (shouldn't happen for 9-5 schedule)
                            return '#64748b';
                          };
                          
                          const color = isSelected ? '#1e293b' : 
                                       getTimeBasedColor(hour, slot.intensity?.toLowerCase() || 'medium');
                          
                          const radius = isSelected ? 115 : 105;
                          const opacity = isSelected ? 1.0 : 0.85;
                          
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
                                strokeWidth="2"
                                className="cursor-pointer transition-all duration-300 ease-out hover:brightness-110 hover:shadow-lg"
                                onClick={() => setSelectedSlot(selectedSlot === index ? null : index)}
                                style={{
                                  filter: isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                                  transformOrigin: '200px 200px',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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
                                      cx="0" cy="0" r="16" 
                                      fill="white" 
                                      opacity="0.95"
                                      stroke={color}
                                      strokeWidth="2"
                                      className="drop-shadow-lg"
                                    />
                                    <foreignObject x="-8" y="-8" width="16" height="16">
                                      <div className="flex items-center justify-center w-4 h-4 text-gray-700">
                                        {getActivityIcon(slot.activity)}
                                      </div>
                                    </foreignObject>
                                  </g>
                                );
                              })()}
                              
                              {/* Time label with enhanced styling */}
                              {(() => {
                                const midAngle = startAngle + (endAngle - startAngle) / 2;
                                const labelRadius = 130;
                                const labelX = 200 + labelRadius * Math.cos(midAngle);
                                const labelY = 200 + labelRadius * Math.sin(midAngle);
                                
                                return (
                                  <text
                                    x={labelX}
                                    y={labelY}
                                    fill="white"
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    dominantBaseline="central"
                                    transform={`rotate(${(midAngle * 180 / Math.PI) + 90}, ${labelX}, ${labelY})`}
                                    className="pointer-events-none drop-shadow-sm font-mono"
                                    style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}
                                  >
                                    {timeStr.replace(':00', '')}
                                  </text>
                                );
                              })()}
                            </g>
                          );
                        })}
                        
                        {/* Clean Center circle */}
                        <circle 
                          cx="200" 
                          cy="200" 
                          r="28" 
                          fill="#f1f5f9" 
                          stroke="#cbd5e1" 
                          strokeWidth="2"
                        />
                        
                        {/* Simplified center logo */}
                        <foreignObject x="186" y="186" width="28" height="28">
                          <div className="flex items-center justify-center w-full h-full">
                            <Clock className="h-5 w-5 text-slate-600" />
                          </div>
                        </foreignObject>
                      </svg>
                      
                      {/* Improved interactive hints */}
                      {!selectedSlot && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg px-3 py-1 text-xs font-medium shadow-lg border border-gray-200">
                          <div className="flex items-center">
                            <span className="text-sm mr-1">👆</span>
                            Click any work hour segment (9 AM - 5 PM)
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Activity Details Panel */}
                  <div className="overflow-y-auto">
                    {selectedSlot !== null && daySimulation.schedule[selectedSlot] ? (
                      <div className="bg-white rounded-xl p-4 border-2 border-indigo-100 h-full shadow-lg animate-fade-in">
                        <div className="space-y-3">
                          {/* Activity header - compact */}
                          <div className="border-b border-gray-100 pb-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-2 rounded-lg shadow-lg">
                                  {getActivityIcon(daySimulation.schedule[selectedSlot].activity)}
                                </div>
                                <div>
                                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-tight">
                                    {daySimulation.schedule[selectedSlot].activity}
                                  </h3>
                                  <div className="flex items-center space-x-2 text-xs text-gray-600">
                                    <span className="flex items-center font-mono font-semibold">
                                      <Clock className="h-3 w-3 mr-1 text-indigo-500" />
                                      {daySimulation.schedule[selectedSlot].time}
                                    </span>
                                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                    <span className="font-semibold text-indigo-600">{daySimulation.schedule[selectedSlot].duration}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold shadow-md ${getIntensityColor(daySimulation.schedule[selectedSlot].intensity)}`}>
                                  {daySimulation.schedule[selectedSlot].intensity}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Description - compact */}
                          <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-indigo-500">
                            <h4 className="text-xs font-semibold text-gray-900 mb-1">What you'll be doing:</h4>
                            <p className="text-gray-700 leading-relaxed text-xs">
                              {daySimulation.schedule[selectedSlot].description}
                            </p>
                          </div>
                          
                          {/* Tasks - compact */}
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 mb-2 flex items-center">
                              <BarChart3 className="h-3 w-3 mr-1 text-indigo-600" />
                              Tasks ({daySimulation.schedule[selectedSlot].tasks.length}):
                            </h4>
                            <div className="space-y-1">
                              {daySimulation.schedule[selectedSlot].tasks.map((task, taskIndex) => {
                                const taskId = `${selectedSlot}-${taskIndex}`;
                                const isCompleted = completedTasks.has(taskId);
                                
                                return (
                                  <div 
                                    key={taskIndex}
                                    className={`flex items-center p-2 rounded-lg cursor-pointer transition-all duration-300 transform hover:scale-[1.01] border ${
                                      isCompleted 
                                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 shadow-md border-green-200' 
                                        : 'bg-white hover:bg-indigo-50 shadow-sm border-gray-200 hover:border-indigo-300'
                                    }`}
                                    onClick={() => toggleTaskCompletion(taskId)}
                                  >
                                    <div className={`rounded-lg p-1 mr-2 transition-all duration-300 ${
                                      isCompleted 
                                        ? 'bg-green-500 text-white' 
                                        : 'bg-gray-200 text-gray-500 hover:bg-indigo-100 hover:text-indigo-600'
                                    }`}>
                                      <CheckCircle2 className="h-3 w-3" />
                                    </div>
                                    <span className={`text-xs font-medium transition-all duration-300 ${
                                      isCompleted ? 'line-through opacity-75' : ''
                                    }`}>
                                      {task}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* Progress for this activity - more compact */}
                          {(() => {
                            const activityTasks = daySimulation.schedule[selectedSlot].tasks.length;
                            const completedInActivity = daySimulation.schedule[selectedSlot].tasks.filter((_, i) => 
                              completedTasks.has(`${selectedSlot}-${i}`)
                            ).length;
                            const activityProgress = activityTasks > 0 ? (completedInActivity / activityTasks) * 100 : 0;
                            
                            return (
                              <div className="p-3 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 shadow-sm">
                                <div className="flex justify-between text-xs text-gray-600 mb-2">
                                  <span className="font-semibold flex items-center">
                                    <TrendingUp className="h-3 w-3 mr-1 text-indigo-500" />
                                    Progress
                                  </span>
                                  <span className="font-bold text-indigo-600">{Math.round(activityProgress)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className="bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500 h-2 rounded-full transition-all duration-1000 ease-out animate-shimmer"
                                    style={{ width: `${activityProgress}%` }}
                                  ></div>
                                </div>
                                <div className="mt-1 text-xs text-gray-500 text-center">
                                  {completedInActivity} of {activityTasks} completed
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gradient-to-br from-gray-50 to-indigo-50 rounded-xl p-6 border-2 border-dashed border-indigo-200 h-full flex items-center justify-center">
                        <div className="text-center max-w-xs">
                          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center shadow-lg">
                            <Clock className="h-6 w-6 text-indigo-600" />
                          </div>
                          <h3 className="text-base font-bold text-gray-900 mb-2">Select Work Activity</h3>
                          <p className="text-gray-600 leading-relaxed mb-2 text-xs font-medium">
                            Click on any colored segment in the working hours (9 AM - 5 PM) to explore details about that part of your workday.
                          </p>
                          <div className="inline-flex items-center text-indigo-600 font-semibold bg-indigo-50 px-2 py-1 rounded-lg text-xs">
                            <span className="text-xs mr-1">⏰</span>
                            <span>9 AM - 5 PM Schedule</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timeline Panel */}
                  <div className="overflow-y-auto">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3 border-2 border-indigo-100 shadow-lg h-full">
                      <div className="text-center mb-3">
                        <h4 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-center">
                          <Calendar className="h-4 w-4 mr-1 text-indigo-600" />
                          Day Timeline
                        </h4>
                        <p className="text-gray-600 text-xs font-medium">{daySimulation.schedule.length} activities</p>
                      </div>
                      
                      <div className="space-y-2">
                        {daySimulation.schedule.map((slot, index) => {
                          const getProfessionalColor = (index: number, isSelected: boolean) => {
                            if (isSelected) return 'from-indigo-600 to-purple-700 text-white border-indigo-500';
                            
                            const colorGroup = index % 3;
                            if (colorGroup === 0) return 'from-indigo-50 to-indigo-100 text-indigo-700 border-indigo-200 hover:from-indigo-100 hover:to-indigo-200';
                            if (colorGroup === 1) return 'from-blue-50 to-sky-100 text-sky-700 border-sky-200 hover:from-blue-100 hover:to-sky-200';
                            return 'from-emerald-50 to-green-100 text-emerald-700 border-emerald-200 hover:from-emerald-100 hover:to-green-200';
                          };
                          
                          const isActive = isCurrentTimeSlot(slot.time);
                          const isSelected = selectedSlot === index;
                          const colorClasses = getProfessionalColor(index, isSelected);
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedSlot(index)}
                              className={`group relative bg-gradient-to-r ${colorClasses} border rounded-lg p-3 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md w-full text-left ${
                                isSelected ? 'scale-[1.02] shadow-lg ring-2 ring-indigo-200' : 'shadow-sm'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                {/* Activity icon */}
                                <div className={`flex items-center justify-center p-2 rounded-lg transition-all duration-300 ${
                                  isSelected
                                    ? 'bg-white/20 backdrop-blur-sm' 
                                    : 'bg-white/60 group-hover:bg-white/80'
                                }`}>
                                  <div className="transition-transform duration-300 group-hover:scale-110">
                                    {getActivityIcon(slot.activity)}
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  {/* Time */}
                                  <div className={`font-mono font-bold text-sm mb-1 transition-all duration-300`}>
                                    {slot.time.replace(':00', '')}
                                  </div>
                                  
                                  {/* Activity name */}
                                  <div className={`text-xs font-semibold leading-tight transition-all duration-300 truncate`}>
                                    {slot.activity}
                                  </div>
                                  
                                  {/* Duration */}
                                  <div className={`text-xs font-medium opacity-75 mt-1`}>
                                    {slot.duration}
                                  </div>
                                </div>
                                
                                {/* Status indicators */}
                                <div className="flex flex-col gap-1">
                                  {isSelected && (
                                    <div className="bg-white/30 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                                      SEL
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Progress indicator */}
                              {(() => {
                                const slotTasks = slot.tasks.length;
                                const completedInSlot = slot.tasks.filter((_, i) => 
                                  completedTasks.has(`${index}-${i}`)
                                ).length;
                                const slotProgress = slotTasks > 0 ? (completedInSlot / slotTasks) * 100 : 0;
                                
                                if (slotProgress > 0) {
                                  return (
                                    <div className="mt-2">
                                      <div className="w-full bg-black/20 rounded-full h-1">
                                        <div 
                                          className="bg-white h-1 rounded-full transition-all duration-500 shadow-sm"
                                          style={{ width: `${slotProgress}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-center mt-1 opacity-75">
                                        {Math.round(slotProgress)}% done
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })()}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Compact Legend */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-700 bg-white/50 backdrop-blur-sm rounded-lg p-2 border border-white/20">
                        <div className="flex items-center font-medium">
                          <div className="w-2 h-2 rounded-full bg-indigo-600 mr-1"></div>
                          <span>Selected</span>
                        </div>
                        <div className="flex items-center font-medium">
                          <div className="w-2 h-1 rounded-full bg-white mr-1 border border-gray-300"></div>
                          <span>Progress</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Summary Scorecard */}
            {daySimulation.summary && (
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 p-8 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50"></div>
                  <div className="relative z-10">
                    <h3 className="text-3xl font-bold text-white flex items-center mb-2">
                      <Target className="h-8 w-8 mr-3 animate-pulse" />
                      Career Insights & Analytics
                    </h3>
                    <p className="text-blue-100 text-lg">Comprehensive analysis and industry insights for {jobRole}</p>
                    <div className="mt-4 flex items-center space-x-4 text-sm text-blue-200">
                      <span className="flex items-center">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        6 Key Metrics
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        Industry Leaders
                      </span>
                      <span className="flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        Professional Tools
                      </span>
                    </div>
                  </div>
                </div>
                
                
                <div className="p-8 space-y-8">
                  {/* Enhanced Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tech Intensity */}
                    <div className="bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-orange-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-orange-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-pulse">
                              <Zap className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Tech Intensity</h4>
                              <p className="text-orange-600 text-sm font-medium">Technical complexity level</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 ${getIntensityColor(daySimulation.summary.tech_intensity)}`}>
                            {daySimulation.summary.tech_intensity}
                          </span>
                          <div className="text-orange-500 text-2xl font-bold">
                            {daySimulation.summary.tech_intensity === 'High' ? '🔥' : 
                             daySimulation.summary.tech_intensity === 'Medium' ? '⚡' : '💡'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stress Level */}
                    <div className="bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-red-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-bounce">
                              <TrendingUp className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Stress Level</h4>
                              <p className="text-red-600 text-sm font-medium">Work pressure & deadlines</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 ${getStressColor(daySimulation.summary.stress_level)}`}>
                            {daySimulation.summary.stress_level}
                          </span>
                          <div className="text-red-500 text-2xl font-bold">
                            {daySimulation.summary.stress_level === 'High' ? '😰' : 
                             daySimulation.summary.stress_level === 'Medium' ? '😅' : '😌'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Teamwork */}
                    <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 border-2 border-blue-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-pulse">
                              <Users className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Teamwork</h4>
                              <p className="text-blue-600 text-sm font-medium">Collaboration frequency</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 ${getIntensityColor(daySimulation.summary.teamwork)}`}>
                            {daySimulation.summary.teamwork}
                          </span>
                          <div className="text-blue-500 text-2xl font-bold">
                            {daySimulation.summary.teamwork === 'High' ? '🤝' : 
                             daySimulation.summary.teamwork === 'Medium' ? '👥' : '🧑‍💼'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Learning Curve */}
                    <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-green-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-spin">
                              <Target className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Learning Curve</h4>
                              <p className="text-green-600 text-sm font-medium">Skill development time</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className={`px-4 py-2 rounded-xl text-sm font-bold shadow-lg transition-all duration-200 ${getIntensityColor(daySimulation.summary.learning_curve)}`}>
                            {daySimulation.summary.learning_curve}
                          </span>
                          <div className="text-green-500 text-2xl font-bold">
                            {daySimulation.summary.learning_curve === 'High' ? '📚' : 
                             daySimulation.summary.learning_curve === 'Medium' ? '📖' : '📝'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Work Hours */}
                    <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-purple-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-pulse">
                              <Clock className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Work Schedule</h4>
                              <p className="text-purple-600 text-sm font-medium">Daily time commitment</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-bold bg-purple-100 px-4 py-2 rounded-xl shadow-lg">
                            {daySimulation.summary.typical_day_hours}
                          </span>
                          <div className="text-purple-500 text-2xl font-bold">⏰</div>
                        </div>
                      </div>
                    </div>

                    {/* Work Style */}
                    <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-50 border-2 border-indigo-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-500 transform hover:scale-105 cursor-pointer group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/30 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-indigo-500 text-white p-3 rounded-xl shadow-lg group-hover:animate-bounce">
                              <Briefcase className="h-6 w-6" />
                            </div>
                            <div className="ml-3">
                              <h4 className="font-bold text-gray-800 text-lg">Work Style</h4>
                              <p className="text-indigo-600 text-sm font-medium">Professional approach</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-700 font-bold bg-indigo-100 px-4 py-2 rounded-xl shadow-lg text-center">
                            {daySimulation.summary.work_style}
                          </span>
                          <div className="text-indigo-500 text-2xl font-bold">💼</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Famous Personalities Section */}
                  <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
                    <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                      <Users className="h-7 w-7 text-indigo-600 mr-3" />
                      Industry Leaders & Famous Personalities
                      <span className="ml-3 text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                        Click to explore
                      </span>
                    </h4>
                    <p className="text-gray-600 mb-6 text-lg">
                      Learn from successful professionals who have excelled in {jobRole.toLowerCase()} roles
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(() => {
                        // Define famous personalities for different job roles
                        type Personality = {
                          name: string;
                          role: string;
                          company: string;
                          expertise: string;
                        };
                        
                        const getFamousPersonalities = (role: string): Personality[] => {
                          const roleKey = role.toLowerCase();
                          const personalities: Record<string, Personality[]> = {
                            'software developer': [
                              { name: 'Linus Torvalds', role: 'Creator of Linux', company: 'Linux Foundation', expertise: 'Operating Systems' },
                              { name: 'John Carmack', role: 'Game Programming Pioneer', company: 'id Software', expertise: 'Game Development' },
                              { name: 'Margaret Hamilton', role: 'Apollo Software Engineer', company: 'NASA', expertise: 'Mission-Critical Software' }
                            ],
                            'data scientist': [
                              { name: 'Andrew Ng', role: 'AI/ML Pioneer', company: 'Stanford/Coursera', expertise: 'Machine Learning' },
                              { name: 'Hilary Mason', role: 'Data Science Leader', company: 'Founder of Fast Forward Labs', expertise: 'Applied Data Science' },
                              { name: 'Fei-Fei Li', role: 'Computer Vision Expert', company: 'Stanford AI Lab', expertise: 'Computer Vision' }
                            ],
                            'product manager': [
                              { name: 'Marissa Mayer', role: 'Former CEO Yahoo', company: 'Google/Yahoo', expertise: 'Product Strategy' },
                              { name: 'Ken Norton', role: 'Product Management Guru', company: 'Google Ventures', expertise: 'Product Leadership' },
                              { name: 'Julie Zhou', role: 'Design Executive', company: 'Facebook/Meta', expertise: 'Product Design' }
                            ],
                            'ux designer': [
                              { name: 'Don Norman', role: 'Design Thinking Pioneer', company: 'Author/Consultant', expertise: 'User-Centered Design' },
                              { name: 'Alan Cooper', role: 'Interaction Design Father', company: 'Cooper Design', expertise: 'Interaction Design' },
                              { name: 'Jared Spool', role: 'UX Research Expert', company: 'UIE', expertise: 'User Research' }
                            ],
                            'marketing manager': [
                              { name: 'Seth Godin', role: 'Marketing Visionary', company: 'Author/Speaker', expertise: 'Permission Marketing' },
                              { name: 'Ann Handley', role: 'Content Marketing Pioneer', company: 'MarketingProfs', expertise: 'Content Strategy' },
                              { name: 'Gary Vaynerchuk', role: 'Digital Marketing Leader', company: 'VaynerMedia', expertise: 'Social Media Marketing' }
                            ],
                            'financial analyst': [
                              { name: 'Warren Buffett', role: 'Investment Legend', company: 'Berkshire Hathaway', expertise: 'Value Investing' },
                              { name: 'Mary Meeker', role: 'Internet Analyst', company: 'Bond Capital', expertise: 'Tech Investment Analysis' },
                              { name: 'Ray Dalio', role: 'Hedge Fund Founder', company: 'Bridgewater Associates', expertise: 'Economic Analysis' }
                            ],
                            'sales representative': [
                              { name: 'Zig Ziglar', role: 'Sales Training Legend', company: 'Ziglar Inc.', expertise: 'Sales Psychology' },
                              { name: 'Brian Tracy', role: 'Sales Expert', company: 'Brian Tracy International', expertise: 'Sales Methodology' },
                              { name: 'Jill Konrath', role: 'B2B Sales Expert', company: 'Author/Speaker', expertise: 'Modern Sales Techniques' }
                            ],
                            'human resources manager': [
                              { name: 'Dave Ulrich', role: 'HR Thought Leader', company: 'University of Michigan', expertise: 'Strategic HR' },
                              { name: 'Laszlo Bock', role: 'People Operations Pioneer', company: 'Former Google CHRO', expertise: 'People Analytics' },
                              { name: 'Patty McCord', role: 'Culture Expert', company: 'Former Netflix CPO', expertise: 'Corporate Culture' }
                            ],
                            'graphic designer': [
                              { name: 'Paula Scher', role: 'Graphic Design Icon', company: 'Pentagram', expertise: 'Brand Identity' },
                              { name: 'David Carson', role: 'Typography Pioneer', company: 'David Carson Design', expertise: 'Experimental Typography' },
                              { name: 'Jessica Hische', role: 'Lettering Artist', company: 'Freelance', expertise: 'Typography & Lettering' }
                            ],
                            'project manager': [
                              { name: 'Harold Kerzner', role: 'Project Management Author', company: 'Baldwin Wallace University', expertise: 'PM Methodology' },
                              { name: 'Rita Mulcahy', role: 'PMP Training Pioneer', company: 'RMC Learning Solutions', expertise: 'PMP Certification' },
                              { name: 'Elizabeth Harrin', role: 'PM Thought Leader', company: 'Author/Speaker', expertise: 'Modern PM Practices' }
                            ]
                          };
                          
                          // Return personalities for the role or default ones
                          return personalities[roleKey] || [
                            { name: 'Steve Jobs', role: 'Visionary Leader', company: 'Apple', expertise: 'Innovation & Leadership' },
                            { name: 'Oprah Winfrey', role: 'Media Mogul', company: 'OWN Network', expertise: 'Communication & Leadership' },
                            { name: 'Elon Musk', role: 'Entrepreneur', company: 'Tesla/SpaceX', expertise: 'Innovation & Disruption' }
                          ];
                        };
                        
                        const personalities = getFamousPersonalities(jobRole);
                        
                        return personalities.map((person: Personality, index: number) => (
                          <div 
                            key={index}
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(person.name + ' ' + person.role + ' ' + person.company)}`, '_blank')}
                            className="bg-white rounded-xl p-6 border-2 border-gray-200 hover:border-indigo-300 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl group"
                          >
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                  {person.name.split(' ').map((n: string) => n[0]).join('')}
                                </div>
                                <div className="ml-4">
                                  <h5 className="font-bold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors duration-300">
                                    {person.name}
                                  </h5>
                                  <p className="text-gray-600 text-sm font-medium">{person.role}</p>
                                </div>
                              </div>
                              <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600 font-medium">{person.company}</span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Target className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-gray-600 font-medium">{person.expertise}</span>
                              </div>
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Click to learn more</span>
                                <div className="flex items-center text-xs text-indigo-600 font-medium group-hover:text-indigo-700">
                                  <span>Google Search</span>
                                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>

                  {/* Enhanced Tools Section */}
                  {daySimulation.summary.tools && daySimulation.summary.tools.length > 0 && (
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-indigo-200">
                      <h4 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                        <Zap className="h-7 w-7 text-indigo-600 mr-3 animate-pulse" />
                        Professional Tools & Technologies
                        <span className="ml-3 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                          {daySimulation.summary.tools.length} tools
                        </span>
                      </h4>
                      <p className="text-gray-600 mb-6 text-lg">
                        Essential software, platforms, and technologies used daily in {jobRole.toLowerCase()} positions
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {daySimulation.summary.tools.map((tool: string, index: number) => (
                          <div
                            key={index}
                            onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(tool + ' software tool tutorial')}`, '_blank')}
                            className="group bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-800 rounded-xl p-4 text-center font-medium hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg hover:shadow-xl"
                            style={{
                              animationDelay: `${index * 100}ms`,
                            }}
                          >
                            <div className="flex flex-col items-center space-y-3">
                              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition-transform duration-300">
                                {tool.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors duration-300 text-sm">
                                  {tool}
                                </h5>
                                <p className="text-xs text-gray-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  Click to learn more
                                </p>
                              </div>
                              <div className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Learning Resources Section */}
                      <div className="mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                        <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                          <Target className="h-5 w-5 text-purple-600 mr-2" />
                          Recommended Learning Paths
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button 
                            onClick={() => window.open(`https://www.coursera.org/search?query=${encodeURIComponent(jobRole)}`, '_blank')}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <span>📚</span>
                            <span>Coursera Courses</span>
                          </button>
                          <button 
                            onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(jobRole + ' tutorials')}`, '_blank')}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <span>🎥</span>
                            <span>YouTube Tutorials</span>
                          </button>
                          <button 
                            onClick={() => window.open(`https://www.linkedin.com/learning/search?keywords=${encodeURIComponent(jobRole)}`, '_blank')}
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-4 py-3 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                          >
                            <span>💼</span>
                            <span>LinkedIn Learning</span>
                          </button>
                        </div>
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
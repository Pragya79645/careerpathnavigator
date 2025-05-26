'use client';

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { ArrowDownCircle, BookOpen, Clock, Search, ChevronRight, 
         BookMarked, Award, Briefcase, Sparkles } from "lucide-react";

export default function TargetCompanyRoadmap() {
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [error, setError] = useState(null);
  const roadmapRef = useRef(null);
  const [estimatedReadTime, setEstimatedReadTime] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate reading time when roadmap changes
  useEffect(() => {
    if (roadmap) {
      const words = roadmap.trim().split(/\s+/).length;
      const minutes = Math.ceil(words / 200);
      setEstimatedReadTime(`${minutes} min read`);
    }
  }, [roadmap]);

  const handleSubmit = async () => {
    if (!company || !role) {
      return alert('Please fill in all fields');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/company-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, role }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate roadmap');
      }

      const data = await res.json();
      setRoadmap(data.roadmap);
      
      // Set the first section as active by default
      const firstSectionMatch = data.roadmap.match(/## \d+\.\s*(.*)/);
      if (firstSectionMatch && firstSectionMatch[1]) {
        setActiveSection(firstSectionMatch[1].trim());
      }
      
      // Scroll to results
      setTimeout(() => {
        if (roadmapRef.current) {
          roadmapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    } catch (error) {
      console.error('Error details:', error);
      setError('Sorry, we could not generate a roadmap. Please check your internet connection and try again later.');
      setRoadmap('');
    } finally {
      setLoading(false);
    }
  };

  // Extract table of contents from the markdown
  const tableOfContents = roadmap
    ? roadmap
        .split('\n')
        .filter(line => line.match(/^## \d+\./))
        .map(line => {
          const match = line.match(/## \d+\.\s*(.*)/);
          return match ? match[1].trim() : '';
        })
    : [];

  const scrollToSection = (section) => {
    setActiveSection(section);
    if (typeof section === 'string') {
      const element = document.getElementById(section.replace(/\s+/g, '-').toLowerCase());
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Custom renderer for ReactMarkdown
  const customRenderers = {
    h2: (({ children }) => {
      const text = children ? children.toString() : '';
      const match = text.match(/\d+\.\s*(.*)/);
      const sectionTitle = match ? match[1] : text;
      const id = sectionTitle.replace(/\s+/g, '-').toLowerCase();
      
      return (
        <h2 
          id={id} 
          className="text-2xl font-bold text-indigo-700 mt-10 mb-6 pb-3 border-b border-indigo-100"
        >
          {text}
        </h2>
      );
    }),
    ul: (({ children }) => (
      <ul className="list-disc ml-6 my-5 space-y-3">
        {children}
      </ul>
    )),
    li: (({ children }: { children: React.ReactNode }) => (
      <li className="text-gray-700">{children}</li>
    )),
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-500 to-teal-500 text-white py-16 w-full mt-11">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="md:w-2/3 space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold">
                Land Your <span className="text-indigo-200">Dream Role</span>
              </h1>
              <p className="text-xl text-indigo-100 leading-relaxed">
                Get a personalized roadmap with actionable steps to help you secure your ideal position at top companies.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-indigo-200" />
                  <span className="text-indigo-100">Expert Insights</span>
                </div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 mr-2 text-indigo-200" />
                  <span className="text-indigo-100">Tailored Steps</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/3 mt-8 md:mt-0 flex justify-center md:justify-end">
              <div className="relative w-48 h-48 md:w-56 md:h-56">
                <div className="absolute inset-0 bg-indigo-400 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute inset-4 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 shadow-xl"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Briefcase className="h-14 w-14 md:h-16 md:w-16 text-white/80" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-100">
        <span className="bg-gradient-to-r from-purple-400 via-teal-400 to-blue-500 bg-clip-text text-transparent font-bold text-2xl mb-2">
                 Generate Your Career Roadmap
                </span>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label htmlFor="company" className="flex items-center text-gray-700 font-medium">
                <Search className="h-4 w-4 mr-2 text-indigo-500" />
                Target Company
              </label>
              <input
                id="company"
                className="w-full p-3.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., Google, Microsoft, Amazon"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label htmlFor="role" className="flex items-center text-gray-700 font-medium">
                <BookMarked className="h-4 w-4 mr-2 text-indigo-500" />
                Target Role
              </label>
              <input
                id="role"
                className="w-full p-3.5 text-gray-700 bg-gray-50 border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-all"
                placeholder="e.g., Software Engineer, Product Manager"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !company.trim() || !role.trim()}
            className="mt-6 px-6 py-2 font-medium bg-indigo-400 text-white w-fit transition-all shadow-[3px_3px_0px_black] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Your Roadmap...
              </>
            ) : (
              <>
                <ArrowDownCircle className="mr-2 h-5 w-5" />
                Generate Career Roadmap
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg text-red-700">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Roadmap Results */}
      {roadmap && (
        <div ref={roadmapRef} className="container mx-auto px-4 md:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {role} at {company}
                  </h2>
                  <div className="flex items-center flex-wrap gap-4 text-white/80 text-sm mt-2">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{estimatedReadTime}</span>
                    </div>
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{tableOfContents.length} sections</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={toggleSidebar} 
                  className="md:hidden mt-4 md:mt-0 bg-white/20 hover:bg-white/30 text-white rounded-lg py-1.5 px-3 text-sm flex items-center transition-colors"
                >
                  <ChevronRight className={`h-4 w-4 mr-1.5 transition-transform ${sidebarOpen ? 'rotate-90' : ''}`} />
                  {sidebarOpen ? 'Hide' : 'Show'} Sections
                </button>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex flex-col md:flex-row">
              {/* Table of Contents Sidebar */}
              <div 
                className={`${
                  sidebarOpen ? 'block' : 'hidden'
                } md:block md:w-72 bg-gray-50 p-5 md:p-6 md:shrink-0 border-r border-gray-100`}
              >
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Contents</h3>
                <nav className="space-y-2">
                  {tableOfContents.map((section, index) => (
                    <button
                      key={index}
                      onClick={() => scrollToSection(section)}
                      className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                        activeSection === section
                          ? 'bg-indigo-100 text-indigo-800 font-medium shadow-sm'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-indigo-600'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="inline-flex h-6 w-6 bg-indigo-100 rounded-full text-indigo-600 text-xs font-semibold items-center justify-center mr-2">
                          {index + 1}
                        </span>
                        <span className="truncate">{section}</span>
                      </div>
                    </button>
                  ))}
                </nav>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto">
                <div className="prose prose-indigo prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-headings:text-indigo-900 prose-a:text-indigo-600 max-w-none">
                  <ReactMarkdown components={customRenderers}>{roadmap}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8 mt-10 md:mt-20 w-full">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>© 2025 PathPILOT. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
// File: src/components/RoadmapDisplay.tsx
import { useState } from 'react';
import { RoadmapData, SkillCategory } from '../types';

interface RoadmapDisplayProps {
  data: RoadmapData;
}

const RoadmapDisplay: React.FC<RoadmapDisplayProps> = ({ data }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'resources' | 'timeline'>('overview');

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
        <h2 className="text-2xl font-bold text-blue-800">
          {data.role} at {data.company}
        </h2>
      </div>
      
      <div className="border-b border-gray-200">
        <nav className="flex" aria-label="Tabs">
          {['overview', 'skills', 'resources', 'timeline'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`
                px-4 py-3 text-sm font-medium
                ${activeTab === tab 
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'}
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-6">
        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-700 mb-4">{data.overview}</p>
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="text-sm text-yellow-700">
                Company Culture Fit: {data.cultureFit}
              </p>
            </div>
          </div>
        )}
        
        {activeTab === 'skills' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Required Skills</h3>
            
            {data.skills.map((category: SkillCategory, index: number) => (
              <div key={index} className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-2">
                  {category.category}
                </h4>
                <ul className="space-y-2">
                  {category.items.map((skill, skillIndex) => (
                    <li key={skillIndex} className="bg-gray-50 p-3 rounded-md">
                      <div className="font-medium">{skill.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{skill.description}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Resources</h3>
            
            <div className="space-y-4">
              {data.resources.map((resource, index) => (
                <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium">{resource.title}</h4>
                  <p className="text-sm text-gray-600 mb-1">{resource.description}</p>
                  <div className="text-sm font-medium text-blue-600">
                    Type: {resource.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'timeline' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Suggested Timeline</h3>
            
            <div className="relative">
              {data.timeline.map((item, index) => (
                <div key={index} className="mb-8 flex">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <h4 className="text-md font-medium">
                      {item.phase} - {item.duration}
                    </h4>
                    <p className="text-gray-700 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoadmapDisplay;
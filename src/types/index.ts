// File: src/types/index.ts
export interface Skill {
    name: string;
    description: string;
    importance: 'high' | 'medium' | 'low';
  }
  
  export interface SkillCategory {
    category: string;
    items: Skill[];
  }
  
  export interface Resource {
    title: string;
    description: string;
    type: 'Book' | 'Course' | 'Tutorial' | 'Documentation' | 'Other';
    url?: string;
  }
  
  export interface TimelineItem {
    phase: string;
    duration: string;
    description: string;
  }
  
  export interface RoadmapData {
    company: string;
    role: string;
    overview: string;
    cultureFit: string;
    skills: SkillCategory[];
    resources: Resource[];
    timeline: TimelineItem[];
  }
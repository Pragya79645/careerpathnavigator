// utils/analyzeCareer.ts
export const analyzeCareer = async (resumeData: any) => {
    try {
      const res = await fetch('/api/career-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumeData }),
      });
  
      if (!res.ok) {
        throw new Error('Failed to analyze career paths');
      }
  
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error analyzing career paths:', error);
      throw error;
    }
  };
// Test script for failure analysis API
// Run this with: node test-api.js

const testResumeText = `John Doe
Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Frontend Developer | TechCorp | 2021 - Present
• Developed web applications using React
• Worked with team members
• Built user interfaces

EDUCATION
BS Computer Science | University | 2021

SKILLS
JavaScript, React, HTML, CSS`;

const testData = {
  resume_text: testResumeText,
  interview_feedback: "Had trouble explaining technical concepts clearly",
  test_performance: "Struggled with algorithmic problems",
  target_role: "Senior Frontend Developer"
};

async function testAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/failure-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return;
    }

    const result = await response.json();
    console.log('API Success!');
    console.log('Analysis:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAPI();

// Test script for evaluate-skills API
// Run this with: node test-api.js

const testData = {
  github_username: 'octocat', // GitHub's official test account
  portfolio_url: 'https://github.com/octocat',
  skills_list: 'JavaScript, React, Node.js'
};

async function testAPI() {
  try {
    console.log('🧪 Testing evaluate-skills API...');
    
    const response = await fetch('http://localhost:3000/api/evaluate-skills', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ API Response:', {
      skill_level: result.skill_level,
      total_score: result.total_score,
      frontend_projects_count: result.frontend_projects?.length || 0,
      all_projects_count: result.all_projects?.length || 0,
      has_error: !!result.error
    });

    if (result.error) {
      console.error('❌ API returned error:', result.error);
    } else {
      console.log('✅ API test successful!');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();

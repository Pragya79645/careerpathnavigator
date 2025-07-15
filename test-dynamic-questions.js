// Test script to verify dynamic question generation
// Run this with: node test-dynamic-questions.js

const testDynamicQuestions = async () => {
  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Company-specific questions (Amazon)
  console.log('🏢 Testing Company-specific questions (Amazon)...');
  const companyTest = {
    role: 'Software Engineer',
    questionType: 'technical',
    company: 'Amazon',
    mode: 'flashcard'
  };
  
  try {
    const response1 = await fetch(`${baseUrl}/api/interview-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(companyTest)
    });
    
    const data1 = await response1.json();
    console.log('✅ Company-specific test result:');
    console.log('- Mode:', data1.mode);
    console.log('- Company:', data1.company);
    console.log('- Question count:', data1.questions?.length || 0);
    console.log('- Sample question:', data1.questions?.[0]?.question || 'N/A');
    console.log('- Display mode:', data1.displayMode);
    console.log('');
  } catch (error) {
    console.error('❌ Company-specific test failed:', error.message);
  }
  
  // Test 2: General questions (no company)
  console.log('🌍 Testing General questions (no company)...');
  const generalTest = {
    role: 'Software Engineer',
    questionType: 'technical',
    mode: 'flashcard'
  };
  
  try {
    const response2 = await fetch(`${baseUrl}/api/interview-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(generalTest)
    });
    
    const data2 = await response2.json();
    console.log('✅ General test result:');
    console.log('- Mode:', data2.mode);
    console.log('- Company:', data2.company || 'None (General)');
    console.log('- Question count:', data2.questions?.length || 0);
    console.log('- Sample question:', data2.questions?.[0]?.question || 'N/A');
    console.log('- Display mode:', data2.displayMode);
    console.log('');
  } catch (error) {
    console.error('❌ General test failed:', error.message);
  }
  
  // Test 3: Different company (Google)
  console.log('🏢 Testing Different company (Google)...');
  const googleTest = {
    role: 'Software Engineer',
    questionType: 'technical',
    company: 'Google',
    mode: 'flashcard'
  };
  
  try {
    const response3 = await fetch(`${baseUrl}/api/interview-questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleTest)
    });
    
    const data3 = await response3.json();
    console.log('✅ Google test result:');
    console.log('- Mode:', data3.mode);
    console.log('- Company:', data3.company);
    console.log('- Question count:', data3.questions?.length || 0);
    console.log('- Sample question:', data3.questions?.[0]?.question || 'N/A');
    console.log('- Display mode:', data3.displayMode);
    console.log('');
  } catch (error) {
    console.error('❌ Google test failed:', error.message);
  }
  
  console.log('🎯 Test Summary:');
  console.log('- The API should generate Amazon-specific questions for Test 1');
  console.log('- The API should generate general questions for Test 2');
  console.log('- The API should generate Google-specific questions for Test 3');
  console.log('- All should have 12-15 questions in flashcard format');
};

// Only run if this file is executed directly
if (require.main === module) {
  testDynamicQuestions().catch(console.error);
}

module.exports = testDynamicQuestions;

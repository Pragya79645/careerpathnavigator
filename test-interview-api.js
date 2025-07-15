// Test the interview questions API with enhanced validation
const API_URL = 'http://localhost:3000/api/interview-questions';

async function testAPI() {
  console.log('🚀 Testing Interview Questions API with Enhanced Validation...\n');
  
  // Test 1: Technical Questions
  console.log('1. Testing Technical Questions (General)...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'technical'
      })
    });
    
    const data = await response.json();
    console.log('✅ Technical Questions Response:', JSON.stringify(data, null, 2));
    
    // Validate question separation
    if (data.questions) {
      console.log(`📊 Question count: ${data.questions.length}`);
      
      // Validate minimum question count
      if (data.questions.length < 12) {
        console.log(`❌ ERROR: Only ${data.questions.length} questions provided, minimum required is 12`);
      } else if (data.questions.length >= 15) {
        console.log(`✅ Excellent: ${data.questions.length} questions provided (target: 15)`);
      } else {
        console.log(`✅ Good: ${data.questions.length} questions provided (minimum: 12, target: 15)`);
      }
      
      const hasBehavioralWords = data.questions.some(q => 
        q.question.toLowerCase().includes('tell me about a time') ||
        q.question.toLowerCase().includes('describe a situation') ||
        q.question.toLowerCase().includes('how do you handle') ||
        q.question.toLowerCase().includes('give an example of when')
      );
      
      if (hasBehavioralWords) {
        console.log('❌ ERROR: Technical questions contain behavioral elements!');
      } else {
        console.log('✅ Good: Technical questions properly separated');
      }
      
      // Check answer quality
      const shortAnswers = data.questions.filter(q => q.answer.length < 200);
      if (shortAnswers.length > 0) {
        console.log(`⚠️  WARNING: ${shortAnswers.length} answers are too short (< 200 chars)`);
      } else {
        console.log('✅ Good: All answers are detailed and comprehensive');
      }
    }
    
  } catch (error) {
    console.error('❌ Technical Questions Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Behavioral Questions
  console.log('2. Testing Behavioral Questions (General)...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'behavioral'
      })
    });
    
    const data = await response.json();
    console.log('✅ Behavioral Questions Response:', JSON.stringify(data, null, 2));
    
    // Validate question separation
    if (data.questions) {
      console.log(`📊 Question count: ${data.questions.length}`);
      
      // Validate minimum question count
      if (data.questions.length < 12) {
        console.log(`❌ ERROR: Only ${data.questions.length} questions provided, minimum required is 12`);
      } else if (data.questions.length >= 15) {
        console.log(`✅ Excellent: ${data.questions.length} questions provided (target: 15)`);
      } else {
        console.log(`✅ Good: ${data.questions.length} questions provided (minimum: 12, target: 15)`);
      }
      
      const hasTechnicalWords = data.questions.some(q => 
        q.question.toLowerCase().includes('design') ||
        q.question.toLowerCase().includes('algorithm') ||
        q.question.toLowerCase().includes('code') ||
        q.question.toLowerCase().includes('system') ||
        q.question.toLowerCase().includes('implement')
      );
      
      if (hasTechnicalWords) {
        console.log('❌ ERROR: Behavioral questions contain technical elements!');
      } else {
        console.log('✅ Good: Behavioral questions properly separated');
      }
      
      // Check for STAR method in answers
      const starAnswers = data.questions.filter(q => 
        q.answer.toLowerCase().includes('situation') ||
        q.answer.toLowerCase().includes('task') ||
        q.answer.toLowerCase().includes('action') ||
        q.answer.toLowerCase().includes('result')
      );
      
      if (starAnswers.length > 0) {
        console.log(`✅ Good: ${starAnswers.length} answers use STAR method`);
      } else {
        console.log('⚠️  WARNING: Answers should use STAR method');
      }
    }
    
  } catch (error) {
    console.error('❌ Behavioral Questions Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: DSA Questions
  console.log('3. Testing DSA Questions (General)...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'dsa'
      })
    });
    
    const data = await response.json();
    console.log('✅ DSA Questions Response:', JSON.stringify(data, null, 2));
    
    // Validate question separation
    if (data.questions) {
      console.log(`📊 Question count: ${data.questions.length}`);
      
      // Validate minimum question count
      if (data.questions.length < 12) {
        console.log(`❌ ERROR: Only ${data.questions.length} questions provided, minimum required is 12`);
      } else if (data.questions.length >= 15) {
        console.log(`✅ Excellent: ${data.questions.length} questions provided (target: 15)`);
      } else {
        console.log(`✅ Good: ${data.questions.length} questions provided (minimum: 12, target: 15)`);
      }
      
      const hasBehavioralWords = data.questions.some(q => 
        q.question.toLowerCase().includes('tell me about') ||
        q.question.toLowerCase().includes('describe your experience') ||
        q.question.toLowerCase().includes('how do you handle')
      );
      
      if (hasBehavioralWords) {
        console.log('❌ ERROR: DSA questions contain behavioral elements!');
      } else {
        console.log('✅ Good: DSA questions properly separated');
      }
      
      // Check for code examples in answers
      const codeAnswers = data.questions.filter(q => 
        q.answer.includes('```') ||
        q.answer.includes('function') ||
        q.answer.includes('class') ||
        q.answer.includes('def ')
      );
      
      if (codeAnswers.length > 0) {
        console.log(`✅ Good: ${codeAnswers.length} answers include code examples`);
      } else {
        console.log('⚠️  WARNING: DSA answers should include code examples');
      }
    }
    
  } catch (error) {
    console.error('❌ DSA Questions Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: Company-specific Technical Questions
  console.log('4. Testing Company-specific Technical Questions (Amazon)...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'technical',
        company: 'Amazon'
      })
    });
    
    const data = await response.json();
    console.log('✅ Company-specific Technical Response:', JSON.stringify(data, null, 2));
    
    // Validate sourceNote presence
    if (data.sourceNote) {
      console.log('✅ Good: Source note is present');
    } else {
      console.log('❌ ERROR: Source note is missing');
    }
    
    // Validate question count for company-specific
    if (data.questions) {
      console.log(`📊 Company-specific question count: ${data.questions.length}`);
      
      if (data.questions.length < 12) {
        console.log(`❌ ERROR: Only ${data.questions.length} questions provided, minimum required is 12`);
      } else if (data.questions.length >= 15) {
        console.log(`✅ Excellent: ${data.questions.length} questions provided (target: 15)`);
      } else {
        console.log(`✅ Good: ${data.questions.length} questions provided (minimum: 12, target: 15)`);
      }
    }
    
  } catch (error) {
    console.error('❌ Company-specific Technical Error:', error);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 5: Company-specific Behavioral Questions
  console.log('5. Testing Company-specific Behavioral Questions (Amazon)...');
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'behavioral',
        company: 'Amazon'
      })
    });
    
    const data = await response.json();
    console.log('✅ Company-specific Behavioral Response:', JSON.stringify(data, null, 2));
    
    // Validate Amazon Leadership Principles
    if (data.questions) {
      console.log(`📊 Company-specific behavioral question count: ${data.questions.length}`);
      
      if (data.questions.length < 12) {
        console.log(`❌ ERROR: Only ${data.questions.length} questions provided, minimum required is 12`);
      } else if (data.questions.length >= 15) {
        console.log(`✅ Excellent: ${data.questions.length} questions provided (target: 15)`);
      } else {
        console.log(`✅ Good: ${data.questions.length} questions provided (minimum: 12, target: 15)`);
      }
      
      const leadershipQuestions = data.questions.filter(q => 
        q.question.toLowerCase().includes('ownership') ||
        q.question.toLowerCase().includes('leadership') ||
        q.question.toLowerCase().includes('customer') ||
        q.question.toLowerCase().includes('disagree')
      );
      
      if (leadershipQuestions.length > 0) {
        console.log(`✅ Good: ${leadershipQuestions.length} questions relate to Amazon Leadership Principles`);
      } else {
        console.log('⚠️  WARNING: Should include Amazon Leadership Principles questions');
      }
    }
    
  } catch (error) {
    console.error('❌ Company-specific Behavioral Error:', error);
  }
}

// Run the tests
testAPI().catch(console.error);

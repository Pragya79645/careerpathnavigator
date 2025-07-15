// Quick deployment test script
// Run this in your browser console on the deployed site

console.log('🔍 Starting deployment debug...');

// Test 1: Check if the API endpoint exists
async function testEndpoint() {
  console.log('📍 Testing API endpoint accessibility...');
  
  try {
    // Get current URL info
    const currentUrl = window.location.href;
    const baseUrl = window.location.origin;
    
    console.log('Current page:', currentUrl);
    console.log('Base URL:', baseUrl);
    
    // Test GET request first (health check)
    console.log('🔄 Testing GET request...');
    const getResponse = await fetch(`${baseUrl}/api/interview-questions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('GET Response:', {
      status: getResponse.status,
      statusText: getResponse.statusText,
      ok: getResponse.ok,
      url: getResponse.url
    });
    
    if (getResponse.ok) {
      const getData = await getResponse.json();
      console.log('✅ GET Success:', getData);
    } else {
      console.log('❌ GET Failed - Response text:', await getResponse.text());
    }
    
    // Test POST request
    console.log('🔄 Testing POST request...');
    const postResponse = await fetch(`${baseUrl}/api/interview-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'technical',
        company: '',
        mode: 'interview'
      })
    });
    
    console.log('POST Response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      ok: postResponse.ok,
      url: postResponse.url,
      headers: Object.fromEntries(postResponse.headers.entries())
    });
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('✅ POST Success:', {
        questionCount: postData.questions?.length || 0,
        hasQuestions: !!postData.questions,
        mode: postData.mode,
        role: postData.role
      });
    } else {
      const errorText = await postResponse.text();
      console.log('❌ POST Failed - Response text:', errorText);
      
      // Try to parse as JSON
      try {
        const errorJson = JSON.parse(errorText);
        console.log('❌ POST Error JSON:', errorJson);
      } catch (e) {
        console.log('❌ Could not parse error as JSON');
      }
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
  }
}

// Test 2: Check network connectivity
async function testNetworkConnectivity() {
  console.log('📍 Testing network connectivity...');
  
  try {
    // Test basic connectivity
    const response = await fetch(window.location.origin, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log('✅ Basic connectivity OK');
  } catch (error) {
    console.error('❌ Network connectivity issue:', error);
  }
}

// Test 3: Check if API routes are built correctly
async function testApiRouteStructure() {
  console.log('📍 Testing API route structure...');
  
  const testUrls = [
    '/api/interview-questions',
    '/api/interview-questions/',
    '/_next/static/chunks/pages/api/interview-questions.js'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(window.location.origin + url, {
        method: 'HEAD'
      });
      console.log(`${url}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`${url}: Error - ${error.message}`);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive deployment test...');
  
  await testNetworkConnectivity();
  await testApiRouteStructure();
  await testEndpoint();
  
  console.log('✅ All tests completed! Check the logs above for issues.');
}

// Auto-run the tests
runAllTests();

// Debug script to test the API endpoint
// Run this in the browser console on your deployed site

async function debugApiEndpoint() {
  console.log('🔍 Starting API endpoint debug...');
  
  // Get the current origin
  const baseUrl = window.location.origin;
  const apiUrl = `${baseUrl}/api/interview-questions`;
  
  console.log('Base URL:', baseUrl);
  console.log('API URL:', apiUrl);
  
  // Test 1: Health check (GET request)
  console.log('\n📍 Test 1: Health Check (GET)');
  try {
    const healthResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('Health check response:', {
      status: healthResponse.status,
      statusText: healthResponse.statusText,
      ok: healthResponse.ok,
      headers: Object.fromEntries(healthResponse.headers.entries())
    });
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check data:', healthData);
    } else {
      const errorText = await healthResponse.text();
      console.log('Health check error:', errorText);
    }
  } catch (error) {
    console.error('Health check failed:', error);
  }
  
  // Test 2: Simple POST request
  console.log('\n📍 Test 2: Simple POST Request');
  try {
    const postResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'Software Engineer',
        questionType: 'technical',
        company: '',
        mode: 'interview'
      }),
    });
    
    console.log('POST response:', {
      status: postResponse.status,
      statusText: postResponse.statusText,
      ok: postResponse.ok,
      headers: Object.fromEntries(postResponse.headers.entries())
    });
    
    if (postResponse.ok) {
      const postData = await postResponse.json();
      console.log('POST success:', {
        questionCount: postData.questions?.length || 0,
        mode: postData.mode,
        role: postData.role
      });
    } else {
      const errorText = await postResponse.text();
      console.log('POST error text:', errorText);
      
      try {
        const errorJson = JSON.parse(errorText);
        console.log('POST error JSON:', errorJson);
      } catch {
        console.log('Could not parse error as JSON');
      }
    }
  } catch (error) {
    console.error('POST request failed:', error);
  }
  
  // Test 3: Check network connectivity
  console.log('\n📍 Test 3: Network Connectivity Check');
  try {
    const connectivityResponse = await fetch(baseUrl, {
      method: 'GET',
      mode: 'no-cors'
    });
    console.log('Base URL connectivity:', connectivityResponse.type);
  } catch (error) {
    console.error('Connectivity check failed:', error);
  }
  
  console.log('\n✅ Debug complete! Check the logs above for any issues.');
}

// Run the debug
debugApiEndpoint();

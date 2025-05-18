// Test API script
import fetch from 'node-fetch';

// Replace this with your actual token from the browser localStorage
const token = process.argv[2] || 'YOUR_TOKEN_HERE';

async function testAPI() {
  try {
    console.log('Testing get profiles API with token:', token.substring(0, 20) + '...');
    
    const response = await fetch('http://localhost:5001/api/profiles', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log(`Found ${data.count} child profiles`);
      if (data.data && data.data.length > 0) {
        data.data.forEach((profile, index) => {
          console.log(`Profile ${index + 1}:`);
          console.log(`  ID: ${profile.id}`);
          console.log(`  Name: "${profile.name}"`);
          console.log(`  Age: ${profile.age}`);
        });
      }
    } else {
      console.error('API Error:', data.error);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();

/*
To run this script:
1. Copy your token from the browser's localStorage
2. Run: node --experimental-modules test_api.js YOUR_TOKEN
*/ 
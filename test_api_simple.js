// Test API script using built-in http module
const http = require('http');

// Replace this with your actual token from the browser localStorage
const token = process.argv[2] || 'YOUR_TOKEN_HERE';

console.log('Testing profiles API with token:', token.substring(0, 15) + '...');

const options = {
  hostname: 'localhost',
  port: 5001,
  path: '/api/profiles',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const parsedData = JSON.parse(data);
      console.log('API Response:', JSON.stringify(parsedData, null, 2));
      
      if (parsedData.success) {
        console.log(`Found ${parsedData.count} child profiles`);
        if (parsedData.data && parsedData.data.length > 0) {
          parsedData.data.forEach((profile, index) => {
            console.log(`Profile ${index + 1}:`);
            console.log(`  ID: ${profile.id}`);
            console.log(`  Name: "${profile.name}"`);
            console.log(`  Age: ${profile.age}`);
          });
        }
      } else {
        console.error('API Error:', parsedData.error);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

/*
To run this script:
1. Copy your token from the browser's localStorage
2. Run: node test_api_simple.js YOUR_TOKEN
*/ 
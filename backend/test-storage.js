const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Load the service account credentials from the JSON file
const serviceAccount = require('./firebase-credentials.json');

// Initialize the app
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'smiles-for-speech-1b81d.firebasestorage.app'
});

// Get storage bucket
const bucket = admin.storage().bucket();

async function testStorage() {
  try {
    // Create a test file
    const testFilePath = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFilePath, 'This is a test file for Firebase Storage');
    
    console.log('Test file created');
    console.log('Bucket name:', bucket.name);
    
    // Upload the file to Firebase Storage
    const destination = 'test/test-file.txt';
    
    await bucket.upload(testFilePath, {
      destination,
      metadata: {
        contentType: 'text/plain'
      }
    });
    
    console.log('File uploaded successfully to Firebase Storage');
    
    // Get a signed URL
    const [url] = await bucket.file(destination).getSignedUrl({
      action: 'read',
      expires: '03-01-2500'
    });
    
    console.log('File URL:', url);
    
    // Delete the local test file
    fs.unlinkSync(testFilePath);
    console.log('Local test file deleted');
    
  } catch (error) {
    console.error('Error testing storage:', error);
  }
}

testStorage(); 
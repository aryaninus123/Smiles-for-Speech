/**
 * This script helps you create the necessary Firestore index to fix the error:
 * "The query requires an index."
 * 
 * Run this script with:
 * node create-firebase-index.js
 */

console.log('='.repeat(80));
console.log('FIREBASE INDEX CREATION GUIDE');
console.log('='.repeat(80));
console.log('\nThe error you\'re seeing indicates you need to create a composite index in Firestore.');
console.log('This happens when you query with filters AND ordering (in your case, profileId + createdAt).\n');

console.log('OPTION 1: Use the direct link from the error message');
console.log('-----------------------------------------------');
console.log('The easiest way is to open the URL from your error message in a browser:');
console.log('https://console.firebase.google.com/v1/r/project/smiles-for-speech-1b81d/firestore/indexes?create_composite=Clpwcm9qZWN0cy9zbWlsZXMtZm9yLXNwZWVjaC0xYjgxZC9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvc2NyZWVuaW5ncy9pbmRleGVzL18QARoNCglwcm9maWxlSWQQARoNCgljcmVhdGVkQXQQAhoMCghfX25hbWVfXxAC');
console.log('\nThis will automatically open the Firebase console with the index pre-configured.\n');

console.log('OPTION 2: Create the index manually');
console.log('--------------------------------');
console.log('1. Go to the Firebase console: https://console.firebase.google.com/');
console.log('2. Select your project: "smiles-for-speech-1b81d"');
console.log('3. Click on "Firestore Database" in the left sidebar');
console.log('4. Click on the "Indexes" tab');
console.log('5. Click on "Create index"');
console.log('6. Fill in the following information:');
console.log('   - Collection: screenings');
console.log('   - Fields to index:');
console.log('     * Field path: profileId, Order: Ascending');
console.log('     * Field path: createdAt, Order: Descending');
console.log('   - Query scope: Collection');
console.log('7. Click "Create index"');
console.log('\nNote: Index creation can take a few minutes. Once created, your app will work correctly.');
console.log('\nAfter creating the index, restart your backend server to verify the error is resolved.');
console.log('='.repeat(80)); 
// Check database script
const admin = require('./backend/node_modules/firebase-admin');
const serviceAccount = require('./backend/firebase-credentials.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkChildProfiles() {
  try {
    console.log('Checking child profiles in Firebase...');
    
    // Get all child profiles
    const profilesSnapshot = await db.collection('childProfiles').get();
    
    console.log(`Found ${profilesSnapshot.size} child profiles in the database.`);
    
    if (profilesSnapshot.size > 0) {
      profilesSnapshot.forEach((doc, index) => {
        const data = doc.data();
        console.log(`\nProfile ${index + 1}:`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Name: "${data.name}"`);
        console.log(`  Age: ${data.age}`);
        console.log(`  Parent UID: ${data.parentUid}`);
        console.log(`  Created: ${data.createdAt}`);
      });
    }
    
    // Get parent document to check childProfileIds
    console.log('\nChecking parent documents...');
    const parentsSnapshot = await db.collection('users').where('role', '==', 'parent').get();
    
    console.log(`Found ${parentsSnapshot.size} parent users.`);
    
    parentsSnapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\nParent ${index + 1}:`);
      console.log(`  ID: ${doc.id}`);
      console.log(`  Name: ${data.name}`);
      console.log(`  UID: ${data.uid}`);
      console.log(`  Child Profile IDs: ${JSON.stringify(data.childProfileIds || [])}`);
    });
    
  } catch (error) {
    console.error('Error checking profiles:', error);
  } finally {
    // Exit process to avoid hanging
    process.exit(0);
  }
}

// Run the function
checkChildProfiles(); 
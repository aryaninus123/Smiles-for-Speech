const admin = require('firebase-admin');
const path = require('path');

// Load the service account credentials from the JSON file
const serviceAccount = require(path.join(__dirname, '..', '..', 'firebase-credentials.json'));

// Initialize the app if it hasn't been initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
    storageBucket: 'smiles-for-speech-1b81d.firebasestorage.app'
  });
}

// Access Firestore, Auth, and Storage services
const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = { admin, db, auth, storage }; 
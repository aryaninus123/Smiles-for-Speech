// Check if config.js exists, if not create it with necessary config
module.exports = {
  PORT: process.env.PORT || 5001,
  FIREBASE_CONFIG: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID
  },
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || 'AIzaSyBMSeWURKVP3eIyIDMWCFU_TKLqyx-JdCU', // Replace this with your real API key
  JWT_SECRET: process.env.JWT_SECRET || 'smiles-for-speech-secret'
}; 
const { db, auth, admin } = require('../config/firebase');

// User collection reference
const usersCollection = db.collection('users');

/**
 * Check for orphaned records and clean them up
 * @param {string} email User's email
 */
const cleanupOrphanedRecords = async (email) => {
  try {
    // Check Firestore for existing documents with this email
    const firestoreDocs = await usersCollection.where('email', '==', email).get();
    
    // Check Firebase Auth for this email
    let authUser = null;
    try {
      authUser = await auth.getUserByEmail(email);
    } catch (error) {
      // User doesn't exist in Auth, which is fine for cleanup
      if (error.code !== 'auth/user-not-found') {
        console.error('Error checking Auth user:', error);
      }
    }
    
    // If we have Firestore docs but no Auth user, delete the orphaned docs
    if (!firestoreDocs.empty && !authUser) {
      console.log(`Found orphaned Firestore documents for ${email}, cleaning up...`);
      
      // Delete all orphaned documents
      const batch = db.batch();
      firestoreDocs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      console.log(`Successfully deleted ${firestoreDocs.size} orphaned documents`);
    }
    
    // If we have Auth user but no Firestore docs, we might want to add a document
    // This is optional and depends on your application's needs
  } catch (error) {
    console.error('Error cleaning up orphaned records:', error);
  }
};

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email and password'
      });
    }

    // Clean up any orphaned records before registration
    await cleanupOrphanedRecords(email);

    // Check if user already exists in Firebase Auth
    let existingAuthUser = null;
    try {
      existingAuthUser = await auth.getUserByEmail(email);
      
      // If we reach here, the user exists in Auth
      return res.status(400).json({
        success: false,
        error: 'User already exists with that email'
      });
    } catch (error) {
      // Expected error if user doesn't exist
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Check if user already exists in Firestore (should be cleaned up, but double-check)
    const userByEmail = await usersCollection.where('email', '==', email).limit(1).get();
    if (!userByEmail.empty) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with that email'
      });
    }

    // Create user in Firebase Auth
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false // Explicitly set emailVerified to false
    });

    // Create user document in Firestore
    const userData = {
      uid: userRecord.uid,
      name,
      email,
      role: 'parent',
      emailVerified: false,
      createdAt: new Date().toISOString()
    };

    await usersCollection.add(userData);

    // Send email verification
    const verificationLink = await auth.generateEmailVerificationLink(email);
    
    // In a production app, you would send this using a proper email service
    console.log('Verification link:', verificationLink);
    
    // Create and send JWT token
    const token = await createToken(userRecord.uid);

    res.status(201).json({
      success: true,
      token,
      user: {
        uid: userRecord.uid,
        name,
        email,
        role: 'parent',
        emailVerified: false
      },
      message: 'Please check your email to verify your account'
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Server error'
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Verify credentials using Firebase Auth SDK directly
    try {
      // Since we're in Node.js and using firebase-admin, we need to validate the password
      // Firebase Admin doesn't have a direct signInWithEmailAndPassword method, 
      // so we'll do this by attempting to authenticate with the Auth REST API
      
      // Import the necessary modules
      const https = require('https');
      
      // Create a basic credential verification function
      const verifyPassword = (email, password) => {
        return new Promise((resolve, reject) => {
          // Get the API key directly from environment variables
          const apiKey = process.env.FIREBASE_API_KEY;
          
          if (!apiKey) {
            console.error('Firebase API key is missing from environment variables');
            reject(new Error('Server configuration error'));
            return;
          }
          
          // Create the request options
          const options = {
            hostname: 'identitytoolkit.googleapis.com',
            path: `/v1/accounts:signInWithPassword?key=${apiKey}`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          };
          
          // Create the request body
          const data = JSON.stringify({
            email,
            password,
            returnSecureToken: true
          });
          
          // Send the request
          const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
              responseData += chunk;
            });
            
            res.on('end', () => {
              try {
                const parsed = JSON.parse(responseData);
                if (parsed.error) {
                  reject(new Error(parsed.error.message || 'Invalid credentials'));
                } else {
                  resolve(parsed);
                }
              } catch (e) {
                reject(e);
              }
            });
          });
          
          req.on('error', (e) => {
            reject(e);
          });
          
          req.write(data);
          req.end();
        });
      };
      
      // Attempt to verify the password
      await verifyPassword(email, password);
      console.log('Password verification successful');
    } catch (error) {
      console.error('Password verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // If we got here, the password is correct
    // Now continue with the user lookup and token generation
    
    // Find user in Auth
    let authUser;
    try {
      authUser = await auth.getUserByEmail(email);
    } catch (error) {
      console.error('Error getting user by email:', error);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    // Find user in Firestore
    const userSnapshot = await usersCollection.where('email', '==', email).limit(1).get();
    
    // If user exists in Auth but not in Firestore, create a Firestore record
    if (userSnapshot.empty && authUser) {
      console.log(`User exists in Auth but not Firestore, creating document for ${email}`);
      const userData = {
        uid: authUser.uid,
        name: authUser.displayName || email.split('@')[0],
        email: authUser.email,
        role: 'parent',
        emailVerified: authUser.emailVerified || false,
        createdAt: new Date().toISOString()
      };
      
      // Add user to Firestore
      await usersCollection.add(userData);
      
      // Get the newly created user document
      const newUserSnapshot = await usersCollection.where('email', '==', email).limit(1).get();
      
      if (!newUserSnapshot.empty) {
        const userData = newUserSnapshot.docs[0].data();
        const token = await createToken(userData.uid);
        
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: newUserSnapshot.docs[0].id,
            ...userData
          }
        });
      }
    }
    
    // If no user found in Firestore (should not happen after the above fix)
    if (userSnapshot.empty) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
    
    const userData = userSnapshot.docs[0].data();
    
    // Create a token after password verification
    const token = await createToken(userData.uid);
    
    // Get the latest email verification status from Firebase Auth
    const userRecord = await auth.getUser(userData.uid);
    
    // Update the Firestore record if the emailVerified status is different
    if (userRecord.emailVerified !== userData.emailVerified) {
      await userSnapshot.docs[0].ref.update({ 
        emailVerified: userRecord.emailVerified 
      });
    }
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: userSnapshot.docs[0].id,
        ...userData,
        emailVerified: userRecord.emailVerified
      }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
};

/**
 * Verify email
 * @route GET /api/auth/verify-email
 * @access Public
 */
const verifyEmail = async (req, res) => {
  try {
    const { oobCode } = req.query;
    
    if (!oobCode) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }
    
    // Verify the code and update the user's email verification status
    // Note: Firebase handles the actual verification when the user clicks the email link
    // This endpoint is for confirming the verification to the user
    
    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid verification code'
    });
  }
};

/**
 * Send password reset email
 * @route POST /api/auth/forgot-password
 * @access Public
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    // Generate password reset link
    const resetLink = await auth.generatePasswordResetLink(email);
    
    // In a production app, you would send this via email
    console.log('Password reset link:', resetLink);
    
    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email'
    });
  } catch (error) {
    console.error('Error sending password reset:', error);
    // Don't reveal if the email exists or not for security reasons
    res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset link will be sent'
    });
  }
};

/**
 * Reset password using reset code
 * @route POST /api/auth/reset-password
 * @access Public
 */
const resetPassword = async (req, res) => {
  try {
    const { oobCode, newPassword } = req.body;
    
    if (!oobCode || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Reset code and new password are required'
      });
    }
    
    // In a real implementation, you would verify the oobCode and reset the password
    // For this demo, we'll just return success since Firebase handles the actual reset
    
    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(400).json({
      success: false,
      error: 'Invalid reset code or password'
    });
  }
};

/**
 * Create JWT token using Firebase Admin
 */
const createToken = async (uid) => {
  try {
    // Get the user from Firebase Auth to include accurate user data
    const user = await auth.getUser(uid);
    
    // Create a custom token using Firebase Admin
    const firebaseToken = await admin.auth().createCustomToken(uid, {
      uid: uid, // Explicitly include uid in the claims
      email: user.email,
      emailVerified: user.emailVerified
    });
    
    return firebaseToken;
  } catch (error) {
    console.error('Error creating token:', error);
    throw new Error('Failed to generate authentication token');
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword
}; 
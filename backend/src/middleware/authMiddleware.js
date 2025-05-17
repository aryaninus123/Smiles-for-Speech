const { auth } = require('../config/firebase');

/**
 * Authentication middleware to verify Firebase ID tokens
 */
const protect = async (req, res, next) => {
  let token;

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token using Firebase Admin
      const decodedToken = await auth.verifyIdToken(token);
      
      // Add the user data to the request
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        ...decodedToken
      };

      next();
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, invalid token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, no token'
    });
  }
};

/**
 * Admin authorization middleware
 */
const adminOnly = async (req, res, next) => {
  try {
    // Get user claims from Firebase Auth
    const { customClaims } = await auth.getUser(req.user.uid);
    
    if (customClaims && customClaims.admin === true) {
      next();
    } else {
      return res.status(403).json({
        success: false,
        error: 'Not authorized as admin'
      });
    }
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }
};

module.exports = { protect, adminOnly }; 
const { auth, admin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify tokens
 */
const protect = async (req, res, next) => {
  let token;

  console.log('Auth headers:', req.headers.authorization ? 'Present' : 'Missing');

  // Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log('Token found in request');

      // First, decode the token to get the UID
      const decoded = jwt.decode(token);
      console.log('Decoded token:', decoded ? 'Valid' : 'Invalid');
      
      if (!decoded) {
        console.log('Invalid token format - could not decode');
        return res.status(401).json({
          success: false,
          error: 'Not authorized, invalid token format'
        });
      }
      
      // Extract UID from the token claims
      // Custom tokens have different structure than ID tokens
      const uid = decoded.uid || 
                (decoded.claims && decoded.claims.uid) || 
                (decoded.sub);
      
      console.log('Extracted UID from token:', uid || 'Not found');
      
      if (!uid) {
        return res.status(401).json({
          success: false,
          error: 'Not authorized, token missing user ID'
        });
      }
      
      // Get user info from Firebase Auth
      try {
        console.log('Verifying user with Firebase Auth');
        const user = await auth.getUser(uid);
        console.log('User verified with Firebase Auth');
        
        // Add the user data to the request
        req.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        };
        
        console.log('User data added to request:', req.user);
        next();
      } catch (userErr) {
        console.error('Failed to get user from Firebase:', userErr);
        return res.status(401).json({
          success: false,
          error: 'Not authorized, user not found'
        });
      }
    } catch (error) {
      console.error('Error processing auth token:', error);
      return res.status(401).json({
        success: false,
        error: 'Not authorized, token error'
      });
    }
  } else {
    console.log('No authorization token found in request');
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
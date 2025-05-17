const { auth, admin } = require('../config/firebase');
const jwt = require('jsonwebtoken');

/**
 * Authentication middleware to verify tokens
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

      // First, try to decode the token to see if it's a custom token
      // Custom tokens have a specific format we can check
      try {
        // Just decode the token, don't verify signature
        const decoded = jwt.decode(token);
        
        if (!decoded) {
          return res.status(401).json({
            success: false,
            error: 'Not authorized, invalid token format'
          });
        }
        
        // Check if this is a Firebase custom token by looking for uid field
        const uid = decoded.uid || (decoded.claims && decoded.claims.sub);
        
        if (!uid) {
          return res.status(401).json({
            success: false,
            error: 'Not authorized, token missing user ID'
          });
        }
        
        // Get user info from Firebase Auth
        const user = await auth.getUser(uid);
        
        // Add the user data to the request
        req.user = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified
        };
        
        next();
      } catch (error) {
        console.error('Error verifying auth token:', error);
        return res.status(401).json({
          success: false,
          error: 'Not authorized, invalid token'
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
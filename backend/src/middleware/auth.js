const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Middleware to require authentication for protected routes
 * Checks for a valid JWT token in the Authorization header
 */
exports.requireAuth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }
    
    // Extract the token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication token missing' 
      });
    }
    
    // Verify the token
    jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
      
      // Add decoded user info to request object
      req.user = decoded;
      next();
    });
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication' 
    });
  }
}; 
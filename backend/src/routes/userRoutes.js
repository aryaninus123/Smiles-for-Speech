const express = require('express');
const router = express.Router();
const { 
  getCurrentUser, 
  updateUserProfile, 
  getUsers, 
  deleteUser 
} = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Protected routes (require authentication)
router.use(protect);

// User profile routes
router.get('/me', getCurrentUser);
router.post('/profile', updateUserProfile);

// Admin routes
router.get('/', adminOnly, getUsers);
router.delete('/:id', adminOnly, deleteUser);

module.exports = router; 
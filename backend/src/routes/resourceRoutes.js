const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourcesByRiskLevel,
  getLocalResources
} = require('../controllers/resourceController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/local', getLocalResources);
router.get('/', getResources);

// Protected routes
router.use(protect);

// Get resources by risk level (for recommendations)
router.get('/recommendations/:riskLevel', getResourcesByRiskLevel);

// Admin routes
router.post('/', adminOnly, createResource);
router.put('/:id', adminOnly, updateResource);
router.delete('/:id', adminOnly, deleteResource);

// This must come last to avoid conflicts with other routes
router.get('/:id', getResourceById);

module.exports = router; 
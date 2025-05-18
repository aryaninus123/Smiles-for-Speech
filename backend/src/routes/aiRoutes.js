const express = require('express');
const router = express.Router();
const { generateSummary, generateActivities } = require('../controllers/aiController');
const { requireAuth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(requireAuth);

// Generate a summary based on screening test results
router.post('/summary', generateSummary);

// Generate activity recommendations based on assessment results
router.post('/activities', generateActivities);

module.exports = router; 
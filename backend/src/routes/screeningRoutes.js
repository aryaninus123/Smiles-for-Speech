const express = require('express');
const router = express.Router();
const {
  getScreeningsByProfile,
  getScreeningById,
  createScreening,
  updateScreening,
  deleteScreening,
  getScreeningQuestions
} = require('../controllers/screeningController');
const { protect } = require('../middleware/authMiddleware');

// Public route for screening questions
router.get('/questions', getScreeningQuestions);

// Protected routes
router.use(protect);

// Routes for profile-specific screenings
router.get('/profile/:profileId', getScreeningsByProfile);

// Routes for individual screenings
router.route('/')
  .post(createScreening);

router.route('/:id')
  .get(getScreeningById)
  .put(updateScreening)
  .delete(deleteScreening);

module.exports = router; 
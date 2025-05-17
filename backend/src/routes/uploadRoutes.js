const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadFile,
  deleteFile,
  getFileUrl
} = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Public route to get file URL
router.get('/:filePath', getFileUrl);

// Protected routes
router.use(protect);

// Upload route with multer middleware
router.post('/', upload.single('file'), uploadFile);

// Delete route
router.delete('/:filePath', deleteFile);

module.exports = router; 
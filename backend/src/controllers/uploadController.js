const { storage } = require('../config/firebase');
const path = require('path');
const os = require('os');
const fs = require('fs');

// Get the default bucket
const bucket = storage.bucket();

/**
 * Generate a unique ID without using uuid
 * This is a simple approach for Node.js 12 compatibility
 */
const generateUniqueId = () => {
  return Date.now().toString() + '-' + Math.random().toString(36).substring(2, 15);
};

/**
 * Upload a file to Firebase Storage
 * @route POST /api/upload
 * @access Private
 */
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    // Create a unique filename
    const filename = `${generateUniqueId()}${path.extname(req.file.originalname)}`;
    
    // Determine the folder based on file type
    let folder = 'misc';
    if (req.body.type === 'profile') {
      folder = 'profiles';
    } else if (req.body.type === 'resource') {
      folder = 'resources';
    }
    
    // Full path in storage bucket
    const filePath = `${folder}/${filename}`;
    
    // Create a temporary file
    const tempFilePath = path.join(os.tmpdir(), filename);
    fs.writeFileSync(tempFilePath, req.file.buffer);
    
    // Upload to Firebase Storage
    await bucket.upload(tempFilePath, {
      destination: filePath,
      metadata: {
        contentType: req.file.mimetype,
        metadata: {
          uploadedBy: req.user.uid,
          originalName: req.file.originalname
        }
      }
    });
    
    // Remove the temporary file
    fs.unlinkSync(tempFilePath);
    
    // Get the file URL
    const file = bucket.file(filePath);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future expiration
    });
    
    res.status(200).json({
      success: true,
      data: {
        filename,
        filePath,
        url
      }
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a file from Firebase Storage
 * @route DELETE /api/upload/:filePath
 * @access Private
 */
const deleteFile = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    
    // Delete the file
    await bucket.file(filePath).delete();
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get file URL from Firebase Storage
 * @route GET /api/upload/:filePath
 * @access Public
 */
const getFileUrl = async (req, res) => {
  try {
    const { filePath } = req.params;
    
    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: 'File path is required'
      });
    }
    
    // Get the file URL
    const file = bucket.file(filePath);
    
    // Check if file exists
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' // Far future expiration
    });
    
    res.status(200).json({
      success: true,
      data: { url }
    });
  } catch (error) {
    console.error('Error getting file URL:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl
}; 
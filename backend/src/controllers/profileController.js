const { db } = require('../config/firebase');

// Child profiles collection reference
const profilesCollection = db.collection('childProfiles');
const screeningsCollection = db.collection('screenings');

/**
 * Get all child profiles for a parent
 * @route GET /api/profiles
 * @access Private
 */
const getProfiles = async (req, res) => {
  try {
    const profilesSnapshot = await profilesCollection
      .where('parentUid', '==', req.user.uid)
      .get();
    
    const profiles = [];
    profilesSnapshot.forEach(doc => {
      profiles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: profiles.length,
      data: profiles
    });
  } catch (error) {
    console.error('Error getting profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a single child profile
 * @route GET /api/profiles/:id
 * @access Private
 */
const getProfileById = async (req, res) => {
  try {
    const profileDoc = await profilesCollection.doc(req.params.id).get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }
    
    // Check if user owns this profile
    const profileData = profileDoc.data();
    if (profileData.parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this profile'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: profileDoc.id,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Error getting profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create a child profile
 * @route POST /api/profiles
 * @access Private
 */
const createProfile = async (req, res) => {
  try {
    const { name, birthDate, gender, developmentHistory, photoUrl } = req.body;
    
    // Validate required fields
    if (!name || !birthDate) {
      return res.status(400).json({
        success: false,
        error: 'Name and birth date are required'
      });
    }
    
    // Create profile object
    const profileData = {
      parentUid: req.user.uid,
      name,
      birthDate,
      gender: gender || '',
      developmentHistory: developmentHistory || '',
      photoUrl: photoUrl || '',
      createdAt: new Date().toISOString()
    };
    
    // Add to database
    const docRef = await profilesCollection.add(profileData);
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...profileData
      }
    });
  } catch (error) {
    console.error('Error creating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Update a child profile
 * @route PUT /api/profiles/:id
 * @access Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, birthDate, gender, developmentHistory, photoUrl } = req.body;
    
    // Check if profile exists
    const profileRef = profilesCollection.doc(req.params.id);
    const profileDoc = await profileRef.get();
    
    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }
    
    // Check if user owns this profile
    const profileData = profileDoc.data();
    if (profileData.parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }
    
    // Update profile
    const updatedData = {
      name: name || profileData.name,
      birthDate: birthDate || profileData.birthDate,
      gender: gender || profileData.gender,
      developmentHistory: developmentHistory || profileData.developmentHistory,
      photoUrl: photoUrl || profileData.photoUrl,
      updatedAt: new Date().toISOString()
    };
    
    await profileRef.update(updatedData);
    
    res.status(200).json({
      success: true,
      data: {
        id: profileDoc.id,
        ...profileData,
        ...updatedData
      }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a child profile
 * @route DELETE /api/profiles/:id
 * @access Private
 */
const deleteProfile = async (req, res) => {
  try {
    const profileId = req.params.id;
    const profileRef = profilesCollection.doc(profileId);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    const profileData = profileDoc.data();
    if (profileData.parentUid !== req.user.uid) { 
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this profile'
      });
    }

    // Batch delete for screenings
    const batch = db.batch();

    // Find and delete associated screenings
    const screeningsSnapshot = await screeningsCollection.where('profileId', '==', profileId).get();
    
    if (!screeningsSnapshot.empty) {
      screeningsSnapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
    }

    // Delete the profile itself
    batch.delete(profileRef);

    // Commit the batch
    await batch.commit();

    res.status(200).json({
      success: true,
      message: 'Profile and associated screenings deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile and screenings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during profile deletion'
    });
  }
};

module.exports = {
  getProfiles,
  getProfileById,
  createProfile,
  updateProfile,
  deleteProfile
}; 
const { db, auth } = require('../config/firebase');

// User collection reference
const usersCollection = db.collection('users');

/**
 * Get current user profile
 * @route GET /api/users/me
 * @access Private
 */
const getCurrentUser = async (req, res) => {
  try {
    // Get user from Firestore using Firebase Auth UID
    const userSnapshot = await usersCollection
      .where('uid', '==', req.user.uid)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const userData = userSnapshot.docs[0].data();
    
    res.status(200).json({
      success: true,
      data: {
        id: userSnapshot.docs[0].id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create or update a user profile
 * @route POST /api/users/profile
 * @access Private
 */
const updateUserProfile = async (req, res) => {
  try {
    console.log('Received profile update request:', req.body);
    console.log('User from token:', req.user);
    
    const { name, phone, address, role, age, profilePicture } = req.body;
    
    // Check if user already exists
    const userSnapshot = await usersCollection
      .where('uid', '==', req.user.uid)
      .limit(1)
      .get();

    console.log('User exists in Firestore:', !userSnapshot.empty);

    if (userSnapshot.empty) {
      // Create new user profile
      console.log('Creating new user profile');
      const newUser = {
        uid: req.user.uid,
        email: req.user.email,
        name: name || '',
        phone: phone || '',
        address: address || '',
        age: age || 'N/A',
        profilePicture: profilePicture || '',
        role: role || 'parent',
        createdAt: new Date().toISOString()
      };
      
      await usersCollection.add(newUser);
      
      return res.status(201).json({
        success: true,
        data: newUser
      });
    } else {
      // Update existing user profile
      console.log('Updating existing user profile');
      const userRef = userSnapshot.docs[0].ref;
      
      // Create update object with only defined values
      const userData = {};
      
      // Always include these fields with fallback values
      userData.name = name || userSnapshot.docs[0].data().name || 'User';
      userData.age = age || userSnapshot.docs[0].data().age || 'N/A';
      userData.profilePicture = profilePicture || userSnapshot.docs[0].data().profilePicture || '';
      
      // Only add other fields if they're defined
      if (phone !== undefined) userData.phone = phone;
      if (address !== undefined) userData.address = address;
      if (role !== undefined) userData.role = role || 'parent';
      
      // Always add updatedAt timestamp
      userData.updatedAt = new Date().toISOString();
      
      console.log('Updated data:', userData);
      
      await userRef.update(userData);
      
      return res.status(200).json({
        success: true,
        data: {
          id: userSnapshot.docs[0].id,
          ...userSnapshot.docs[0].data(),
          ...userData
        }
      });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: error.message
    });
  }
};

/**
 * Get all users (admin only)
 * @route GET /api/users
 * @access Private/Admin
 */
const getUsers = async (req, res) => {
  try {
    const usersSnapshot = await usersCollection.get();
    
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const userDocRef = usersCollection.doc(req.params.id);
    const userDoc = await userDocRef.get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    // Get user's UID from Firestore
    const userData = userDoc.data();
    
    // Delete user from Firebase Auth
    await auth.deleteUser(userData.uid);
    
    // Delete user from Firestore
    await userDocRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getCurrentUser,
  updateUserProfile,
  getUsers,
  deleteUser
}; 
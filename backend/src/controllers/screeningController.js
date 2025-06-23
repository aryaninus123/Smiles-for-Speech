const { db } = require('../config/firebase');

// Collections references
const screeningsCollection = db.collection('screenings');
const profilesCollection = db.collection('childProfiles');

/**
 * Get all screenings for a child profile
 * @route GET /api/screenings/profile/:profileId
 * @access Private
 */
const getScreeningsByProfile = async (req, res) => {
  try {
    const { profileId } = req.params;

    // Verify profile ownership
    const profileDoc = await profilesCollection.doc(profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    if (profileDoc.data().parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this profile'
      });
    }

    // Get screenings for this profile
    const screeningsSnapshot = await screeningsCollection
      .where('profileId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .get();

    const screenings = [];
    screeningsSnapshot.forEach(doc => {
      screenings.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.status(200).json({
      success: true,
      count: screenings.length,
      data: screenings
    });
  } catch (error) {
    console.error('Error getting screenings:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a single screening by ID
 * @route GET /api/screenings/:id
 * @access Private
 */
const getScreeningById = async (req, res) => {
  try {
    const screeningDoc = await screeningsCollection.doc(req.params.id).get();

    if (!screeningDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Screening not found'
      });
    }

    const screeningData = screeningDoc.data();

    // Verify profile ownership
    const profileDoc = await profilesCollection.doc(screeningData.profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Associated profile not found'
      });
    }

    if (profileDoc.data().parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this screening'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: screeningDoc.id,
        ...screeningData
      }
    });
  } catch (error) {
    console.error('Error getting screening:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create a new screening
 * @route POST /api/screenings
 * @access Private
 */
const createScreening = async (req, res) => {
  try {
    const { profileId, answers, notes } = req.body;

    // Validate required fields
    if (!profileId || !answers) {
      return res.status(400).json({
        success: false,
        error: 'Profile ID and answers are required'
      });
    }

    // Verify profile ownership
    const profileDoc = await profilesCollection.doc(profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    if (profileDoc.data().parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create screening for this profile'
      });
    }

    // Get child profile data
    const profileData = profileDoc.data();

    // Calculate screening score based on the answers
    const score = calculateScreeningScore(answers);

    // Generate recommendations based on the score
    const { riskLevel, recommendations } = generateRecommendations(score);

    // Save the screening result
    const screeningData = {
      profileId,
      answers,
      score,
      riskLevel,
      recommendations,
      notes: notes || '',
      status: 'completed',
      createdAt: new Date().toISOString(),
      userId: req.user.uid
    };

    const docRef = await screeningsCollection.add(screeningData);

    // Calculate child's age from birthDate
    let childAge = 'Unknown';
    if (profileData.birthDate) {
      const birthDate = new Date(profileData.birthDate);
      const today = new Date();
      childAge = today.getFullYear() - birthDate.getFullYear();
      if (today.getMonth() < birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() < birthDate.getDate())) {
        childAge--;
      }
    }

    // Add child profile info to the response
    const responseData = {
      id: docRef.id,
      ...screeningData,
      childName: profileData.name || 'Unknown',
      childAge: childAge.toString()
    };

    res.status(201).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Error creating screening:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Update screening notes
 * @route PUT /api/screenings/:id
 * @access Private
 */
const updateScreening = async (req, res) => {
  try {
    const { notes } = req.body;

    const screeningRef = screeningsCollection.doc(req.params.id);
    const screeningDoc = await screeningRef.get();

    if (!screeningDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Screening not found'
      });
    }

    const screeningData = screeningDoc.data();

    // Verify profile ownership
    const profileDoc = await profilesCollection.doc(screeningData.profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Associated profile not found'
      });
    }

    if (profileDoc.data().parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this screening'
      });
    }

    // Update screening
    await screeningRef.update({
      notes: notes || screeningData.notes,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Screening updated successfully'
    });
  } catch (error) {
    console.error('Error updating screening:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a screening
 * @route DELETE /api/screenings/:id
 * @access Private
 */
const deleteScreening = async (req, res) => {
  try {
    const screeningRef = screeningsCollection.doc(req.params.id);
    const screeningDoc = await screeningRef.get();

    if (!screeningDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Screening not found'
      });
    }

    const screeningData = screeningDoc.data();

    // Verify profile ownership
    const profileDoc = await profilesCollection.doc(screeningData.profileId).get();

    if (!profileDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Associated profile not found'
      });
    }

    if (profileDoc.data().parentUid !== req.user.uid) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this screening'
      });
    }

    // Delete screening
    await screeningRef.delete();

    res.status(200).json({
      success: true,
      message: 'Screening deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting screening:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get screening questions
 * @route GET /api/screenings/questions
 * @access Public
 */
const getScreeningQuestions = async (req, res) => {
  try {
    // In a production app, these questions would likely be stored in Firestore
    // For this hackathon, we'll return hardcoded questions
    const questions = [
      {
        id: 'q1',
        text: 'Does your child look at you when you call his/her name?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q2',
        text: 'How easy is it for you to get eye contact with your child?',
        type: 'frequency',
        options: ['Very Difficult', 'Difficult', 'Somewhat Easy', 'Easy', 'Very Easy']
      },
      {
        id: 'q3',
        text: 'Does your child point to indicate that he/she wants something?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q4',
        text: 'Does your child point to share interest with you?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q5',
        text: 'Does your child pretend?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q6',
        text: 'Does your child follow where you\'re looking?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q7',
        text: 'If you or someone else in the family is visibly upset, does your child show signs of wanting to comfort them?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q8',
        text: 'Does your child focus a lot on a few favorite toys or activities, and not play with many other things?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q9',
        text: 'Does your child use simple gestures?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      },
      {
        id: 'q10',
        text: 'Does your child stare at nothing with no apparent purpose?',
        type: 'frequency',
        options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always']
      }
    ];

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Error getting screening questions:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Helper function to calculate screening score
 * @param {Object} answers - Object containing question IDs and answers
 * @returns {Number} - Calculated risk score
 */
const calculateScreeningScore = (answers) => {
  // This is a simplified scoring algorithm for the hackathon
  // In a production app, this would be more sophisticated and 
  // based on validated screening tools

  let score = 0;
  const answerValues = {
    'Never': 4,
    'Rarely': 3,
    'Sometimes': 2,
    'Often': 1,
    'Always': 0,
    'Very Difficult': 4,
    'Difficult': 3,
    'Somewhat Easy': 2,
    'Easy': 1,
    'Very Easy': 0,
    'Typical': 0,
    'Unusual': 3,
    'No words yet': 4
  };

  // Reverse scoring for negative questions (where "never" is good)
  const reverseScoring = ['q10'];

  Object.keys(answers).forEach(questionId => {
    const answer = answers[questionId];

    if (reverseScoring.includes(questionId)) {
      // For reverse-scored questions, invert the score
      score += 4 - answerValues[answer];
    } else {
      score += answerValues[answer] || 0;
    }
  });

  return score;
};

/**
 * Helper function to generate recommendations based on score
 * @param {Number} score - Screening score
 * @returns {Object} - Risk level and recommendations
 */
const generateRecommendations = (score) => {
  // In a production app, these thresholds would be based on validated tools

  let riskLevel, recommendations;

  if (score >= 30) {
    riskLevel = 'High';
    recommendations = [
      'The screening results indicate some behaviors that may suggest further evaluation is needed',
      'It\'s recommended to discuss these observations with a healthcare professional for guidance',
      'Early intervention can be beneficial if further support is needed',
      'Consider a comprehensive developmental assessment with a specialist'
    ];
  } else if (score >= 15) {
    riskLevel = 'Medium';
    recommendations = [
      'The screening results suggest monitoring your child\'s development',
      'Consider discussing these observations with a healthcare professional',
      'Engage in activities that strengthen social communication skills',
      'Schedule a follow-up assessment in 3-6 months'
    ];
  } else {
    riskLevel = 'Low';
    recommendations = [
      'Your child is showing typical development patterns',
      'Continue engaging in interactive play and communication activities',
      'Celebrate your child\'s social communication strengths',
      'Regular developmental check-ups are still recommended'
    ];
  }

  return { riskLevel, recommendations };
};

module.exports = {
  getScreeningsByProfile,
  getScreeningById,
  createScreening,
  updateScreening,
  deleteScreening,
  getScreeningQuestions
}; 
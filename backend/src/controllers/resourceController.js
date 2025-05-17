const { db } = require('../config/firebase');

// Collection reference
const resourcesCollection = db.collection('resources');

/**
 * Get all resources or filter by category
 * @route GET /api/resources
 * @access Public
 */
const getResources = async (req, res) => {
  try {
    const { category } = req.query;
    let query = resourcesCollection;
    
    if (category) {
      query = query.where('category', '==', category);
    }
    
    const resourcesSnapshot = await query.get();
    
    const resources = [];
    resourcesSnapshot.forEach(doc => {
      resources.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error getting resources:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get a single resource by ID
 * @route GET /api/resources/:id
 * @access Public
 */
const getResourceById = async (req, res) => {
  try {
    const resourceDoc = await resourcesCollection.doc(req.params.id).get();
    
    if (!resourceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: resourceDoc.id,
        ...resourceDoc.data()
      }
    });
  } catch (error) {
    console.error('Error getting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Create a new resource
 * @route POST /api/resources
 * @access Private/Admin
 */
const createResource = async (req, res) => {
  try {
    const { title, description, category, url, imageUrl, tags } = req.body;
    
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, and category are required'
      });
    }
    
    const resourceData = {
      title,
      description,
      category,
      url: url || '',
      imageUrl: imageUrl || '',
      tags: tags || [],
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid
    };
    
    const docRef = await resourcesCollection.add(resourceData);
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...resourceData
      }
    });
  } catch (error) {
    console.error('Error creating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Update a resource
 * @route PUT /api/resources/:id
 * @access Private/Admin
 */
const updateResource = async (req, res) => {
  try {
    const { title, description, category, url, imageUrl, tags } = req.body;
    
    const resourceRef = resourcesCollection.doc(req.params.id);
    const resourceDoc = await resourceRef.get();
    
    if (!resourceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
    
    const resourceData = resourceDoc.data();
    const updatedResource = {
      title: title || resourceData.title,
      description: description || resourceData.description,
      category: category || resourceData.category,
      url: url || resourceData.url,
      imageUrl: imageUrl || resourceData.imageUrl,
      tags: tags || resourceData.tags,
      updatedAt: new Date().toISOString()
    };
    
    await resourceRef.update(updatedResource);
    
    res.status(200).json({
      success: true,
      data: {
        id: resourceDoc.id,
        ...resourceData,
        ...updatedResource
      }
    });
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Delete a resource
 * @route DELETE /api/resources/:id
 * @access Private/Admin
 */
const deleteResource = async (req, res) => {
  try {
    const resourceRef = resourcesCollection.doc(req.params.id);
    const resourceDoc = await resourceRef.get();
    
    if (!resourceDoc.exists) {
      return res.status(404).json({
        success: false,
        error: 'Resource not found'
      });
    }
    
    await resourceRef.delete();
    
    res.status(200).json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get resources by risk level (for recommendation engine)
 * @route GET /api/resources/recommendations/:riskLevel
 * @access Private
 */
const getResourcesByRiskLevel = async (req, res) => {
  try {
    const { riskLevel } = req.params;
    
    // Validate risk level
    if (!['Low', 'Medium', 'High'].includes(riskLevel)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid risk level'
      });
    }
    
    // Query resources by tags that match the risk level
    const resourcesSnapshot = await resourcesCollection
      .where('tags', 'array-contains', riskLevel)
      .limit(5)
      .get();
    
    const resources = [];
    resourcesSnapshot.forEach(doc => {
      resources.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // If not enough resources with exact risk level tag, get general resources
    if (resources.length < 5) {
      const generalResourcesSnapshot = await resourcesCollection
        .where('category', '==', 'General')
        .limit(5 - resources.length)
        .get();
      
      generalResourcesSnapshot.forEach(doc => {
        resources.push({
          id: doc.id,
          ...doc.data()
        });
      });
    }
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

/**
 * Get local resources by location (Ghana specifically)
 * @route GET /api/resources/local
 * @access Public
 */
const getLocalResources = async (req, res) => {
  try {
    // Query resources specific to Ghana
    const resourcesSnapshot = await resourcesCollection
      .where('tags', 'array-contains', 'Ghana')
      .get();
    
    const resources = [];
    resourcesSnapshot.forEach(doc => {
      resources.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    res.status(200).json({
      success: true,
      count: resources.length,
      data: resources
    });
  } catch (error) {
    console.error('Error getting local resources:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

module.exports = {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourcesByRiskLevel,
  getLocalResources
}; 
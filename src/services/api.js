/**
 * API service for making requests to the backend
 */

// The base URL for all API requests
const API_URL = 'http://localhost:5002/api';

/**
 * Helper to make API requests with appropriate headers
 */
const fetchWithAuth = async (endpoint, options = {}) => {
  // Get token from localStorage if we implement auth later
  const token = localStorage.getItem('token');
  console.log(`API Request to ${endpoint} - Token exists: ${!!token}`);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    console.warn(`Making request without auth token to: ${endpoint}`);
  }

  const config = {
    ...options,
    headers,
  };

  console.log(`Sending request to: ${API_URL}${endpoint}`);
  const response = await fetch(`${API_URL}${endpoint}`, config);
  console.log(`Response status from ${endpoint}: ${response.status}`);

  if (!response.ok) {
    const error = await response.json();
    console.error(`API error from ${endpoint}:`, error);

    // Check if this is an authentication error (401)
    if (response.status === 401) {
      // For login endpoint specifically, show "Wrong password"
      if (endpoint === '/auth/login') {
        throw new Error('Wrong password');
      } else {
        throw new Error(error.message || 'Authentication failed');
      }
    }

    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

/**
 * Authentication API calls
 */
export const authAPI = {
  // Login user
  login: async (email, password) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Register user
  register: async (userData) => {
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Verify email with verification code
  verifyEmail: async (oobCode) => {
    return fetchWithAuth(`/auth/verify-email?oobCode=${oobCode}`);
  },

  // Check if user's email is verified
  checkEmailVerification: async () => {
    return fetchWithAuth('/users/me');
  },

  // Request password reset email
  forgotPassword: async (email) => {
    return fetchWithAuth('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // Reset password with code and new password
  resetPassword: async (oobCode, newPassword) => {
    return fetchWithAuth('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ oobCode, newPassword }),
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    console.log('Sending profile update request with data:', profileData);
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      console.log('Profile update response status:', response.status);

      // If response is not ok, throw error
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Profile update failed with error:', errorData);
        throw new Error(errorData.error || 'Failed to update profile');
      }

      return response.json();
    } catch (error) {
      console.error('Profile update exception:', error);
      throw error;
    }
  }
};

/**
 * Child profiles API calls
 */
export const profilesAPI = {
  // Get all profiles for current user
  getProfiles: () => fetchWithAuth('/profiles'),

  // Get single profile
  getProfile: (id) => fetchWithAuth(`/profiles/${id}`),

  // Create new profile
  createProfile: (profileData) => {
    return fetchWithAuth('/profiles', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update profile
  updateProfile: (id, profileData) => {
    return fetchWithAuth(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Delete profile
  deleteProfile: (id) => {
    return fetchWithAuth(`/profiles/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Screening API calls
 */
export const screeningAPI = {
  // Get screening questions
  getQuestions: () => fetchWithAuth('/screenings/questions'),

  // Get screenings for a profile
  getScreeningsByProfile: (profileId) => fetchWithAuth(`/screenings/profile/${profileId}`),

  // Get a single screening
  getScreening: (id) => fetchWithAuth(`/screenings/${id}`),

  // Get a single screening by ID (alias for getScreening for consistency)
  getScreeningById: (id) => fetchWithAuth(`/screenings/${id}`),

  // Create a screening
  createScreening: (screeningData) => {
    return fetchWithAuth('/screenings', {
      method: 'POST',
      body: JSON.stringify(screeningData),
    });
  },
};

/**
 * Resources API calls
 */
export const resourcesAPI = {
  // Get all resources
  getResources: (category) => {
    const endpoint = category ? `/resources?category=${category}` : '/resources';
    return fetchWithAuth(endpoint);
  },

  // Get local resources for Ghana
  getLocalResources: () => fetchWithAuth('/resources/local'),

  // Get resources by risk level
  getResourcesByRiskLevel: (riskLevel) => fetchWithAuth(`/resources/recommendations/${riskLevel}`),
};

/**
 * Upload API calls
 */
export const uploadAPI = {
  // Upload a file (this needs a different approach since it's multipart/form-data)
  uploadFile: async (file, type) => {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload file');
    }

    return response.json();
  },

  // Get file URL
  getFileUrl: (filePath) => fetchWithAuth(`/upload/${filePath}`),
}; 
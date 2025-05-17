/**
 * Authentication utility functions
 */

// Check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Set authentication token
export const setToken = (token) => {
  localStorage.setItem('token', token);
};

// Get authentication token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Remove authentication token (logout)
export const removeToken = () => {
  localStorage.removeItem('token');
};

// Set user data in local storage
export const setUser = (userData) => {
  localStorage.setItem('user', JSON.stringify(userData));
};

// Get user data from local storage
export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from local storage
export const removeUser = () => {
  localStorage.removeItem('user');
};

// Logout user completely
export const logout = () => {
  removeToken();
  removeUser();
};

// Get authentication status with user data
export const getAuthState = () => {
  return {
    isAuthenticated: isAuthenticated(),
    user: getUser()
  };
}; 
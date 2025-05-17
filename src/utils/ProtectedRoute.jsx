import React, { useEffect, useState } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { authAPI } from '../services/api';

/**
 * ProtectedRoute component that wraps routes requiring authentication
 * 
 * @param {Component} component - The component to render if user is authenticated
 * @param {Object} rest - Rest of the props to pass to Route
 */
const ProtectedRoute = ({ component: Component, ...rest }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      try {
        // Verify the token by making a request to get user data
        await authAPI.checkEmailVerification();
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Authentication failed:', error);
        // Clear the invalid token
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthentication();
  }, []);

  if (isLoading) {
    // Show loading indicator while checking authentication
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div 
            style={{ 
              border: '4px solid #f3f3f3', 
              borderTop: '4px solid #0277bd', 
              borderRadius: '50%', 
              width: '40px', 
              height: '40px', 
              margin: '0 auto',
              animation: 'spin 1s linear infinite' 
            }} 
          />
          <p style={{ marginTop: '1rem' }}>Verifying authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: '/login',
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute; 
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import AboutPage from './AboutPage';
import SignUpPage from './SignUpPage';
import ProfilePage from './ProfilePage';
import AssessmentForm from './AssessmentForm';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <Switch>
        {/* Public routes */}
        <Route exact path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/about" component={AboutPage} />
        <Route path="/signup" component={SignUpPage} />
        <Route path="/verify-email" component={VerifyEmail} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/reset-password" component={ResetPassword} />
        
        {/* Protected routes - require authentication */}
        <ProtectedRoute path="/profile" component={ProfilePage} />
        <ProtectedRoute path="/assessment" component={AssessmentForm} />
      </Switch>
    </Router>
  );
}

export default App; 
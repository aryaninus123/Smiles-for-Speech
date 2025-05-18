import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import AboutPage from './AboutPage';
import SignUpPage from './SignUpPage';
import ProfilePage from './ProfilePage';
import AssessmentForm from './AssessmentForm';
import ResultsPage from './ResultsPage';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import EducationPage from './EducationPage';
import ProtectedRoute from './utils/ProtectedRoute';

function App() {
  return (
    <Router>
      <Layout>
        <Switch>
          {/* Public routes */}
          <Route exact path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/signup" component={SignUpPage} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/education" component={EducationPage} />
          
          {/* Protected routes - require authentication */}
          <ProtectedRoute path="/profile" component={ProfilePage} />
          <ProtectedRoute path="/assessment/:profileId?" component={AssessmentForm} />
          <ProtectedRoute path="/results/:id" component={ResultsPage} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App; 
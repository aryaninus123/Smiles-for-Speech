import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Layout from './components/Layout';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import AboutPage from './AboutPage';
import SignUpPage from './SignUpPage';
import ProfilePage from './ProfilePage';
import AssessmentForm from './AssessmentForm';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import EducationPage from './EducationPage';

function App() {
  return (
    <Router>
      <Layout>
        <Switch>
          <Route exact path="/" component={LandingPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/about" component={AboutPage} />
          <Route path="/signup" component={SignUpPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/assessment" component={AssessmentForm} />
          <Route path="/verify-email" component={VerifyEmail} />
          <Route path="/forgot-password" component={ForgotPassword} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="/education" component={EducationPage} />
        </Switch>
      </Layout>
    </Router>
  );
}

export default App; 
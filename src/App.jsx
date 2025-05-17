import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';
import AboutPage from './AboutPage';
function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/about" component={AboutPage} />
      </Switch>
    </Router>
  );
}

export default App; 
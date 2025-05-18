import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// Debug log to verify app is loading
console.log('Application starting - index.js loaded');

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
); 
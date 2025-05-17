import React, { useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { authAPI } from './services/api';
import { setToken, setUser } from './utils/auth';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();
    const location = useLocation();

    // Get the page the user was trying to access before being redirected to login
    const { from } = location.state || { from: { pathname: '/profile' } };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await authAPI.login(email, password);
            
            // Store the token and user data using auth utilities
            if (response.token) {
                setToken(response.token);
                if (response.user) {
                    setUser(response.user);
                }
            }
            
            // Redirect to the page the user was trying to access, or profile by default
            history.push(from);
        } catch (err) {
            // Display error message directly from the API service
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sfs-root">
            <nav className="sfs-navbar" role="navigation" aria-label="Main navigation">
                <div className="sfs-navbar-content">
                    <div className="sfs-navbar-brand">
                        <img
                            src="https://static1.squarespace.com/static/5ab98c1c5cfd7903fb57593c/t/5ac8de7a352f53a44fbbd872/1746198109953/"
                            alt="Smiles for Speech logo: a smiley face"
                            className="sfs-logo"
                        />
                        <Link to='/'><h1 className="sfs-title">Smiles for Speech</h1></Link>
                    </div>
                    <div className="sfs-navbar-links">
                        <Link to="/" className="sfs-link">Home</Link>
                        <Link to="/about" className="sfs-link">About Us</Link>
                        <Link to="/login" className="sfs-login-btn" aria-current="page" aria-label="Log in to your account">Log In</Link>
                    </div>
                </div>
            </nav>

            {/* Login Form Section */}
            <main className="sfs-hero">
                <form 
                    className="sfs-login-form" 
                    style={{ maxWidth: '24rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}
                    onSubmit={handleSubmit}
                >
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Log In</h2>
                    
                    {error && (
                        <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="sfs-login-input"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                            required
                            autoComplete="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
                        <label htmlFor="password" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            className="sfs-login-input"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                            required
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="sfs-get-started-btn" 
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Logging in...' : 'Log In'}
                    </button>
                    
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p>Don't have an account? <Link to="/signup" style={{ color: '#0277bd', textDecoration: 'underline' }}>Sign up</Link></p>
                        <p style={{ marginTop: '0.5rem' }}><Link to="/forgot-password" style={{ color: '#0277bd', textDecoration: 'underline' }}>Forgot password?</Link></p>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default LoginPage; 
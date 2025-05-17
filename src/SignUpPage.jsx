import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI } from './services/api';

function SignUpPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const history = useHistory();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        
        try {
            const response = await authAPI.register(formData);
            
            // Store the token in localStorage
            if (response.token) {
                localStorage.setItem('token', response.token);
            }
            
            // Redirect to profile page
            history.push('/profile');
        } catch (err) {
            setError(err.message || 'Failed to sign up. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="sfs-root">

            {/* Sign Up Form Section */}
            <main className="sfs-hero">
                <form 
                    className="sfs-login-form" 
                    style={{ maxWidth: '24rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}
                    onSubmit={handleSubmit}
                >
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Sign Up</h2>
                    
                    {error && (
                        <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {error}
                        </div>
                    )}
                    
                    <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
                        <label htmlFor="name" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Name</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            className="sfs-login-input"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                            required
                            autoComplete="name"
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>
                    <div style={{ marginBottom: '1.2rem', textAlign: 'left' }}>
                        <label htmlFor="email" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            className="sfs-login-input"
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                            required
                            autoComplete="email"
                            value={formData.email}
                            onChange={handleChange}
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
                            autoComplete="new-password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="sfs-get-started-btn" 
                        style={{ width: '100%' }}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing up...' : 'Sign Up'}
                    </button>
                    
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p>Already have an account? <Link to="/login" style={{ color: '#0277bd', textDecoration: 'underline' }}>Log in</Link></p>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default SignUpPage; 
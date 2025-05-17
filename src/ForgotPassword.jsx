import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from './services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('idle'); // 'idle', 'success', 'error'
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('idle');
        setMessage('');
        
        try {
            await authAPI.forgotPassword(email);
            setStatus('success');
            setMessage('If an account exists with this email, a password reset link will be sent.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to send password reset. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sfs-root">

            {/* Forgot Password Form */}
            <main className="sfs-hero">
                <form 
                    className="sfs-login-form" 
                    style={{ maxWidth: '24rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}
                    onSubmit={handleSubmit}
                >
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Reset Password</h2>
                    <p style={{ marginBottom: '1.5rem', color: '#555' }}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                    
                    {status === 'success' && (
                        <div style={{ padding: '0.75rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {message}
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                            {message}
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
                    <button 
                        type="submit" 
                        className="sfs-get-started-btn" 
                        style={{ width: '100%', marginBottom: '1rem' }}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                        <p>Remember your password? <Link to="/login" style={{ color: '#0277bd', textDecoration: 'underline' }}>Log in</Link></p>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default ForgotPassword; 
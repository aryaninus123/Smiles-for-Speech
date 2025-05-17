import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI } from './services/api';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [oobCode, setOobCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState('verifying'); // 'verifying', 'ready', 'success', 'error'
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        // Get the oobCode from URL query parameters
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('oobCode');
        
        if (!code) {
            setStatus('error');
            setMessage('Invalid or expired password reset link.');
            return;
        }
        
        setOobCode(code);
        setStatus('ready');
    }, [location.search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setStatus('error');
            setMessage('Passwords do not match.');
            return;
        }
        
        if (password.length < 6) {
            setStatus('error');
            setMessage('Password must be at least 6 characters long.');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            await authAPI.resetPassword(oobCode, password);
            setStatus('success');
            setMessage('Your password has been reset successfully! You can now log in with your new password.');
        } catch (error) {
            setStatus('error');
            setMessage(error.message || 'Failed to reset password. The link may be invalid or expired.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="sfs-root">

            {/* Reset Password Form */}
            <main className="sfs-hero">
                <div 
                    className="sfs-login-form" 
                    style={{ maxWidth: '24rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}
                >
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Reset Password</h2>
                    
                    {status === 'verifying' && (
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                            <p>Verifying reset link...</p>
                            <div style={{
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #f9c32b',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                animation: 'spin 1s linear infinite',
                                margin: '1rem auto'
                            }}></div>
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                {message}
                            </div>
                            <Link to="/forgot-password" className="sfs-get-started-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Try Again
                            </Link>
                        </div>
                    )}
                    
                    {status === 'success' && (
                        <div style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ padding: '0.75rem', background: '#e8f5e9', color: '#2e7d32', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                {message}
                            </div>
                            <Link to="/login" className="sfs-get-started-btn" style={{ display: 'inline-block', textDecoration: 'none' }}>
                                Log In
                            </Link>
                        </div>
                    )}
                    
                    {status === 'ready' && (
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label htmlFor="password" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    className="sfs-login-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                                <label htmlFor="confirmPassword" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="sfs-login-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                />
                            </div>
                            
                            {status === 'error' && (
                                <div style={{ padding: '0.75rem', background: '#ffebee', color: '#c62828', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                    {message}
                                </div>
                            )}
                            
                            <button 
                                type="submit" 
                                className="sfs-get-started-btn" 
                                style={{ width: '100%' }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                </div>
            </main>
            
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}

export default ResetPassword; 
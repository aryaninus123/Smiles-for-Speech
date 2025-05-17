import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { authAPI } from './services/api';

function VerifyEmail() {
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('');
    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                // Get the oobCode from URL query parameters
                const queryParams = new URLSearchParams(location.search);
                const oobCode = queryParams.get('oobCode');
                
                if (!oobCode) {
                    setStatus('error');
                    setMessage('Verification link is invalid or has expired.');
                    return;
                }
                
                // Call the API to verify the email
                await authAPI.verifyEmail(oobCode);
                setStatus('success');
                setMessage('Your email has been verified successfully! You can now log in.');
            } catch (error) {
                setStatus('error');
                setMessage(error.message || 'Failed to verify email. The link may be invalid or expired.');
            }
        };
        
        verifyEmail();
    }, [location.search]);

    return (
        <div className="sfs-root">
            <main className="sfs-hero">
                <div className="sfs-login-form" style={{
                    maxWidth: '24rem',
                    width: '100%',
                    background: '#fff',
                    borderRadius: '1rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    padding: '2rem',
                    margin: '0 auto',
                    textAlign: 'center'
                }}>
                    <h2 className="sfs-hero-title" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Email Verification</h2>
                    
                    {status === 'verifying' && (
                        <div style={{ padding: '1rem' }}>
                            <p>Verifying your email address...</p>
                            <div className="sfs-loader" style={{
                                border: '4px solid #f3f3f3',
                                borderTop: '4px solid #ffc107',
                                borderRadius: '50%',
                                width: '30px',
                                height: '30px',
                                animation: 'spin 1s linear infinite',
                                margin: '1rem auto'
                            }}></div>
                        </div>
                    )}
                    
                    {status === 'success' && (
                        <div style={{ padding: '1rem', color: '#4caf50' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                <polyline points="22 4 12 14.01 9 11.01"></polyline>
                            </svg>
                            <p style={{ marginTop: '1rem' }}>{message}</p>
                            <Link to="/login" className="sfs-get-started-btn" style={{ 
                                display: 'inline-block', 
                                marginTop: '1rem', 
                                textDecoration: 'none' 
                            }}>
                                Log In
                            </Link>
                        </div>
                    )}
                    
                    {status === 'error' && (
                        <div style={{ padding: '1rem', color: '#f44336' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="15" y1="9" x2="9" y2="15"></line>
                                <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                            <p style={{ marginTop: '1rem' }}>{message}</p>
                            <Link to="/login" className="sfs-link" style={{ 
                                display: 'inline-block', 
                                marginTop: '1rem', 
                                color: '#0277bd',
                                textDecoration: 'underline'
                            }}>
                                Return to Login
                            </Link>
                        </div>
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

export default VerifyEmail; 
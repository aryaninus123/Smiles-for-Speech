import React from 'react';
import { Link } from 'react-router-dom';
import pic from './assets/pic.jpg';

function LandingPage() {
    return (
        <div className="sfs-root">
            <main className="sfs-hero" style={{
                maxWidth: '1200px',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2rem',
                textAlign: 'center'
            }}>
                <div style={{
                    maxWidth: '600px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}>
                    <div style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        marginBottom: '2rem'
                    }}>
                        <img
                            src={pic}
                            alt="Kid smiling with a speech therapist"
                            style={{
                                width: '100%',
                                maxWidth: '400px',
                                height: 'auto',
                                objectFit: 'contain',
                                borderRadius: '12px'
                            }}
                        />
                    </div>
                    <h1 className="sfs-hero-title" style={{
                        fontSize: 'clamp(2rem, 5vw, 2.5rem)',
                        marginBottom: '1rem',
                        color: '#1a1a1a',
                        lineHeight: '1.2'
                    }}>
                        Empowering Children with Disabilities
                    </h1>
                    <p className="sfs-hero-desc" style={{
                        fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
                        marginBottom: '2rem',
                        color: '#2d2d2d',
                        lineHeight: '1.6',
                        maxWidth: '50ch',
                        margin: '0 auto 2rem'
                    }}>
                        Smiles for Speech provides personalized resources and support for children with disabilities and their families in underserved communities.
                    </p>
                    <Link
                        to="/signup"
                        className="sfs-get-started-btn"
                        aria-label="Get started with personalized support"
                        style={{
                            display: 'inline-block',
                            padding: '1rem 2.5rem',
                            background: '#f9c32b',
                            color: '#1a1a1a',
                            textDecoration: 'none',
                            borderRadius: '8px',
                            fontWeight: '600',
                            fontSize: '1.125rem',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            ':hover': {
                                background: '#ffd15b',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                            }
                        }}
                    >
                        Get Started
                    </Link>
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
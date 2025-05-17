import React from 'react';
import { Link } from 'react-router-dom';

function LoginPage() {
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
                <form className="sfs-login-form" style={{ maxWidth: '24rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}>
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1rem' }}>Log In</h2>
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
                        />
                    </div>
                    <button type="submit" className="sfs-get-started-btn" style={{ width: '100%' }}>Log In</button>
                </form>
            </main>
        </div>
    );
}

export default LoginPage; 
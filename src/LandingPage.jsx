import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
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
                        <Link to="/" className="sfs-link" aria-current="page">Home</Link>
                        <Link to="/about" className="sfs-link">About Us</Link>
                        <Link to="/login" className="sfs-login-btn" aria-label="Log in to your account">Log In</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="sfs-hero">
                <h2 className="sfs-hero-title">
                    Empowering Children with Disabilities
                </h2>
                <p className="sfs-hero-desc">
                    Smiles for Speech provides personalized resources and support for children with disabilities and their families in underserved communities.
                </p>
                <Link
                    to="/signup"
                    className="sfs-get-started-btn"
                    aria-label="Get started with personalized support"
                >
                    Get Started
                </Link>
            </main>
        </div>
    );
}

export default LandingPage;
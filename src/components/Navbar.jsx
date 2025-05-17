import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();

    return (
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
                    <Link to="/education" className="sfs-link">Learn About Autism</Link>
                    {location.pathname !== '/login' && (
                        <Link to="/login" className="sfs-login-btn" aria-label="Log in to your account">Log In</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 
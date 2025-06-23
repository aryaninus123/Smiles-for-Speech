import React from 'react';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';
import './Navbar.css';

function Navbar() {
    const location = useLocation();
    const history = useHistory();
    const auth = isAuthenticated();

    const handleLogout = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

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
                    <Link to="/education" className="sfs-link">Learn More</Link>
                    {auth ? (
                        <>
                            <Link to="/profile" className="sfs-link">Profile</Link>
                            <button
                                onClick={handleLogout}
                                className="sfs-login-btn"
                                aria-label="Log out of your account"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        location.pathname !== '/login' && (
                            <Link
                                to="/login"
                                className="sfs-login-btn"
                                aria-label="Log in to your account"
                            >
                                Log In
                            </Link>
                        )
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar; 
import React from 'react';
import { Link } from 'react-router-dom';

function AboutPage() {
    return (
        <div className="sfs-root">
            {/* Navigation */}
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
                        <Link to="/about" className="sfs-link" aria-current="page">About Us</Link>
                        <Link to="/login" className="sfs-login-btn" aria-label="Log in to your account">Log In</Link>
                    </div>
                </div>
            </nav>

            <main className="sfs-hero" style={{ alignItems: 'stretch', paddingTop: '2rem', paddingBottom: '2rem' }}>
                <section style={{ maxWidth: '48rem', margin: '0 auto', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem' }}>
                    <h2 className="sfs-hero-title" style={{ fontSize: '2.25rem', marginBottom: '1.5rem' }}>About Smiles for Speech</h2>
                    <p className="sfs-hero-desc" style={{ marginBottom: '2rem' }}>
                        <strong>Smiles for Speech (SFS)</strong> is a nonprofit organization dedicated to enhancing the quality of life for children with disabilities in underserved communities globally. We empower caregivers by providing access to developmentally appropriate resources and ensure long-term sustainable solutions through expert professional volunteers from around the world.
                    </p>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9c32b', marginBottom: '1rem', maxWidth: '48rem', borderRadius: '20px' }}>Our Purpose</h3>
                    <img
                            src="https://images.squarespace-cdn.com/content/v1/5ab98c1c5cfd7903fb57593c/ecc4ffb3-a4a1-4c9f-836a-6b802f0f3c60/IMG_0886.jpg?format=1500w"
                            alt="Kids smiling"
                            className="sfs-photo"
                        />
                    <p className="sfs-hero-desc" style={{ marginBottom: '2rem' }}>
                        Children with disabilities can be commonly defined by what they can't do—milestones unmet, and benchmarks unchecked. These children and their caregivers are among our most vulnerable population, especially if they reside in a disadvantaged community. Smiles for Speech (SFS) is committed to empowering caregivers by providing access to developmentally appropriate resources to support children with disabilities and ensure long-term sustainable solutions given by expert professional volunteers from all around the world..
                    </p>
                </section>
            </main>
        </div>
    );
}

export default AboutPage; 
import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
    return (
        <div className="sfs-root">

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
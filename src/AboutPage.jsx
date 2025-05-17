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

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9c32b', marginBottom: '1rem' }}>Our Purpose</h3>
                    <p className="sfs-hero-desc" style={{ marginBottom: '2rem' }}>
                        Children with disabilities can be commonly defined by what they can't do—milestones unmet, and benchmarks unchecked. These children and their caregivers are among our most vulnerable population, especially if they reside in a disadvantaged community. SFS is committed to empowering caregivers by providing access to developmentally appropriate resources to support children with disabilities and ensure long-term sustainable solutions given by expert professional volunteers from all around the world.
                    </p>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9c32b', marginBottom: '1rem' }}>Our Objectives</h3>
                    <ul style={{ textAlign: 'left', marginBottom: '2rem', color: '#111', fontSize: '1.1rem', lineHeight: '1.7' }}>
                        <li>• Increase global awareness and provide education on the importance of therapeutic services for children with disabilities around the world to build an inclusive society.</li>
                        <li>• Offer intensive training and education for professionals and for families without any access to speech therapy to help their children at home.</li>
                        <li>• Remodel attitudes and beliefs surrounding speech and language disorders by providing support and resources to families and their communities.</li>
                        <li>• Distribute materials such as therapy materials, books, toys and games to expose children to new experiences, stimulate language development, and self-expression.</li>
                        <li>• Professional development through training and creating libraries as a resource for students studying speech-language pathology.</li>
                        <li>• Support increased cultural awareness in our collective society by learning and understanding various cultures through giving.</li>
                        <li>• Connect and collaborate with other nonprofits with similar objectives to expand knowledge and resources.</li>
                    </ul>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9c32b', marginBottom: '1rem' }}>Our Impact</h3>
                    <ul style={{ textAlign: 'left', marginBottom: '2rem', color: '#111', fontSize: '1.1rem', lineHeight: '1.7' }}>
                        <li>• <strong>300+</strong> children receive direct consultative speech therapy services every year</li>
                        <li>• <strong>1000+</strong> professionals and families received training to support functional communication skills</li>
                        <li>• <strong>17+</strong> countries were reached in our virtual workshops globally</li>
                    </ul>

                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f9c32b', marginBottom: '1rem' }}>Our Founder</h3>
                    <p className="sfs-hero-desc" style={{ marginBottom: '1.5rem' }}>
                        <strong>Sandy Dorsey, MA, CCC-SLP</strong> is a leading speech-language pathologist, educator, and global advocate for children with special needs. With over 25 years of experience, Sandy founded Smiles for Speech in 2017 to provide access to resources and experts for children in disadvantaged communities. Her vision is to create a world where a child's future is not bound by circumstances such as disability, socioeconomic status, race, or gender.
                    </p>
                </section>
            </main>
        </div>
    );
}

export default AboutPage; 
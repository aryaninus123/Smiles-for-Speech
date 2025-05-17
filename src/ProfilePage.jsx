import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function ProfilePage() {
    // User profile state
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('User');
    const [age, setAge] = useState('N/A');
    const [profilePic, setProfilePic] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ0FpBg5Myb9CQ-bQpFou9BY9JXoRG6208_Q&s');
    const [testResult, setTestResult] = useState('No test taken yet.');
    const [summary, setSummary] = useState('No summary available.');

    // For editing
    const [editName, setEditName] = useState(name);
    const [editAge, setEditAge] = useState(age);
    const [editProfilePic, setEditProfilePic] = useState(profilePic);
    const [editProfileFile, setEditProfileFile] = useState(null);

    const handleEdit = () => {
        setEditName(name);
        setEditAge(age);
        setEditProfilePic(profilePic);
        setEditProfileFile(null);
        setEditing(true);
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditProfilePic(reader.result);
                setEditProfileFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        setName(editName);
        setAge(editAge);
        setProfilePic(editProfilePic);
        setEditing(false);
    };

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
                        <Link to="/about" className="sfs-link">About Us</Link>
                        <Link to="/login" className="sfs-login-btn" aria-label="Log in to your account">Log In</Link>
                    </div>
                </div>
            </nav>

            {/* Profile Section */}
            <main className="sfs-hero" style={{ alignItems: 'center' }}>
                <section style={{ maxWidth: '28rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}>
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Your Profile</h2>
                    {!editing ? (
                        <div style={{ textAlign: 'center' }}>
                            <img src={profilePic} alt="Profile" className="sfs-photo" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>{name}</div>
                            <div style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1.5rem' }}>Age: {age}</div>
                            <button className="sfs-get-started-btn" style={{ marginBottom: '2rem' }} onClick={handleEdit}>Edit Profile</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} style={{ textAlign: 'center' }}>
                            <img src={editProfilePic} alt="Profile preview" className="sfs-photo" style={{ marginBottom: '1.5rem' }} />
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="profilePic" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Profile Picture</label>
                                <input
                                    type="file"
                                    id="profilePic"
                                    name="profilePic"
                                    accept="image/*"
                                    className="sfs-login-input"
                                    style={{ width: '100%', marginBottom: '0.5rem' }}
                                    onChange={handleProfilePicChange}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label htmlFor="editName" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Name</label>
                                <input
                                    type="text"
                                    id="editName"
                                    name="editName"
                                    className="sfs-login-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label htmlFor="editAge" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>Age</label>
                                <input
                                    type="number"
                                    id="editAge"
                                    name="editAge"
                                    className="sfs-login-input"
                                    style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                                    value={editAge}
                                    onChange={e => setEditAge(e.target.value)}
                                    min="0"
                                    required
                                />
                            </div>
                            <button type="submit" className="sfs-get-started-btn" style={{ marginRight: '1rem' }}>Save</button>
                            <button type="button" className="sfs-link" style={{ background: 'none', border: 'none', color: '#f9c32b', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }} onClick={() => setEditing(false)}>Cancel</button>
                        </form>
                    )}

                    {/* Test Result Section */}
                    <section style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Test Result</h3>
                        <div style={{ background: '#f9f9f9', borderRadius: '0.5rem', padding: '1rem', color: '#333', minHeight: '2.5rem' }}>{testResult}</div>
                    </section>

                    {/* Summary Section */}
                    <section style={{ marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Summary</h3>
                        <div style={{ background: '#f9f9f9', borderRadius: '0.5rem', padding: '1rem', color: '#333', minHeight: '2.5rem' }}>{summary}</div>
                    </section>
                </section>
            </main>
        </div>
    );
}

export default ProfilePage; 
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI } from './services/api';

function ProfilePage() {
    const history = useHistory();
    // User profile state
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('User');
    const [email, setEmail] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [age, setAge] = useState('N/A');
    const [profilePic, setProfilePic] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ0FpBg5Myb9CQ-bQpFou9BY9JXoRG6208_Q&s');
    const [testResult, setTestResult] = useState('No test taken yet.');
    const [summary, setSummary] = useState('No summary available.');

    // For editing
    const [editName, setEditName] = useState(name);
    const [editAge, setEditAge] = useState(age);
    const [editProfilePic, setEditProfilePic] = useState(profilePic);
    const [editProfileFile, setEditProfileFile] = useState(null);

    // Load user data on component mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Check if user is logged in
                const token = localStorage.getItem('token');
                if (!token) {
                    history.push('/login');
                    return;
                }
                
                // Get current user data
                const userData = await authAPI.checkEmailVerification();
                if (userData && userData.data) {
                    setUser(userData.data);
                    setName(userData.data.name || 'User');
                    setEmail(userData.data.email || '');
                    setEmailVerified(userData.data.emailVerified || false);
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                // If authentication error, redirect to login
                if (error.message.includes('Not authorized') || error.message.includes('token')) {
                    localStorage.removeItem('token');
                    history.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchUserData();
    }, [history]);

    const handleResendVerification = async () => {
        try {
            // This would be implemented in a real app to resend verification email
            alert('Verification email sent! Please check your inbox.');
        } catch (error) {
            console.error('Error sending verification email:', error);
            alert('Failed to send verification email. Please try again.');
        }
    };

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

    const handleLogout = () => {
        localStorage.removeItem('token');
        history.push('/login');
    };

    if (loading) {
        return (
            <div className="sfs-root" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        border: '4px solid #f3f3f3',
                        borderTop: '4px solid #f9c32b',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto'
                    }}></div>
                    <p style={{ marginTop: '1rem' }}>Loading your profile...</p>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

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
                        <button onClick={handleLogout} className="sfs-login-btn" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Log Out</button>
                    </div>
                </div>
            </nav>

            {/* Profile Section */}
            <main className="sfs-hero" style={{ alignItems: 'center' }}>
                <section style={{ maxWidth: '28rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}>
                    <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Your Profile</h2>
                    
                    {/* Email Verification Status */}
                    {email && (
                        <div style={{ 
                            marginBottom: '1.5rem', 
                            padding: '0.75rem', 
                            borderRadius: '0.5rem',
                            background: emailVerified ? '#e8f5e9' : '#fff3e0',
                            color: emailVerified ? '#2e7d32' : '#ef6c00',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <span style={{ fontWeight: 600 }}>
                                    {emailVerified ? 'Email Verified' : 'Email Not Verified'}
                                </span>
                                <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>{email}</div>
                            </div>
                            {!emailVerified && (
                                <button
                                    onClick={handleResendVerification}
                                    style={{
                                        background: '#ff9800',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.25rem',
                                        padding: '0.5rem 0.75rem',
                                        cursor: 'pointer',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Resend
                                </button>
                            )}
                        </div>
                    )}
                    
                    {!editing ? (
                        <div style={{ textAlign: 'center' }}>
                            <img src={profilePic} alt="Profile" className="sfs-photo" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>{name}</div>
                            <div style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1.5rem' }}>Age: {age}</div>
                            <button className="sfs-get-started-btn" style={{ marginBottom: '2rem' }} onClick={handleEdit}>Edit Profile</button>
                        </div>
                    ) : (
                        <form onSubmit={handleSave} style={{ textAlign: 'center' }}>
                            <img src={editProfilePic} alt="Profile preview" className="sfs-photo" style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} />
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

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .sfs-photo {
                    width: 150px;
                    height: 150px;
                    border-radius: 50%;
                    object-fit: cover;
                }
            `}</style>
        </div>
    );
}

export default ProfilePage; 
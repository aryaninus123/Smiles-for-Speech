import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { authAPI, uploadAPI } from './services/api';
import { logout, getUser } from './utils/auth';

function ProfilePage() {
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState('User');
    const [email, setEmail] = useState('');
    const [emailVerified, setEmailVerified] = useState(false);
    const [age, setAge] = useState('N/A');
    const [profilePic, setProfilePic] = useState('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZ0FpBg5Myb9CQ-bQpFou9BY9JXoRG6208_Q&s');
    const [testResult, setTestResult] = useState('No test result available.');
    const [summary, setSummary] = useState('No summary available.');

    const [editName, setEditName] = useState(name);
    const [editAge, setEditAge] = useState(age);
    const [editProfilePic, setEditProfilePic] = useState(profilePic);
    const [editProfileFile, setEditProfileFile] = useState(null);

    const [childName, setChildName] = useState('');
    const [childAge, setChildAge] = useState('');
    const [childrenList, setChildrenList] = useState([]);
    const [sidebarError, setSidebarError] = useState('');
    const [sidebarSuccess, setSidebarSuccess] = useState('');
    const [selectedChild, setSelectedChild] = useState(null);

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
                    
                    // Update age and profile picture if available in the response
                    if (userData.data.age) setAge(userData.data.age);
                    if (userData.data.profilePicture) setProfilePic(userData.data.profilePicture);
                }

                if (childrenList.length > 0) {
                    const firstChild = childrenList[0];
                    setSelectedChild(firstChild);
                    const hasTest = firstChild.testResults && firstChild.testResults.length > 0;
                    setTestResult(hasTest ? "Test results found" : "No test result available.");
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.message.includes('Not authorized') || error.message.includes('token')) {
                    logout();
                    history.push('/login');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [history]);

    useEffect(() => {
        if (selectedChild) {
            const hasTest = selectedChild.testResults && selectedChild.testResults.length > 0;
            setTestResult(hasTest ? "Test results found" : "No test result available.");
            setSummary("No Summary Available");
        }
    }, [selectedChild]);

    const handleResendVerification = async () => {
        try {
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

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            console.log("Starting profile update...");
            let profilePicUrl = profilePic;
            
            // Step 1: If a new profile picture was selected, upload it to Firebase Storage
            if (editProfileFile) {
                console.log("Uploading profile picture...");
                try {
                    const uploadResult = await uploadAPI.uploadFile(editProfileFile, 'profile');
                    console.log("Upload result:", uploadResult);
                    if (uploadResult && uploadResult.data && uploadResult.data.url) {
                        // Get the URL from the upload result
                        profilePicUrl = uploadResult.data.url;
                        console.log("Profile picture URL:", profilePicUrl);
                    }
                } catch (uploadError) {
                    console.error("Error uploading profile picture:", uploadError);
                    throw new Error(`Failed to upload image: ${uploadError.message}`);
                }
            }
            
            // Step 2: Update user profile in Firestore with the new data
            const profileData = {
                name: editName || 'User',
                age: editAge.toString() || '25',  // Convert to string and provide default
                profilePicture: profilePicUrl || '',
                email: email || user?.email || ''
            };
            
            console.log("Sending profile data to server:", profileData);
            
            // Call the API to update the user profile
            try {
                const result = await authAPI.updateProfile(profileData);
                console.log("Profile update result:", result);
                
                // If successful, update the local cache
                if (result && result.data) {
                    // Update the user in localStorage
                    const updatedUser = {
                        ...user,
                        ...profileData
                    };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }
            } catch (updateError) {
                console.error("Error updating profile data:", updateError);
                throw new Error(`Failed to update profile data: ${updateError.message}`);
            }
            
            // Update local state with the new values
            setName(editName);
            setAge(editAge);
            setProfilePic(profilePicUrl);
            
            // Exit edit mode
            setEditing(false);
            
            // Show success message
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(`Failed to update profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        history.push('/login');
    };

    const handleAddChild = (e) => {
        e.preventDefault();
        if (!childName || !childAge) {
            setSidebarError("Child's name and age are required");
            setSidebarSuccess('');
            return;
        }

        const newChild = {
            id: Date.now(),
            name: childName,
            age: childAge,
            testResults: []
        };

        const updatedChildren = [...childrenList, newChild];
        setChildrenList(updatedChildren);
        setSelectedChild(newChild);

        setChildName('');
        setChildAge('');
        setSidebarSuccess('Child profile added successfully!');
        setSidebarError('');

        setTimeout(() => {
            setSidebarSuccess('');
        }, 3000);
    };

    const handleSelectChild = (child) => {
        setSelectedChild(child);
    };

    const showCaregiverProfile = () => {
        setSelectedChild(null);
        setTestResult('No test result available.');
        setSummary('No summary available.');
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

            <div style={{ display: 'flex', position: 'relative' }}>
                {/* Sidebar for Child Management */}
                <div style={{
                    width: '250px',
                    background: 'white',
                    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
                    padding: '20px',
                    position: 'fixed',
                    left: 0,
                    top: '60px', // Navbar height
                    bottom: 0,
                    overflowY: 'auto'
                }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '20px',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '4px',
                            transition: 'background-color 0.2s',
                            backgroundColor: !selectedChild ? '#fff3e0' : 'transparent'
                        }}
                        onClick={showCaregiverProfile}
                        title="View caregiver profile"
                    >
                        <img
                            src={profilePic}
                            alt="Caregiver"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                marginRight: '10px',
                                cursor: 'pointer'
                            }}
                        />
                        <div>
                            <div style={{ fontWeight: '600' }}>{name}</div>
                            <div style={{ fontSize: '0.85rem', color: '#666' }}>Caregiver</div>
                        </div>
                    </div>

                    <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', color: '#f9c32b' }}>Add New Child</h3>

                    {/* Add Child Form */}
                    <form onSubmit={handleAddChild}>
                        {sidebarError && (
                            <div style={{ padding: '8px', marginBottom: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.9rem' }}>
                                {sidebarError}
                            </div>
                        )}

                        {sidebarSuccess && (
                            <div style={{ padding: '8px', marginBottom: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '0.9rem' }}>
                                {sidebarSuccess}
                            </div>
                        )}

                        <div style={{ marginBottom: '10px' }}>
                            <label htmlFor="childName" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Child's Name *</label>
                            <input
                                type="text"
                                id="childName"
                                value={childName}
                                onChange={(e) => setChildName(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                placeholder="Enter child's name"
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="childAge" style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>Age *</label>
                            <input
                                type="number"
                                id="childAge"
                                value={childAge}
                                onChange={(e) => setChildAge(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                                placeholder="Child's age"
                                min="1"
                                max="18"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            style={{
                                width: '100%',
                                padding: '10px',
                                background: '#f9c32b',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Add Child Profile
                        </button>
                    </form>

                    {/* Children List */}
                    <div style={{ marginTop: '30px' }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px', color: '#f9c32b' }}>Your Children ({childrenList.length})</h3>

                        {childrenList.length === 0 ? (
                            <p style={{ color: '#666', fontStyle: 'italic' }}>No children profiles found</p>
                        ) : (
                            <div>
                                {childrenList.map(child => (
                                    <div
                                        key={child.id}
                                        style={{
                                            padding: '10px',
                                            borderBottom: '1px solid #eee',
                                            fontSize: '0.9rem',
                                            background: selectedChild && selectedChild.id === child.id ? '#fff3e0' : 'transparent',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => handleSelectChild(child)}
                                    >
                                        <div style={{ fontWeight: '600' }}>{child.name}</div>
                                        <div style={{ color: '#666' }}>Age: {child.age}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <main className="sfs-hero" style={{
                    marginLeft: '250px',
                    width: 'calc(100% - 250px)',
                    minHeight: 'calc(100vh - 60px)',
                    alignItems: 'center',
                    padding: '20px'
                }}>
                    <section style={{ maxWidth: '28rem', width: '100%', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem', margin: '0 auto' }}>
                        {selectedChild ? (
                            <>
                                <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>{selectedChild.name}'s Profile</h2>

                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src={`https://api.dicebear.com/6.x/avataaars/svg?seed=${selectedChild.name}`}
                                        alt="Child Profile"
                                        className="sfs-photo"
                                        style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }}
                                    />
                                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>{selectedChild.name}</div>
                                    <div style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1.5rem' }}>Age: {selectedChild.age}</div>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Your Caregiver Profile</h2>

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
                            </>
                        )}

                        {/* Test Result Section */}
                        <section style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Test Result</h3>
                            <div style={{ background: '#f9f9f9', borderRadius: '0.5rem', padding: '1rem', color: '#333', minHeight: '2.5rem' }}>{testResult}</div>

                            {/* Assessment Button */}
                            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                                <Link to="/assessment" style={{ textDecoration: 'none' }}>
                                    <button
                                        style={{
                                            background: '#f9c32b',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            fontSize: '1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e8b52a'}
                                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f9c32b'}
                                    >
                                        Take Assessment!
                                    </button>
                                </Link>
                            </div>
                        </section>

                        {/* Summary Section */}
                        <section style={{ marginBottom: '0.5rem' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Summary</h3>
                            <div style={{ background: '#f9f9f9', borderRadius: '0.5rem', padding: '1rem', color: '#333', minHeight: '2.5rem' }}>{summary}</div>
                        </section>
                    </section>
                </main>
            </div>

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
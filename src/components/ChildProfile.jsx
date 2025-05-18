import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { uploadAPI, profilesAPI } from '../services/api';

function ChildProfile({ 
    selectedChild, 
    testResult,
    summary, 
    onEditChild, 
    onSaveChild,
    onCancelEdit,
    editingChild
}) {
    const [editChildName, setEditChildName] = useState(editingChild ? editingChild.name : '');
    const [editChildAge, setEditChildAge] = useState(editingChild ? editingChild.age : '');
    const [editChildPic, setEditChildPic] = useState('');
    const [editChildPicFile, setEditChildPicFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    React.useEffect(() => {
        if (editingChild) {
            setEditChildName(editingChild.name);
            setEditChildAge(editingChild.age);
            setEditChildPic(editingChild.photoUrl || getDefaultAvatar(editingChild.name));
        }
    }, [editingChild]);

    const getDefaultAvatar = (name) => {
        return "https://api.dicebear.com/6.x/avataaars/svg?seed=" + (name || "default");
    };

    const handleChildPicChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditChildPic(reader.result);
                setEditChildPicFile(file);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChild = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let childPicUrl = editChildPic;

            // Upload new profile picture if one was selected
            if (editChildPicFile) {
                try {
                    const uploadResult = await uploadAPI.uploadFile(editChildPicFile, 'childProfile');
                    if (uploadResult && uploadResult.data && uploadResult.data.url) {
                        childPicUrl = uploadResult.data.url;
                    }
                } catch (uploadError) {
                    console.error("Error uploading child's picture:", uploadError);
                    setError("Failed to upload image: " + (uploadError.message || 'Unknown error'));
                    setLoading(false);
                    return;
                }
            }

            // Calculate birthDate from age for update
            const today = new Date();
            const birthYear = today.getFullYear() - parseInt(editChildAge, 10);
            const birthDate = new Date(birthYear, today.getMonth(), today.getDate()).toISOString().split('T')[0];

            // Update child data
            const updatedChild = {
                ...editingChild,
                name: editChildName,
                birthDate: birthDate,
                age: editChildAge,
                photoUrl: childPicUrl
            };

            // Call the backend API to update the profile
            await profilesAPI.updateProfile(editingChild.id, {
                name: editChildName,
                birthDate: birthDate,
                photoUrl: childPicUrl
            });

            // Call the parent handler to update UI
            onSaveChild(updatedChild);
            setSuccess('Child profile updated successfully!');
            
            setTimeout(() => {
                setSuccess('');
            }, 3000);
        } catch (error) {
            console.error('Error updating child profile:', error);
            setError('Failed to update child profile. Please try again.');
            setTimeout(() => {
                setError('');
            }, 3000);
        } finally {
            setLoading(false);
        }
    };

    // Generate avatar URL
    const avatarUrl = selectedChild?.photoUrl || getDefaultAvatar(selectedChild?.name);

    if (!selectedChild) {
        return <div>No child selected</div>;
    }

    if (editingChild && editingChild.id === selectedChild.id) {
        return (
            <form onSubmit={handleSaveChild} style={{ textAlign: 'center' }}>
                <h2 className="sfs-hero-title" style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
                    Edit {editChildName}'s Profile
                </h2>

                {error && (
                    <div style={{ padding: '8px', marginBottom: '10px', background: '#ffebee', color: '#c62828', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                {success && (
                    <div style={{ padding: '8px', marginBottom: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {success}
                    </div>
                )}
                
                <img 
                    src={editChildPic} 
                    alt="Child Profile preview" 
                    className="sfs-photo" 
                    style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover', marginBottom: '1.5rem' }} 
                />
                
                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="childProfilePic" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>
                        Profile Picture
                    </label>
                    <input
                        type="file"
                        id="childProfilePic"
                        accept="image/*"
                        className="sfs-login-input"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                        onChange={handleChildPicChange}
                    />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label htmlFor="editChildName" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>
                        Name
                    </label>
                    <input
                        type="text"
                        id="editChildName"
                        className="sfs-login-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                        value={editChildName}
                        onChange={e => setEditChildName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label htmlFor="editChildAge" style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: '#111' }}>
                        Age
                    </label>
                    <input
                        type="number"
                        id="editChildAge"
                        className="sfs-login-input"
                        style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc', fontSize: '1rem' }}
                        value={editChildAge}
                        onChange={e => setEditChildAge(e.target.value)}
                        min="1"
                        max="18"
                        required
                    />
                </div>

                <button 
                    type="submit" 
                    className="sfs-get-started-btn" 
                    style={{ marginRight: '1rem' }}
                    disabled={loading}
                >
                    {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                    type="button" 
                    className="sfs-link" 
                    style={{ 
                        background: 'none', 
                        border: 'none', 
                        color: '#f9c32b', 
                        fontWeight: 700, 
                        fontSize: '1rem', 
                        cursor: 'pointer' 
                    }} 
                    onClick={onCancelEdit}
                >
                    Cancel
                </button>
            </form>
        );
    }

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 className="sfs-hero-title" style={{ fontSize: '2rem', margin: 0 }}>
                    {selectedChild.name}'s Profile
                </h2>
                <button
                    onClick={() => onEditChild(selectedChild)}
                    className="sfs-link"
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#f9c32b',
                        fontWeight: 700,
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Edit Profile
                </button>
            </div>

            <div style={{ textAlign: 'center' }}>
                <img
                    src={avatarUrl}
                    alt="Child Profile"
                    className="sfs-photo"
                    style={{ 
                        width: '150px', 
                        height: '150px', 
                        borderRadius: '50%', 
                        objectFit: 'cover', 
                        marginBottom: '1.5rem' 
                    }}
                />
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem' }}>
                    {selectedChild.name}
                </div>
                <div style={{ fontSize: '1rem', color: '#666', marginBottom: '1.5rem' }}>
                    Age: {selectedChild.age}
                </div>

                <div className="sfs-assessment-section" style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.75rem' }}>Test Result</h3>
                    <p style={{ fontSize: '0.95rem', color: testResult && !testResult.toLowerCase().includes('no test') && !testResult.toLowerCase().includes('error') ? '#555' : '#777' }}>
                        {testResult || 'No test result available.'}
                    </p>
                    <Link 
                        to={`/assessment/${selectedChild.id}`} 
                        className="sfs-button sfs-take-assessment-btn" 
                        style={{ 
                            display: 'inline-block',
                            marginTop: '0.75rem', 
                            padding: '0.6rem 1.2rem', 
                            fontSize: '0.9rem' 
                        }}
                    >
                        {testResult && !testResult.toLowerCase().includes('no test') && !testResult.toLowerCase().includes('error') ? 'Retake Assessment' : 'Take Assessment'}
                    </Link>
                </div>

                <div className="sfs-summary-section" style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#333', marginBottom: '0.75rem' }}>Summary</h3>
                    {summary ? (
                        // If summary is a string with newlines from recommendations.join('\n')
                        summary.split('\n').map((line, index) => (
                            <p key={index} style={{ fontSize: '0.95rem', color: '#555', margin: '0 0 0.25rem 0' }}>{line}</p>
                        ))
                    ) : (
                        <p style={{ fontSize: '0.95rem', color: '#777' }}>No Summary Available</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default ChildProfile; 
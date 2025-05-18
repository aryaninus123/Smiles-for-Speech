import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { uploadAPI, profilesAPI } from '../services/api';
import { screeningAPI } from '../services/api';

function ChildProfile({
    selectedChild,
    testResult,
    summary,
    onEditChild,
    onSaveChild,
    onCancelEdit,
    editingChild,
    onDeleteChild,
    latestAssessmentId: parentAssessmentId  // Rename to avoid conflict
}) {
    const [editChildName, setEditChildName] = useState(editingChild ? editingChild.name : '');
    const [editChildAge, setEditChildAge] = useState(editingChild ? editingChild.age : '');
    const [editChildPic, setEditChildPic] = useState('');
    const [editChildPicFile, setEditChildPicFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [latestAssessmentId, setLatestAssessmentId] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
    const history = useHistory();

    // Set latestAssessmentId from parent when it changes
    React.useEffect(() => {
        console.log('Parent assessment ID updated:', parentAssessmentId);
        if (parentAssessmentId) {
            setLatestAssessmentId(parentAssessmentId);
        }
    }, [parentAssessmentId]);

    React.useEffect(() => {
        if (editingChild) {
            setEditChildName(editingChild.name);
            setEditChildAge(editingChild.age);
            setEditChildPic(editingChild.photoUrl || getDefaultAvatar(editingChild.name));
        }
    }, [editingChild]);

    // Fetch the latest assessment ID when the selected child changes
    React.useEffect(() => {
        if (selectedChild && selectedChild.id) {
            console.log(`Fetching assessments for child ID: ${selectedChild.id}`);
            
            // Create fetch function that can be called directly
            fetchLatestAssessment();
        }
    }, [selectedChild]);

    // Extract fetchLatestAssessment to be callable directly for refreshing
    const fetchLatestAssessment = async () => {
        if (!selectedChild || !selectedChild.id) return;
        
        try {
            // Add cache busting parameter to avoid stale data
            const timestamp = new Date().getTime();
            const response = await screeningAPI.getScreeningsByProfile(
                `${selectedChild.id}?nocache=${timestamp}`
            );
            console.log('Assessment response:', response);

            if (response && response.data && response.data.length > 0) {
                // Sort to ensure we have the latest assessment
                const sortedAssessments = [...response.data].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                // Get the latest assessment (first in the array, assuming it's sorted by date)
                const latestAssessment = sortedAssessments[0];
                console.log('Latest assessment found:', latestAssessment);
                setLatestAssessmentId(latestAssessment.id);
                console.log(`Set latestAssessmentId to: ${latestAssessment.id}`);
            } else {
                console.log('No assessments found for this child');
                setLatestAssessmentId(null);
            }
        } catch (error) {
            console.error('Error fetching assessment ID:', error);
            setLatestAssessmentId(null);
        }
    };

    // Add a function to handle taking a new assessment
    const handleTakeAssessment = () => {
        if (selectedChild && selectedChild.id) {
            // Set a flag to trigger refresh when user returns from assessment
            sessionStorage.setItem('refreshProfileAfterAssessment', 'true');
            sessionStorage.setItem('forceRefreshAI', 'true');
            
            // Use React Router's history to navigate instead of window.location
            history.push(`/assessment/${selectedChild.id}`);
        }
    };

    // Check for refresh flag when component mounts
    React.useEffect(() => {
        const shouldRefresh = sessionStorage.getItem('refreshProfileAfterAssessment');
        if (shouldRefresh) {
            console.log('Detected return from assessment, refreshing data...');
            sessionStorage.removeItem('refreshProfileAfterAssessment');
            
            // Set refreshing state to true (can use for UI indicator)
            setRefreshing(true);
            
            // Add a small delay to ensure the backend has processed the assessment
            setTimeout(() => {
                // Fetch fresh data
                fetchLatestAssessment().finally(() => {
                    setRefreshing(false);
                });
            }, 500);
        }
    }, []);

    const getDefaultAvatar = (name) => {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAPFBMVEXk5ueutLepsLPo6uursbXJzc/p6+zj5ea2u76orrKvtbi0ubzZ3N3O0dPAxcfg4uPMz9HU19i8wcPDx8qKXtGiAAAFTElEQVR4nO2d3XqzIAyAhUD916L3f6+f1m7tVvtNINFg8x5tZ32fQAIoMcsEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQRAEQTghAJD1jWtnXJPP/54IgNzZQulSmxvTH6oYXX4WS+ivhTbqBa1r26cvCdCu6i0YXbdZ0o4A1rzV+5IcE3YE+z58T45lqo7g1Aa/JY5tgoqQF3qb382x7lNzBLcxft+O17QUYfQI4IIeklKsPSN4i6LKj/7Zm8n99RbHJpEw9gEBXNBpKIYLJqKYRwjOikf//r+J8ZsVuacbqCMNleI9TqGLGqMzhnVdBOdd6F/RlrFijiCoVMk320CBIahUxTWI0KKEcJqKbMdpdJb5QvdHq6wCI5qhKlgGMS/RBHkubWDAE+QZxB4xhCyDiDkLZxgGEVdQldzSKbTIhmZkFkSEPcVvmBn2SMuZB9od7fQDsMiDdKJjFUSCQarM5WirZ3C2TT/htYnyPcPfgrFHWz0BI74gr6J/IZiGUxAZGQLqmvQLTrtE/Go4YxhVRIpEw+sww1IIcqr5NKmUUzLF3d4/qPkYIp2T/obPuemlojFUR4t9Q2Vojhb7BmgElWHzLPH8hucfpefPNFTVgs9h1AdU/Pin96vwWbWdf+X9Absn3OdO34aMdsDnP8WgKYisTqI6CkNGqZQo1XA6Ef6AU32SJzOcBukHPF07/xNSgmHKa5BOhtezv6mA/rYJpwXNAnbRZ1XuF3BzDcO3vpA3+ny2909gbqE4hhD3LIPhLLyBNhPZvbZ3B+3tPYa18A7auSlXQayKwTPNLKDcuOB0xPYKDPFTkWsevQPRZ1J8Hji9I1KQ34r7hZhrwNwOZ97QxNx0drwn4QI0wQk1DcEsfKCWKdxVvxPSNUIp/knmAXT+nT+Ko3+0H96rcNb3m1fx7MBTJdeBJ7uFcWsc0wvgAsC4pROW0l2inbAmIBv/7GZmuhQH6API2rr8T0e6yuZJ+80A9LZeG62T3tik31XwxtwZcizKuTHkMjB1WdZde4Kmic/A5ZI3rr1ae21d08PlVHYfAaxw9G9CYRbJ+8ZdbTcMRV1XM3VdF0M32vtoTdZ0+u29s0OttJ5bz64UwinjaFMVY9vkqc3KKSxN21Xl+0L4Q3Vuv1tYl0pqnX6ms4XetFz7gdZVAgUEoJntfOUe4ZwsHd9FzqQ3Vv6xe41l0XJcqcKl6TZvlv7ClAW3BsqQW4X7ypApB8dmTgK4IX5wvqIVj33HtD2qSG4BqznxdIefL27Y4sahi0MdIdvUsDva8agGGbCtITmCY31MHD2O0uIdh/0rJDQ1VX5Zdxz3rR2QDbv6qXl9vudzqQtGm1Jv9LDXOsfvvB7VcZ8PDKD0mQ1VHPYQ9O+Yj4hR1IUD8rBnn3ho2m8oQMxbCFiKlL2ioSW5heeJqegED52CzxCtcGD3Kv8Wms9EYLyUhwaFIhSMBClevWEmiK/Iaogu4H7sg6ppQhQG8RUqivuTGOAJOg6FfgW0q0M0PQMRMEgXaeNf3SYDZ8PIMI0+wHgr/MgN7wYwpiLjCCqM6ydUDZLQiB6nDdNC8SDyig3jPPpFXGcC9O8BUBDVmgBY59E7Md/35Loe/UVEECEJwYggJjELZ4J71SaQSBeC02n4Da29CayJNA28SAhd2CQyC1Xw6pSmGSINQVuMhAZp4DClan9MgmkDDNmezqwS8sgtlXK/EPBhoaSmYVC/F7IO1jQEdHOlabpKh3+jzLQSTUiq4X2I+Ip/zU8rlaqAvkS21ElR+gqu3zbjjL+hIAiCIAiCIAiCIAiCsCf/AKrfVhSbvA+DAAAAAElFTkSuQmCC";
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

    // Use assessment ID from the child profile if available (stored in backend)
    // Otherwise fall back to the ones we fetched or received from parent
    const assessmentId = selectedChild?.latestAssessmentId || parentAssessmentId || latestAssessmentId;
    console.log('Using assessment ID:', assessmentId, 'from profile:', selectedChild?.latestAssessmentId);

    if (!selectedChild) {
        return <div>No child selected</div>;
    }

    console.log('Current latestAssessmentId:', latestAssessmentId);

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
                    <div style={{
                        border: '2px dashed #f9c32b',
                        borderRadius: '0.5rem',
                        padding: '1.25rem',
                        backgroundColor: '#fffaf0',
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}>
                        <label htmlFor="childProfilePic" style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            cursor: 'pointer'
                        }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f9c32b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h7"></path>
                                <path d="M16 5h6v6"></path>
                                <path d="M8 12l8-8v8h-8z"></path>
                            </svg>
                            <span style={{
                                marginTop: '0.75rem',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                color: '#666'
                            }}>
                                Choose a new photo or drag it here
                            </span>
                            <span style={{
                                fontSize: '0.8rem',
                                color: '#888',
                                marginTop: '0.5rem'
                            }}>
                                JPG, PNG or GIF (max. 5MB)
                            </span>
                        </label>
                        <input
                            type="file"
                            id="childProfilePic"
                            name="childProfilePic"
                            accept="image/*"
                            style={{
                                width: '0.1px',
                                height: '0.1px',
                                opacity: 0,
                                overflow: 'hidden',
                                position: 'absolute',
                                zIndex: '-1'
                            }}
                            onChange={handleChildPicChange}
                        />
                    </div>
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
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#111', marginBottom: '0.5rem', textAlign: 'center', width: '100%' }}>
                    {selectedChild.name}
                </div>
                <div style={{ fontSize: '1.1rem', color: '#555', marginBottom: '1.5rem', textAlign: 'center' }}>
                    Age: {selectedChild.age}
                </div>
            </div>

            {/* Test Result Section */}
            <section style={{ marginTop: '2.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Test Result</h3>
                <div style={{ background: '#f9f9f9', borderRadius: '0.5rem', padding: '1rem', color: '#333', minHeight: '2.5rem' }}>{testResult}</div>

                {/* Assessment Button */}
                <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <button 
                        style={{
                            backgroundColor: '#e53935',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.5rem',
                            padding: '0.75rem 1.5rem',
                            fontSize: '1.1rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(229, 57, 53, 0.3)',
                            transition: 'all 0.2s ease'
                        }}
                        onClick={handleTakeAssessment}
                        disabled={refreshing}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#d32f2f';
                            e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#e53935';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                    >
                        {refreshing ? 'Loading...' : 'Take Assessment!'}
                    </button>
                </div>
            </section >

            {/* Summary Section */}
            <section style={{ marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f9c32b', marginBottom: '0.5rem' }}>Summary</h3>
                <div style={{ 
                    background: '#f9f9f9', 
                    borderRadius: '0.5rem', 
                    padding: '1rem', 
                    color: '#333', 
                    minHeight: '2.5rem',
                    whiteSpace: 'pre-line', // This helps preserve line breaks
                }}>
                    {summary}
                </div>
            </section>

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                {console.log('Rendering Next Steps button, assessmentId:', assessmentId)}
                {assessmentId ? (
                    <Link to={`/results/${assessmentId}`} style={{ textDecoration: 'none' }}>
                        <button
                            style={{
                                background: '#f9c32b',
                                color: 'white',
                                border: '2px solid #f9c32b',
                                borderRadius: '0.5rem',
                                padding: '0.75rem 1.5rem',
                                fontSize: '1.1rem',
                                fontWeight: '700',
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px #f9c32b',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9c32b';
                                e.currentTarget.style.transform = 'scale(1.02)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#f9c32b';
                                e.currentTarget.style.transform = 'scale(1)';
                            }}

                            aria-label="View next steps for the child (according to the assessment)"
                        >
                            More Details & Resources
                        </button>
                    </Link>
                ) : (
                    <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        Complete an assessment to see next steps
                    </div>
                )}
            </div>
        </>
    );
}

export default ChildProfile; 
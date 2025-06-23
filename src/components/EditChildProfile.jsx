import React, { useState, useEffect } from 'react';
import { profilesAPI } from '../services/api';

function EditChildProfile({ child, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: child.name || '',
        age: child.age || '',
        developmentHistory: child.developmentHistory || '',
        gender: child.gender || '',
        photoUrl: child.photoUrl || ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await profilesAPI.updateProfile(child.id, formData);
            if (response.success) {
                onSave(response.data);
            } else {
                setError('Failed to update profile. Please try again.');
            }
        } catch (err) {
            setError(err.message || 'An error occurred while updating the profile');
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div style={{ padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>Edit Child Profile</h3>
            
            {error && (
                <div style={{ 
                    padding: '10px', 
                    marginBottom: '20px', 
                    background: '#ffebee', 
                    color: '#c62828', 
                    borderRadius: '4px' 
                }}>
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="name" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '5px', 
                            fontWeight: '600' 
                        }}
                    >
                        Name *
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="age" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '5px', 
                            fontWeight: '600' 
                        }}
                    >
                        Age *
                    </label>
                    <input
                        type="number"
                        id="age"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        required
                        min="1"
                        max="18"
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="gender" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '5px', 
                            fontWeight: '600' 
                        }}
                    >
                        Gender
                    </label>
                    <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="developmentHistory" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '5px', 
                            fontWeight: '600' 
                        }}
                    >
                        Development History
                    </label>
                    <textarea
                        id="developmentHistory"
                        name="developmentHistory"
                        value={formData.developmentHistory}
                        onChange={handleChange}
                        rows="4"
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd',
                            resize: 'vertical'
                        }}
                        placeholder="Enter any relevant development history or notes"
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label 
                        htmlFor="photoUrl" 
                        style={{ 
                            display: 'block', 
                            marginBottom: '5px', 
                            fontWeight: '600' 
                        }}
                    >
                        Photo URL
                    </label>
                    <input
                        type="url"
                        id="photoUrl"
                        name="photoUrl"
                        value={formData.photoUrl}
                        onChange={handleChange}
                        style={{
                            width: '100%',
                            padding: '8px',
                            borderRadius: '4px',
                            border: '1px solid #ddd'
                        }}
                        placeholder="Enter photo URL"
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            background: '#f9c32b',
                            color: '#333',
                            border: 'none',
                            borderRadius: '4px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        style={{
                            padding: '10px 20px',
                            background: '#f5f5f5',
                            color: '#333',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontWeight: '600',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditChildProfile; 
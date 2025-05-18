import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { screeningAPI, resourcesAPI, profilesAPI } from './services/api';
import ResultsSummary from './ResultsSummary';

function ResultsPage() {
    const { id } = useParams();
    const history = useHistory();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [assessment, setAssessment] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [childInfo, setChildInfo] = useState(null);
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch the assessment data using the ID from URL params
                const response = await screeningAPI.getScreeningById(id);

                if (!response || !response.data) {
                    throw new Error('Assessment data not found');
                }

                const assessmentData = response.data;
                setAssessment(assessmentData);

                // Format answers for the ResultsSummary component
                if (assessmentData.answers) {
                    const formattedAnswers = Object.entries(assessmentData.answers).map(([id, value]) => ({
                        id,
                        answer: value
                    }));
                    setAnswers(formattedAnswers);
                }

                // Fetch child profile information if profileId exists
                if (assessmentData.profileId) {
                    try {
                        const profileResponse = await profilesAPI.getProfile(assessmentData.profileId);
                        if (profileResponse && profileResponse.data) {
                            setChildInfo(profileResponse.data);
                        }
                    } catch (profileError) {
                        console.error('Error fetching child profile:', profileError);
                        // Non-critical error, continue showing results
                    }
                }

                // Fetch recommendations based on risk level if available
                if (assessmentData.riskLevel) {
                    try {
                        const recommendationsResponse = await resourcesAPI.getResourcesByRiskLevel(assessmentData.riskLevel);
                        if (recommendationsResponse && recommendationsResponse.data) {
                            setRecommendations(recommendationsResponse.data);
                        }
                    } catch (recError) {
                        console.error('Error fetching recommendations:', recError);
                        // Use default recommendations from ResultsSummary if this fails
                    }
                }
            } catch (err) {
                console.error('Error fetching assessment:', err);
                setError('Failed to load assessment results. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        } else {
            setError('Assessment ID is missing. Please go back to the profile page and try again.');
            setLoading(false);
        }
    }, [id]);

    const handleBackToProfile = () => {
        // If we have child info, navigate to that child's profile
        if (childInfo && childInfo.id) {
            history.push(`/profile#child-${childInfo.id}`);
        } else {
            history.push('/profile');
        }
    };

    const handleTakeNewAssessment = () => {
        if (childInfo && childInfo.id) {
            history.push(`/assessment/${childInfo.id}`);
        } else {
            history.push('/profile');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner"></div>
                    <p style={{ marginTop: '1rem' }}>Loading assessment results...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ maxWidth: '36rem', margin: '2rem auto', padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Error</h2>
                <p>{error}</p>
                <button
                    onClick={handleBackToProfile}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    if (!assessment) {
        return (
            <div style={{ maxWidth: '36rem', margin: '2rem auto', padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#f9c32b', marginBottom: '1rem' }}>Assessment Not Found</h2>
                <p>We couldn't find the assessment you're looking for. It may have been deleted or you may not have permission to view it.</p>
                <button
                    onClick={handleBackToProfile}
                    style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem 1.5rem',
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                    }}
                >
                    Back to Profile
                </button>
            </div>
        );
    }

    // Add custom recommendations from backend if available
    const enhancedAssessment = {
        ...assessment,
        recommendations: recommendations.length > 0 ? recommendations : assessment.recommendations
    };

    return (
        <div className="sfs-root">
            <ResultsSummary
                answers={answers}
                savedResult={enhancedAssessment}
                onBack={handleBackToProfile}
                childInfo={childInfo}
            />
        </div>
    );
}

export default ResultsPage;
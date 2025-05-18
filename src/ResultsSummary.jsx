import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Updated categories to use string IDs that match the backend ('q1', 'q2', etc.)
const CATEGORIES = {
    'Social Awareness & Interaction': ['q1', 'q2', 'q4', 'q6', 'q7'],
    'Communication & Gestures': ['q3', 'q5', 'q9'],
    'Play & Imitation': ['q8', 'q10']
};

const RESPONSE_COLORS = {
    always: '#4CAF50',    // Green
    often: '#2196F3',     // Blue
    sometimes: '#f9c32b', // Yellow
    rarely: '#FF9800',    // Orange
    never: '#f44336'      // Red
};


const getSummaryForGroup = (counts) => {
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    // Consider "always" and "often" as positive indicators
    const positiveResponses = (counts.always || 0) + (counts.often || 0);
    // Consider "never" and "rarely" as concerning indicators
    const negativeResponses = (counts.never || 0) + (counts.rarely || 0);

    if (positiveResponses >= total / 2) return "Your child shows typical behaviors in this area.";
    if (negativeResponses >= total / 2) return "Some behaviors may be delayed. Consider speaking to a specialist.";
    return "Your child may be developing these skills. Keep observing.";
};

const getOverallSummary = (totalCounts) => {
    const total = Object.values(totalCounts).reduce((sum, count) => sum + count, 0);
    // Consider "always" and "often" as positive indicators
    const positiveResponses = (totalCounts.always || 0) + (totalCounts.often || 0);
    // Consider "never" and "rarely" as concerning indicators
    const negativeResponses = (totalCounts.never || 0) + (totalCounts.rarely || 0);

    if (positiveResponses >= total / 2) {
        return "Your child shows many expected behaviors. Keep supporting their growth!";
    }
    if (negativeResponses >= total / 2) {
        return "This screening suggests possible signs of delay. Consider speaking to a professional.";
    }
    return "You may want to continue observing your child's development.";
};

function ResultsSummary({ answers, savedResult, onBack, childInfo }) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('summary');
    const categoryCounts = {};
    const totalCounts = { always: 0, often: 0, sometimes: 0, rarely: 0, never: 0 };

    // Process answers differently based on whether they're from direct user input or savedResult
    let processedAnswers = answers;

    // If we have savedResult, use its answers instead
    if (savedResult && savedResult.answers) {
        processedAnswers = Object.entries(savedResult.answers).map(([id, value]) => ({
            id,
            answer: value
        }));
    }

    // Debug the answers
    console.log("Processing answers:", processedAnswers);

    Object.entries(CATEGORIES).forEach(([category, questionIds]) => {
        categoryCounts[category] = { always: 0, often: 0, sometimes: 0, rarely: 0, never: 0 };
        questionIds.forEach(id => {
            // Find the answer for this question by ID (either numeric or string)
            const answer = processedAnswers.find(a =>
                a.id === id || a.id === parseInt(id.replace('q', '')) || a.id.toString() === id
            )?.answer?.toLowerCase() || '';

            if (answer) {
                categoryCounts[category][answer.toLowerCase()]++;
                totalCounts[answer.toLowerCase()]++;
            }
        });
    });

    const getPercentage = (count, total) => (total > 0 ? (count / total) * 100 : 0);
    const total = Object.values(totalCounts).reduce((a, b) => a + b, 0);

    // Find the most common response
    const mainResponse = Object.entries(totalCounts)
        .sort(([, a], [, b]) => b - a)
        .filter(([, count]) => count > 0)[0]?.[0] || 'sometimes';

    // Get risk level and recommendations from saved result if available
    const riskLevel = savedResult?.riskLevel ||
        ((totalCounts.always || 0) + (totalCounts.often || 0) >= total / 2 ? 'Low' :
            (totalCounts.never || 0) + (totalCounts.rarely || 0) >= total / 2 ? 'High' : 'Medium');

    const recommendations = savedResult?.recommendations || [
        'Discuss these results with your child\'s healthcare provider',
        'Continue monitoring your child\'s development',
        'Engage in face-to-face play activities that encourage social interaction',
        'Create opportunities for communication through daily activities'
    ];

    // Local speech therapy resources for the Near You tab
    const localResources = [
        {
            name: 'Accra Speech Therapy Center',
            location: 'East Legon, Accra',
            contact: '+233 20 123 4567',
            services: 'Speech evaluation, articulation therapy, language intervention'
        },
        {
            name: 'Children\'s Communication Clinic',
            location: 'Osu, Accra',
            contact: '+233 24 987 6543',
            services: 'Pediatric speech therapy, developmental assessments'
        },
        {
            name: 'Korle Bu Speech and Hearing Center',
            location: 'Korle Bu Teaching Hospital, Accra',
            contact: '+233 30 268 3045',
            services: 'Speech and language assessments, audiology, intervention'
        },
        {
            name: 'Hope Speech Therapy',
            location: 'Tema, Greater Accra',
            contact: '+233 55 765 4321',
            services: 'Early intervention, developmental language therapy'
        }
    ];

    const TabButton = ({ id, label, active }) => (
        <button
            onClick={() => setActiveTab(id)}
            style={{
                padding: '0.75rem 1.5rem',
                background: active ? '#fff' : '#f5f5f5',
                border: '1px solid #e0e0e0',
                borderBottom: active ? 'none' : '1px solid #e0e0e0',
                borderRadius: active ? '0.5rem 0.5rem 0 0' : '0.5rem',
                marginRight: '0.5rem',
                cursor: 'pointer',
                fontWeight: active ? '600' : '400',
                color: active ? '#333' : '#666',
                position: 'relative',
                bottom: active ? '-1px' : '0'
            }}
        >
            {label}
        </button>
    );
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setError('');
            },
            (err) => {
                if (err.code === 1) {
                    setError('Permission denied. Please enable location access.');
                } else {
                    setError('Unable to retrieve your location.');
                }
            }
        );
    };

    return (
        <div style={{ maxWidth: '44rem', margin: '2rem auto', padding: '0 1rem' }}>
            <h1 style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 600, color: '#333', marginBottom: '2rem' }}>Assessment Results</h1>

            {/* Success Message if Result was Saved */}
            {savedResult && (
                <div style={{
                    background: '#e8f5e9',
                    color: '#2e7d32',
                    padding: '0.75rem 1rem',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    border: '1px solid #a5d6a7'
                }}>
                    Results have been saved successfully.
                </div>
            )}

            {/* Quick Summary Card */}
            <div style={{
                background: '#fff',
                borderRadius: '1rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                padding: '1.5rem',
                marginBottom: '2rem',
                border: '1px solid #e0e0e0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                        width: '4rem',
                        height: '4rem',
                        borderRadius: '50%',
                        background: RESPONSE_COLORS[mainResponse],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '1.2rem'
                    }}>
                        {Math.round(getPercentage(totalCounts[mainResponse], total))}%
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Quick Summary</h2>
                        <p>{getOverallSummary(totalCounts)}</p>
                    </div>
                </div>

                {savedResult && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#f5f5f5',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}>
                        <span style={{
                            fontWeight: '600',
                            color: riskLevel === 'Low' ? '#2e7d32' : riskLevel === 'Medium' ? '#f57c00' : '#c62828'
                        }}>
                            Risk Level: {riskLevel}
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation Tabs */}
            <div style={{ marginBottom: '0rem' }}>
                <TabButton id="summary" label="Detailed Results" active={activeTab === 'summary'} />
                <TabButton id="nextSteps" label="Next Steps" active={activeTab === 'nextSteps'} />
                <TabButton id="nearYou" label="Near You" active={activeTab === 'nearYou'} />
            </div>

            {/* Tab Content */}
            <div style={{
                background: '#fff',
                borderRadius: '0 0.5rem 0.5rem 0.5rem',
                padding: '1.5rem',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                border: '1px solid #e0e0e0',
                marginBottom: '2rem'
            }}>
                {activeTab === 'summary' && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Detailed Results</h2>

                        {Object.entries(categoryCounts).map(([category, counts]) => {
                            const categoryTotal = Object.values(counts).reduce((a, b) => a + b, 0);
                            const summary = getSummaryForGroup(counts);
                            return (
                                <div key={category} style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ color: '#333', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {category}
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{CATEGORIES[category].length} questions</span>
                                    </h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        {Object.entries(counts).map(([response, count]) => (
                                            <div key={response} style={{ marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ minWidth: '5rem', fontSize: '0.9rem' }}>{response.charAt(0).toUpperCase() + response.slice(1)}</span>
                                                    <div style={{ flex: 1, height: '1.25rem', background: '#eee', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${getPercentage(count, CATEGORIES[category].length)}%`,
                                                            height: '100%',
                                                            background: RESPONSE_COLORS[response],
                                                            transition: 'width 0.3s ease'
                                                        }} />
                                                    </div>
                                                    <span style={{ minWidth: '2rem', textAlign: 'right', fontSize: '0.9rem' }}>{count}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{
                                        padding: '0.75rem',
                                        background: '#f5f5f5',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.95rem'
                                    }}>
                                        {summary}
                                    </div>
                                </div>
                            );
                        })}

                        {savedResult?.notes && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem' }}>
                                <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Notes</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{savedResult.notes}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'nextSteps' && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Recommendations</h2>

                        <div style={{
                            padding: '1rem',
                            background: '#f5f5f5',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Risk Level Assessment</div>

                            <div style={{
                                padding: '0.5rem 1rem',
                                background: riskLevel === 'Low' ? '#e8f5e9' : riskLevel === 'Medium' ? '#fff3e0' : '#ffebee',
                                color: riskLevel === 'Low' ? '#2e7d32' : riskLevel === 'Medium' ? '#ef6c00' : '#c62828',
                                borderRadius: '0.25rem',
                                display: 'inline-block',
                                fontWeight: '600',
                                marginBottom: '0.5rem'
                            }}>
                                {riskLevel}
                            </div>

                            <p style={{ fontSize: '0.95rem' }}>
                                {riskLevel === 'Low'
                                    ? 'Based on your responses, your child appears to be developing typically in the areas assessed.'
                                    : riskLevel === 'Medium'
                                        ? 'Based on your responses, your child may need some additional support in certain developmental areas.'
                                        : 'Based on your responses, it is recommended to consult with a healthcare provider about your child\'s development.'}
                            </p>
                        </div>

                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '1rem' }}>What to do next:</div>
                            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                                {recommendations.map((rec, i) => (
                                    <li key={i} style={{ marginBottom: '0.75rem' }}>{rec}</li>
                                ))}
                            </ul>
                        </div>

                        {childInfo && (
                            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                                <Link to={`/assessment/${childInfo.id}`} style={{
                                    display: 'inline-block',
                                    padding: '0.75rem 1.5rem',
                                    background: '#f9c32b',
                                    color: 'white',
                                    fontWeight: '600',
                                    borderRadius: '0.5rem',
                                    textDecoration: 'none',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                    margin: '0 auto'
                                }}>
                                    Take Assessment Again
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'nearYou' && (
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Speech Therapists Near You</h2>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <button
                                onClick={getUserLocation}
                                style={{
                                    padding: '0.75rem 1rem',
                                    background: '#f9c32b',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    fontWeight: '600',
                                    cursor: 'pointer'
                                }}
                            >
                                Find Therapists Near Me
                            </button>

                            {error && (
                                <p style={{ color: '#c62828', marginTop: '0.5rem' }}>{error}</p>
                            )}

                            {location && (
                                <p style={{ marginTop: '0.5rem' }}>
                                    Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div>
                            <p style={{ marginBottom: '1.5rem' }}>Here are some speech therapy resources available in your region:</p>

                            {localResources.map((resource, i) => (
                                <div key={i} style={{
                                    padding: '1rem',
                                    background: '#f5f5f5',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1rem'
                                }}>
                                    <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '0.5rem' }}>{resource.name}</div>
                                    <div style={{ marginBottom: '0.25rem' }}><strong>Location:</strong> {resource.location}</div>
                                    <div style={{ marginBottom: '0.25rem' }}><strong>Contact:</strong> {resource.contact}</div>
                                    <div><strong>Services:</strong> {resource.services}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        padding: '0.75rem 1.5rem',
                        background: '#f5f5f5',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: '0.5rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Back to Profile
                </button>
            </div>
        </div>
    );
}

export default ResultsSummary; 
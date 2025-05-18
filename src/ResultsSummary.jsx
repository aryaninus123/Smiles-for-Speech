import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Updated categories to use string IDs that match the backend ('q1', 'q2', etc.)
const CATEGORIES = {
    'Social Awareness & Interaction': ['q1', 'q2', 'q4', 'q5', 'q7', 'q12', 'q13', 'q15'],
    'Communication & Gestures': ['q3', 'q9', 'q14'],
    'Play & Imitation': ['q6', 'q8', 'q10', 'q11']
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
    // For autism screening, "never" and "rarely" are positive indicators (lower risk)
    const positiveResponses = (counts.never || 0) + (counts.rarely || 0);
    // "always" and "often" are concerning indicators (higher risk)
    const concerningResponses = (counts.always || 0) + (counts.often || 0);

    if (positiveResponses >= total / 2) return "Your child shows typical development in this area.";
    if (concerningResponses >= total / 2) return "Some behaviors in this area may need further evaluation. Consider speaking to a specialist.";
    return "Your child shows mixed patterns in this area. Continue to observe their development.";
};

const getOverallSummary = (totalCounts) => {
    const total = Object.values(totalCounts).reduce((sum, count) => sum + count, 0);
    // For autism screening, "never" and "rarely" are positive indicators (lower risk)
    const positiveResponses = (totalCounts.never || 0) + (totalCounts.rarely || 0);
    // "always" and "often" are concerning indicators (higher risk)
    const concerningResponses = (totalCounts.always || 0) + (totalCounts.often || 0);

    if (positiveResponses >= total / 2) {
        return "Your child shows many typical social communication behaviors. Keep supporting their growth!";
    }
    if (concerningResponses >= total / 2) {
        return "The screening results indicate some behaviors that may suggest further evaluation is needed. It's recommended to discuss these observations with a healthcare professional for guidance.";
    }
    return "Your child shows some behaviors that may benefit from continued observation. Consider discussing the results with a developmental specialist.";
};

function ResultsSummary({ answers, savedResult, onBack, childInfo }) {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('summary');
    const [aiSummary, setAiSummary] = useState(null);
    const [loadingAiSummary, setLoadingAiSummary] = useState(false);
    const [aiError, setAiError] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
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
        ((totalCounts.never || 0) + (totalCounts.rarely || 0) >= total / 2 ? 'Low' :
            (totalCounts.always || 0) + (totalCounts.often || 0) >= total / 2 ? 'High' : 'Medium');

    // Get the summary text - from AI or fallback to default
    const summaryText = aiSummary?.overallSummary || getOverallSummary(totalCounts);

    // Get recommendations from AI or fall back to default recommendations
    const recommendations = aiSummary?.recommendations || [
        "Continue observing your child's behavior and note any changes over time.",
        "Engage in regular play activities that encourage social interaction.",
        "Consider scheduling a developmental screening with your pediatrician.",
        "Look into local early intervention programs that can provide additional support if needed."
    ];

    // Local resources data
    const localResources = [
        {
            title: 'Autism Awareness Care and Training (AACT)',
            link: 'https://aact-ghana.org/',
            snippet: 'A leading autism center in Accra providing assessment, therapy and support for children with autism and their families.'
        },
        {
            title: 'The Children\'s Hospital at Korle Bu Teaching Hospital',
            link: 'https://kbth.gov.gh/departments-and-units/child-health-department/',
            snippet: 'Pediatric specialists providing developmental assessments and therapy services for children with special needs.'
        },
        {
            title: 'Early Autism Project Ghana',
            link: 'https://eapghana.com/',
            snippet: 'Provides evidence-based ABA therapy and speech therapy services for children with autism in Ghana.'
        },
        {
            title: 'Multikids Inclusive Academy',
            link: 'https://multikidsafrica.org/',
            snippet: 'An inclusive education center offering speech therapy, occupational therapy and support for children with various developmental needs.'
        }
    ];

    const getUserLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                };
                setLocation(coords);
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

    const searchNearbyResources = () => {
        if (!location) {
            setError('Please get your location first');
            return;
        }

        setSearchLoading(true);

        // Simulate loading and then display resources directly on screen
        setTimeout(() => {
            // Set results to the local resources (simulating a search)
            setSearchResults(localResources);
            setSearchLoading(false);
        }, 1500);
    };

    // Effect to fetch AI-generated summary
    useEffect(() => {
        // Check for force refresh trigger
        const forceRefreshKey = sessionStorage.getItem('forceRefreshAI');
        if (forceRefreshKey) {
            sessionStorage.removeItem('forceRefreshAI');
            console.log('Force refresh detected');
        }

        const fetchAiSummary = async () => {
            if (!processedAnswers || processedAnswers.length === 0 || Object.keys(totalCounts).reduce((a, b) => a + b, 0) === 0) {
                console.log('Skipping AI fetch - insufficient data:', { processedAnswers, totalCounts });
                return;
            }

            setLoadingAiSummary(true);
            setAiError(null);

            try {
                console.log('Starting AI summary fetch with data:', { processedAnswers, savedResult, riskLevel });

                const formattedAnswers = {};
                processedAnswers.forEach(a => {
                    if (a && a.id) {
                        const id = a.id.toString().startsWith('q') ? a.id : `q${a.id}`;
                        formattedAnswers[id] = a.answer;
                    }
                });

                const childName = savedResult?.childName || "your child";
                const childAge = savedResult?.childAge || "young";

                // Prepare data for the Firebase function
                const requestData = {
                    childName: childName,
                    childAge: childAge,
                    assessmentData: formattedAnswers // Sending the detailed answers
                };

                console.log('Calling Firebase function generateOpenAISummary with:', requestData);

                const response = await fetch('http://localhost:5001/smiles-for-speech-1b81d/us-central1/generateOpenAISummary', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestData),
                });

                if (!response.ok) {
                    const errorData = await response.text(); // Try to get error text
                    console.error('Error response from Firebase function:', response.status, errorData);
                    throw new Error(`Network response was not ok: ${response.status} - ${errorData}`);
                }

                const summaryData = await response.json();

                console.log('AI summary result from Firebase function:', summaryData);

                if (summaryData && summaryData.overallSummary) { // Check for the new expected structure
                    setAiSummary(summaryData); // Store the whole object
                    console.log('Personalized AI summary received and set:', summaryData);
                } else if (summaryData && summaryData.rawSummary) {
                    // Handle cases where the OpenAI response wasn't perfect JSON but was wrapped
                    setAiSummary({
                        overallSummary: "AI response might need review: " + summaryData.rawSummary,
                        positiveObservations: [],
                        areasForSupport: [],
                        recommendations: [summaryData.errorParsing || "Please check the raw summary."]
                    });
                    setAiError(summaryData.errorParsing || 'AI summary was not in the expected format.');
                    console.warn('Received raw summary or parsing error from Firebase function:', summaryData);
                } else {
                    setAiError('Unable to generate AI summary. Using default recommendations.');
                    console.warn('Received incomplete or unexpected summary from Firebase function:', summaryData);
                }

            } catch (error) {
                console.error('Error fetching AI summary from Firebase function:', error);
                setAiError(`Error: ${error.message}. Using default recommendations.`);
            } finally {
                setLoadingAiSummary(false);
            }
        };

        fetchAiSummary();

        const timeoutId = setTimeout(() => {
            if (loadingAiSummary) {
                console.log('AI summary fetch timed out after 15 seconds'); // Increased timeout
                setLoadingAiSummary(false);
                setAiError('AI summary generation timed out. Using default recommendations.');
            }
        }, 15000); // Increased timeout to 15s

        return () => clearTimeout(timeoutId);
        // Ensure dependencies are correctly stringified if they are objects/arrays
    }, [JSON.stringify(processedAnswers), JSON.stringify(savedResult), riskLevel]); // Stringify complex dependencies

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

    // Near You Tab content
    const renderNearYouTab = () => (
        <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.2rem' }}>Find Resources Near You</h3>
                <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                    Click the button below to find special needs and speech therapy resources in your area.
                </p>

                <button
                    onClick={getUserLocation}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#4caf50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        fontSize: '1rem',
                        marginRight: location ? '1rem' : '0'
                    }}
                >
                    {location ? '✓ Location Found' : 'Find My Location'}
                </button>

                {location && (
                    <button
                        onClick={searchNearbyResources}
                        style={{
                            padding: '12px 20px',
                            backgroundColor: '#2196F3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            fontSize: '1rem'
                        }}
                        disabled={searchLoading}
                    >
                        {searchLoading ? 'Searching...' : 'Search All Resources'}
                    </button>
                )}
            </div>

            {error && (
                <div style={{
                    padding: '0.75rem 1rem',
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    textAlign: 'center'
                }}>
                    {error}
                </div>
            )}

            {searchLoading && (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{
                        display: 'inline-block',
                        borderTop: '3px solid #2196F3',
                        borderRight: '3px solid transparent',
                        borderBottom: '3px solid transparent',
                        borderLeft: '3px solid transparent',
                        borderRadius: '50%',
                        width: '30px',
                        height: '30px',
                        animation: 'spin 1s linear infinite'
                    }}></div>
                    <p style={{ marginTop: '1rem', color: '#666' }}>Searching for resources near you...</p>
                    <style>{`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                </div>
            )}

            {/* Display resources section - show when search is complete or as default */}
            {!searchLoading && (
                <div style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    marginBottom: '2rem'
                }}>
                    <h3 style={{
                        fontSize: '1.1rem',
                        marginBottom: '1rem',
                        color: '#333'
                    }}>
                        {searchResults.length > 0 ? 'Resources Near You' : 'Local Resources'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(searchResults.length > 0 ? searchResults : localResources).map((resource, index) => (
                            <div
                                key={index}
                                style={{
                                    padding: '1rem',
                                    backgroundColor: 'white',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                    border: '1px solid #e0e0e0'
                                }}
                            >
                                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#1976d2' }}>
                                    {resource.title}
                                </h4>
                                <p style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem', color: '#666' }}>
                                    {resource.snippet}
                                </p>
                                {resource.link && (
                                    <div style={{ textAlign: 'right' }}>
                                        <a
                                            href={resource.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                display: 'inline-block',
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#e3f2fd',
                                                color: '#1976d2',
                                                borderRadius: '0.25rem',
                                                textDecoration: 'none',
                                                fontWeight: '500',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Visit Website
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );

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
                        fontSize: '1.2rem',
                        minWidth: '4rem'
                    }}>
                        {riskLevel === 'Low' ? '✓' : riskLevel === 'Medium' ? '!' : '⚠️'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Quick Summary</h2>
                        {loadingAiSummary ? (
                            <div>
                                <p>Generating personalized assessment...</p>
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#2196F3', animation: 'pulse 1s infinite' }}></div>
                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#2196F3', animation: 'pulse 1s infinite 0.2s' }}></div>
                                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#2196F3', animation: 'pulse 1s infinite 0.4s' }}></div>
                                </div>
                                <style>
                                    {`
                                    @keyframes pulse {
                                        0% { transform: scale(1); opacity: 1; }
                                        50% { transform: scale(1.5); opacity: 0.7; }
                                        100% { transform: scale(1); opacity: 1; }
                                    }
                                    `}
                                </style>
                            </div>
                        ) : (
                            <p>{summaryText}</p>
                        )}
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

                {/* AI Generation Status Indicator */}
                <div style={{
                    marginTop: '1rem',
                    padding: '0.75rem',
                    background: '#e3f2fd',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#0d47a1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <strong>AI Status:</strong>
                    {loadingAiSummary ? 'Generating personalized summary...' :
                        aiSummary ? 'Personalized assessment completed' :
                            aiError ? 'Error: Using default content' : 'Using default content'}
                </div>

                {aiSummary?.note && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#e8f5e9',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#2e7d32'
                    }}>
                        <strong>Note:</strong> {aiSummary.note}
                    </div>
                )}

                {aiError && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: '#ffebee',
                        borderRadius: '0.5rem',
                        fontSize: '0.9rem',
                        color: '#c62828'
                    }}>
                        <strong>Error:</strong> {aiError}
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
                borderRadius: '0 1rem 1rem 1rem',
                border: '1px solid #e0e0e0',
                padding: '2rem'
            }}>
                {activeTab === 'summary' ? (
                    // Detailed Results Tab
                    <>
                        {Object.entries(CATEGORIES).map(([category, questionIds]) => {
                            const counts = categoryCounts[category];
                            const total = questionIds.length;
                            return (
                                <div key={category} style={{ marginBottom: '2rem' }}>
                                    <h3 style={{ color: '#333', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        {category}
                                        <span style={{ fontSize: '0.9rem', color: '#666' }}>{questionIds.length} questions</span>
                                    </h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        {Object.entries(counts).map(([response, count]) => (
                                            <div key={response} style={{ marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <span style={{ minWidth: '5rem', fontSize: '0.9rem' }}>{response.charAt(0).toUpperCase() + response.slice(1)}</span>
                                                    <div style={{ flex: 1, height: '1.25rem', background: '#eee', borderRadius: '0.25rem', overflow: 'hidden' }}>
                                                        <div style={{
                                                            width: `${getPercentage(count, total)}%`,
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
                                    <p style={{ fontSize: '0.95rem', color: '#666', marginTop: '0.5rem' }}>{getSummaryForGroup(counts)}</p>
                                </div>
                            );
                        })}

                        {savedResult?.notes && (
                            <div style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: '0.5rem' }}>
                                <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Notes</h3>
                                <p style={{ whiteSpace: 'pre-wrap' }}>{savedResult.notes}</p>
                            </div>
                        )}
                    </>
                ) : activeTab === 'nextSteps' ? (
                    // Next Steps Tab
                    <>
                        <div style={{
                            background: '#fff3e0',
                            padding: '1rem',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #f9c32b',
                            marginBottom: '1.5rem'
                        }}>
                            <strong>Important Note:</strong> This screening tool is not a diagnosis. It is designed to help identify potential areas that may need further evaluation.
                        </div>

                        {aiSummary && aiSummary.positiveObservations && aiSummary.positiveObservations.length > 0 ? (
                            <>
                                <h3 style={{ color: '#444', marginBottom: '1rem' }}>Positive Observations</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                    {aiSummary.positiveObservations.map((item, index) => (
                                        <li key={`pos-${index}`} style={{
                                            marginBottom: '0.75rem',
                                            paddingLeft: '1.5rem',
                                            position: 'relative'
                                        }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#4CAF50' }}>•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <h3 style={{ color: '#444', marginBottom: '1rem' }}>Positive Observations</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#4CAF50' }}>•</span>
                                        Shows a good foundation in responsive social behaviors
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#4CAF50' }}>•</span>
                                        Demonstrates engagement in social interactions
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#4CAF50' }}>•</span>
                                        Shows some interest in communication with others
                                    </li>
                                </ul>
                            </>
                        )}

                        {aiSummary && aiSummary.areasForSupport && aiSummary.areasForSupport.length > 0 ? (
                            <>
                                <h3 style={{ color: '#444', marginBottom: '1rem' }}>Areas for Support</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                    {aiSummary.areasForSupport.map((item, index) => (
                                        <li key={`sup-${index}`} style={{
                                            marginBottom: '0.75rem',
                                            paddingLeft: '1.5rem',
                                            position: 'relative'
                                        }}>
                                            <span style={{ position: 'absolute', left: 0, color: '#FF9800' }}>•</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <h3 style={{ color: '#444', marginBottom: '1rem' }}>Areas for Support</h3>
                                <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#FF9800' }}>•</span>
                                        May benefit from activities that encourage eye contact
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#FF9800' }}>•</span>
                                        Could use support with social gesture development
                                    </li>
                                    <li style={{ marginBottom: '0.75rem', paddingLeft: '1.5rem', position: 'relative' }}>
                                        <span style={{ position: 'absolute', left: 0, color: '#FF9800' }}>•</span>
                                        May need help with turn-taking in conversations
                                    </li>
                                </ul>
                            </>
                        )}

                        <h3 style={{ color: '#444', marginBottom: '1rem' }}>Suggested Steps</h3>
                        <ul style={{ listStyle: 'none', padding: 0, marginBottom: '2rem' }}>
                            {recommendations.map((step, index) => (
                                <li key={index} style={{
                                    marginBottom: '0.75rem',
                                    paddingLeft: '1.5rem',
                                    position: 'relative'
                                }}>
                                    <span style={{ position: 'absolute', left: 0, color: '#4CAF50' }}>•</span>
                                    {step}
                                </li>
                            ))}
                        </ul>


                    </>
                ) : (
                    // Near You Tab
                    renderNearYouTab()
                )}
            </div>

            {/* Back Button */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: '#f5f5f5',
                        border: '1px solid #ddd',
                        color: '#333',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '500'
                    }}
                >
                    Back to Profile
                </button>
            </div>

            {/* Privacy Note */}
            <div style={{
                marginTop: '1rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.9rem'
            }}>
                <p><em>Privacy Note: Your assessment answers are saved securely and used to provide you with personalized summaries and recommendations. We are committed to protecting your privacy in accordance with our <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">privacy policy</a>.</em></p>
            </div>
        </div>
    );
}

export default ResultsSummary; 
import React, { useState } from 'react';

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

function ResultsSummary({ answers, savedResult, onBack }) {
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
        .sort(([,a], [,b]) => b - a)
        .filter(([,count]) => count > 0)[0]?.[0] || 'sometimes';

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
                ) : (
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

                        <h3 style={{ color: '#444', marginBottom: '1rem' }}>Local Resources</h3>
                        <ul style={{ 
                            listStyle: 'none', 
                            padding: '0.5rem 1rem',
                            background: '#f5f5f5',
                            borderRadius: '0.5rem',
                            marginBottom: '0'
                        }}>
                            {[
                                'Autism Awareness Care and Training (AACT) - Accra',
                                'Your local district hospital\'s pediatric department',
                                'The Children\'s Hospital at Korle Bu Teaching Hospital'
                            ].map((resource, index) => (
                                <li key={index} style={{ 
                                    padding: '0.75rem',
                                    borderBottom: index !== 2 ? '1px solid #e0e0e0' : 'none'
                                }}>
                                    {resource}
                                </li>
                            ))}
                        </ul>
                    </>
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
                <p><em>Privacy Note: Your answers are saved securely in accordance with our privacy policy.</em></p>
            </div>
        </div>
    );
}

export default ResultsSummary; 
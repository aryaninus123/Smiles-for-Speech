import React, { useState } from 'react';

const CATEGORIES = {
    'Social Awareness & Interaction': [1, 2, 4, 6, 7],
    'Communication & Gestures': [3, 5, 9],
    'Play & Imitation': [8, 10]
};

const RESPONSE_COLORS = {
    often: '#4CAF50',    // Green
    sometimes: '#f9c32b', // Yellow
    never: '#f44336'     // Red
};

const getSummaryForGroup = (counts) => {
    const total = counts.often + counts.sometimes + counts.never;
    if (counts.often >= total / 2) return "Your child shows typical behaviors in this area.";
    if (counts.never >= total / 2) return "Some behaviors may be delayed. Consider speaking to a specialist.";
    return "Your child may be developing these skills. Keep observing.";
};

const getOverallSummary = (totalCounts) => {
    const total = totalCounts.often + totalCounts.sometimes + totalCounts.never;
    if (totalCounts.often >= total / 2) {
        return "Your child shows many expected behaviors. Keep supporting their growth!";
    }
    if (totalCounts.never >= total / 2) {
        return "This screening suggests possible signs of delay. Consider speaking to a professional.";
    }
    return "You may want to continue observing your child's development.";
};

function ResultsSummary({ answers }) {
    const [activeTab, setActiveTab] = useState('summary');
    const categoryCounts = {};
    const totalCounts = { often: 0, sometimes: 0, never: 0 };

    Object.entries(CATEGORIES).forEach(([category, questionIds]) => {
        categoryCounts[category] = { often: 0, sometimes: 0, never: 0 };
        questionIds.forEach(id => {
            const answer = answers.find(a => a.id === id)?.answer.toLowerCase() || '';
            if (answer) {
                categoryCounts[category][answer.toLowerCase()]++;
                totalCounts[answer.toLowerCase()]++;
            }
        });
    });

    const getPercentage = (count, total) => (total > 0 ? (count / total) * 100 : 0);
    const total = Object.values(totalCounts).reduce((a, b) => a + b, 0);
    const mainResponse = Object.entries(totalCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

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
                            {[
                                'Keep a daily journal of your child\'s behaviors and interactions',
                                'Engage in face-to-face play activities that encourage social interaction',
                                'Create opportunities for communication through daily activities',
                                'If concerned, seek evaluation from healthcare professionals'
                            ].map((step, index) => (
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

            {/* Privacy Note */}
            <div style={{ 
                marginTop: '1rem',
                textAlign: 'center',
                color: '#666',
                fontSize: '0.9rem'
            }}>
                <p><em>Privacy Note: Your answers are saved only on your device. No data is sent or stored on a server.</em></p>
            </div>
        </div>
    );
}

export default ResultsSummary; 
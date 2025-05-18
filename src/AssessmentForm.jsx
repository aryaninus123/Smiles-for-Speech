import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ResultsSummary from './ResultsSummary';
import { screeningAPI, profilesAPI } from './services/api';

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
    {
        id: 1,
        text: 'My child turns toward me when I call their name.',
    },
    {
        id: 2,
        text: 'My child maintains eye contact during conversations or playtime.',
    },
    {
        id: 3,
        text: 'My child uses gestures like pointing or waving to communicate wants or interests.',
    },
    {
        id: 4,
        text: 'My child looks at me when I speak to them.',
    },
    {
        id: 5,
        text: 'My child responds appropriately when their name is called.',
    },
    {
        id: 6,
        text: 'My child shows interest in playing with or being near other children.',
    },
    {
        id: 7,
        text: 'My child smiles back when someone smiles at them.',
    },
    {
        id: 8,
        text: 'My child brings or shows me objects just to share their interest (not only to get help).',
    },
    {
        id: 9,
        text: 'My child uses appropriate gestures in social situations (pointing, waving, nodding).',
    },
    {
        id: 10,
        text: 'My child imitates actions or behaviors they observe in others.',
    },
    {
        id: 11,
        text: 'My child engages in pretend play (like feeding a doll or driving toy cars).',
    },
    {
        id: 12,
        text: 'My child responds to my facial expressions with appropriate emotions.',
    },
    {
        id: 13,
        text: 'My child shows concern when someone is hurt or upset.',
    },
    {
        id: 14,
        text: 'My child takes turns in games or conversations.',
    },
    {
        id: 15,
        text: 'My child attempts to comfort others who are distressed.',
    },
];

const CHOICES = [
    { value: 'always', label: 'Always', color: '#4CAF50', hoverColor: '#45a049' },  // Green
    { value: 'often', label: 'Often', color: '#2196F3', hoverColor: '#1976D2' },    // Blue
    { value: 'sometimes', label: 'Sometimes', color: '#FFC107', hoverColor: '#FFA000' }, // Amber
    { value: 'rarely', label: 'Rarely', color: '#FF9800', hoverColor: '#F57C00' },   // Orange
    { value: 'never', label: 'Never', color: '#f44336', hoverColor: '#d32f2f' }     // Red
];

function AssessmentForm() {
    const { profileId } = useParams();
    const history = useHistory();
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [savingResult, setSavingResult] = useState(false);
    const [savedResult, setSavedResult] = useState(null);
    const [notes, setNotes] = useState('');

    // Fetch questions from API
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Temporarily force using fallback questions for testing
                console.log("Using hardcoded fallback questions for testing");
                setQuestions(FALLBACK_QUESTIONS);

                // Original code (commented out for testing)
                /*
                const response = await screeningAPI.getQuestions();
                if (response && response.data) {
                    setQuestions(response.data);
                } else {
                    // Fallback to hardcoded questions
                    setQuestions(FALLBACK_QUESTIONS);
                }
                */
            } catch (err) {
                console.error('Error fetching questions:', err);
                setError('Failed to load questions. Using default questions.');
                // Fallback to hardcoded questions
                setQuestions(FALLBACK_QUESTIONS);
            } finally {
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    const handleChange = (qid, value) => {
        setAnswers({ ...answers, [qid]: value });
    };

    const handleSubmit = async () => {
        // Format answers for backend - ensure IDs are properly formatted
        const formattedAnswersForBackend = {};
        Object.entries(answers).forEach(([id, value]) => {
            // Convert numeric ID to string ID with 'q' prefix if needed
            const formattedId = id.toString().startsWith('q') ? id : `q${id}`;
            formattedAnswersForBackend[formattedId] = value;
        });

        // Convert answers to format expected by ResultsSummary component
        const formattedAnswersForDisplay = Object.entries(answers).map(([id, value]) => ({
            id: id.toString().startsWith('q') ? id : `q${id}`,
            answer: value
        }));

        if (profileId) {
            setSavingResult(true);
            try {
                // Save to backend
                const result = await screeningAPI.createScreening({
                    profileId,
                    answers: formattedAnswersForBackend,
                    notes
                });

                if (result && result.data) {
                    setSavedResult(result.data);

                    // Redirect to the results page with the assessment ID
                    history.push(`/results/${result.data.id}`);

                    // Update the latest assessment ID in the child profile
                    try {
                        await profilesAPI.updateProfile(profileId, {
                            latestAssessmentId: result.data.id
                        });
                        console.log(`Stored latestAssessmentId ${result.data.id} in child profile ${profileId}`);
                    } catch (updateError) {
                        console.error('Error updating profile with assessment ID:', updateError);
                        // Continue with redirection even if this update fails
                    }

                    return; // Exit early after redirection
                }
            } catch (err) {
                console.error('Error saving screening result:', err);
                setError('Failed to save results to server, but you can still view them.');
                // Still show results even if save failed
                setShowResults(true);
            } finally {
                setSavingResult(false);
            }
        } else {
            // If no profileId, just show results without saving
            setShowResults(true);
        }
    };

    const handleBack = () => {
        if (profileId) {
            history.push(`/profile/${profileId}`);
        } else {
            history.push('/profile');
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading questions...</p>
            </div>
        );
    }

    if (showResults) {
        return (
            <ResultsSummary
                answers={Object.entries(answers).map(([id, value]) => ({
                    id: id.toString().startsWith('q') ? id : `q${id}`,
                    answer: value
                }))}
                savedResult={savedResult}
                onBack={handleBack}
            />
        );
    }

    const numAnswered = Object.keys(answers).length;
    const progress = Math.round((numAnswered / questions.length) * 100);
    const isFormComplete = numAnswered === questions.length;

    return (
        <>
            <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', textAlign: 'center', fontWeight: 700, color: '#333', marginBottom: '1rem', marginTop: '2rem' }}>Child Development Assessment</h1>

                <p style={{ textAlign: 'center', color: '#666', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: '38rem', margin: '0 auto 2rem' }}>
                    Please rate how frequently your child displays these behaviors, selecting from "Always" to "Never" for each statement.
                </p>
            </div>

            {error && (
                <div style={{
                    maxWidth: '44rem',
                    margin: '0 auto 2rem auto',
                    padding: '0.75rem 1rem',
                    background: '#ffebee',
                    color: '#c62828',
                    borderRadius: '0.5rem',
                    border: '1px solid #ef9a9a'
                }}>
                    {error}
                </div>
            )}

            <div style={{ maxWidth: '44rem', margin: '2rem auto', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem' }}>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Progress: {numAnswered} / {questions.length}</div>
                    <div style={{ background: '#eee', borderRadius: '0.5rem', height: '1rem', width: '100%' }}>
                        <div style={{ width: `${progress}%`, background: '#f9c32b', height: '100%', borderRadius: '0.5rem', transition: 'width 0.3s' }}></div>
                    </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()}>
                    {questions.map((q, idx) => (
                        <div key={q.id} style={{ marginBottom: '3rem', background: '#fafafa', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                            <div style={{ fontWeight: 600, color: '#111', marginBottom: '1.25rem', fontSize: '1.1rem' }}>{idx + 1}. {q.text}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {CHOICES.map(choice => (
                                    <button
                                        key={choice.value}
                                        type="button"
                                        onClick={() => handleChange(q.id, choice.value)}
                                        style={{
                                            flex: '1 1 18%',
                                            minWidth: '90px',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            color: answers[q.id] === choice.value ? '#fff' : '#333',
                                            background: answers[q.id] === choice.value ? choice.color : '#fff',
                                            borderRadius: '0.5rem',
                                            padding: '0.75rem 0.5rem',
                                            textAlign: 'center',
                                            border: answers[q.id] === choice.value ? `2px solid ${choice.color}` : '1px solid #ddd',
                                            transition: 'all 0.2s ease',
                                            boxShadow: answers[q.id] === choice.value ? `0 2px 5px rgba(0,0,0,0.2)` : 'none'
                                        }}
                                        onMouseOver={(e) => {
                                            if (answers[q.id] !== choice.value) {
                                                e.currentTarget.style.background = '#f5f5f5';
                                                e.currentTarget.style.borderColor = '#ccc';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (answers[q.id] !== choice.value) {
                                                e.currentTarget.style.background = '#fff';
                                                e.currentTarget.style.borderColor = '#ddd';
                                            }
                                        }}
                                        aria-label={`Select ${choice.label} for question ${idx + 1}`}
                                    >
                                        {choice.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {profileId && (
                        <div style={{ marginBottom: '2rem', background: '#f9f9f9', padding: '1.5rem', borderRadius: '0.75rem' }}>
                            <label htmlFor="notes" style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem', color: '#333' }}>
                                Additional Notes (optional)
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '120px',
                                    padding: '1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #ddd',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem',
                                    resize: 'vertical'
                                }}
                                placeholder="Add any additional observations or notes about your child's behavior..."
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
                        <button
                            onClick={handleBack}
                            style={{
                                background: '#f5f5f5',
                                color: '#333',
                                padding: '1rem 2rem',
                                borderRadius: '0.5rem',
                                border: '1px solid #ddd',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#eee';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = '#f5f5f5';
                            }}
                        >
                            Back
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!isFormComplete || savingResult}
                            style={{
                                background: isFormComplete ? '#4CAF50' : '#e0e0e0',
                                color: isFormComplete ? 'white' : '#999',
                                padding: '1rem 2.5rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: isFormComplete ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s',
                                boxShadow: isFormComplete ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                            }}
                            onMouseOver={(e) => {
                                if (isFormComplete) {
                                    e.currentTarget.style.background = '#45a049';
                                    e.currentTarget.style.boxShadow = '0 3px 7px rgba(0,0,0,0.15)';
                                }
                            }}
                            onMouseOut={(e) => {
                                if (isFormComplete) {
                                    e.currentTarget.style.background = '#4CAF50';
                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                                }
                            }}
                        >
                            {savingResult ? 'Saving...' : 'Submit Assessment'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AssessmentForm; 
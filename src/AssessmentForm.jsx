import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import ResultsSummary from './ResultsSummary';
import { screeningAPI, profilesAPI } from './services/api';

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
    {
        id: 1,
        text: 'Does your child respond to their name being called?',
    },
    {
        id: 2,
        text: 'Does your child make eye contact when interacting with others?',
    },
    {
        id: 3,
        text: 'Does your child use gestures (like pointing or waving) to communicate?',
    },
    {
        id: 4,
        text: 'Does your child look at you when you talk?',
    },
    {
        id: 5,
        text: 'Does your child respond when you call their name?',
    },
    {
        id: 6,
        text: 'Does your child watch or go near other children?',
    },
    {
        id: 7,
        text: 'Does your child smile back when someone smiles?',
    },
    {
        id: 8,
        text: 'Does your child show you things just to share?',
    },
    {
        id: 9,
        text: 'Does your child point, wave, or nod?',
    },
    {
        id: 10,
        text: 'Does your child copy what others do?',
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
                const response = await screeningAPI.getQuestions();
                if (response && response.data) {
                    setQuestions(response.data);
                } else {
                    // Fallback to hardcoded questions
                    setQuestions(FALLBACK_QUESTIONS);
                }
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
            <h1 style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 600, color: '#333', marginBottom: '2rem', marginTop: '2rem' }}>Questionnaire</h1>

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
                        <div key={q.id} style={{ marginBottom: '3rem' }}>
                            <div style={{ fontWeight: 600, color: '#111', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{idx + 1}. {q.text}</div>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                {CHOICES.map(choice => (
                                    <label
                                        key={choice.value}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            fontWeight: 500,
                                            color: answers[q.id] === choice.value ? '#fff' : '#333',
                                            background: answers[q.id] === choice.value ? choice.color : '#f6f6f6',
                                            borderRadius: '0.5rem',
                                            padding: '0.5rem 1rem',
                                            border: answers[q.id] === choice.value ? `2px solid ${choice.color}` : '1px solid #ccc',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name={`q_${q.id}`}
                                            value={choice.value}
                                            checked={answers[q.id] === choice.value}
                                            onChange={() => handleChange(q.id, choice.value)}
                                            style={{ marginRight: '0.5rem' }}
                                            aria-label={`Select ${choice.label} for question ${q.text}`}
                                        />
                                        {choice.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {profileId && (
                        <div style={{ marginBottom: '2rem' }}>
                            <label htmlFor="notes" style={{ display: 'block', fontWeight: 600, marginBottom: '0.75rem' }}>
                                Additional Notes (optional)
                            </label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{
                                    width: '100%',
                                    minHeight: '100px',
                                    padding: '0.75rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #ccc',
                                    fontFamily: 'inherit',
                                    fontSize: '1rem'
                                }}
                                placeholder="Add any additional observations or notes about your child's behavior..."
                            />
                        </div>
                    )}

                    <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', justifyContent: 'space-between' }}>
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
                        >
                            Cancel
                        </button>

                        <button
                            onClick={handleSubmit}
                            disabled={!isFormComplete || savingResult}
                            style={{
                                background: isFormComplete ? '#4CAF50' : '#aaa',
                                color: 'white',
                                padding: '1rem 2rem',
                                borderRadius: '0.5rem',
                                border: 'none',
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                cursor: isFormComplete ? 'pointer' : 'not-allowed',
                                transition: 'all 0.2s'
                            }}
                        >
                            {savingResult ? 'Saving...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}

export default AssessmentForm; 
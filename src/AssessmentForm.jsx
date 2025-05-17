import React, { useState } from 'react';
import ResultsSummary from './ResultsSummary';

const QUESTIONS = [
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
    { value: 'never', label: 'Never', color: '#f44336', hoverColor: '#d32f2f' },     // Red
    { value: 'rarely', label: 'Rarely', color: '#FF9800', hoverColor: '#F57C00' },   // Orange
    { value: 'sometimes', label: 'Sometimes', color: '#FFC107', hoverColor: '#FFA000' }, // Amber
    { value: 'often', label: 'Often', color: '#2196F3', hoverColor: '#1976D2' },    // Blue
    { value: 'always', label: 'Always', color: '#4CAF50', hoverColor: '#45a049' },  // Green
];
    

function AssessmentForm() {
    const [answers, setAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleChange = (qid, value) => {
        setAnswers({ ...answers, [qid]: value });
    };

    const handleSubmit = () => {
        const formattedAnswers = Object.entries(answers).map(([id, value]) => ({
            id: parseInt(id),
            answer: value
        }));
        setShowResults(true);
    };

    if (showResults) {
        return <ResultsSummary answers={Object.entries(answers).map(([id, value]) => ({ id: parseInt(id), answer: value }))} />;
    }

    const numAnswered = Object.keys(answers).length;
    const progress = Math.round((numAnswered / QUESTIONS.length) * 100);
    const isFormComplete = numAnswered === QUESTIONS.length;

    return (
        <>
        <h1 style={{ fontSize: '1.5rem', textAlign: 'center', fontWeight: 600, color: '#333', marginBottom: '2rem', marginTop: '2rem' }}>Questionnaire</h1>
        <div style={{ maxWidth: '44rem', margin: '2rem auto', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Progress: {numAnswered} / {QUESTIONS.length}</div>
                <div style={{ background: '#eee', borderRadius: '0.5rem', height: '1rem', width: '100%' }}>
                    <div style={{ width: `${progress}%`, background: '#f9c32b', height: '100%', borderRadius: '0.5rem', transition: 'width 0.3s' }}></div>
                </div>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                {QUESTIONS.map((q, idx) => (
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
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            background: answers[q.id] === choice.value ? choice.hoverColor : '#e9e9e9'
                                        }
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
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <button 
                        onClick={handleSubmit}
                        style={{
                            background: '#4CAF50',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '0.5rem',
                            border: 'none',
                            fontSize: '1.1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
        </>
    );
}

export default AssessmentForm; 
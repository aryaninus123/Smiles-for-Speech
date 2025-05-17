import React, { useState } from 'react';

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
    // Add more questions here
];

const CHOICES = [
    { value: 'very_likely', label: 'Very Likely' },
    { value: 'not_often', label: 'Not Often' },
    { value: 'not_likely', label: 'Not Likely' },
];

function AssessmentForm() {
    const [answers, setAnswers] = useState({});

    const handleChange = (qid, value) => {
        setAnswers({ ...answers, [qid]: value });
    };

    const numAnswered = Object.keys(answers).length;
    const progress = Math.round((numAnswered / QUESTIONS.length) * 100);

    return (
        <div style={{ maxWidth: '36rem', margin: '2rem auto', background: '#fff', borderRadius: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ fontWeight: 600, color: '#f9c32b', marginBottom: '0.5rem' }}>Progress: {numAnswered} / {QUESTIONS.length}</div>
                <div style={{ background: '#eee', borderRadius: '0.5rem', height: '1rem', width: '100%' }}>
                    <div style={{ width: `${progress}%`, background: '#f9c32b', height: '100%', borderRadius: '0.5rem', transition: 'width 0.3s' }}></div>
                </div>
            </div>

            <form>
                {QUESTIONS.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: '2rem' }}>
                        <div style={{ fontWeight: 600, color: '#111', marginBottom: '0.75rem', fontSize: '1.1rem' }}>{idx + 1}. {q.text}</div>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            {CHOICES.map(choice => (
                                <label key={choice.value} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontWeight: 500, color: '#333', background: answers[q.id] === choice.value ? '#f9c32b' : '#f6f6f6', borderRadius: '0.5rem', padding: '0.5rem 1rem', border: answers[q.id] === choice.value ? '2px solid #f9c32b' : '1px solid #ccc', transition: 'background 0.2s, border 0.2s' }}>
                                    <input
                                        type="radio"
                                        name={`q_${q.id}`}
                                        value={choice.value}
                                        checked={answers[q.id] === choice.value}
                                        onChange={() => handleChange(q.id, choice.value)}
                                        style={{ marginRight: '0.5rem' }}
                                    />
                                    {choice.label}
                                </label>
                            ))}
                        </div>
                    </div>
                ))}
            </form>
        </div>
    );
}

export default AssessmentForm; 
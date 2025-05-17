import React, { useState } from 'react';

const SECTIONS = {
    'understanding': {
        title: 'Understanding Autism',
        content: [
            {
                subtitle: 'What is Autism?',
                text: 'Autism, or Autism Spectrum Disorder (ASD), is a developmental condition that affects how a person perceives and interacts with the world. It can impact social skills, communication, and behavior in various ways.'
            },
            {
                subtitle: 'Early Signs',
                text: 'Early signs may include delayed speech, limited eye contact, difficulty with social interactions, repetitive behaviors, and intense interests in specific topics.'
            },
            {
                subtitle: 'Every Child is Unique',
                text: 'Autism presents differently in each person. Some may need significant support, while others may need minimal assistance in specific areas.'
            }
        ]
    },
    'myths': {
        title: 'Common Myths vs Facts',
        content: [
            {
                subtitle: 'Myth: Autism can be "cured"',
                text: 'Fact: Autism is not a disease that needs curing. It\'s a different way of developing and experiencing the world. Early intervention and support can help develop skills and strategies.'
            },
            {
                subtitle: 'Myth: Autistic people don\'t want friends',
                text: 'Fact: Many autistic people desire and maintain meaningful relationships. They may just interact and express friendship differently.'
            },
            {
                subtitle: 'Myth: Autistic people lack emotions',
                text: 'Fact: Autistic individuals experience the full range of emotions but might express them differently or have difficulty reading others\' emotional cues.'
            }
        ]
    },
    'support': {
        title: 'Supporting Development',
        content: [
            {
                subtitle: 'Early Intervention',
                text: 'Early support can significantly impact development. This may include speech therapy, occupational therapy, and behavioral support.'
            },
            {
                subtitle: 'Creating Routine',
                text: 'Consistent routines and clear communication can help reduce anxiety and build confidence.'
            },
            {
                subtitle: 'Celebrating Strengths',
                text: 'Focus on and nurture your child\'s interests and abilities. Many autistic individuals have exceptional skills in specific areas.'
            }
        ]
    }
};

const RESOURCES = [
    {
        title: 'Ghana Resources',
        links: [
            {
                name: 'Autism Awareness Care and Training (AACT)',
                url: 'http://aactgh.org',
                description: 'Provides support, training, and resources for families in Ghana'
            },
            {
                name: 'Autism Assistance Ghana',
                url: 'https://autismassistancegh.org',
                description: 'Offers educational programs and community support'
            }
        ]
    },
    {
        title: 'International Resources',
        links: [
            {
                name: 'Autism Speaks',
                url: 'https://www.autismspeaks.org',
                description: 'Comprehensive resource for autism research and support'
            },
            {
                name: 'WHO - Autism Spectrum Disorders',
                url: 'https://www.who.int/news-room/fact-sheets/detail/autism-spectrum-disorders',
                description: 'World Health Organization\'s official information'
            }
        ]
    }
];

function EducationPage() {
    const [activeSection, setActiveSection] = useState('understanding');

    const handleKeyPress = (event, section) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setActiveSection(section);
        }
    };

    return (
        <div className="sfs-root">
            <main className="sfs-hero" style={{ alignItems: 'stretch', paddingTop: '2rem', paddingBottom: '2rem' }}>
                <section style={{ 
                    maxWidth: '50rem', 
                    margin: '0 auto', 
                    background: '#fff', 
                    borderRadius: '1rem', 
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
                    padding: '2rem',
                    fontSize: '1rem', // Base font size for better readability
                    lineHeight: '1.6' // Improved line height for better readability
                }}>
                    <h1 className="sfs-hero-title" style={{ 
                        fontSize: 'clamp(1.875rem, 2.25rem, 2.5rem)', // Responsive font size
                        marginBottom: '1.5rem',
                        color: '#1a1a1a', // Darker color for better contrast
                        lineHeight: '1.2',
                        fontWeight: '700'
                    }}>
                        Learning About Autism
                    </h1>
                    
                    {/* Navigation Tabs */}
                    <div 
                        role="tablist"
                        aria-label="Autism information sections"
                        style={{ 
                            display: 'flex', 
                            gap: '1rem', 
                            marginBottom: '2rem',
                            flexWrap: 'wrap'
                        }}
                    >
                        {Object.keys(SECTIONS).map(section => (
                            <button
                                key={section}
                                role="tab"
                                aria-selected={activeSection === section}
                                aria-controls={`${section}-panel`}
                                id={`${section}-tab`}
                                onClick={() => setActiveSection(section)}
                                onKeyPress={(e) => handleKeyPress(e, section)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    background: activeSection === section ? '#f9c32b' : '#f6f6f6',
                                    border: '2px solid',
                                    borderColor: activeSection === section ? '#d4a012' : 'transparent',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                    fontWeight: activeSection === section ? '700' : '500',
                                    color: '#1a1a1a', // Darker text for better contrast
                                    fontSize: '1.125rem', // Larger font size for better readability
                                    transition: 'all 0.2s',
                                    minWidth: '160px', // Ensure buttons are large enough to tap
                                    textAlign: 'center'
                                }}
                            >
                                {SECTIONS[section].title}
                            </button>
                        ))}
                    </div>

                    {/* Content Sections */}
                    {Object.keys(SECTIONS).map(section => (
                        <div
                            key={section}
                            role="tabpanel"
                            id={`${section}-panel`}
                            aria-labelledby={`${section}-tab`}
                            hidden={activeSection !== section}
                            style={{ 
                                marginBottom: '2rem',
                                animation: activeSection === section ? 'fadeIn 0.3s ease-in' : 'none'
                            }}
                        >
                            {SECTIONS[section].content.map((item, index) => (
                                <div key={index} style={{ marginBottom: '2rem' }}>
                                    <h2 style={{ 
                                        fontSize: '1.5rem', 
                                        fontWeight: '700', 
                                        color: '#1a1a1a', // Darker color for better contrast
                                        marginBottom: '1rem',
                                        lineHeight: '1.3'
                                    }}>
                                        {item.subtitle}
                                    </h2>
                                    <p style={{ 
                                        marginBottom: '1.5rem',
                                        color: '#2d2d2d', // Dark enough for good contrast
                                        fontSize: '1.125rem', // Larger text for better readability
                                        maxWidth: '70ch' // Optimal line length for readability
                                    }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Resources Section */}
                    <h2 style={{ 
                        fontSize: '1.75rem', 
                        fontWeight: '700', 
                        color: '#1a1a1a', 
                        marginBottom: '1.5rem',
                        lineHeight: '1.3'
                    }}>
                        Resources & Support
                    </h2>
                    {RESOURCES.map((category, index) => (
                        <div key={index} style={{ marginBottom: '2rem' }}>
                            <h3 style={{ 
                                fontSize: '1.375rem', 
                                color: '#1a1a1a', 
                                marginBottom: '1rem',
                                fontWeight: '600',
                                lineHeight: '1.3'
                            }}>
                                {category.title}
                            </h3>
                            <div style={{ 
                                display: 'grid',
                                gap: '1rem',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))'
                            }}>
                                {category.links.map((link, linkIndex) => (
                                    <a
                                        key={linkIndex}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`${link.name} - ${link.description}`}
                                        style={{
                                            display: 'block',
                                            padding: '1.5rem',
                                            background: '#f8f8f8',
                                            borderRadius: '0.5rem',
                                            textDecoration: 'none',
                                            transition: 'all 0.2s',
                                            border: '2px solid #e0e0e0',
                                            outline: 'none',
                                            ':focus': {
                                                borderColor: '#1a1a1a',
                                                boxShadow: '0 0 0 2px #1a1a1a'
                                            }
                                        }}
                                    >
                                        <div style={{ 
                                            fontWeight: '700', 
                                            color: '#1a1a1a', // Better contrast than yellow
                                            marginBottom: '0.5rem',
                                            fontSize: '1.125rem'
                                        }}>
                                            {link.name}
                                        </div>
                                        <div style={{ 
                                            color: '#2d2d2d',
                                            fontSize: '1rem',
                                            lineHeight: '1.5'
                                        }}>
                                            {link.description}
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Additional Help Note */}
                    <div 
                        role="alert"
                        style={{ 
                            marginTop: '2rem',
                            padding: '1.5rem',
                            background: '#fff3e0',
                            borderRadius: '0.5rem',
                            borderLeft: '4px solid #d4a012', // Darker yellow for better contrast
                            fontSize: '1.125rem'
                        }}
                    >
                        <p style={{ 
                            margin: 0, 
                            color: '#1a1a1a', // Better contrast
                            lineHeight: '1.5'
                        }}>
                            <strong>Need immediate support?</strong> Contact your local healthcare provider or visit the nearest medical facility for professional guidance.
                        </p>
                    </div>
                </section>
            </main>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default EducationPage; 
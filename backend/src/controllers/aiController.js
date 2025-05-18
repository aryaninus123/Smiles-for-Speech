const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Generate a summary based on screening test results
 */
exports.generateSummary = async (req, res) => {
  try {
    const { answers, riskLevel } = req.body;
    
    if (!answers || !Array.isArray(answers) || !riskLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request: answers array and riskLevel are required' 
      });
    }

    // Create a prompt for the Gemini model
    const prompt = createPrompt(answers, riskLevel);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const summary = response.text();
    
    // Log the summary for debugging (optional)
    console.log('Generated summary:', summary);
    
    // Return the generated summary
    return res.status(200).json({
      success: true,
      summary: summary
    });
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate summary', 
      error: error.message 
    });
  }
};

/**
 * Create a prompt for the Gemini model based on test answers and risk level
 */
function createPrompt(answers, riskLevel) {
  // Map question IDs to their text
  const questionMap = {
    q1: "Does your child respond to their name being called?",
    q2: "Does your child make eye contact when interacting with others?",
    q3: "Does your child use gestures (like pointing or waving) to communicate?",
    q4: "Does your child look at you when you talk?",
    q5: "Does your child respond when you call their name?",
    q6: "Does your child watch or go near other children?",
    q7: "Does your child smile back when someone smiles?",
    q8: "Does your child show you things just to share?",
    q9: "Does your child point, wave, or nod?",
    q10: "Does your child copy what others do?"
  };

  // Format the answers for the prompt
  const formattedAnswers = answers.map(answer => {
    const questionText = questionMap[answer.id] || `Question ${answer.id}`;
    return `- ${questionText}: ${answer.answer}`;
  }).join('\n');

  return `
You are an expert child developmental specialist providing guidance about potential autism spectrum signs in children.

Based on the screening questionnaire below, provide a factual, supportive, and educational summary for parents about what these results might indicate. The overall risk level has been assessed as "${riskLevel}".

Questionnaire answers:
${formattedAnswers}

Your response should:
1. Acknowledge the screening is only preliminary and not diagnostic
2. Explain 2-3 specific observations from the answers that might be relevant to developmental considerations
3. Provide 2-3 practical, supportive suggestions for the parents
4. Emphasize the importance of consulting with healthcare professionals for proper evaluation
5. Be compassionate, factual, and avoid making definitive diagnoses
6. Be approximately 3-4 paragraphs in length

Begin your response with a brief introduction and end with encouragement.
`;
}

/**
 * Generate activity recommendations based on assessment results
 */
exports.generateActivities = async (req, res) => {
  try {
    const { answers, riskLevel } = req.body;
    
    if (!answers || !Array.isArray(answers) || !riskLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request: answers array and riskLevel are required' 
      });
    }

    // Create a prompt for activity recommendations
    const prompt = createActivityPrompt(answers, riskLevel);
    
    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response;
    const activities = response.text();
    
    // Return the generated activities
    return res.status(200).json({
      success: true,
      activities: activities
    });
  } catch (error) {
    console.error('Error generating AI activities:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to generate activities', 
      error: error.message 
    });
  }
};

/**
 * Create a prompt for activity recommendations
 */
function createActivityPrompt(answers, riskLevel) {
  // Get areas of concern from answers
  const concerns = getAreasOfConcern(answers);

  return `
You are an expert in child development providing activity recommendations for parents.

Based on a screening assessment, the child has been evaluated with a risk level of "${riskLevel}" 
for developmental concerns, with specific challenges in these areas:
${concerns}

Please provide 3-5 practical, engaging activities that parents can do at home to support their child's development.
For each activity:
1. Give it a simple, encouraging title
2. Provide clear, step-by-step instructions
3. Explain what developmental skill the activity helps with
4. Keep it accessible for parents without specialized materials or training

Format the activities in a clear, friendly way that parents can easily follow.
`;
}

/**
 * Extract areas of concern from answers
 */
function getAreasOfConcern(answers) {
  const concernAreas = {
    'social': ['q1', 'q4', 'q5', 'q6', 'q7'],
    'communication': ['q2', 'q3', 'q8', 'q9'],
    'behavior': ['q10']
  };
  
  const concerns = [];
  
  // Check if there are concerns in social area
  const socialAnswers = answers.filter(a => concernAreas.social.includes(a.id) && ['never', 'rarely'].includes(a.answer));
  if (socialAnswers.length >= 2) {
    concerns.push('social interaction');
  }
  
  // Check if there are concerns in communication area
  const commAnswers = answers.filter(a => concernAreas.communication.includes(a.id) && ['never', 'rarely'].includes(a.answer));
  if (commAnswers.length >= 2) {
    concerns.push('communication');
  }
  
  // Check if there are concerns in behavior area
  const behaviorAnswers = answers.filter(a => concernAreas.behavior.includes(a.id) && ['never', 'rarely'].includes(a.answer));
  if (behaviorAnswers.length >= 1) {
    concerns.push('repetitive behaviors');
  }
  
  return concerns.length > 0 
    ? concerns.join(', ') 
    : 'general developmental support';
} 
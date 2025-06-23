const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);

/**
 * Generate a summary based on screening test results
 */
exports.generateSummary = async (req, res) => {
  try {
    console.log('AI Summary Request Body:', req.body);

    // Extract data from request
    const { assessmentData, riskLevel, childName, childAge } = req.body;

    // For backward compatibility, also accept answers array
    const answers = req.body.answers || [];

    // If no assessmentData is provided, try to use the answers array
    let formattedAnswers = [];

    if (assessmentData && Object.keys(assessmentData).length > 0) {
      // Convert assessmentData object to array format for processing
      formattedAnswers = Object.entries(assessmentData).map(([id, answer]) => ({
        id,
        answer
      }));
    } else if (answers.length > 0) {
      formattedAnswers = answers;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: assessmentData or answers are required'
      });
    }

    if (!riskLevel) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request: riskLevel is required'
      });
    }

    console.log('Formatted answers for AI processing:', formattedAnswers);
    console.log('Risk level:', riskLevel);

    // Create a prompt for the Gemini model
    const prompt = createPrompt(formattedAnswers, riskLevel, childName, childAge);

    // For testing without API key, return dummy data
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.log('No API keys found. Returning mock data.');
      return res.status(200).json({
        success: true,
        overallSummary: "Based on the screening results, your child shows some behaviors that may benefit from continued observation. The responses indicate a mixed pattern of social communication skills. While this screening tool is not diagnostic, it provides helpful information about your child's development. It's recommended to discuss these observations with a healthcare professional for guidance.",
        positiveObservations: [
          "Responds well to their name being called",
          "Shows interest in other children"
        ],
        areasForSupport: [
          "May benefit from more practice with pointing and gestures",
          "Could use support with maintaining eye contact"
        ],
        recommendations: [
          "Continue engaging in social play activities",
          "Consider scheduling a developmental check-up",
          "Try activities that encourage pointing and showing objects",
          "Read together daily, encouraging interaction with the story"
        ]
      });
    }

    // Attempt to use Google's Gemini if available
    let model;
    let summary;
    let parsedResult;

    try {
      if (process.env.GEMINI_API_KEY) {
        // Google Gemini approach
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Generate content
        const result = await model.generateContent(prompt);
        const response = result.response;
        summary = response.text();

        // Parse the result
        parsedResult = parseAISummaryResponse(summary);
      } else {
        // Return mock data if no model available
        return res.status(200).json({
          success: true,
          overallSummary: "Based on the screening results, your child shows some behaviors that may benefit from continued observation. This screening tool provides helpful information but is not diagnostic. Consider discussing these observations with a healthcare professional.",
          recommendations: [
            "Continue observing your child's behavior and note any changes over time.",
            "Engage in regular play activities that encourage social interaction.",
            "Consider scheduling a developmental screening with your pediatrician.",
            "Look into local early intervention programs that can provide additional support."
          ]
        });
      }
    } catch (error) {
      console.error('Error generating AI content:', error);
      // Return graceful fallback for errors
      return res.status(200).json({
        success: true,
        overallSummary: "Based on the screening results, we recommend continued observation of your child's development. This screening tool provides helpful information but is not diagnostic. Consider discussing these results with a healthcare professional.",
        recommendations: [
          "Continue observing your child's behavior and note any changes over time.",
          "Engage in regular play activities that encourage social interaction.",
          "Consider scheduling a developmental screening with your pediatrician.",
          "Look into local early intervention programs that can provide additional support."
        ]
      });
    }

    // Return the generated summary
    return res.status(200).json({
      success: true,
      ...parsedResult
    });
  } catch (error) {
    console.error('Error in AI summary generation:', error);
    // Return a friendly error as successful response with fallback content
    return res.status(200).json({
      success: true,
      overallSummary: "We couldn't generate a personalized summary at this time. Based on the screening results, continued observation and discussion with healthcare professionals is recommended.",
      recommendations: [
        "Continue observing your child's behavior and note any changes over time.",
        "Engage in regular play activities that encourage social interaction.",
        "Consider scheduling a developmental screening with your pediatrician.",
        "Look into local early intervention programs that can provide additional support."
      ]
    });
  }
};

/**
 * Create a prompt for the Gemini model based on test answers and risk level
 */
function createPrompt(answers, riskLevel, childName = "the child", childAge = "young") {
  // Map question IDs to their text
  const questionMap = {
    q1: "Does your child turn toward you when you call their name?",
    q2: "Does your child maintain eye contact during conversations or playtime?",
    q3: "Does your child use gestures like pointing or waving to communicate wants or interests?",
    q4: "Does your child look at you when you speak to them?",
    q5: "Does your child respond appropriately when their name is called?",
    q6: "Does your child show interest in playing with or being near other children?",
    q7: "Does your child smile back when someone smiles at them?",
    q8: "Does your child bring or show you objects just to share their interest?",
    q9: "Does your child use appropriate gestures in social situations?",
    q10: "Does your child imitate actions or behaviors they observe in others?",
    q11: "Does your child engage in pretend play?",
    q12: "Does your child respond to your facial expressions with appropriate emotions?",
    q13: "Does your child show concern when someone is hurt or upset?",
    q14: "Does your child take turns in games or conversations?",
    q15: "Does your child attempt to comfort others who are distressed?"
  };

  // Format the answers for the prompt
  const formattedAnswers = answers.map(answer => {
    const questionText = questionMap[answer.id] || `Question ${answer.id}`;
    return `- ${questionText}: ${answer.answer}`;
  }).join('\n');

  return `
You are an expert child developmental specialist providing guidance about potential autism spectrum signs in children.

Based on the screening questionnaire below, provide a factual, supportive, and educational summary for parents about what these results might indicate. The overall risk level has been assessed as "${riskLevel}".

Child information:
- Name: ${childName}
- Age: ${childAge}

Questionnaire answers:
${formattedAnswers}

Provide your response in the following JSON format:
{
  "overallSummary": "A 2-3 paragraph summary of the assessment results that is factual, supportive, and educational",
  "positiveObservations": ["Positive observation 1", "Positive observation 2"],
  "areasForSupport": ["Area that might need support 1", "Area that might need support 2"],
  "recommendations": ["Specific recommendation 1", "Specific recommendation 2", "Specific recommendation 3", "Specific recommendation 4"]
}

The JSON should include:
1. An overallSummary acknowledging the screening is preliminary and not diagnostic
2. 2-3 positiveObservations highlighting strengths observed in the answers
3. 2-3 areasForSupport noting behaviors that might need additional support
4. 3-5 recommendations with practical, supportive suggestions for parents

Be compassionate, factual, avoid making definitive diagnoses, and emphasize the importance of consulting with healthcare professionals.
`;
}

/**
 * Parse the AI-generated summary response
 */
function parseAISummaryResponse(rawText) {
  try {
    // Try to extract JSON from the text (in case there's explanatory text around it)
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const jsonText = jsonMatch[0];
      const parsed = JSON.parse(jsonText);

      return {
        overallSummary: parsed.overallSummary || "Summary not available",
        positiveObservations: parsed.positiveObservations || [],
        areasForSupport: parsed.areasForSupport || [],
        recommendations: parsed.recommendations || []
      };
    }

    // If no JSON found, return the text as overall summary
    return {
      overallSummary: rawText,
      recommendations: [
        "Continue observing your child's behavior",
        "Engage in regular play activities",
        "Consider scheduling a developmental screening"
      ]
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return {
      overallSummary: "We couldn't parse the AI response. Please consider discussing the screening results with a healthcare professional.",
      recommendations: [
        "Continue observing your child's behavior",
        "Engage in regular play activities",
        "Consider scheduling a developmental screening"
      ]
    };
  }
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
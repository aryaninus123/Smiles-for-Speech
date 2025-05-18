/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const {OpenAI} = require('openai');
const fetch = require('node-fetch');

const path = require('path'); // Add path module
require('dotenv').config({path: path.resolve(__dirname, '.env')}); // Explicitly point to .env in the functions directory

// Get the API key, prioritizing Firebase config, then .env file
const apiKey = (functions.config().openai && functions.config().openai.key) || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('OpenAI API key is missing. Ensure it\'s set in Firebase config (openai.key) or in functions/.env (OPENAI_API_KEY).');
}

const openai = new OpenAI({
  apiKey: apiKey, // Use the resolved API key
});

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.generateOpenAISummary = functions.https.onRequest(async (request, response) => {
  // Set CORS headers for preflight requests
  response.set('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
  response.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    response.status(204).send('');
    return;
  }

  if (request.method !== 'POST') {
    response.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const {childName, childAge, assessmentData, riskLevel} = request.body;

    if (!childName || !childAge || !assessmentData) {
      response.status(400).send('Missing required fields: childName, childAge, assessmentData');
      return;
    }

    // Map of question IDs to their text for richer context
    const questionMap = {
      q1: 'Does your child respond to their name being called?',
      q2: 'Does your child make eye contact when interacting with others?',
      q3: 'Does your child use gestures (like pointing or waving) to communicate?',
      q4: 'Does your child look at you when you talk?',
      q5: 'Does your child respond when you call their name?',
      q6: 'Does your child watch or go near other children?',
      q7: 'Does your child smile back when someone smiles?',
      q8: 'Does your child show you things just to share?',
      q9: 'Does your child point, wave, or nod?',
      q10: 'Does your child copy what others do?',
    };

    // Enhanced prompt for better analysis of assessment answers
    let promptContent = `Generate a personalized summary and recommendations for a child named ${childName}, aged ${childAge}, based on an autism screening assessment. \n\n`;

    promptContent += 'The assessment uses a frequency scale (always, often, sometimes, rarely, never) for each statement about the child\'s behavior. ';
    promptContent += 'These statements are indicators of social communication and interaction skills typically assessed in autism screenings.\n\n';

    promptContent += 'Assessment Results:\n';

    // Create a more organized view of the assessment data
    // Group by response type to better analyze patterns
    const responseGroups = {
      always: [],
      often: [],
      sometimes: [],
      rarely: [],
      never: [],
    };

    // Add all questions and responses
    for (const [questionId, answerValue] of Object.entries(assessmentData)) {
      // Get the question number (strip 'q' prefix if present)
      const qNum = questionId.replace('q', '');

      const answerKey = answerValue.toLowerCase();
      // Add to appropriate response group
      if (responseGroups[answerKey]) {
        responseGroups[answerKey].push(qNum);
      }
    }

    // Add the grouped responses to the prompt
    for (const [ansType, questions] of Object.entries(responseGroups)) {
      if (questions.length > 0) {
        promptContent += `\n${ansType.toUpperCase()} responses for questions: ${questions.join(', ')}\n`;
      }
    }

    // Add the full question text and response for context
    promptContent += '\nDetailed responses (Question : Answer):\n';
    for (const [questionId, responseValue] of Object.entries(assessmentData)) {
      const idWithPrefix = questionId.toString().startsWith('q') ? questionId : `q${questionId}`;
      const questionText = questionMap[idWithPrefix] || `Question ${idWithPrefix}`;
      promptContent += `- ${questionText}: ${responseValue}\n`;
    }

    // Mention the overall risk level if provided
    if (riskLevel) {
      promptContent += `\nOverall screening risk level assessed as: ${riskLevel}. Use this information to guide the tone and depth of your recommendations.\n`;
    }

    promptContent += '\nThe questions assess behaviors like:\n';
    promptContent += '- Responding to name and maintaining eye contact\n';
    promptContent += '- Using gestures to communicate wants and interests\n';
    promptContent += '- Social interaction with others\n';
    promptContent += '- Imitation and pretend play\n';
    promptContent += '- Turn-taking in conversations\n';
    promptContent += '- Showing empathy and responding to others\' emotions\n\n';

    promptContent += 'Based on these results, provide:\n';
    promptContent += '1. A brief overall summary (2-3 sentences) of the child\'s current developmental status related to autism indicators.\n';
    promptContent += '2. Three specific positive observations or strengths based directly on the \'always\' and \'often\' responses.\n';
    promptContent += '3. Three specific areas where the child might need support based on the \'rarely\' and \'never\' responses.\n';
    promptContent += '4. Four actionable recommendations for parents or caregivers that specifically address the areas of need identified.\n\n';

    promptContent += 'Use the child\'s name and age to personalize the response. Keep the language clear, empathetic, and supportive. ';
    promptContent += 'The summary should be suitable for parents with no prior medical expertise. ';
    promptContent += 'Avoid definitive diagnoses. Focus on observations and recommendations for next steps.\n\n';

    promptContent += 'Format the output as a JSON object with these exact keys:\n';
    promptContent += '{\n';
    promptContent += '  "overallSummary": "[2-3 sentence summary]",\n';
    promptContent += '  "positiveObservations": ["[strength 1]", "[strength 2]", "[strength 3]"],\n';
    promptContent += '  "areasForSupport": ["[area 1]", "[area 2]", "[area 3]"],\n';
    promptContent += '  "recommendations": ["[recommendation 1]", "[recommendation 2]", "[recommendation 3]", "[recommendation 4]"]\n';
    promptContent += '}';

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {role: 'system', content: 'You are a helpful assistant for an autism screening application called Smiles for Speech. You provide personalized summaries based on screening results, with a focus on identifying both strengths and areas for support.'},
        {role: 'user', content: promptContent},
      ],
      temperature: 0.7, // Slightly increased for more nuanced responses
      max_tokens: 1000, // Ensure we have enough space for detailed responses
    });

    const summaryText = completion.choices[0].message.content;
    let summaryJson = {};

    // Try to parse the response as JSON, if not, use the text directly under a generic key
    try {
      summaryJson = JSON.parse(summaryText);
    } catch (e) {
      functions.logger.error('OpenAI response was not valid JSON:', summaryText, e);
      // Fallback: if the model didn't return perfect JSON, wrap the text.
      summaryJson = {'rawSummary': summaryText, 'errorParsing': 'AI response was not in the expected JSON format.'};
    }

    response.status(200).send(summaryJson);
  } catch (error) {
    functions.logger.error('Error calling OpenAI API:', error);
    if (error.response) {
      functions.logger.error('OpenAI API Error Response:', error.response.data);
      response.status(error.response.status || 500).send(error.response.data || 'Error generating summary from OpenAI.');
    } else {
      response.status(500).send(`Error generating summary: ${error.message}`);
    }
  }
});

exports.getNearbyPlaces = functions.https.onRequest(async (req, res) => {
  const {lat, lng, keyword} = req.query;
  const apiKey = (functions.config().openai && functions.config().openai.key) || process.env.OPENAI_API_KEY;

  if (!lat || !lng || !keyword) {
    return res.status(400).json({error: 'Missing parameters'});
  }

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=10000&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Google Places Error:', error);
    return res.status(500).json({error: error.message});
  }
});

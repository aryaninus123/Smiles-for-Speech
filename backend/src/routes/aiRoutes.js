const express = require('express');
const router = express.Router();
const { generateActivities } = require('../controllers/aiController');
const { OpenAI } = require('openai');

// Initialize OpenAI client using the key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Map of question IDs to their text (same as Cloud Function)
const QUESTION_MAP = {
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

// If you want auth on these routes, re-enable the middleware below
// const { requireAuth } = require('../middleware/auth');
// router.use(requireAuth);

// Generate activity recommendations based on assessment results
router.post('/activities', generateActivities);

/**
 * POST /api/ai/summary
 * Generate an OpenAI-based screening summary
 */
router.post('/summary', async (req, res) => {
  try {
    const { childName, childAge, assessmentData, riskLevel } = req.body;

    if (!childName || !childAge || !assessmentData) {
      return res
        .status(400)
        .json({ error: 'Missing required fields: childName, childAge, assessmentData' });
    }

    // Organise answers by response type for concise prompt
    const responseGroups = { always: [], often: [], sometimes: [], rarely: [], never: [] };

    for (const [qid, answer] of Object.entries(assessmentData)) {
      const qNum = qid.replace('q', '');
      const key = (answer || '').toLowerCase();
      if (responseGroups[key]) {
        responseGroups[key].push(qNum);
      }
    }

    // Build the prompt (same wording as Cloud Function)
    let prompt = `Generate a personalized summary and recommendations for a child named ${childName}, aged ${childAge}, based on an autism screening assessment.\n\n`;
    prompt += 'The assessment uses a frequency scale (always, often, sometimes, rarely, never) for each statement about the child\'s behavior. These statements are indicators of social communication and interaction skills typically assessed in autism screenings.\n\n';
    prompt += 'Assessment Results:';

    for (const [type, list] of Object.entries(responseGroups)) {
      if (list.length) {
        prompt += `\n${type.toUpperCase()} responses for questions: ${list.join(', ')}`;
      }
    }

    prompt += '\n\nDetailed responses (Question : Answer):\n';
    for (const [qid, answer] of Object.entries(assessmentData)) {
      const idWithPrefix = qid.toString().startsWith('q') ? qid : `q${qid}`;
      const text = QUESTION_MAP[idWithPrefix] || `Question ${idWithPrefix}`;
      prompt += `- ${text}: ${answer}\n`;
    }

    if (riskLevel) {
      prompt += `\nOverall screening risk level assessed as: ${riskLevel}. Use this information to guide the tone and depth of your recommendations.\n`;
    }

    prompt += '\nThe questions assess behaviors like:\n- Responding to name and maintaining eye contact\n- Using gestures to communicate wants and interests\n- Social interaction with others\n- Imitation and pretend play\n- Turn-taking in conversations\n- Showing empathy and responding to others\' emotions\n\n';

    prompt += 'Based on these results, provide:\n1. A brief overall summary (2-3 sentences).\n2. Three specific positive observations (from always/often).\n3. Three areas for support (from rarely/never).\n4. Four actionable recommendations.\n\n';

    prompt += 'Format the output strictly as JSON with keys: overallSummary, positiveObservations, areasForSupport, recommendations.';

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant for an autism screening application called Smiles for Speech. Provide clear, supportive, parent-friendly feedback.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content;
    let json;
    try {
      json = JSON.parse(raw);
    } catch (e) {
      json = { rawSummary: raw, errorParsing: 'AI response not valid JSON' };
    }

    return res.json(json);
  } catch (err) {
    console.error('OpenAI summary error:', err);
    return res.status(500).json({ error: err.message || 'OpenAI summary failed' });
  }
});

module.exports = router; 
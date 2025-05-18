/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require("firebase-functions");
const { OpenAI } = require("openai");
const path = require('path'); // Add path module
require("dotenv").config({ path: path.resolve(__dirname, '.env') }); // Explicitly point to .env in the functions directory

// Get the API key, prioritizing Firebase config, then .env file
const apiKey = functions.config().openai?.key || process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("OpenAI API key is missing. Ensure it's set in Firebase config (openai.key) or in functions/.env (OPENAI_API_KEY).");
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
  response.set("Access-Control-Allow-Origin", "*"); // Allow requests from any origin
  response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (request.method === "OPTIONS") {
    // Send response to OPTIONS requests
    response.status(204).send("");
    return;
  }

  if (request.method !== "POST") {
    response.status(405).send("Method Not Allowed");
    return;
  }

  try {
    const { childName, childAge, assessmentData } = request.body;

    if (!childName || !childAge || !assessmentData) {
      response.status(400).send("Missing required fields: childName, childAge, assessmentData");
      return;
    }

    // Constructing a more detailed prompt
    let promptContent = `Generate a personalized summary and recommendations for a child named ${childName}, aged ${childAge}. \n`;
    promptContent += "The child has undergone an autism screening with the following results:\n";

    // Assuming assessmentData is an object where keys are categories and values are scores/observations
    // e.g., { "Social Interaction": "Shows good eye contact", "Communication": "Uses simple sentences" }
    for (const [category, result] of Object.entries(assessmentData)) {
      promptContent += `- ${category}: ${result}\n`;
    }

    promptContent += "\nBased on these results, provide: \n";
    promptContent += "1. A brief overall summary of the child's current developmental status related to autism indicators.\n";
    promptContent += "2. Two to three positive observations or strengths.\n";
    promptContent += "3. Two to three areas where the child might need support or further observation.\n";
    promptContent += "4. Actionable recommendations for parents or caregivers, such as activities to encourage development in specific areas, or suggestions to consult with a specialist if certain signs are strong. \n";
    promptContent += "Keep the language clear, empathetic, and supportive. The summary should be suitable for parents with no prior medical expertise. Avoid definitive diagnoses. Focus on observations and recommendations for next steps. Format the output as a JSON object with keys 'overallSummary', 'positiveObservations', 'areasForSupport', and 'recommendations'. Ensure recommendations are practical and easy to understand.";


    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant for an autism screening application called Smiles for Speech. You provide personalized summaries based on screening results." },
        { role: "user", content: promptContent }
      ],
      // Enforce JSON output if the model/API supports it directly, or instruct it in the prompt.
      // For gpt-3.5-turbo, we ask for JSON in the prompt.
      // For newer models like gpt-4-turbo-preview, you can use response_format: { type: "json_object" }
    });

    let summaryText = completion.choices[0].message.content;
    let summaryJson = {};

    // Try to parse the response as JSON, if not, use the text directly under a generic key
    try {
        summaryJson = JSON.parse(summaryText);
    } catch (e) {
        functions.logger.error("OpenAI response was not valid JSON:", summaryText, e);
        // Fallback: if the model didn't return perfect JSON, wrap the text.
        // Or, you could try to extract parts using regex, but that's more brittle.
        summaryJson = { "rawSummary": summaryText, "errorParsing": "AI response was not in the expected JSON format." };
    }

    response.status(200).send(summaryJson);

  } catch (error) {
    functions.logger.error("Error calling OpenAI API:", error);
    if (error.response) {
      functions.logger.error("OpenAI API Error Response:", error.response.data);
      response.status(error.response.status || 500).send(error.response.data || "Error generating summary from OpenAI.");
    } else {
      response.status(500).send(`Error generating summary: ${error.message}`);
    }
  }
});

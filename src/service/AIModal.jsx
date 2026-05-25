/**
 * AIModal.jsx — Gemini API integration for TravelMate AI
 * Handles trip generation prompts and chat conversations.
 */
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GOOGLE_GEMINI_AI_APIKEY);

// ─── Trip Generation ─────────────────────────────────────────────────────────

/**
 * Build the structured prompt for trip generation.
 */
export const buildTripPrompt = ({ destination, days, budget, companion, companionCount, interests, mood }) => {
  return `Generate a complete travel plan for the following preferences:

Destination: ${destination}
Duration: ${days} days
Budget: ${budget} (Budget/Moderate/Luxury)
Travelers: ${companion} (${companionCount} people)
Interests: ${interests.join(', ')}
Mood: ${mood || 'Curious'}

Return ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "tripInfo": {
    "destination": "string",
    "country": "string",
    "bestTimeToVisit": "string",
    "weatherInfo": "string",
    "generalTips": ["tip1", "tip2", "tip3"]
  },
  "hotels": [
    {
      "hotelName": "string",
      "address": "string",
      "pricePerNight": "string",
      "rating": 4.5,
      "description": "string",
      "geoCoordinates": {"lat": 0.0, "lng": 0.0}
    }
  ],
  "itinerary": [
    {
      "day": 1,
      "theme": "string (e.g. Arrival & City Exploration)",
      "places": [
        {
          "placeName": "string",
          "placeDetails": "string",
          "timeToSpend": "string",
          "ticketPrice": "string",
          "geoCoordinates": {"lat": 0.0, "lng": 0.0},
          "bestTimeToVisit": "string"
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "accommodation": "string",
    "activities": "string",
    "food": "string",
    "transport": "string",
    "total": "string"
  }
}`;
};

/**
 * Generate a trip plan using Gemini.
 * Returns the parsed JSON object or throws on error.
 */
export const generateTripPlan = async (tripParams) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const prompt = buildTripPrompt(tripParams);

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Strip any markdown code fences before parsing
  const cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Attempt to extract JSON substring if there's surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Failed to parse Gemini response as JSON');
  }
};

// ─── Chat ─────────────────────────────────────────────────────────────────────

const CHAT_SYSTEM_CONTEXT = `You are TravelMate AI, a helpful and enthusiastic travel planning assistant. 
Help users plan trips, suggest destinations, estimate budgets, recommend activities, 
advise on packing, and answer any travel-related questions. 
Be concise, friendly, and practical. Format lists with bullet points when appropriate.`;

/**
 * Send a chat message to Gemini with full conversation history.
 * @param {Array} history - Array of {role: 'user'|'model', parts: [{text}]}
 * @param {string} userMessage - The new user message
 * @returns {string} AI response text
 */
export const sendChatMessage = async (history, userMessage) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  // Build conversation with system context prepended to the first message
  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({
    history: [
      {
        role: 'user',
        parts: [{ text: CHAT_SYSTEM_CONTEXT }],
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm TravelMate AI, ready to help you plan your perfect trip. What can I help you with today?" }],
      },
      ...formattedHistory,
    ],
  });

  const result = await chat.sendMessage(userMessage);
  return result.response.text();
};

// ─── API Health Check ─────────────────────────────────────────────────────────

/**
 * Test Gemini API connectivity (used by Admin dashboard).
 * @returns {boolean}
 */
export const testGeminiConnection = async () => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent('Reply with just: ok');
    return result.response.text().length > 0;
  } catch {
    return false;
  }
};

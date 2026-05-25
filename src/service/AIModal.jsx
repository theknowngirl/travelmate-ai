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
  return `Create a travel plan. Return ONLY valid JSON, no markdown.

Destination: ${destination}, Duration: ${days} days, Budget: ${budget}, Travelers: ${companion} (${companionCount}), Interests: ${interests.join(', ')}, Mood: ${mood || 'Curious'}

{"tripInfo":{"destination":"","country":"","bestTimeToVisit":"","weatherInfo":"","generalTips":[]},"hotels":[{"hotelName":"","address":"","pricePerNight":"","rating":4.5,"description":"","geoCoordinates":{"lat":0,"lng":0}}],"itinerary":[{"day":1,"theme":"","places":[{"placeName":"","placeDetails":"","timeToSpend":"","ticketPrice":"","geoCoordinates":{"lat":0,"lng":0},"bestTimeToVisit":""}]}],"budgetBreakdown":{"accommodation":"","activities":"","food":"","transport":"","total":""}}

Return 3 hotels, ${days} itinerary days with 3-4 places each.`;
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

const CHAT_SYSTEM_CONTEXT = `You are TravelMate AI, a helpful travel planning assistant. Help users plan trips, suggest destinations, estimate budgets, recommend activities, and advise on packing. Be concise, friendly, and practical. Use bullet points for lists.`;

/**
 * Send a chat message to Gemini with full conversation history.
 * @param {Array} history - Array of {role: 'user'|'model', parts: [{text}]}
 * @param {string} userMessage - The new user message
 * @returns {string} AI response text
 */
export const sendChatMessage = async (history, userMessage) => {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: CHAT_SYSTEM_CONTEXT,
  });

  const formattedHistory = history.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  const chat = model.startChat({ history: formattedHistory });
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
    const result = await model.generateContent('ok');
    return result.response.text().length > 0;
  } catch {
    return false;
  }
};

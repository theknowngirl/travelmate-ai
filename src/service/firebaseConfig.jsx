/**
 * firebaseConfig.jsx — localStorage helpers for TravelMate AI
 * Manages trip persistence and retrieval from browser localStorage.
 */

const TRIP_PREFIX = 'trip_';

/**
 * Save a generated trip to localStorage.
 * @param {Object} userSelection - Form data from CreateTrip
 * @param {Object} tripData - Parsed Gemini response
 * @param {Object} user - Authenticated user object
 * @returns {string} The generated trip ID
 */
export const saveTrip = (userSelection, tripData, user) => {
  const tripId = Date.now().toString();
  const tripRecord = {
    id: tripId,
    userSelection,
    tripData,
    userEmail: user?.email || 'anonymous',
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(`${TRIP_PREFIX}${tripId}`, JSON.stringify(tripRecord));
  return tripId;
};

/**
 * Retrieve a single trip by ID.
 * @param {string} tripId
 * @returns {Object|null}
 */
export const getTripById = (tripId) => {
  const raw = localStorage.getItem(`${TRIP_PREFIX}${tripId}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

/**
 * Retrieve all trips for a specific user, sorted by most recent first.
 * @param {string} userEmail
 * @returns {Array}
 */
export const getAllTrips = (userEmail) => {
  const trips = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TRIP_PREFIX)) {
      try {
        const trip = JSON.parse(localStorage.getItem(key));
        if (trip && trip.userEmail === userEmail) {
          trips.push(trip);
        }
      } catch {
        // Skip malformed entries
      }
    }
  }
  return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Retrieve ALL trips from localStorage (for admin use).
 * @returns {Array}
 */
export const getAllTripsAdmin = () => {
  const trips = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TRIP_PREFIX)) {
      try {
        const trip = JSON.parse(localStorage.getItem(key));
        if (trip) trips.push(trip);
      } catch {
        // Skip malformed entries
      }
    }
  }
  return trips.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

/**
 * Delete a trip by ID.
 * @param {string} tripId
 */
export const deleteTrip = (tripId) => {
  localStorage.removeItem(`${TRIP_PREFIX}${tripId}`);
};

/**
 * Count total trips in localStorage.
 * @returns {number}
 */
export const getTripCount = () => {
  let count = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TRIP_PREFIX)) count++;
  }
  return count;
};

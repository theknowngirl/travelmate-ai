/**
 * GlobalApi.jsx — Google Places API (New) integration for TravelMate AI
 * Fetches place photos and details for hotels and attractions.
 */

const PLACES_API_KEY = import.meta.env.VITE_GOOGLE_PLACE_APIKEY;
const PLACES_BASE_URL = 'https://places.googleapis.com/v1';

// Fallback image when Places API returns nothing
export const PLACEHOLDER_IMAGE = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80';

/**
 * Fetch a photo URL for a given place name using Google Places API (New).
 * Step 1: Text search to get photo reference
 * Step 2: Construct photo media URL
 *
 * @param {string} placeName - Name/query for the place
 * @returns {string} Photo URL or placeholder
 */
export const getPlacePhoto = async (placeName) => {
  if (!PLACES_API_KEY || PLACES_API_KEY === 'your_google_places_api_key') {
    return PLACEHOLDER_IMAGE;
  }

  try {
    const searchUrl = `${PLACES_BASE_URL}/places:searchText`;
    const response = await fetch(searchUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.photos',
      },
      body: JSON.stringify({ textQuery: placeName }),
    });

    if (!response.ok) return PLACEHOLDER_IMAGE;

    const data = await response.json();
    const photoRef = data?.places?.[0]?.photos?.[0]?.name;

    if (!photoRef) return PLACEHOLDER_IMAGE;

    // Construct photo media URL
    return `${PLACES_BASE_URL}/${photoRef}/media?maxWidthPx=800&key=${PLACES_API_KEY}`;
  } catch (error) {
    console.warn(`[Places API] Failed to fetch photo for "${placeName}":`, error.message);
    return PLACEHOLDER_IMAGE;
  }
};

/**
 * Fetch multiple place photos in parallel with a concurrency limit.
 * Returns a map of { placeName -> photoUrl }
 *
 * @param {string[]} placeNames
 * @returns {Object} { [placeName]: url }
 */
export const getMultiplePlacePhotos = async (placeNames) => {
  const results = {};
  // Process in batches of 4 to avoid rate limiting
  const BATCH_SIZE = 4;
  for (let i = 0; i < placeNames.length; i += BATCH_SIZE) {
    const batch = placeNames.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(async (name) => ({ name, url: await getPlacePhoto(name) }))
    );
    batchResults.forEach(({ name, url }) => { results[name] = url; });
  }
  return results;
};

/**
 * Test Places API connectivity (used by Admin dashboard).
 * @returns {boolean}
 */
export const testPlacesApiConnection = async () => {
  if (!PLACES_API_KEY || PLACES_API_KEY === 'your_google_places_api_key') {
    return false;
  }
  try {
    const response = await fetch(`${PLACES_BASE_URL}/places:searchText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': PLACES_API_KEY,
        'X-Goog-FieldMask': 'places.id',
      },
      body: JSON.stringify({ textQuery: 'Paris' }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

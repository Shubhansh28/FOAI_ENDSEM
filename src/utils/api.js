const HF_API = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEOCODE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// Detect if we're on production (Vercel) or local dev
const IS_PROD = !window.location.hostname.includes('localhost');

// In production, use Vercel serverless functions as proxy
// In development, call APIs directly
const getISSUrl = (endpoint) => {
  if (IS_PROD) {
    return `/api/iss?endpoint=${endpoint}`;
  }
  // In dev, use wheretheiss.at which supports CORS
  if (endpoint === 'position') return 'https://api.wheretheiss.at/v1/satellites/25544';
  return 'http://api.open-notify.org/astros.json';
};

const getNewsUrl = (category, query, max) => {
  if (IS_PROD) {
    if (query) return `/api/news?q=${encodeURIComponent(query)}&max=${max || 10}`;
    return `/api/news?category=${category || 'general'}&max=${max || 5}`;
  }
  // In dev, call GNews directly
  const apiKey = import.meta.env.VITE_NEWS_API_KEY;
  if (query) return `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${max || 10}&apikey=${apiKey}`;
  return `https://gnews.io/api/v4/top-headlines?category=${category || 'general'}&lang=en&max=${max || 5}&apikey=${apiKey}`;
};

/**
 * Fetch current ISS position
 */
export async function fetchISSPosition() {
  try {
    const url = getISSUrl('position');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`ISS API error: ${res.status}`);
    const data = await res.json();

    // Handle both API response formats
    if (data.iss_position) {
      // open-notify format (via Vercel proxy)
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        velocity: 0,
        timestamp: data.timestamp * 1000,
      };
    }
    // wheretheiss.at format (dev mode)
    return {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude),
      velocity: Math.round(data.velocity || 0),
      timestamp: (data.timestamp || Math.floor(Date.now() / 1000)) * 1000,
    };
  } catch (e) {
    console.error('ISS position fetch failed:', e.message);
    throw new Error('Failed to fetch ISS position. Please try again.');
  }
}

/**
 * Fetch people currently in space
 */
export async function fetchAstronauts() {
  try {
    const url = getISSUrl('astros');
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Astronauts API error: ${res.status}`);
    const data = await res.json();
    return {
      number: data.number || 0,
      people: (data.people || []).map(p => ({
        name: p.name,
        craft: p.craft || 'ISS',
      })),
    };
  } catch (e) {
    console.error('Astronauts fetch failed:', e.message);
    // Fallback data
    return {
      number: 7,
      people: [
        { name: 'Oleg Kononenko', craft: 'ISS' },
        { name: 'Nikolai Chub', craft: 'ISS' },
        { name: 'Tracy Dyson', craft: 'ISS' },
        { name: 'Matthew Dominick', craft: 'ISS' },
        { name: 'Michael Barratt', craft: 'ISS' },
        { name: 'Jeanette Epps', craft: 'ISS' },
        { name: 'Alexander Grebenkin', craft: 'ISS' },
      ],
    };
  }
}

/**
 * Reverse geocode lat/lon to a place name
 */
export async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `${GEOCODE_API}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return 'Unknown Location';
    const data = await res.json();
    if (data.locality) return `${data.locality}, ${data.countryName}`;
    if (data.city) return `${data.city}, ${data.countryName}`;
    if (data.countryName) return data.countryName;
    if (data.continent) return `${data.continent} (Ocean Region)`;
    return 'Over the Ocean';
  } catch {
    return 'Unknown Location';
  }
}

/**
 * Fetch news articles from GNews API (via proxy in production)
 */
export async function fetchNews(category = 'general', query = '') {
  try {
    const url = getNewsUrl(category, query);
    const res = await fetch(url);

    if (!res.ok) {
      if (res.status === 429) {
        throw new Error('Rate limited - please wait a moment and try again.');
      }
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.errors?.[0] || `News API error: ${res.status}`);
    }

    const data = await res.json();
    return data.articles || [];
  } catch (e) {
    console.error('News fetch failed:', e.message);
    throw e;
  }
}

/**
 * Chat with Hugging Face Mistral model
 */
export async function chatWithAI(messages, systemContext) {
  const token = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    throw new Error('Missing Hugging Face token. Add VITE_HF_TOKEN to your .env file.');
  }

  const prompt = `<s>[INST] You are SpaceDesk AI Assistant. You can ONLY answer questions using the following dashboard data. Do NOT use any outside knowledge. If the question is not related to the data provided, say "I can only answer questions about the ISS tracking data and news articles shown on this dashboard."

DASHBOARD DATA:
${systemContext}

User question: ${messages[messages.length - 1].content} [/INST]`;

  const res = await fetch(HF_API, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7,
        return_full_text: false,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 503) {
      throw new Error('Model is loading, please try again in 30 seconds...');
    }
    if (res.status === 429) {
      throw new Error('Too many requests. Please wait a moment...');
    }
    throw new Error(err.error || 'AI service unavailable');
  }

  const data = await res.json();
  return data[0]?.generated_text?.trim() || 'I could not generate a response. Please try again.';
}

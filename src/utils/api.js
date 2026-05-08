// Use HTTPS-compatible endpoints only
const ISS_APIS = [
  'https://api.wheretheiss.at/v1/satellites/25544',
  'https://corquaid.github.io/international-space-station-APIs/JSON/people-in-space.json',
];
const GNEWS_API = 'https://gnews.io/api/v4';
const HF_API = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEOCODE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

// Simple in-memory rate limiter
const lastFetchTimes = {};
function canFetch(key, minIntervalMs = 2000) {
  const now = Date.now();
  if (lastFetchTimes[key] && now - lastFetchTimes[key] < minIntervalMs) {
    return false;
  }
  lastFetchTimes[key] = now;
  return true;
}

/**
 * Fetch current ISS position with fallback
 */
export async function fetchISSPosition() {
  // Primary: wheretheiss.at API (HTTPS, has velocity data)
  try {
    const res = await fetch(ISS_APIS[0]);
    if (res.ok) {
      const data = await res.json();
      return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        velocity: Math.round(data.velocity),
        timestamp: data.timestamp * 1000,
      };
    }
  } catch (e) {
    console.warn('Primary ISS API failed, trying fallback...', e.message);
  }

  // Fallback: open-notify via HTTPS CORS proxy
  try {
    const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('http://api.open-notify.org/iss-now.json'));
    if (res.ok) {
      const data = await res.json();
      return {
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        velocity: 0, // No velocity data from this API
        timestamp: data.timestamp * 1000,
      };
    }
  } catch (e) {
    console.warn('Fallback ISS API also failed:', e.message);
  }

  throw new Error('Failed to fetch ISS position. Please try again.');
}

/**
 * Fetch people currently in space (HTTPS compatible)
 */
export async function fetchAstronauts() {
  // Try the static GitHub-hosted JSON first (always HTTPS, always works)
  try {
    const res = await fetch(ISS_APIS[1]);
    if (res.ok) {
      const data = await res.json();
      return {
        number: data.number || data.people?.length || 0,
        people: (data.people || []).map(p => ({
          name: p.name,
          craft: p.craft || p.station || 'ISS',
        })),
      };
    }
  } catch (e) {
    console.warn('GitHub astronauts API failed:', e.message);
  }

  // Fallback: CORS proxy for open-notify
  try {
    const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('http://api.open-notify.org/astros.json'));
    if (res.ok) {
      const data = await res.json();
      return { number: data.number, people: data.people };
    }
  } catch (e) {
    console.warn('Proxy astronauts API failed:', e.message);
  }

  // Hardcoded fallback data (current as of 2024-2025)
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

/**
 * Reverse geocode lat/lon to a place name
 */
export async function reverseGeocode(lat, lon) {
  if (!canFetch('geocode', 3000)) return null; // Don't update too frequently
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
 * Fetch news articles from GNews API
 */
export async function fetchNews(category = 'general', query = '') {
  const apiKey = import.meta.env.VITE_GNEWS_API_KEY || import.meta.env.VITE_NEWS_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GNews API key. Add VITE_NEWS_API_KEY to your .env file.');
  }

  let url;
  if (query) {
    url = `${GNEWS_API}/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${apiKey}`;
  } else {
    url = `${GNEWS_API}/top-headlines?category=${category}&lang=en&max=5&apikey=${apiKey}`;
  }

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
}

/**
 * Chat with Hugging Face Mistral model
 */
export async function chatWithAI(messages, systemContext) {
  const token = import.meta.env.VITE_HF_TOKEN || import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    throw new Error('Missing Hugging Face token. Add VITE_HF_TOKEN to your .env file.');
  }

  // Build prompt in Mistral instruct format
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

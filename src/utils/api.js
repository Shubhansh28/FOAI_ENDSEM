const ISS_POSITION_API = 'https://api.wheretheiss.at/v1/satellites/25544';
const OPEN_NOTIFY_API = 'http://api.open-notify.org';
const GNEWS_API = 'https://gnews.io/api/v4';
const HF_API = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const GEOCODE_API = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

/**
 * Fetch current ISS position
 */
export async function fetchISSPosition() {
  const res = await fetch(ISS_POSITION_API);
  if (!res.ok) throw new Error('Failed to fetch ISS position');
  const data = await res.json();
  return {
    latitude: parseFloat(data.latitude),
    longitude: parseFloat(data.longitude),
    velocity: Math.round(data.velocity),
    timestamp: data.timestamp * 1000,
  };
}

/**
 * Fetch people currently in space
 */
export async function fetchAstronauts() {
  const res = await fetch(`${OPEN_NOTIFY_API}/astros.json`);
  if (!res.ok) throw new Error('Failed to fetch astronauts');
  const data = await res.json();
  return { number: data.number, people: data.people };
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
  let prompt = `<s>[INST] You are SpaceDesk AI Assistant. You can ONLY answer questions using the following dashboard data. Do NOT use any outside knowledge. If the question is not related to the data provided, say "I can only answer questions about the ISS tracking data and news articles shown on this dashboard."

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
      throw new Error('Model is loading, please try again in a moment...');
    }
    throw new Error(err.error || 'AI service unavailable');
  }

  const data = await res.json();
  return data[0]?.generated_text?.trim() || 'I could not generate a response. Please try again.';
}

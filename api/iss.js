// Vercel serverless proxy for ISS API
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=5');

  const { endpoint } = req.query;

  try {
    let url;
    if (endpoint === 'position') {
      url = 'http://api.open-notify.org/iss-now.json';
    } else if (endpoint === 'astros') {
      url = 'http://api.open-notify.org/astros.json';
    } else {
      return res.status(400).json({ error: 'Invalid endpoint. Use ?endpoint=position or ?endpoint=astros' });
    }

    const response = await fetch(url);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch ISS data', details: error.message });
  }
}

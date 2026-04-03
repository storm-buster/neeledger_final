// Vercel Serverless Function: Geocoding Proxy (OpenStreetMap Nominatim)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10`;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'NeeLedger/1.0 (carbon-verification)' }
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Geocode error', err);
    res.status(500).json({ error: 'Failed to fetch geocode results' });
  }
}

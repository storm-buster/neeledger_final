// Vercel Serverless Function: Satellites Data
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

  // Embedded satellite data (from customerSatellites.json)
  const satellites = [
    {
      "id": "SAT-001",
      "name": "Sentinel-2A",
      "type": "Earth Observation",
      "operator": "ESA",
      "resolution": "10m",
      "coverage": "Global",
      "revisitTime": "5 days"
    },
    {
      "id": "SAT-002", 
      "name": "Landsat-8",
      "type": "Earth Observation",
      "operator": "NASA/USGS",
      "resolution": "30m",
      "coverage": "Global",
      "revisitTime": "16 days"
    },
    {
      "id": "SAT-003",
      "name": "Planet Dove",
      "type": "Commercial",
      "operator": "Planet Labs",
      "resolution": "3m",
      "coverage": "Global",
      "revisitTime": "Daily"
    }
  ];

  res.json(satellites);
}

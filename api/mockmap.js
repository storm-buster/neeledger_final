// Vercel Serverless Function: Mock Map Data
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

  const mock = {
    projects: [
      { id: 'PRJ-001', name: 'Amazon Restoration', coordinates: { lat: -3.4653, lng: -62.2159 }, country: 'Brazil', acva: 'ACVA-001' },
      { id: 'PRJ-002', name: 'Sumatra Reforestation', coordinates: { lat: -2.5489, lng: 118.0149 }, country: 'Indonesia', acva: 'ACVA-002' }
    ],
    acvas: [
      { id: 'ACVA-001', agencyName: 'Global Carbon Verification', country: 'India', contact: { email: 'verification@globalcarbon.com', phone: '+1-555-0123' }, coordinates: { lat: 37.7749, lng: -122.4194 } },
      { id: 'ACVA-002', agencyName: 'EcoVerify International', country: 'India', contact: { email: 'contact@ecoverify.de', phone: '+49-30-12345678' }, coordinates: { lat: 52.5200, lng: 13.4050 } }
    ]
  };

  res.json(mock);
}

const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://your-app.vercel.app']
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Simple geocode proxy to OpenStreetMap Nominatim
app.get('/api/geocode', async (req, res) => {
  const q = req.query.q;
  if (!q) return res.status(400).json({ error: 'Missing query parameter q' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'NeeLedger/0.1 (you@domain.example)' }
    });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    console.error('Geocode error', err);
    res.status(500).json({ error: 'Failed to fetch geocode results' });
  }
});

app.get('/', (req, res) => res.send('NeeLedger server running'));

// Mock XAI endpoint: accepts JSON { codePhrase, fileName } and returns simulated
// liveness verification and tree/carbon metrics. This is deterministic-ish using
// a small hash of the inputs to bias random values for reproducible demo outputs.
app.post('/api/xai', (req, res) => {
  const { codePhrase = '', fileName = '' } = req.body || {};

  // Simple hash -> seed
  const seedStr = (codePhrase + '|' + fileName).toString();
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  const rnd = () => {
    // xorshift-ish deterministic pseudorandom from h
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
  };

  // Simulate liveness sub-scores (movement, lip-sync) and combined liveness score
  const movementScore = Math.max(0, Math.min(1, 0.4 + rnd() * 0.6));
  const lipSyncScore = Math.max(0, Math.min(1, 0.3 + rnd() * 0.7));
  const livenessScore = +(0.5 * movementScore + 0.5 * lipSyncScore).toFixed(3);

  // Authenticity Pass/Fail based on combined metric (threshold 0.7)
  const authenticity = livenessScore >= 0.7 ? 'Pass' : 'Fail';

  // Mock tree & carbon metrics
  const treeCount = Math.round(50 + rnd() * 950); // 50 - 1000
  const canopyCover = +((20 + rnd() * 60).toFixed(1)); // 20% - 80%
  const co2Tonnes = +((treeCount * (0.8 + rnd() * 1.5)).toFixed(2));
  const uncertainty = +(0.05 + rnd() * 0.3).toFixed(3); // 0.05 - 0.35

  // Decision mapping based on livenessScore (confidence)
  let decisionCategory = 'Field Audit';
  if (livenessScore >= 0.95) decisionCategory = 'Auto Pre-approve';
  else if (livenessScore >= 0.7) decisionCategory = 'ACVA Manual Review';

  const payload = {
    treeCount,
    canopyCover,
    co2Tonnes,
    uncertainty,
    liveness: {
      movementScore,
      lipSyncScore,
      livenessScore,
      authenticity
    },
    decisionCategory
  };

  return res.json(payload);
});

// Return mock projects and ACVA list for the map UI
app.get('/api/mockmap', (req, res) => {
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
});

// Serve the provided customer satellites JSON for demo purposes
app.get('/api/satellites', (req, res) => {
  try {
    const sats = require('./customerSatellites.json');
    res.json(sats);
  } catch (err) {
    console.error('Failed to load customerSatellites.json', err);
    res.status(500).json({ error: 'Failed to load satellites' });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`NeeLedger server listening on ${port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS enabled for: ${JSON.stringify(corsOptions.origin)}`);
});

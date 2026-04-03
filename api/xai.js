// Vercel Serverless Function: Mock XAI Analysis
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { codePhrase = '', fileName = '' } = req.body || {};

  // Simple hash -> seed for deterministic random
  const seedStr = (codePhrase + '|' + fileName).toString();
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h ^= seedStr.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }

  const rnd = () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967295;
  };

  const movementScore = Math.max(0, Math.min(1, 0.4 + rnd() * 0.6));
  const lipSyncScore = Math.max(0, Math.min(1, 0.3 + rnd() * 0.7));
  const livenessScore = +(0.5 * movementScore + 0.5 * lipSyncScore).toFixed(3);
  const authenticity = livenessScore >= 0.7 ? 'Pass' : 'Fail';

  const treeCount = Math.round(50 + rnd() * 950);
  const canopyCover = +((20 + rnd() * 60).toFixed(1));
  const co2Tonnes = +((treeCount * (0.8 + rnd() * 1.5)).toFixed(2));
  const uncertainty = +(0.05 + rnd() * 0.3).toFixed(3);

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

  res.json(payload);
}

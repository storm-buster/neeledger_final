// Vercel Serverless Function: Local & Cloud Fallback Auth and PostgREST endpoints
import crypto from 'crypto';

// Helper to create a signed JWT matching Supabase session token format
function createMockJwt(user) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    sub: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    exp: now + (3600 * 24 * 7), // 7 days
    iat: now,
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      name: user.name,
      account_type: user.role
    }
  })).toString('base64url');

  const signature = crypto.createHmac('sha256', 'neeledger-local-secret').update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

// In-memory data stores for authentication and database
const localUsers = [
  {
    id: 'a0000000-0000-4000-a000-000000000001',
    email: 'admin@neeledger.org',
    password: 'adminpassword123',
    name: 'Platform Administrator',
    role: 'Project Developer',
    is_admin: true,
    is_disabled: false,
    credits: 50000,
    member_since: '2025-01-01T00:00:00.000Z',
    additional_data: { department: 'MRV Standards Board' }
  },
  {
    id: 'b0000000-0000-4000-b000-000000000002',
    email: 'user@neeledger.org',
    password: 'userpassword123',
    name: 'Aarav Sharma',
    role: 'Project Proponent',
    is_admin: false,
    is_disabled: false,
    credits: 2450,
    member_since: '2025-01-15T10:00:00.000Z',
    additional_data: { company: 'Sundarbans Coastal Biosphere Ltd' }
  }
];

const localProjects = [
  {
    id: 'prj-001-sundarbans',
    user_id: 'b0000000-0000-4000-b000-000000000002',
    name: 'Sundarbans Mangrove Delta Carbon Restoration',
    description: 'High-density Avicennia marina reforestation and coastal carbon sequestration across 450 hectares of tidal wetlands.',
    status: 'under_validation',
    country: 'India',
    region: 'West Bengal',
    latitude: 21.9497,
    longitude: 89.1833,
    created_at: '2025-02-10T08:30:00Z',
    updated_at: '2025-02-28T14:15:00Z',
    additional_data: {
      creditsIssued: 3820,
      bufferCredits: 573,
      riskAssessment: 'Low',
      country: 'India',
      area: 450,
      species: 'Avicennia marina'
    },
    documents: [],
    images: []
  },
  {
    id: 'prj-002-andaman',
    user_id: 'b0000000-0000-4000-b000-000000000002',
    name: 'Andaman Coastal Rhizophora Protection Zone',
    description: 'Conservation of pristine mature Rhizophora apiculata mangrove ecosystems with remote sensing biomass monitoring.',
    status: 'under_verification',
    country: 'India',
    region: 'Andaman Islands',
    latitude: 11.7401,
    longitude: 92.6586,
    created_at: '2025-01-15T11:00:00Z',
    updated_at: '2025-03-01T09:45:00Z',
    additional_data: {
      creditsIssued: 6150,
      bufferCredits: 922,
      riskAssessment: 'Low',
      country: 'India',
      area: 620,
      species: 'Rhizophora apiculata'
    },
    documents: [],
    images: []
  },
  {
    id: 'prj-003-kutch',
    user_id: 'b0000000-0000-4000-b000-000000000002',
    name: 'Gulf of Kutch Arid Coastal Restoration',
    description: 'Saline-tolerant blue carbon vegetation restoration for industrial buffering and coastal stabilization in Gujarat.',
    status: 'credits_released',
    country: 'India',
    region: 'Gujarat',
    latitude: 22.7548,
    longitude: 69.6917,
    created_at: '2024-11-20T10:00:00Z',
    updated_at: '2025-02-15T16:20:00Z',
    additional_data: {
      creditsIssued: 12400,
      bufferCredits: 1860,
      riskAssessment: 'Medium',
      country: 'India',
      area: 890,
      species: 'Avicennia marina'
    },
    documents: [],
    images: []
  }
];

const localNotifications = [
  {
    id: 'notif-1',
    user_id: 'a0000000-0000-4000-a000-000000000001',
    type: 'validation',
    title: 'New Validation Request',
    message: 'Sundarbans Mangrove Delta project submitted for ACVA assignment.',
    count: 1,
    read: false,
    timestamp: new Date().toISOString()
  },
  {
    id: 'notif-2',
    user_id: 'a0000000-0000-4000-a000-000000000001',
    type: 'verification',
    title: 'Verification In Progress',
    message: 'Andaman Coastal project desk audit passed; evidence hashes sealed on ledger.',
    count: 2,
    read: false,
    timestamp: new Date(Date.now() - 3600000).toISOString()
  }
];

function formatSupabaseUser(u) {
  return {
    id: u.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: u.email,
    email_confirmed_at: '2025-01-01T00:00:00.000Z',
    phone: '',
    confirmed_at: '2025-01-01T00:00:00.000Z',
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {
      name: u.name,
      account_type: u.role
    },
    identities: [
      {
        id: u.id,
        user_id: u.id,
        identity_data: { email: u.email, sub: u.id },
        provider: 'email',
        last_sign_in_at: new Date().toISOString(),
        created_at: u.member_since,
        updated_at: new Date().toISOString()
      }
    ],
    created_at: u.member_since,
    updated_at: new Date().toISOString()
  };
}

async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', chunk => { raw += chunk; });
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, Prefer, x-client-info, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'content-range, content-type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const parsedUrl = new URL(req.url, 'http://localhost');
  let subpath = req.query?._subpath || parsedUrl.pathname;
  subpath = subpath.replace(/^\/api\/supabase\/?/, '').replace(/^\/+/, '').replace(/\/+$/, '');

  const body = await parseBody(req);
  const query = req.query || {};

  // Auth: POST token
  if (subpath === 'auth/v1/token') {
    const grantType = query.grant_type || body.grant_type;
    if (grantType === 'password') {
      const normalizedEmail = (body.email || '').trim().toLowerCase();
      const user = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
      if (!user || user.password !== body.password) {
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid login credentials' });
      }
      if (user.is_disabled) {
        return res.status(400).json({ error: 'user_disabled', error_description: 'This account has been disabled.' });
      }
      return res.json({
        access_token: createMockJwt(user),
        token_type: 'bearer',
        expires_in: 3600 * 24 * 7,
        refresh_token: `mock-refresh-${user.id}`,
        user: formatSupabaseUser(user)
      });
    }

    if (grantType === 'refresh_token') {
      const refreshToken = body.refresh_token || '';
      const userId = refreshToken.replace('mock-refresh-', '');
      const user = localUsers.find(u => u.id === userId) || localUsers[0];
      return res.json({
        access_token: createMockJwt(user),
        token_type: 'bearer',
        expires_in: 3600 * 24 * 7,
        refresh_token: refreshToken || `mock-refresh-${user.id}`,
        user: formatSupabaseUser(user)
      });
    }
    return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Unsupported grant_type' });
  }

  // Auth: POST signup
  if (subpath === 'auth/v1/signup') {
    const normalizedEmail = (body.email || '').trim().toLowerCase();
    if (!normalizedEmail || !body.password) {
      return res.status(400).json({ error: 'invalid_request', message: 'Email and password required' });
    }
    const existing = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(400).json({ error: 'user_already_exists', message: 'User already registered' });
    }
    const newUser = {
      id: crypto.randomUUID(),
      email: normalizedEmail,
      password: body.password,
      name: body.data?.name || normalizedEmail.split('@')[0],
      role: body.data?.account_type || 'Project Developer',
      is_admin: false,
      is_disabled: false,
      credits: 1000,
      member_since: new Date().toISOString(),
      additional_data: {}
    };
    localUsers.push(newUser);
    return res.status(200).json({
      access_token: createMockJwt(newUser),
      token_type: 'bearer',
      expires_in: 3600 * 24 * 7,
      refresh_token: `mock-refresh-${newUser.id}`,
      user: formatSupabaseUser(newUser)
    });
  }

  // Auth: GET user
  if (subpath === 'auth/v1/user') {
    const authHeader = req.headers.authorization || req.headers.Authorization || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    if (!token) return res.status(401).json({ error: 'unauthorized', message: 'Missing Authorization token' });
    try {
      const [, payloadPart] = token.split('.');
      const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
      const user = localUsers.find(u => u.id === decoded.sub);
      if (!user) return res.status(404).json({ error: 'user_not_found', message: 'User not found' });
      return res.json(formatSupabaseUser(user));
    } catch {
      return res.status(401).json({ error: 'invalid_token', message: 'Invalid JWT' });
    }
  }

  // Auth: POST logout
  if (subpath === 'auth/v1/logout') {
    return res.status(200).json({});
  }

  // Rest: /rest/v1/users
  if (subpath === 'rest/v1/users') {
    if (req.method === 'GET') {
      let list = [...localUsers];
      if (query.id) {
        const targetId = String(query.id).replace(/^eq\./, '');
        list = list.filter(u => u.id === targetId);
      }
      if (query.email) {
        const targetEmail = String(query.email).replace(/^eq\./, '').toLowerCase();
        list = list.filter(u => u.email.toLowerCase() === targetEmail);
      }
      const results = list.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        is_admin: u.is_admin,
        is_disabled: u.is_disabled,
        credits: u.credits,
        kyc_status: 'Done',
        member_since: u.member_since,
        additional_data: u.additional_data || {}
      }));
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('vnd.pgrst.object+json')) {
        if (results.length === 0) {
          return res.status(406).json({ message: 'JSON object requested, multiple (or no) rows returned' });
        }
        return res.json(results[0]);
      }
      return res.json(results);
    }

    if (req.method === 'POST' || req.method === 'PATCH') {
      const payload = Array.isArray(body) ? body[0] : body;
      if (!payload || !payload.id) return res.status(400).json({ message: 'User id is required' });
      let existing = localUsers.find(u => u.id === payload.id);
      if (existing) {
        existing.name = payload.name || existing.name;
        existing.role = payload.role || existing.role;
        existing.additional_data = { ...(existing.additional_data || {}), ...(payload.additional_data || {}) };
      } else {
        existing = {
          id: payload.id,
          email: payload.email || '',
          password: '',
          name: payload.name || 'User',
          role: payload.role || 'Project Developer',
          is_admin: false,
          is_disabled: false,
          credits: payload.credits || 1000,
          member_since: payload.member_since || new Date().toISOString(),
          additional_data: payload.additional_data || {}
        };
        localUsers.push(existing);
      }
      const safeRecord = {
        id: existing.id,
        email: existing.email,
        name: existing.name,
        role: existing.role,
        is_admin: existing.is_admin,
        is_disabled: existing.is_disabled,
        credits: existing.credits,
        member_since: existing.member_since,
        additional_data: existing.additional_data
      };
      const acceptHeader = req.headers.accept || '';
      if (acceptHeader.includes('vnd.pgrst.object+json')) {
        return res.status(req.method === 'POST' ? 201 : 200).json(safeRecord);
      }
      return res.status(req.method === 'POST' ? 201 : 200).json([safeRecord]);
    }
  }

  // Rest: /rest/v1/projects
  if (subpath === 'rest/v1/projects') {
    return res.json(localProjects);
  }

  // Rest: /rest/v1/notifications
  if (subpath === 'rest/v1/notifications') {
    return res.json(localNotifications);
  }

  // Rest: default fallback for other tables
  if (subpath.startsWith('rest/v1/')) {
    return res.json([]);
  }

  return res.status(404).json({ error: 'not_found', message: `Route ${subpath} not found` });
}

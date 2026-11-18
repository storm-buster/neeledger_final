const express = require('express');
const crypto = require('crypto');

const router = express.Router();

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

  const signature = crypto.createHmac('sha256', 'neeledger-local-secret').update(`${header}.${body = payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

// In-memory data stores for local authentication and database
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

// ── Auth Endpoints ──────────────────────────────────────────────────────────

// POST /auth/v1/token?grant_type=password | refresh_token
router.post('/auth/v1/token', (req, res) => {
  const grantType = req.query.grant_type || req.body.grant_type;

  if (grantType === 'password') {
    const { email, password } = req.body || {};
    const normalizedEmail = (email || '').trim().toLowerCase();

    const user = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
    if (!user || user.password !== password) {
      return res.status(400).json({
        error: 'invalid_grant',
        error_description: 'Invalid login credentials'
      });
    }

    if (user.is_disabled) {
      return res.status(400).json({
        error: 'user_disabled',
        error_description: 'This account has been disabled. Please contact system support.'
      });
    }

    const token = createMockJwt(user);
    const formattedUser = formatSupabaseUser(user);

    return res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600 * 24 * 7,
      refresh_token: `mock-refresh-${user.id}`,
      user: formattedUser
    });
  }

  if (grantType === 'refresh_token') {
    const refreshToken = req.body.refresh_token || '';
    const userId = refreshToken.replace('mock-refresh-', '');
    const user = localUsers.find(u => u.id === userId) || localUsers[0];

    const token = createMockJwt(user);
    const formattedUser = formatSupabaseUser(user);

    return res.json({
      access_token: token,
      token_type: 'bearer',
      expires_in: 3600 * 24 * 7,
      refresh_token: refreshToken || `mock-refresh-${user.id}`,
      user: formattedUser
    });
  }

  return res.status(400).json({ error: 'unsupported_grant_type', error_description: 'Unsupported grant_type' });
});

// POST /auth/v1/signup
router.post('/auth/v1/signup', (req, res) => {
  const { email, password, data = {} } = req.body || {};
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ error: 'invalid_request', message: 'Email and password required' });
  }

  const existing = localUsers.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    return res.status(400).json({
      error: 'user_already_exists',
      message: 'User already registered'
    });
  }

  const newUser = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    password,
    name: data.name || normalizedEmail.split('@')[0],
    role: data.account_type || 'Project Developer',
    is_admin: false, // Security: signup NEVER grants admin
    is_disabled: false,
    credits: 1000,
    member_since: new Date().toISOString(),
    additional_data: {}
  };

  localUsers.push(newUser);

  const token = createMockJwt(newUser);
  const formattedUser = formatSupabaseUser(newUser);

  return res.status(200).json({
    access_token: token,
    token_type: 'bearer',
    expires_in: 3600 * 24 * 7,
    refresh_token: `mock-refresh-${newUser.id}`,
    user: formattedUser
  });
});

// GET /auth/v1/user
router.get('/auth/v1/user', (req, res) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');

  if (!token) {
    return res.status(401).json({ error: 'unauthorized', message: 'Missing Authorization token' });
  }

  try {
    const [, payloadPart] = token.split('.');
    const decoded = JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
    const user = localUsers.find(u => u.id === decoded.sub);
    if (!user) return res.status(404).json({ error: 'user_not_found', message: 'User not found' });
    return res.json(formatSupabaseUser(user));
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token', message: 'Invalid JWT' });
  }
});

// POST /auth/v1/logout
router.post('/auth/v1/logout', (req, res) => {
  return res.status(200).json({});
});

// ── PostgREST Table Endpoints ───────────────────────────────────────────────

// GET /rest/v1/users
router.get('/rest/v1/users', (req, res) => {
  let list = [...localUsers];

  if (req.query.id && typeof req.query.id === 'string') {
    const targetId = req.query.id.replace(/^eq\./, '');
    list = list.filter(u => u.id === targetId);
  }

  if (req.query.email && typeof req.query.email === 'string') {
    const targetEmail = req.query.email.replace(/^eq\./, '').toLowerCase();
    list = list.filter(u => u.email.toLowerCase() === targetEmail);
  }

  // Safe mapping (exclude plaintext passwords)
  const results = list.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    is_admin: u.is_admin,
    is_disabled: u.is_disabled,
    credits: u.credits,
    kyc_status: u.is_admin ? 'Done' : 'Done',
    member_since: u.member_since,
    additional_data: u.additional_data || {}
  }));

  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('vnd.pgrst.object+json')) {
    if (results.length === 0) {
      return res.status(406).json({ message: 'JSON object requested, multiple (or no) rows returned', details: 'The result contains 0 rows' });
    }
    return res.json(results[0]);
  }

  return res.json(results);
});

// POST /rest/v1/users
router.post('/rest/v1/users', (req, res) => {
  const body = Array.isArray(req.body) ? req.body[0] : req.body;
  if (!body || !body.id) {
    return res.status(400).json({ message: 'User id is required' });
  }

  let existing = localUsers.find(u => u.id === body.id);
  if (existing) {
    existing.name = body.name || existing.name;
    existing.role = body.role || existing.role;
    existing.additional_data = { ...(existing.additional_data || {}), ...(body.additional_data || {}) };
  } else {
    existing = {
      id: body.id,
      email: body.email || '',
      password: '',
      name: body.name || 'User',
      role: body.role || 'Project Developer',
      is_admin: false, // Security: public cannot assign admin
      is_disabled: false,
      credits: body.credits || 1000,
      member_since: body.member_since || new Date().toISOString(),
      additional_data: body.additional_data || {}
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
    return res.status(201).json(safeRecord);
  }
  return res.status(201).json([safeRecord]);
});

// GET /rest/v1/projects
router.get('/rest/v1/projects', (req, res) => {
  return res.json(localProjects);
});

// POST /rest/v1/projects
router.post('/rest/v1/projects', (req, res) => {
  const project = {
    id: `prj-${Date.now()}`,
    ...req.body,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  localProjects.unshift(project);
  return res.status(201).json([project]);
});

// GET /rest/v1/notifications
router.get('/rest/v1/notifications', (req, res) => {
  return res.json(localNotifications);
});

module.exports = {
  localSupabaseRouter: router,
  localUsers,
  localProjects
};

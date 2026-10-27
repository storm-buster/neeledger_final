# NeeLedger Frontend Architecture

## 1. Architectural Overview

NeeLedger is a decentralized Carbon Credit MRV (Monitoring, Reporting, and Verification) web application built using **React 18**, **TypeScript**, **Vite**, and **Tailwind CSS**. It connects to:
1. **Supabase (PostgreSQL & Storage)**: Authentication, project records, user profiles, and document storage.
2. **Node.js Express Server (`server/index.js` on port 4000 / Vercel Serverless `/api/*`)**: Mock XAI liveness simulation, geocoding proxy, satellite listings, and Grok/Groq AI document comparisons.
3. **FastAPI Biomass Microservice (`server/biomass_api.py` on port 8001)**: XGBoost satellite-band biomass prediction with SHAP explanations.

### Application Modes & Two-Panel Separation
- **Shared Authentication**: Single login/signup screen (`/login`, `/signup`) resolving credentials via Supabase Auth.
- **User Panel (`<UserLayout>`)**: Accessible by all authenticated accounts (`role: 'Project Developer' | 'Project Proponent' | 'Trader'`). Covers Home, Projects, Map, XAI, Satellites, and Settings.
- **Admin Panel (`<AdminLayout>`)**: Strictly guarded by `<RequireAdmin>`, which verifies `is_admin === true` from the server-controlled `public.users` table. Covers KYC, ACVA management, Validation desk reviews, and Verification credit issuances.

---

## 2. Directory Structure & Responsibilities

```
src/
├── api/                   # Centralized API service layer (Network boundary)
│   ├── client.ts          # Consolidated HTTP fetch client & base URL resolver
│   ├── projects.api.ts    # Project queries, storage document URLs & mutations
│   ├── users.api.ts       # User profiles, account lists & KYC status
│   ├── satellites.api.ts  # Customer satellite catalog endpoint
│   ├── ai.api.ts          # AI operations (Grok comparison & Biomass prediction)
│   └── index.ts           # Barrel export for all API modules
├── components/
│   ├── Auth/              # Route guards (RequireAuth, RequireAdmin, AuthLoadingScreen)
│   ├── Common/            # Shared widgets (ProjectMap, ComparisonResultModal, GradCAMVisualization)
│   ├── Layout/            # Navbars (UserNavbar, AdminNavbar) & Layout wrappers (UserLayout, AdminLayout)
│   ├── Pages/             # Route views (Home, Projects, KYC, Validation, Verification, XAI, etc.)
│   └── ui-bits/           # Design system primitives, toasts, cards, dialogs, 3D WebGL visuals
├── config/
│   └── api.ts             # Environment configuration & legacy API endpoint mappings
├── contexts/
│   └── AuthContext.tsx    # Supabase session management & trusted is_admin role resolution
├── data/
│   ├── customerSatellites.json # Offline satellite catalog fallback
│   └── mockData.ts        # Seed data for projects, ACVAs, and notifications
├── hooks/
│   └── useDocumentActions.ts # HTML document rendering, PDF blob conversion, IPFS upload actions
├── lib/
│   ├── documentHelpers.ts # Formatting markdown/text documents into HTML
│   ├── geminiService.ts   # Direct Gemini API wrapper (flagged for backend proxying)
│   ├── grokService.ts     # Document comparison helper calling /api/grok-compare
│   ├── pdfHelpers.ts      # Client-side PDF generation via jsPDF & html2canvas
│   ├── pinata.ts          # Direct IPFS pinning via Pinata SDK (flagged for backend proxying)
│   ├── supabase.ts        # Supabase client singleton
│   └── supabaseService.ts # Legacy Supabase service bridge (retained for backward compatibility)
└── types/
    └── index.ts           # Domain models, UserProfile, Account, ACVA, Project, AuthRole
```

---

## 3. Data Flow Rules

### Rule 1: Centralized Service Boundary
UI components (`src/components/Pages/`, `src/components/Common/`) must **never** make direct `fetch()` calls or query Supabase directly via `supabase.from(...)`. All backend communications must flow through dedicated typed functions in `src/api/`.

### Rule 2: Defense-in-Depth Authorization
- **Frontend Route Guards (`RequireAuth`, `RequireAdmin`)**: Control view rendering and redirect unauthorized visitors to `/login` or `/unauthorized`.
- **Backend & Database Enforcement**: Frontend guards are strictly for UX. Actual data protection and record access must be enforced by PostgreSQL Row-Level Security (RLS) policies and backend authorization middleware.

### Rule 3: Error Normalization
All HTTP and service errors are normalized into standard `ApiError` instances containing:
- `status`: HTTP status code or database error code.
- `statusText`: Standard status phrase.
- `message`: User-friendly descriptive error message.
- `details`: Raw backend error payload for debugging.

### Rule 4: Zero Client Secrets Exposure
Environment variables prefixed with `VITE_` are bundled directly into public browser assets.
- **NEVER** expose Supabase `service_role` keys, private backend API secrets, or third-party paid API keys (Gemini, Pinata, Groq) in frontend code.
- All operations requiring secret credentials must be proxied through backend server routes (`server/` or `/api/`).

---

## 4. Multi-Service Backend Topology

| Service | Protocol / Port | Production Route (Vercel) | Purpose |
|---|---|---|---|
| **Supabase PostgreSQL** | HTTPS / WSS | `https://<ref>.supabase.co` | Auth, `public.users`, `public.projects`, Realtime changes |
| **Express Server** | HTTP (4000) | Serverless (`/api/*`) | Satellite catalog, Mock XAI, Grok comparison proxy, Nominatim geocoding |
| **FastAPI Microservice** | HTTP (8001) | `/api/predict-biomass` | XGBoost satellite band biomass prediction & SHAP calculations |

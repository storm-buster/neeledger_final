# NeeLedger Frontend Changelog — Phase 3

## Overview
Phase 3 establishes a centralized, typed API service boundary (`src/api/`) for the NeeLedger frontend. It eliminates page-level direct backend calls, unifies API base URL resolution between local development and production deployments, documents real backend contracts, and identifies security requirements for the backend engineering team.

---

## Changes by File

### 1. New API Service Layer (`src/api/`)
- **`src/api/client.ts`**:
  - Implements `getApiBaseUrl()` with consolidated fallback: Vercel relative path -> `VITE_API_BASE_URL` -> legacy `VITE_API_URL` -> `http://localhost:4000`.
  - Implements lightweight, typed native `fetch` HTTP wrapper (`httpClient.get`, `httpClient.post`).
  - Implements normalized error handling via standard `ApiError` class.
- **`src/api/projects.api.ts`**:
  - Exports typed `projectsApi` module for fetching project lists, individual projects by ID, public storage document URLs, project creation, dashboard statistics, and real-time project subscriptions.
  - Reuses the existing Supabase client singleton without creating duplicate instances.
- **`src/api/users.api.ts`**:
  - Exports typed `usersApi` module for fetching user account lists and user profiles.
  - Establishes a contract placeholder for `updateKycStatus` pending backend schema confirmation.
- **`src/api/satellites.api.ts`**:
  - Exports typed `satellitesApi` module for fetching customer satellites list from `/api/satellites`.
- **`src/api/ai.api.ts`**:
  - Consolidates verified AI endpoints: Grok document comparison (`/api/grok-compare`), XGBoost biomass prediction (`/predict-biomass`), and mock XAI evaluation (`/api/xai`).
- **`src/api/index.ts`**:
  - Centralized barrel export for all API modules and shared contract types.

### 2. Configuration & Legacy Service Bridges
- **`src/config/api.ts`**:
  - Updated `getBaseUrl()` to prioritize `VITE_API_BASE_URL` while preserving fallback to `VITE_API_URL` and `http://localhost:4000`.
  - Maintained 100% backward compatibility for all existing `apiConfig` and `apiClient` callers.
- **`src/lib/grokService.ts`**:
  - Updated internal `getApiUrl()` to accept both `VITE_API_BASE_URL` and `VITE_API_URL`.

### 3. Page Component Refactoring
- **`src/components/Pages/ProjectDetailsPage.tsx`**:
  - Removed direct `supabase` client import.
  - Replaced direct query `supabase.from('projects').select('*').eq('id', projectId).single()` with `projectsApi.getProjectById(projectId)`.
  - Replaced direct storage bucket query with `projectsApi.getProjectDocumentPublicUrl(doc)`.
  - Preserved identical loading spinner, empty state, error handling, timeline builder, and UI rendering.
- **`src/components/Pages/SatellitesPage.tsx`**:
  - Replaced raw `fetch('/api/satellites')` with `satellitesApi.getSatellites()`.
  - Added component unmount safety flag (`isMounted`).
  - Preserved existing search filtering, card rendering, and error toast fallbacks.
- **`src/components/Pages/XAIPage.tsx`**:
  - Replaced raw `fetch(apiEndpoint)` in `processWithAI()` with `aiApi.predictBiomass(...)`.
  - Preserved multi-stage progress indicator, Grad-CAM visualization, and metric aggregation.

### 4. Architecture & Integration Documentation
- **`docs/frontend/ARCHITECTURE.md`**: Complete directory layout, module responsibilities, multi-service backend topology, and core data-flow rules.
- **`docs/frontend/API_CONTRACTS.md`**: Verified endpoints, field mappings (`additional_data` vs `metadata`), request/response schemas, security blockers (`VITE_GEMINI_API_KEY`, `VITE_PINATA_JWT`), and unpersisted action audits.
- **`docs/frontend/FRONTEND_CHANGELOG.md`**: Summary of modifications in Phase 3.

---

# NeeLedger Frontend Changelog — Demo Mode (Hackathon Evaluation)

## Overview
Added a safe, local-only demo mode allowing judges, reviewers, and team members to evaluate both the User Panel (Project Proponent) and Admin Panel (MRV Auditor) in local development without needing an active Supabase connection, backend microservices, or remote API keys.

---

## Changes by Component

### 1. Configuration & Security Safeguards (`src/config/demo.ts`)
- Implemented `isDemoModeAllowed()`:
  - Strictly returns `false` in production builds (`import.meta.env.PROD === true`).
  - Controlled in development via `VITE_ENABLE_DEMO_MODE` environment variable.
- Defined distinct mock profiles:
  - `DEMO_USER_PROFILE`: Proponent persona (`is_admin: false`, Sundarbans Coastal Biosphere).
  - `DEMO_ADMIN_PROFILE`: Auditor persona (`is_admin: true`, MRV Carbon Standards Board).
- Session storage persona tracking (`getStoredDemoPersona()`, `setStoredDemoPersona()`) to persist the active demo role across page refreshes.

### 2. Isolated Sample Datasets (`src/data/demoData.ts`)
- `demoUserProjects`: 4 projects tailored to the proponent view across all lifecycle stages:
  - PRJ-DEMO-001: Sundarbans Mangrove Restoration (1,100 credits released on ledger)
  - PRJ-DEMO-002: Mumbai Marine Wetlands (under field verification)
  - PRJ-DEMO-003: Andaman Seagrass Meadow (under validation desk review)
  - PRJ-DEMO-004: Pichavaram Estuarine Forest (sanctioned, verification cycle unlocked)
- `demoAdminProjects`: Expanded dataset including cross-entity pipelines (Mahanadi Delta, Godavari Estuary) for auditor evaluation.
- `demoAccounts` & `demoACVAs`: Realistic KYC proponent organizations and accredited validation/verification agencies.
- `demoStats`: Aggregated carbon metric indicators for dashboard display.

### 3. Visual Indicators & Interactive Controls
- **`src/components/Common/DemoBanner.tsx`**:
  - Sticky header badge: `"DEMO MODE — Sample Data Only"`.
  - Active persona tag displaying current view mode.
  - One-click persona switcher (`Switch to Admin View` / `Switch to User View`).
  - `Exit Demo` button to clear demo session and return to `/login`.
- **`src/components/Pages/AuthPage.tsx`**:
  - Added "Presentation / Demo Preview" panel with two clearly labelled options:
    - **Demo User Preview** (`handleDemoSelect('user')` -> redirects to `/`)
    - **Demo Admin Preview** (`handleDemoSelect('admin')` -> redirects to `/admin`)
- **`src/components/Layout/UserLayout.tsx` & `AdminLayout.tsx`**:
  - Automatically mounts `<DemoBanner />` when `isDemoMode` is active and adjusts fixed navigation spacing.

### 4. API & Mutation Safeguards
- **`src/contexts/AuthContext.tsx`**: Manages demo mode state, initializes demo persona from session storage, and clears demo mode on signOut.
- **`src/api/projects.api.ts`**: Resolves sample projects and dashboard stats in-memory during demo mode; isolates Supabase queries.
- **`src/api/users.api.ts`**: Returns sample accounts and demo profiles; turns KYC updates into simulated in-memory alerts.
- **`src/api/satellites.api.ts`**: Gracefully falls back to local `customerSatellites.json` dataset if backend is offline.
- **`src/api/ai.api.ts`**: Provides realistic fallback predictions for biomass XGBoost and PDF document comparisons when microservices are offline.
- **`src/hooks/useDocumentActions.ts`**: Simulates IPFS file pinning with simulated CIDs without requiring external Pinata credentials.
- **`src/components/Pages/KYCPage.tsx`**: Shows demo simulation alerts on KYC document approvals and rejections.
- **`src/App.tsx`**: Simulates admin sanctions, ACVA assignments, and credit releases directly on local React state.

---

## Verification Results
1. **Production Build (`npm run build`)**: Succeeded cleanly with 0 bundle errors.
2. **TypeScript Validation (`npx tsc --noEmit`)**: Confirmed 0 new errors in all demo mode files.
3. **Isolation Guarantee**: Zero remote Supabase calls or database mutations occur while in demo mode.

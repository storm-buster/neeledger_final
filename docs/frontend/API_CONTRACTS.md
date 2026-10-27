# NeeLedger API & Data Contracts Matrix

This document defines the interface contracts between the NeeLedger frontend and backend systems (Supabase, Node/Express server, and Python FastAPI microservice).

---

## 1. Authentication & User Profiles

### 1.1 Sign Up
- **Owning Module**: `src/contexts/AuthContext.tsx` -> `signUp()`
- **Backend Target**: Supabase Auth (`supabase.auth.signUp`)
- **Request Payload**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword123",
    "options": {
      "data": {
        "name": "Jane Doe",
        "role": "Project Proponent",
        "is_admin": false
      }
    }
  }
  ```
- **Response**: `{ user: User, session: Session | null }`
- **Security Requirement**: `is_admin` is enforced to `false` on the client. Database triggers must never trust client-provided `raw_user_meta_data.is_admin`.
- **Persistence Status**: **PERSISTED** (Supabase Auth).

### 1.2 Sign In
- **Owning Module**: `src/contexts/AuthContext.tsx` -> `signIn()`
- **Backend Target**: Supabase Auth (`supabase.auth.signInWithPassword`)
- **Request Payload**: `{ "email": "user@example.com", "password": "securePassword123" }`
- **Response**: `{ user: User, session: Session }`
- **Persistence Status**: **PERSISTED**.

### 1.3 Fetch User Profile & Role Resolution
- **Owning Module**: `src/api/users.api.ts` -> `getUserProfile(userId)` (used by `AuthContext`)
- **Backend Target**: Supabase Table `public.users` (SELECT)
- **Query**: `SELECT * FROM public.users WHERE id = :userId LIMIT 1;`
- **Expected Record Shape (`UserProfile`)**:
  ```json
  {
    "id": "uuid-1234",
    "name": "Jane Doe",
    "email": "user@example.com",
    "role": "Project Proponent",
    "is_admin": false,
    "is_disabled": false,
    "kyc_status": "Pending",
    "wallet_address": "0x1234...",
    "member_since": "2026-03-20T10:00:00Z",
    "additional_data": {}
  }
  ```
- **Authorization Requirement**: Authenticated user reading own profile (`auth.uid() = id`), or admin.
- **Persistence Status**: **PERSISTED**.

### 1.4 Get User Accounts List (Admin)
- **Owning Module**: `src/api/users.api.ts` -> `getUserAccounts()` (used in `App.tsx` for `KYCPage`)
- **Backend Target**: Supabase Table `public.users` (SELECT)
- **Query**: `SELECT * FROM public.users ORDER BY member_since DESC;`
- **Authorization Requirement**: Admin only (`public.is_admin() = true`).
- **Persistence Status**: **PERSISTED**.

### 1.5 Update KYC Status
- **Owning Module**: `src/api/users.api.ts` -> `updateKycStatus(userId, status)`
- **Backend Target**: `public.users` (UPDATE)
- **Status**: `PENDING BACKEND CONFIRMATION`.
  - *Unknown*: Does the live schema store KYC status in `public.users.kyc_status` (column) or inside `additional_data.kycStatus` (JSONB)?
  - *Current Behavior*: Currently `KYCPage.tsx` logs approval/rejection to the console (`console.log('Approving account')`) without database mutation.

---

## 2. Projects & Evidence

### 2.1 Fetch All Projects
- **Owning Module**: `src/api/projects.api.ts` -> `getProjects()`
- **Backend Target**: Supabase Table `public.projects` (SELECT)
- **Query**: `SELECT * FROM public.projects ORDER BY created_at DESC;`
- **Response Record Shape (`ProjectRecord`)**:
  ```json
  {
    "id": "uuid-project-001",
    "name": "Sundarbans Mangrove Conservation",
    "description": "Restoration of coastal mangrove forests",
    "user_id": "uuid-proponent",
    "status": "under_validation",
    "coordinates": "21.9497,89.1833",
    "state_name": "West Bengal",
    "country": "India",
    "claimed_credits": 1250,
    "released_credits": 0,
    "bufferCredits": 125,
    "riskAssessment": "Low",
    "assigned_acva": "acva-001",
    "verification_acva": null,
    "additional_data": {
      "creditsIssued": 1250,
      "area": 450,
      "methodology": "VM0007",
      "riskAssessment": "Low"
    },
    "documents": [{ "file_name": "PDD_Sundarbans.pdf" }],
    "images": ["/satellite/sentinel2_rgb.png"],
    "created_at": "2026-03-25T14:30:00Z"
  }
  ```
- **Field Mapping Drift (`metadata` vs `additional_data`)**:
  - Legacy mock types in `src/types/index.ts` expect `project.metadata.ownership`, `project.metadata.area`, `project.metadata.methodology`.
  - Supabase database schema stores top-level `name`, `description`, `coordinates`, `documents`, and a JSONB column `additional_data`.
  - Frontend components have fallback logic: `project.name || project.metadata?.ownership`. A formal DTO mapper is recommended in Phase 4.
- **Persistence Status**: **PERSISTED**.

### 2.2 Fetch Project By ID
- **Owning Module**: `src/api/projects.api.ts` -> `getProjectById(projectId)`
- **Backend Target**: Supabase Table `public.projects` (SELECT)
- **Query**: `SELECT * FROM public.projects WHERE id = :projectId LIMIT 1;`
- **Response**: `ProjectRecord` or `null`.
- **Loading / Empty States**:
  - `loading === true`: Renders spinning loader with `"Loading project..."`.
  - `!project`: Renders `"Project not found."` with `"Back to Projects"` button.
- **Persistence Status**: **PERSISTED**.

### 2.3 Resolve Project Document Storage URL
- **Owning Module**: `src/api/projects.api.ts` -> `getProjectDocumentPublicUrl(docPath)`
- **Backend Target**: Supabase Storage Bucket `'project-documents'`
- **Operation**: `supabase.storage.from('project-documents').getPublicUrl(docPath)`
- **Persistence Status**: **PERSISTED**.

### 2.4 Create Project
- **Owning Module**: `src/api/projects.api.ts` -> `createProject(projectData)`
- **Backend Target**: Supabase Table `public.projects` (INSERT)
- **Payload**: Formatted fields + `additional_data` JSONB payload.
- **Persistence Status**: **PERSISTED**.

### 2.5 Admin Sanctioning & ACVA Assignment Workflows
- **Owning Module**: `src/App.tsx` (`handleAssignACVA`, `handleSanctionProject`, `handleAssignVerificationACVA`, `handleReleaseCredits`)
- **Status**: `PENDING BACKEND CONFIRMATION`.
  - *Current Behavior*: Mutates React local state in `App.tsx` (`setProjects(prev => prev.map(...))`).
  - *Persistence Requirement*: Needs backend RPC or authenticated UPDATE query updating `assigned_acva`, `status`, `verification_acva`, and `released_credits`.

---

## 3. Customer Satellites

### 3.1 Fetch Customer Satellites
- **Owning Module**: `src/api/satellites.api.ts` -> `getSatellites()` (used in `SatellitesPage.tsx`)
- **Backend Target**: Node/Express route `/api/satellites` (or Vercel serverless `api/satellites.js`)
- **HTTP Method**: `GET /api/satellites`
- **Response**:
  ```json
  {
    "customer_satellites": [
      {
        "id": "SAT-001",
        "country": "India",
        "launch_date": "2023-01-15",
        "mass": "500 kg",
        "launcher": "PSLV-C55"
      }
    ]
  }
  ```
- **Fallback**: Returns offline seed catalog if backend is unavailable.
- **Persistence Status**: **STATIC JSON DATA**.

---

## 4. Artificial Intelligence & MRV Services

### 4.1 Grok / Groq Document Comparison
- **Owning Module**: `src/api/ai.api.ts` -> `compareDocuments()` (used in `ValidationPage.tsx` and `VerificationPage.tsx`)
- **Backend Target**: Node/Express route `POST /api/grok-compare` (or Vercel `api/grok-compare.js`)
- **Request Payload**:
  ```json
  {
    "doc1Title": "Project Design Document (PDD)",
    "doc1Content": "...",
    "doc2Title": "ACVA Validation Report",
    "doc2Content": "..."
  }
  ```
- **Response Shape (`GrokComparisonResult`)**:
  ```json
  {
    "summary": "Detailed comparison of claimed carbon sequestration against field audit.",
    "keyDifferences": ["Difference 1", "Difference 2"],
    "concerns": ["Uncertainty in canopy cover methodology"],
    "recommendations": ["Conduct localized soil core sample"],
    "overallAssessment": "APPROVE",
    "confidence": 0.88
  }
  ```
- **Backend Dependency**: Requires server-side `GROQ_API_KEY` or `GROK_API_KEY`.
- **Persistence Status**: **TRANSIENT INFERENCE**.

### 4.2 Biomass Prediction (XAI Microservice)
- **Owning Module**: `src/api/ai.api.ts` -> `predictBiomass()` (used in `XAIPage.tsx`)
- **Backend Target**: FastAPI service `POST /predict-biomass` (port 8001 in local dev, or `/api/predict-biomass` in production)
- **Request Payload (`BiomassPredictionInput`)**:
  ```json
  {
    "B2": 0.05,
    "B3": 0.06,
    "B4": 0.04,
    "B8": 0.3,
    "species": "Mangrove"
  }
  ```
- **Response Shape (`BiomassPredictionOutput`)**:
  ```json
  {
    "predicted_biomass": 142.5,
    "confidence": 92.4,
    "ndvi": 0.76,
    "evi": 0.54,
    "savi": 0.48,
    "feature_importance": {
      "ndvi": 35.2,
      "evi": 22.1,
      "B8": 18.4,
      "species_enc": 12.0
    }
  }
  ```
- **Persistence Status**: **TRANSIENT INFERENCE**.

### 4.3 Mock XAI Liveness Simulation
- **Owning Module**: `src/api/ai.api.ts` -> `evaluateXAIMock()`
- **Backend Target**: Express route `POST /api/xai`
- **Request Payload**: `{ "codePhrase": "BlueCarbon2026", "fileName": "field_video.mp4" }`
- **Response**: `{ treeCount, canopyCover, co2Tonnes, uncertainty, liveness, decisionCategory }`
- **Persistence Status**: **SIMULATED DETERMINISTIC OUTPUT**.

---

## 5. Security Blockers & Required Backend Proxies

### 5.1 Gemini API Key Exposure (`VITE_GEMINI_API_KEY`)
- **Current State**: `src/lib/geminiService.ts` instantiates `@google/generative-ai` directly in the browser using `import.meta.env.VITE_GEMINI_API_KEY`.
- **Security Hazard**: Anyone inspecting network requests or Vite asset bundles can extract this private API key.
- **Required Backend Proxy**:
  Create an endpoint `POST /api/gemini-analyze` on the Node/Express server. The browser sends `{ pdfText, satelliteData }` and the server calls Google Gemini using server-side `process.env.GEMINI_API_KEY`.

### 5.2 Pinata JWT Exposure (`VITE_PINATA_JWT`)
- **Current State**: `src/lib/pinata.ts` instantiates `PinataSDK` with `import.meta.env.VITE_PINATA_JWT`.
- **Security Hazard**: Exposes IPFS upload credentials and write permissions to the public client.
- **Required Backend Proxy**:
  Create an endpoint `POST /api/ipfs-pin` that accepts a `multipart/form-data` file upload and securely pins to Pinata using a server-side JWT.

---

## 6. Audit of Remaining Direct Backend Calls

| File | Remaining Call Site | Recommended Phase |
|---|---|---|
| `src/contexts/AuthContext.tsx` | Supabase auth + `public.users` query | Keep as-is (core auth provider) |
| `src/lib/supabaseService.ts` | Legacy Supabase service methods | Preserve for backward compatibility |
| `src/components/Pages/MapPage.tsx` | `SupabaseService.getProjects()` | Can migrate to `projectsApi.getProjects()` in Phase 4 |
| `src/lib/geminiService.ts` | Direct client-side `GoogleGenerativeAI` | Blocked on backend proxy creation |
| `src/lib/pinata.ts` | Direct client-side `PinataSDK` | Blocked on backend proxy creation |
| `src/components/Pages/SettingsPage.tsx` | Unpersisted mock toasts | Phase 4 (Profile update mutation) |

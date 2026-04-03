<div align="center">

# 🌿 NeeLedger

**Blockchain-Powered Carbon Credit Verification & Registry Platform**

![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-363636?logo=solidity) ![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?logo=fastapi) ![XGBoost](https://img.shields.io/badge/XGBoost-ML-FF6600) ![Supabase](https://img.shields.io/badge/Supabase-BaaS-3ECF8E?logo=supabase)

*End-to-end carbon credit lifecycle management — from satellite imagery to tokenized credits on-chain.*

</div>

---

## 📖 Overview

NeeLedger is a full-stack platform that digitises the carbon credit pipeline. It combines **satellite remote sensing**, **ML-driven biomass estimation**, **explainable AI (XAI)**, and **Solidity smart contracts** to register, verify, and tokenise carbon credits with tamper-proof integrity.

### Core Workflow

```
Satellite Data → Biomass ML Model → SHAP Explainability → Verification Pipeline
       ↓                                                           ↓
  Map Visualisation                                       Combined Hashing (SHA-256 + SHA-512 + BLAKE2b)
                                                                   ↓
                                                        Local Blockchain Ledger
                                                                   ↓
                                                  On-Chain Registry & ERC-1155 Minting
```

---

## ✨ Features

| Area                          | Capability                                                                                                        |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| **Dashboard**                 | Real-time project statistics, carbon removed, credits issued                                                      |
| **Projects**                  | Create, browse, and manage carbon reduction projects with Supabase persistence                                    |
| **KYC**                       | Know-Your-Customer onboarding for project proponents and traders                                                  |
| **ACVA**                      | Accredited Carbon Verification Agency management                                                                  |
| **Validation & Verification** | Multi-stage approval pipeline with document review                                                                |
| **XAI / Biomass Prediction**  | XGBoost model with SHAP feature importance for transparent decisions                                              |
| **Liveness Detection**        | Code-phrase-based liveness scoring (movement + lip-sync) for evidence authenticity                                |
| **Interactive Map**           | OpenStreetMap-based project & ACVA geolocation with geocode search                                                |
| **Satellite Tracking**        | Customer satellite constellation viewer                                                                           |
| **Blockchain Hashing**        | Combined SHA-256 / SHA-512 / BLAKE2b hashing with a local JSON blockchain ledger                                  |
| **Smart Contracts**           | Solidity contracts for registry, ERC-1155 carbon tokens, oracle integration, Merkle proofs, and multi-sig wallets |
| **Auth & Theming**            | Supabase auth with role-based access, light/dark theme support                                                    |

---

## 🏗️ Architecture

```
neeledger-main/
├── src/                     # React + TypeScript frontend (Vite)
│   ├── components/
│   │   ├── Pages/           # 14 page-level components
│   │   ├── Layout/          # App shell & sidebar
│   │   ├── Common/          # Error boundary, shared widgets
│   │   ├── ui/              # Base UI primitives
│   │   └── ui-bits/         # Toast, Skeleton, etc.
│   ├── contexts/            # AuthContext, ThemeContext
│   ├── lib/                 # supabaseService, geminiService, utils
│   ├── data/                # Mock/seed data
│   ├── types/               # TypeScript type definitions
│   └── App.tsx              # Router & state orchestration
│
├── server/                  # Backend services
│   ├── index.js             # Express.js – geocode proxy, XAI mock, map & satellite APIs
│   ├── biomass_api.py       # FastAPI – XGBoost biomass prediction + SHAP explanations
│   ├── app/                 # Extended FastAPI application modules
│   ├── models/              # Serialised ML model artifacts
│   └── supabase_migration.sql
│
├── hashing/                 # Python blockchain module
│   ├── hash_generator.py    # SHA-256 + SHA-512 + BLAKE2b combined hash
│   ├── blockchain.py        # Local file-based blockchain (JSON persistence)
│   └── supabase_watcher.py  # Watches Supabase for new projects, auto-hashes & chains
│
├── smart contracts/         # Solidity (Hardhat)
│   ├── CarbonRegistry.sol
│   ├── CarbonCreditToken.sol
│   ├── MerkleTreeUtils.sol
│   ├── OracleConsumer.sol
│   └── MultiSigWallet.sol
│
└── public/                  # Static assets (logos, hero images)
```

---

## 🚀 Getting Started

### Prerequisites

| Tool        | Version |
| ----------- | ------- |
| **Node.js** | ≥ 18    |
| **Python**  | ≥ 3.10  |
| **npm**     | ≥ 9     |

### 1. Clone & Install Frontend

```bash
git clone https://github.com/<your-org>/neeledger.git
cd neeledger

npm install
npm run dev
```

### 2. Start the Express Backend

```bash
cd server
npm install
npm start
```

→ http://localhost:4000

### 3. Start the Biomass Prediction API

```bash
cd server
pip install -r requirements.txt
python biomass_api.py
```

→ http://localhost:8001

### 4. Run the Blockchain / Hashing Module

```bash
cd hashing
pip install -r requirements.txt

python hash_generator.py <unique-id>

python supabase_watcher.py
```

### 5. Environment Variables

```bash
cp server/.env.example server/.env
```

| Variable                        | Purpose                                     |
| ------------------------------- | ------------------------------------------- |
| `SUPABASE_URL` / `SUPABASE_KEY` | Supabase project connection                 |
| `MODELS_DIR`                    | Path to serialised ML models                |
| `BLOCKCHAIN_RPC_URL`            | Ethereum RPC for smart contracts            |
| `CARBON_REGISTRY_ADDRESS`       | Deployed CarbonRegistry contract address    |
| `CARBON_CREDIT_TOKEN_ADDRESS`   | Deployed CarbonCreditToken contract address |

---

## 🔗 Smart Contracts

Contracts target **Solidity ^0.8.20** and use OpenZeppelin v5. Deploy with Hardhat:

| Contract                | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `CarbonRegistry.sol`    | Immutable project registry with Merkle root storage and anti-double-counting |
| `CarbonCreditToken.sol` | ERC-1155 multi-token; minting requires 3-of-3 multi-sig                      |
| `MerkleTreeUtils.sol`   | On-chain Merkle proof verification                                           |
| `OracleConsumer.sol`    | Consumes external oracle data                                                |
| `MultiSigWallet.sol`    | N-of-M multi-signature governance wallet                                     |

---

## 🤖 ML & Explainability

The **Biomass Prediction API** (`server/biomass_api.py`) runs an **XGBoost** model trained on Sentinel-2 satellite bands.

**Input**

* Spectral bands (B2, B3, B4, B8)
* Species type

**Feature Engineering**

* NDVI
* GNDVI
* NDWI
* NDBI
* SAR ratios

**Output**

* Predicted above-ground biomass (tonnes/ha)
* Confidence score
* SHAP feature importance

Endpoint:

```
POST /predict-biomass
```

---

## 🗺️ API Endpoints

### Express Server (`:4000`)

| Method | Path               | Description                           |
| ------ | ------------------ | ------------------------------------- |
| GET    | `/api/geocode?q=…` | Proxy to OpenStreetMap Nominatim      |
| POST   | `/api/xai`         | Mock XAI liveness & carbon metrics    |
| GET    | `/api/mockmap`     | Sample project & ACVA locations       |
| GET    | `/api/satellites`  | Customer satellite constellation data |

### FastAPI Biomass Server (`:8001`)

| Method | Path               | Description                               |
| ------ | ------------------ | ----------------------------------------- |
| GET    | `/`                | Health check                              |
| POST   | `/predict-biomass` | Biomass prediction with SHAP explanations |

---

## 🛡️ Security

* **Multi-sig minting** — verifier + oracle + admin
* **Anti-double-counting** — registry prevents duplicate credits
* **Reentrancy guards** — OpenZeppelin `ReentrancyGuard`
* **Combined hashing** — SHA-256 + SHA-512 + BLAKE2b
* **Rate limiting** — environment-configurable
* **CORS lockdown** — whitelist-based origins

---

## 📄 License

This project is proprietary. All rights reserved.

---

<div align="center">

<sub>Built with 🌍 for a greener future.</sub>

</div>

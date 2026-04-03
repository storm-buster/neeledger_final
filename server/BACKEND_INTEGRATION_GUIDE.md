# 🚀 Blue Carbon MRV Backend - Complete Integration Guide

## 📋 Table of Contents

1. [System Architecture](#system-architecture)
2. [Installation & Setup](#installation--setup)
3. [Database Schema](#database-schema)
4. [ML Pipeline Flow](#ml-pipeline-flow)
5. [API Endpoints](#api-endpoints)
6. [Background Processing](#background-processing)
7. [Blockchain Integration](#blockchain-integration)
8. [Deployment](#deployment)
9. [Security](#security)
10. [Monitoring & Scaling](#monitoring--scaling)

---

## 🏗️ System Architecture

### High-Level Flow

```
[Client: Drone/Satellite Upload]
        ↓
FastAPI Upload Endpoint (/api/v1/upload)
        ↓
Supabase Storage (Raw Image)
        ↓
Background Task Queue
        ↓
ML Pipeline Orchestrator
        ↓
┌─────────────────────────────────────┐
│  1️⃣ Mangrove Verification Model    │
│     - Spatial validation            │
│     - Threshold: 0.7                │
│     - If fail → REJECT              │
└─────────────────────────────────────┘
        ↓ (if passed)
┌─────────────────────────────────────┐
│  2️⃣ Temporal Change Detection     │
│     - Compare with previous image  │
│     - Growth detection             │
│     - Change metrics               │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  3️⃣ Biomass Regression Model      │
│     - XGBoost prediction           │
│     - Confidence intervals         │
│     - Feature importance            │
└─────────────────────────────────────┘
        ↓
┌─────────────────────────────────────┐
│  4️⃣ Carbon Calculation Engine      │
│     - Carbon = Biomass × 0.47       │
│     - CO2 = Carbon × 3.67          │
│     - Risk buffer (15%)             │
└─────────────────────────────────────┘
        ↓
Results Stored in Supabase
        ↓
Blockchain Anchor (if enabled)
        ↓
Audit Dashboard
```

### Service Structure

```
/app
├── main.py                 # FastAPI app entry point
├── routes/
│   ├── upload.py          # Image upload endpoints
│   ├── mrv.py             # MRV pipeline endpoints
│   ├── projects.py        # Project management
│   └── health.py          # Health checks
├── services/
│   ├── mangrove_model.py      # Mangrove verification
│   ├── biomass_model.py       # Biomass regression
│   ├── temporal_model.py      # Temporal change detection
│   ├── carbon_engine.py       # Carbon calculation
│   ├── ml_pipeline.py          # Pipeline orchestrator
│   └── blockchain_service.py  # Blockchain integration
├── db/
│   ├── schemas.py         # Pydantic schemas
│   └── supabase_client.py # Supabase client
└── utils/
    ├── config.py          # Configuration
    └── storage.py         # Storage utilities
```

---

## 🛠️ Installation & Setup

### 1. Prerequisites

- Python 3.10+
- Supabase account
- Redis (for Celery, optional)
- GPU (optional, for faster ML inference)

### 2. Install Dependencies

```bash
cd server
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 4. Set Up Database

Run the migration SQL in Supabase Dashboard → SQL Editor:

```bash
# Run supabase_migration.sql
```

### 5. Prepare ML Models

Place your ML models in the `models/` directory:

```
models/
├── mangrove_verification.pkl  # Mangrove verification model
├── xgb_biomass_booster.json   # Biomass regression model
├── temporal_change.pkl         # Temporal change detection model
├── species_encoder.pkl        # Species label encoder
└── training_medians.pkl       # Training data medians
```

### 6. Run the Server

```bash
# Development
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🗄️ Database Schema

### Tables

#### `projects`
- `id` (UUID, PK)
- `name` (TEXT)
- `description` (TEXT)
- `latitude` (DOUBLE PRECISION)
- `longitude` (DOUBLE PRECISION)
- `region` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

#### `submissions`
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects)
- `image_url` (TEXT)
- `timestamp` (TIMESTAMPTZ)
- `status` (TEXT) - uploaded, processing, verified, rejected, error
- `mangrove_score` (DOUBLE PRECISION)
- `temporal_score` (DOUBLE PRECISION)
- `biomass_estimate` (DOUBLE PRECISION)
- `biomass_lower_bound` (DOUBLE PRECISION)
- `biomass_upper_bound` (DOUBLE PRECISION)
- `carbon_estimate` (DOUBLE PRECISION)
- `co2_equivalent` (DOUBLE PRECISION)
- `confidence_interval` (DOUBLE PRECISION)
- `model_version` (TEXT)
- `error_message` (TEXT)
- `created_at` (TIMESTAMPTZ)
- `processed_at` (TIMESTAMPTZ)

#### `temporal_history`
- `id` (UUID, PK)
- `project_id` (UUID, FK → projects)
- `previous_submission_id` (UUID, FK → submissions)
- `current_submission_id` (UUID, FK → submissions)
- `growth_detected` (BOOLEAN)
- `growth_score` (DOUBLE PRECISION)
- `change_metrics` (JSONB)
- `created_at` (TIMESTAMPTZ)

#### `model_registry`
- `id` (UUID, PK)
- `model_name` (TEXT)
- `version` (TEXT)
- `hash` (TEXT)
- `deployment_date` (TIMESTAMPTZ)
- `metadata` (JSONB)

---

## 🔄 ML Pipeline Flow

### Step-by-Step Process

1. **Image Upload**
   - Client uploads image via `/api/v1/upload`
   - Image stored in Supabase Storage
   - Submission record created with status `uploaded`
   - Background task triggered

2. **Mangrove Verification**
   - Image preprocessed (resize, normalize, feature extraction)
   - Mangrove model predicts probability
   - If probability < threshold (0.7) → status = `rejected`
   - If passed → continue

3. **Temporal Change Detection**
   - Fetch latest verified submission for same project
   - If exists → compare images
   - Calculate growth score and change metrics
   - Create temporal_history record

4. **Biomass Regression**
   - Extract satellite band values (B2, B3, B4, B8)
   - Calculate vegetation indices (NDVI, EVI, SAVI, NDWI)
   - XGBoost model predicts biomass
   - Calculate confidence intervals

5. **Carbon Calculation**
   - Carbon = Biomass × 0.47 (IPCC Tier 1)
   - Apply risk buffer (15%)
   - CO2 equivalent = Carbon × 3.67

6. **Database Update**
   - Update submission with all results
   - Status = `verified`
   - Store model versions

7. **Blockchain Anchor** (optional)
   - Create hash of submission data
   - Anchor to blockchain
   - Store transaction hash

---

## 📡 API Endpoints

### Upload Image

```http
POST /api/v1/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "project_id": "uuid",
  "file": <image_file>
}
```

**Response:**
```json
{
  "submission_id": "uuid",
  "image_url": "https://...",
  "status": "uploaded",
  "message": "Image uploaded successfully. Processing started."
}
```

### Get Submission Status

```http
GET /api/v1/mrv/submission/{submission_id}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "status": "verified",
  "mangrove_score": 0.92,
  "biomass_estimate": 12.3,
  "carbon_estimate": 5.78,
  "co2_equivalent": 21.22,
  "model_version": "mangrove:v1.0.3,biomass:v2.1.0,temporal:v1.2.0"
}
```

### Create Project

```http
POST /api/v1/projects
Authorization: Bearer <token>

{
  "name": "Mangrove Restoration Project",
  "latitude": 21.695562,
  "longitude": 87.786637,
  "region": "Odisha, India",
  "description": "Coastal mangrove restoration"
}
```

---

## ⚙️ Background Processing

### Option 1: FastAPI BackgroundTasks (Small Scale)

```python
# Already implemented in upload.py
background_tasks.add_task(ml_pipeline.run_pipeline, submission_id)
```

**Pros:**
- Simple setup
- No additional infrastructure

**Cons:**
- Limited scalability
- No task persistence
- Single server only

### Option 2: Celery + Redis (Production)

1. Install Redis:
```bash
docker run -d -p 6379:6379 redis
```

2. Start Celery worker:
```bash
celery -A app.tasks.celery_app worker --loglevel=info
```

3. Configure in `.env`:
```env
USE_CELERY=true
CELERY_BROKER_URL=redis://localhost:6379/0
```

**Pros:**
- Scalable
- Task persistence
- Distributed processing
- Retry mechanisms

**Cons:**
- Additional infrastructure
- More complex setup

---

## ⛓️ Blockchain / Smart Contracts Integration

The backend anchors verified MRV results on-chain using the **smart contracts** in `blueledger-main/smart contracts/`. For full details, deployment, and contract addresses, see **[SMART_CONTRACTS_INTEGRATION.md](../SMART_CONTRACTS_INTEGRATION.md)** (in the repo root).

### Contracts involved

| Contract | Role |
|----------|------|
| **CarbonRegistry** | Register project + data hash; anti-double counting; verifier approval. |
| **CarbonCreditToken** | ERC-1155 carbon credits (1 token = 1 ton CO₂); multi-sig mint; retire. |
| **OracleConsumer** | NDVI verification and carbon calculation approval (oracle flow). |
| **MultiSigWallet** | 3-party approval (verifier, admin, oracle). |
| **MerkleTreeUtils** | Merkle roots and proof verification. |

### Backend flow

1. ML pipeline marks a submission as **verified**.
2. `blockchain_service.anchor_submission(submission_id)` is called.
3. A SHA-256 **data hash** of the submission (and carbon result) is computed.
4. When blockchain is enabled, the backend should call **CarbonRegistry** `registerProject(projectID, dataHash, merkleRoot, metadataURI)` (real Web3 implementation is optional; see `blockchain_service.py`).
5. Optionally: **OracleConsumer** for on-chain NDVI/carbon approval, then **CarbonCreditToken** minting with multi-sig.

### Configuration

```env
BLOCKCHAIN_ENABLED=true
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CARBON_REGISTRY_ADDRESS=0x...   # From deploy script
ORACLE_CONSUMER_ADDRESS=0x...  # Optional
CARBON_CREDIT_TOKEN_ADDRESS=0x...  # Optional
PRIVATE_KEY=your-private-key
```

### Deployment (contracts)

From `smart contracts/`: run Hardhat deploy (see **smart contracts/INSTALLATION-GUIDE.md**), then set the deployed addresses in the backend `.env` as above.

---

## 🚀 Deployment

### Docker Deployment

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mrv-backend
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: api
        image: mrv-backend:latest
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase-secrets
              key: url
```

---

## 🔐 Security

### Authentication

- Supabase JWT verification
- Row-level security (RLS) policies
- API key for service-to-service

### Rate Limiting

```python
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)
```

### Input Validation

- File size limits (100MB default)
- File type validation
- Pydantic schema validation

### Data Privacy

- Signed URLs for image access
- Encrypted storage
- Audit logs

---

## 📊 Monitoring & Scaling

### Health Checks

```http
GET /health
GET /health/detailed
```

### Metrics

- Processing time per submission
- Model inference latency
- Error rates
- Queue depth (if using Celery)

### Scaling Strategies

1. **Horizontal Scaling**: Multiple FastAPI instances behind load balancer
2. **ML Inference Pods**: Separate GPU nodes for ML models
3. **Database Scaling**: Supabase auto-scaling
4. **Caching**: Redis for frequently accessed data

---

## 🎯 Model Versioning

Models are registered in `model_registry` table:

```sql
INSERT INTO model_registry (model_name, version, hash, metadata)
VALUES (
  'mangrove_verification',
  'v1.0.3',
  'sha256_hash',
  '{"training_data": "...", "accuracy": 0.92}'
);
```

Each submission stores the model versions used:
```
model_version: "mangrove:v1.0.3,biomass:v2.1.0,temporal:v1.2.0"
```

---

## 📝 Example Usage

### Complete Flow Example

```python
import requests

# 1. Create project
project = requests.post(
    "http://localhost:8000/api/v1/projects",
    json={
        "name": "Test Project",
        "latitude": 21.695562,
        "longitude": 87.786637,
        "region": "Odisha"
    },
    headers={"Authorization": "Bearer <token>"}
).json()

# 2. Upload image
with open("mangrove_image.jpg", "rb") as f:
    submission = requests.post(
        "http://localhost:8000/api/v1/upload",
        files={"file": f},
        data={"project_id": project["id"]},
        headers={"Authorization": "Bearer <token>"}
    ).json()

# 3. Check status
status = requests.get(
    f"http://localhost:8000/api/v1/mrv/submission/{submission['submission_id']}",
    headers={"Authorization": "Bearer <token>"}
).json()

print(f"Status: {status['status']}")
print(f"Carbon: {status['carbon_estimate']} tonnes")
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Model not found**: Check `MODELS_DIR` path and file names
2. **Supabase connection**: Verify credentials in `.env`
3. **Image processing fails**: Check file format and size
4. **Pipeline timeout**: Increase timeout or use Celery

### Debug Mode

```bash
LOG_LEVEL=DEBUG uvicorn app.main:app --reload
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [XGBoost Documentation](https://xgboost.readthedocs.io/)
- [Celery Documentation](https://docs.celeryq.dev/)

---

**🎉 Your Blue Carbon MRV Backend is ready for production!**

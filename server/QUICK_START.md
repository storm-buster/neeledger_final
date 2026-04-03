# 🚀 Quick Start Guide - Blue Carbon MRV Backend

## Prerequisites

- Python 3.10+
- Supabase account
- ML model files (optional for testing - mock mode available)

## Setup Steps

### 1. Install Dependencies

**Windows PowerShell:**
```powershell
cd server
.\setup.ps1
```

**Windows CMD:**
```cmd
cd server
setup.bat
```

**Manual Installation:**
```bash
cd server
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Set Up Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supabase_migration.sql`
3. Run the SQL script

### 4. Prepare Models (Optional)

Place your ML models in `server/models/`:

```
models/
├── mangrove_verification.pkl
├── xgb_biomass_booster.json
├── temporal_change.pkl
├── species_encoder.pkl
└── training_medians.pkl
```

**Note**: The system works in mock mode if models are not provided.

### 5. Run the Server

```bash
# Activate virtual environment first
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# or: venv\Scripts\activate  # Windows CMD
# or: source venv/bin/activate  # Linux/Mac

# Development mode
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### 6. Test the API

```bash
# Health check
curl http://localhost:8000/health

# Detailed health (check ML models)
curl http://localhost:8000/health/detailed
```

## Example API Usage

### Create a Project

```bash
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mangrove Restoration",
    "latitude": 21.695562,
    "longitude": 87.786637,
    "region": "Odisha, India"
  }'
```

### Upload an Image

```bash
curl -X POST http://localhost:8000/api/v1/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "project_id=YOUR_PROJECT_ID" \
  -F "file=@mangrove_image.jpg"
```

### Check Submission Status

```bash
curl http://localhost:8000/api/v1/mrv/submission/SUBMISSION_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Architecture Overview

```
Upload → Storage → Background Task → ML Pipeline → Database → Blockchain
```

**ML Pipeline Steps:**
1. Mangrove Verification (threshold: 0.7)
2. Temporal Change Detection (if previous submission exists)
3. Biomass Regression (XGBoost)
4. Carbon Calculation (IPCC Tier 1)

## Next Steps

- Read `BACKEND_INTEGRATION_GUIDE.md` for detailed documentation
- Configure Celery for production background processing
- Set up blockchain integration (optional)
- Deploy to production (Docker/Kubernetes)

## Troubleshooting

- **Models not loading**: Check `MODELS_DIR` path in `.env`
- **Supabase errors**: Verify credentials and RLS policies
- **Import errors**: Run `pip install -r requirements.txt` again

## Support

For detailed documentation, see `BACKEND_INTEGRATION_GUIDE.md`

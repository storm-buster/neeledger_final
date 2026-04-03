# Windows-specific installation script that uses pre-built wheels
# This avoids GCC compilation issues

Write-Host "🚀 Installing dependencies for Windows (using pre-built wheels)..." -ForegroundColor Green

# Activate virtual environment if not already activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

# Upgrade pip first
Write-Host "`n📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install numpy and pandas first using pre-built wheels (no build)
Write-Host "`n📦 Installing numpy and pandas (pre-built wheels)..." -ForegroundColor Yellow
pip install --only-binary :all: numpy pandas

# Install other packages that might need compilation
Write-Host "`n📦 Installing scipy and scikit-learn..." -ForegroundColor Yellow
pip install --only-binary :all: scipy scikit-learn

# Install the rest of the requirements
Write-Host "`n📦 Installing remaining dependencies..." -ForegroundColor Yellow
pip install fastapi==0.104.1 uvicorn==0.24.0 xgboost scikit-image shap matplotlib pydantic==2.5.0 pydantic-settings==2.1.0 supabase python-multipart opencv-python Pillow python-jose[cryptography] python-dotenv requests celery redis

Write-Host "`n✅ Installation complete!" -ForegroundColor Green

# Step-by-step installation script for Windows
# This installs packages in the correct order to avoid compilation issues

Write-Host "🚀 Installing Blue Carbon MRV Backend dependencies..." -ForegroundColor Green
Write-Host "This will install packages step by step to avoid compilation issues`n" -ForegroundColor Yellow

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "⚠️  Virtual environment not activated. Activating now..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

# Step 1: Upgrade pip
Write-Host "`n[1/6] Upgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to upgrade pip" -ForegroundColor Red
    exit 1
}
Write-Host "✅ pip upgraded" -ForegroundColor Green

# Step 2: Install numpy and pandas (pre-built wheels)
Write-Host "`n[2/6] Installing numpy and pandas (pre-built wheels)..." -ForegroundColor Cyan
pip install --only-binary :all: numpy pandas --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Trying without --only-binary flag..." -ForegroundColor Yellow
    pip install numpy pandas --quiet
}
Write-Host "✅ numpy and pandas installed" -ForegroundColor Green

# Step 3: Install scipy and scikit-learn
Write-Host "`n[3/6] Installing scipy and scikit-learn..." -ForegroundColor Cyan
pip install --only-binary :all: scipy scikit-learn --quiet
if ($LASTEXITCODE -ne 0) {
    pip install scipy scikit-learn --quiet
}
Write-Host "✅ scipy and scikit-learn installed" -ForegroundColor Green

# Step 4: Install FastAPI and core web dependencies (use pre-built wheels)
Write-Host "`n[4/6] Installing FastAPI and web dependencies..." -ForegroundColor Cyan
# Install pydantic-core first with pre-built wheel, then pydantic
pip install --only-binary :all: pydantic-core --quiet
pip install fastapi==0.104.1 uvicorn==0.24.0 pydantic==2.5.0 pydantic-settings==2.1.0 --quiet
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Trying alternative pydantic installation..." -ForegroundColor Yellow
    # Try installing from pre-built wheels only
    pip install --only-binary :all: pydantic pydantic-settings --quiet
    pip install fastapi==0.104.1 uvicorn==0.24.0 --quiet
}
Write-Host "✅ FastAPI installed" -ForegroundColor Green

# Step 5: Install ML and image processing libraries
Write-Host "`n[5/6] Installing ML and image processing libraries..." -ForegroundColor Cyan
pip install xgboost scikit-image shap matplotlib opencv-python Pillow --quiet
Write-Host "✅ ML libraries installed" -ForegroundColor Green

# Step 6: Install remaining dependencies
Write-Host "`n[6/6] Installing remaining dependencies..." -ForegroundColor Cyan
pip install supabase python-multipart python-jose[cryptography] python-dotenv requests celery redis --quiet
Write-Host "✅ All dependencies installed" -ForegroundColor Green

# Verify installation
Write-Host "`n🔍 Verifying installation..." -ForegroundColor Cyan
python -c "import fastapi; import uvicorn; import numpy; import pandas; print('✅ All core packages installed successfully!')" 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Installation completed successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy .env.example to .env and configure Supabase credentials" -ForegroundColor White
    Write-Host "2. Run database migration in Supabase Dashboard" -ForegroundColor White
    Write-Host "3. Start server: uvicorn app.main:app --reload" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Some packages may not have installed correctly. Check errors above." -ForegroundColor Yellow
}

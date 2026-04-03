# Simplified installation - uses only packages with pre-built Windows wheels
# This avoids all compilation issues

Write-Host "🚀 Installing dependencies (pre-built wheels only)..." -ForegroundColor Green

# Check if venv is activated
if (-not $env:VIRTUAL_ENV) {
    Write-Host "Activating virtual environment..." -ForegroundColor Yellow
    & .\venv\Scripts\Activate.ps1
}

# Upgrade pip
Write-Host "`nUpgrading pip..." -ForegroundColor Cyan
python -m pip install --upgrade pip

# Install everything with --only-binary flag to force pre-built wheels
Write-Host "`nInstalling all packages (this may take a few minutes)..." -ForegroundColor Cyan
Write-Host "Using pre-built wheels to avoid compilation..." -ForegroundColor Yellow

# Try to install with pre-built wheels first
pip install --only-binary :all: `
    fastapi `
    uvicorn `
    pydantic `
    pydantic-settings `
    numpy `
    pandas `
    scipy `
    scikit-learn `
    scikit-image `
    xgboost `
    shap `
    matplotlib `
    opencv-python `
    Pillow `
    supabase `
    python-multipart `
    python-jose[cryptography] `
    python-dotenv `
    requests `
    celery `
    redis

# If that fails, install without the flag (will use wheels if available)
if ($LASTEXITCODE -ne 0) {
    Write-Host "`nSome packages need to be installed without --only-binary flag..." -ForegroundColor Yellow
    pip install `
        fastapi uvicorn `
        pydantic pydantic-settings `
        numpy pandas scipy scikit-learn scikit-image `
        xgboost shap matplotlib `
        opencv-python Pillow `
        supabase python-multipart `
        python-jose[cryptography] `
        python-dotenv requests `
        celery redis
}

# Verify
Write-Host "`nVerifying installation..." -ForegroundColor Cyan
python -c "import fastapi; import uvicorn; import numpy; import pandas; print('✅ Core packages installed!')"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n🎉 Installation complete!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Some packages may need manual installation" -ForegroundColor Yellow
}

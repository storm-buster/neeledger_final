# Blue Carbon MRV Backend - Setup Script for Windows
# Run this script in PowerShell: .\setup.ps1

Write-Host "🚀 Setting up Blue Carbon MRV Backend..." -ForegroundColor Green

# Check if Python is installed
Write-Host "`n📦 Checking Python installation..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version
    Write-Host "✅ Found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python 3.10+ from https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Create virtual environment
Write-Host "`n📦 Creating virtual environment..." -ForegroundColor Yellow
if (Test-Path "venv") {
    Write-Host "⚠️  Virtual environment already exists, skipping creation" -ForegroundColor Yellow
} else {
    python -m venv venv
    Write-Host "✅ Virtual environment created" -ForegroundColor Green
}

# Activate virtual environment
Write-Host "`n🔌 Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Upgrade pip
Write-Host "`n📦 Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install dependencies
Write-Host "`n📦 Installing dependencies (this may take a few minutes)..." -ForegroundColor Yellow
pip install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Setup completed successfully!" -ForegroundColor Green
    Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Copy .env.example to .env and configure your Supabase credentials" -ForegroundColor White
    Write-Host "2. Run the database migration in Supabase Dashboard" -ForegroundColor White
    Write-Host "3. Start the server with: .\venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload" -ForegroundColor White
} else {
    Write-Host "`n❌ Setup failed. Please check the error messages above." -ForegroundColor Red
    exit 1
}

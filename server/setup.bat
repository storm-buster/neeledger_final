@echo off
REM Blue Carbon MRV Backend - Setup Script for Windows CMD
REM Run this script: setup.bat

echo 🚀 Setting up Blue Carbon MRV Backend...

REM Check if Python is installed
echo.
echo 📦 Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    echo Please install Python 3.10+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Create virtual environment
echo.
echo 📦 Creating virtual environment...
if exist venv (
    echo ⚠️  Virtual environment already exists, skipping creation
) else (
    python -m venv venv
    echo ✅ Virtual environment created
)

REM Activate virtual environment
echo.
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Upgrade pip
echo.
echo 📦 Upgrading pip...
python -m pip install --upgrade pip

REM Install dependencies
echo.
echo 📦 Installing dependencies (this may take a few minutes)...
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo ❌ Setup failed. Please check the error messages above.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ Setup completed successfully!
    echo.
    echo 📝 Next steps:
    echo 1. Copy .env.example to .env and configure your Supabase credentials
    echo 2. Run the database migration in Supabase Dashboard
    echo 3. Start the server with: venv\Scripts\activate && uvicorn app.main:app --reload
    pause
)

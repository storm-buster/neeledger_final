# Windows Installation Guide

## Problem
On Windows, some packages (like NumPy and Pandas) try to build from source, which requires GCC >= 8.4. If you have an older GCC version, installation will fail.

## Solution: Use Pre-built Wheels

### Method 1: Use the Windows Installation Script (Recommended)

```powershell
cd "c:\Users\rajat\Downloads\new app and web\blueledger-main\server"
.\venv\Scripts\Activate.ps1
.\install_windows.ps1
```

### Method 2: Manual Installation with Pre-built Wheels

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install numpy and pandas first (force pre-built wheels)
pip install --only-binary :all: numpy pandas scipy scikit-learn

# Install the rest
pip install -r requirements.txt
```

### Method 3: Install Packages Individually

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Install core packages first
pip install fastapi uvicorn pydantic pydantic-settings

# Install data science packages (these have Windows wheels)
pip install numpy pandas scikit-learn scikit-image

# Install ML packages
pip install xgboost shap

# Install image processing
pip install opencv-python Pillow

# Install Supabase and utilities
pip install supabase python-multipart python-jose[cryptography] python-dotenv requests

# Install optional packages
pip install celery redis matplotlib
```

## Alternative: Use Conda/Miniconda

If pip continues to have issues, consider using Conda:

```powershell
# Install Miniconda from https://docs.conda.io/en/latest/miniconda.html

# Create environment
conda create -n mrv-backend python=3.10
conda activate mrv-backend

# Install packages via conda (handles C dependencies better)
conda install numpy pandas scikit-learn scikit-image matplotlib opencv -c conda-forge

# Install remaining packages via pip
pip install fastapi uvicorn pydantic supabase xgboost shap celery redis
```

## Verify Installation

```powershell
python -c "import fastapi; import uvicorn; import numpy; import pandas; print('✅ All packages installed successfully!')"
```

## Start the Server

```powershell
uvicorn app.main:app --reload
```

# Quick Start Script for Algorand Donation Transparency dApp
# Run this script from the project root directory

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  AlgoDonate - Quick Start Setup" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Check Node.js
Write-Host "Checking prerequisites..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js 18+" -ForegroundColor Red
    exit 1
}

# Check Python
try {
    $pythonVersion = python --version
    Write-Host "✓ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python not found. Please install Python 3.10+" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow

# Install frontend dependencies
Write-Host "Installing frontend dependencies..." -ForegroundColor Cyan
cd frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Frontend installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
cd ..

# Install smart contract dependencies
Write-Host "Installing smart contract dependencies..." -ForegroundColor Cyan
cd smart_contracts
pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Smart contract installation failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Smart contract dependencies installed" -ForegroundColor Green
cd ..

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Compile Smart Contract:" -ForegroundColor Cyan
Write-Host "   cd smart_contracts" -ForegroundColor White
Write-Host "   python donation_transparency.py" -ForegroundColor White
Write-Host ""
Write-Host "2. Get TestNet ALGO:" -ForegroundColor Cyan
Write-Host "   Visit: https://bank.testnet.algorand.network/" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy Smart Contract:" -ForegroundColor Cyan
Write-Host "   Create smart_contracts/.env with your mnemonic" -ForegroundColor White
Write-Host "   python deploy.py" -ForegroundColor White
Write-Host ""
Write-Host "4. Configure Frontend:" -ForegroundColor Cyan
Write-Host "   Copy frontend/.env.example to frontend/.env" -ForegroundColor White
Write-Host "   Update VITE_APP_ID and VITE_ADMIN_ADDRESS" -ForegroundColor White
Write-Host ""
Write-Host "5. Run Application:" -ForegroundColor Cyan
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Yellow
Write-Host ""

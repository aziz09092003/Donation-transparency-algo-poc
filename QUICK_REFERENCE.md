# Quick Reference Guide

## 🚀 Quick Start Commands

### Initial Setup (One Time)
```powershell
# Run setup script
.\setup.ps1

# OR manually:
cd frontend; npm install
cd ..\smart_contracts; pip install -r requirements.txt
```

### Smart Contract Deployment
```powershell
cd smart_contracts

# Compile
python donation_transparency.py

# Deploy
python deploy.py
```

### Run Application
```powershell
cd frontend
npm run dev
```

## 🔗 Important Links

### TestNet Resources
- **Dispenser**: https://bank.testnet.algorand.network/
- **Explorer**: https://testnet.algoexplorer.io
- **Pera Wallet**: https://perawallet.app/

### API Endpoints
- **Algod**: https://testnet-api.algonode.cloud
- **Indexer**: https://testnet-idx.algonode.cloud

## 📋 Common Operations

### As a Donor
1. Connect Pera Wallet
2. Click "Opt-In to App"
3. Browse NGOs on home page
4. Select NGO → Select campaign
5. Enter amount → Donate
6. View Dashboard for history

### As an NGO
1. Connect Pera Wallet
2. Click "Opt-In to App"
3. Go to "NGO Panel"
4. Register your NGO
5. Wait for admin approval
6. Create campaigns
7. Monitor donations

### As an Admin
1. Connect with admin wallet
2. Go to "Admin" panel
3. Review pending NGOs
4. Click "Approve" on NGOs
5. Monitor platform stats

## ⚙️ Configuration

### Frontend .env
```env
VITE_APP_ID=<your_app_id>
VITE_ADMIN_ADDRESS=<your_wallet>
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
```

### Smart Contract .env
```env
DEPLOYER_MNEMONIC=<25_word_mnemonic>
```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| App not found | Update VITE_APP_ID in .env |
| Transaction failed | Check wallet has ALGO |
| NGO not showing | Wait for approval, refresh page |
| Can't connect wallet | Update Pera Wallet app |
| Opt-in failed | Ensure sufficient ALGO (0.1+) |

## 📱 Testing Checklist

- [ ] Connect wallet successfully
- [ ] Opt-in to application
- [ ] Register NGO
- [ ] Admin approves NGO
- [ ] Create campaign
- [ ] Make donation
- [ ] View donation history
- [ ] Check transaction on explorer
- [ ] Verify stats update

## 🔑 Key Addresses

After deployment, save these:
- **App ID**: _________
- **App Address**: _________
- **Admin Address**: _________

## 💡 Tips

1. **Always opt-in first** before any operations
2. **Keep 1-2 ALGO** in wallet for fees
3. **Fund app address** with 5+ ALGO
4. **Check TestNet explorer** for transaction confirmation
5. **Use descriptive names** for NGOs and campaigns

## 🎯 Demo Flow

### Full Demo (5 minutes)
1. **Show Home** (30s)
   - Platform stats
   - NGO listings

2. **Donor Flow** (90s)
   - Connect wallet
   - Browse NGO
   - Make donation
   - Show confirmation

3. **NGO Flow** (90s)
   - Register NGO
   - Show pending status
   - Admin approves
   - Create campaign

4. **Admin Panel** (90s)
   - Approve NGO
   - Show statistics
   - View donors/donations

## 📊 Smart Contract State

### Global State Keys
- `total_donations` - uint
- `donation_count` - uint  
- `ngo_count` - uint
- `last_donor` - bytes
- `admin` - bytes

### Local State Keys
- `donor_total` - uint
- `ngo_registered` - uint
- `ngo_approved` - uint
- `ngo_name` - bytes
- `ngo_description` - bytes
- `campaign_count` - uint

## 🔄 Development Workflow

```powershell
# Make changes to smart contract
cd smart_contracts
python donation_transparency.py
python deploy.py

# Update App ID in frontend
# frontend/.env -> VITE_APP_ID=<new_id>

# Restart frontend
cd frontend
npm run dev
```

## 📞 Support

Check these in order:
1. Browser console (F12)
2. Transaction on explorer
3. Wallet connection
4. .env configuration
5. ALGO balance

---

**Version**: 1.0.0  
**Network**: Algorand TestNet  
**Status**: ✅ Production-Ready POC

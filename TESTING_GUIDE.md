# 🚀 QUICK START TESTING GUIDE

## ✅ ALL FIXES COMPLETED

### What Was Fixed:
1. **optInToApp()** - Changed to `algosdk.makeApplicationOptInTxn()`
2. **registerNGO()** - Changed to `algosdk.makeApplicationNoOpTxn()`
3. **approveNGO()** - Changed to `algosdk.makeApplicationNoOpTxn()`
4. **createCampaign()** - Changed to `algosdk.makeApplicationNoOpTxn()`
5. **makeDonation()** - Fixed transaction grouping + correct SDK methods
6. **getGlobalState()** - Added null safety: `|| []`
7. **getLocalState()** - Added null safety: `?.['key-value'] || []`

---

## 🧪 TEST NOW - Step by Step

### 1. Open Browser
```
http://localhost:5174
```

### 2. Connect Pera Wallet
- Click "Connect Wallet" button
- Ensure Pera Wallet is on **TestNet** (not MainNet)
- Your wallet: `AU2KTK6Q6BKN4C22ZS3LGNYHKLYSFAABWNWREKMOCEC P76R5AX55XDHPOE`

### 3. Opt-In to Smart Contract
- Click **"Opt-In to App"** button
- Pera Wallet popup will appear
- Click **"Sign"** in Pera Wallet
- Wait for confirmation (~4 seconds)
- Status should change to: ✅ **Opted In: Yes**

### 4. Register as NGO
- Navigate to **"NGO Dashboard"** page
- Fill in the form:
  - **Name**: Your NGO Name
  - **Description**: Your NGO Description
- Click **"Register as NGO"**
- Sign transaction in Pera Wallet
- Status will show: ⏳ **Pending Approval**

### 5. Approve NGO (Switch to Admin Wallet)
- Disconnect current wallet
- Connect with admin wallet: `SASQBRESJY524CT26IT6VAWONFQBU5X3BY7KVCWCR6YLVOK2QEL6JNGZWA`
- Opt-in admin wallet (if not already)
- Navigate to **"Admin Dashboard"**
- Find pending NGO in list
- Click **"Approve"**
- Sign transaction
- NGO is now ✅ **Approved**

### 6. Create Campaign (As Approved NGO)
- Switch back to NGO wallet
- Navigate to **"NGO Dashboard"**
- Fill in campaign form:
  - **Title**: Campaign Name
  - **Purpose**: Campaign Description
  - **Minimum Donation**: 1000000 (= 1 ALGO in microALGO)
- Click **"Create Campaign"**
- Sign transaction
- Campaign appears in list

### 7. Make Donation (As Donor)
- Use any opted-in wallet
- Navigate to **"Donor Dashboard"**
- Browse campaigns
- Click on campaign
- Enter donation amount (in ALGO, e.g., 1)
- Click **"Donate"**
- Sign **2 grouped transactions** in Pera Wallet:
  1. Payment transaction (sending ALGO)
  2. App call transaction (recording donation)
- Donation confirmed! ✅

---

## 🔍 What to Watch in Console

### Success Indicators:
```
✅ "Opting in with address: AU2KTK..."
✅ "APP_ID: 749698364"
✅ "Params received: {...}"
✅ "Transaction created: {...}"
✅ "Opt-in transaction sent: TXID..."
✅ "Opt-in confirmed"
```

### Error Indicators (Should NOT appear now):
```
❌ "algosdk.makeApplicationOptInTxnWithSuggestedParams is not a function"
❌ "Address must not be null or undefined"
❌ "Cannot read properties of undefined (reading 'forEach')"
```

---

## 💡 Troubleshooting

### If Pera Wallet doesn't open:
- Ensure Pera Wallet extension is installed
- Check wallet is on TestNet (Settings → Network → TestNet)
- Refresh browser page

### If transaction fails:
- Ensure wallet has ALGO for fees (~0.002 ALGO per transaction)
- Verify APP_ID in console matches 749698364
- Check Pera Wallet is signing transactions

### If "Not Opted In" persists:
- Wait 5 seconds after transaction confirms
- Click "Refresh" or reload page
- Check AlgoExplorer TestNet: https://testnet.explorer.perawallet.app/

---

## 📊 Smart Contract Info

- **Network**: Algorand TestNet
- **APP_ID**: 749698364
- **Contract Address**: QJP3ULQSL3KUFWHPK27BHV4LOU3YKXLBEQEP2KHUTFHA45KAX556HP4RBQ
- **Admin Wallet**: SASQBRESJY524CT26IT6VAWONFQBU5X3BY7KVCWCR6YLVOK2QEL6JNGZWA

---

## ✨ Key Features to Test

### Donor Role:
- ✅ View all campaigns
- ✅ Make donations
- ✅ View donation history
- ✅ Track total donated

### NGO Role:
- ✅ Register as NGO
- ✅ Create campaigns (after approval)
- ✅ View received donations
- ✅ Track campaign performance

### Admin Role:
- ✅ View all NGOs
- ✅ Approve/reject NGO registrations
- ✅ View platform statistics
- ✅ Monitor all donations

---

## 🎯 Expected Outcomes

After successful testing, you should see:
1. ✅ Wallet connects without errors
2. ✅ Opt-in completes successfully
3. ✅ NGO registration works
4. ✅ Admin can approve NGOs
5. ✅ Approved NGOs can create campaigns
6. ✅ Donors can make donations
7. ✅ All transactions appear on blockchain
8. ✅ State updates reflect in UI

---

## 🚀 START TESTING NOW!

**Open:** http://localhost:5174

**Server is ready and all fixes are live!** ✨

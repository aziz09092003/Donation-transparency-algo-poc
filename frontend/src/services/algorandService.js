import algosdk from 'algosdk';
import { ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT, INDEXER_SERVER, INDEXER_PORT, APP_ID } from './config';
import { peraWallet } from './walletService';

// Initialize Algod client
const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);

// Initialize Indexer client
const indexerClient = new algosdk.Indexer(ALGOD_TOKEN, INDEXER_SERVER, INDEXER_PORT);

/**
 * Get suggested transaction parameters
 */
export const getSuggestedParams = async () => {
  return await algodClient.getTransactionParams().do();
};

/**
 * Opt-in to the smart contract application
 * @param {string} userAddress - User's wallet address
 */
export const optInToApp = async (userAddress) => {
  try {
    if (!userAddress) {
      throw new Error('User address is required');
    }
    
    const cleanAddress = userAddress.trim();
    console.log('Opting in with address:', cleanAddress);
    console.log('APP_ID:', APP_ID);
    
    const params = await getSuggestedParams();
    console.log('Params received:', params);
    
    // ✅ algosdk v3.0 correct method
    const txn = algosdk.makeApplicationOptInTxnFromObject({
      from: cleanAddress,
      suggestedParams: params,
      appIndex: Number(APP_ID)
    });
    
    console.log('Transaction created:', txn);
    
    // Sign with Pera Wallet (correct format)
    const signedTxn = await peraWallet.signTransaction([[
      {
        txn: txn,
        signers: [cleanAddress]
      }
    ]]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    console.log('Opt-in transaction sent:', txId);
    
    // Reduced to 2 rounds for faster UX (~6.6s instead of ~13s)
    await algosdk.waitForConfirmation(algodClient, txId, 2);
    console.log('Opt-in confirmed');
    
    return txId;
  } catch (error) {
    console.error('Error opting in:', error);
    throw error;
  }
};

/**
 * Register NGO
 * @param {string} ngoAddress - NGO wallet address
 * @param {string} name - NGO name
 * @param {string} description - NGO description
 */
export const registerNGO = async (ngoAddress, name, description) => {
  try {
    if (!ngoAddress || typeof ngoAddress !== 'string') {
      throw new Error('Valid address is required');
    }
    
    const cleanAddress = ngoAddress.trim();
    console.log('Registering NGO with address:', cleanAddress);
    
    const params = await getSuggestedParams();
    
    const appArgs = [
      new Uint8Array(Buffer.from('register_ngo')),
      new Uint8Array(Buffer.from(name)),
      new Uint8Array(Buffer.from(description))
    ];
    
    // ✅ algosdk v3.0 correct method
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: cleanAddress,
      suggestedParams: params,
      appIndex: Number(APP_ID),
      appArgs: appArgs
    });
    
    const signedTxn = await peraWallet.signTransaction([[
      {
        txn: txn,
        signers: [cleanAddress]
      }
    ]]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    // Reduced to 2 rounds for faster UX (~6.6s instead of ~13s)
    await algosdk.waitForConfirmation(algodClient, txId, 2);
    
    return txId;
  } catch (error) {
    console.error('Error registering NGO:', error);
    throw error;
  }
};

/**
 * Approve NGO (admin only)
 * @param {string} adminAddress - Admin wallet address
 * @param {string} ngoAddress - NGO wallet address to approve
 */
export const approveNGO = async (adminAddress, ngoAddress) => {
  try {
    const params = await getSuggestedParams();
    
    const appArgs = [
      new Uint8Array(Buffer.from('approve_ngo'))
    ];
    
    // ✅ algosdk v3.0 correct method
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: adminAddress,
      suggestedParams: params,
      appIndex: Number(APP_ID),
      appArgs: appArgs,
      accounts: [ngoAddress]
    });
    
    const signedTxn = await peraWallet.signTransaction([[
      {
        txn: txn,
        signers: [adminAddress]
      }
    ]]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    // Reduced to 2 rounds for faster UX (~6.6s instead of ~13s)
    await algosdk.waitForConfirmation(algodClient, txId, 2);
    
    return txId;
  } catch (error) {
    console.error('Error approving NGO:', error);
    throw error;
  }
};

/**
 * Create campaign
 * @param {string} ngoAddress - NGO wallet address
 * @param {string} title - Campaign title
 * @param {string} purpose - Campaign purpose
 * @param {number} minDonation - Minimum donation amount in microALGO
 */
export const createCampaign = async (ngoAddress, title, purpose, minDonation) => {
  try {
    const params = await getSuggestedParams();
    
    const appArgs = [
      new Uint8Array(Buffer.from('create_campaign')),
      new Uint8Array(Buffer.from(title)),
      new Uint8Array(Buffer.from(purpose)),
      new Uint8Array(Buffer.from(minDonation.toString()))
    ];
    
    // ✅ algosdk v3.0 correct method
    const txn = algosdk.makeApplicationNoOpTxnFromObject({
      from: ngoAddress,
      suggestedParams: params,
      appIndex: Number(APP_ID),
      appArgs: appArgs
    });
    
    const signedTxn = await peraWallet.signTransaction([[
      {
        txn: txn,
        signers: [ngoAddress]
      }
    ]]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxn).do();
    // Reduced to 2 rounds for faster UX (~6.6s instead of ~13s)
    await algosdk.waitForConfirmation(algodClient, txId, 2);
    
    return txId;
  } catch (error) {
    console.error('Error creating campaign:', error);
    throw error;
  }
};

/**
 * Make donation
 * @param {string} donorAddress - Donor wallet address
 * @param {string} ngoAddress - NGO wallet address
 * @param {number} amount - Donation amount in microALGO
 * @param {number} campaignId - Campaign ID
 */
export const makeDonation = async (donorAddress, ngoAddress, amount, campaignId) => {
  try {
    const params = await getSuggestedParams();
    const appAddress = algosdk.getApplicationAddress(APP_ID);
    
    // Payment transaction
    const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: donorAddress,
      to: appAddress,
      amount: amount,
      suggestedParams: params
    });
    
    // Application call transaction
    const appArgs = [
      new Uint8Array(Buffer.from('donate')),
      new Uint8Array(Buffer.from(campaignId.toString()))
    ];
    
    const appCallTxn = algosdk.makeApplicationNoOpTxnFromObject({
      from: donorAddress,
      suggestedParams: params,
      appIndex: Number(APP_ID),
      appArgs: appArgs,
      accounts: [ngoAddress]
    });
    
    // Group transactions
    const txnGroup = algosdk.assignGroupID([payTxn, appCallTxn]);
    
    // ✅ Fixed grouping format for Pera Wallet
    const signedTxns = await peraWallet.signTransaction([[
      { txn: txnGroup[0], signers: [donorAddress] },
      { txn: txnGroup[1], signers: [donorAddress] }
    ]]);
    
    const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
    // Reduced to 2 rounds for faster UX (~6.6s instead of ~13s)
    await algosdk.waitForConfirmation(algodClient, txId, 2);
    
    return txId;
  } catch (error) {
    console.error('Error making donation:', error);
    throw error;
  }
};

/**
 * Get global state
 */
export const getGlobalState = async () => {
  if (!APP_ID || APP_ID === 0) {
    console.warn('App ID not configured');
    return {};
  }
  
  try {
    const appInfo = await algodClient.getApplicationByID(APP_ID).do();
    const globalState = appInfo.params['global-state'] || [];
    
    const state = {};
    (globalState || []).forEach(item => {
      const key = Buffer.from(item.key, 'base64').toString();
      if (item.value.type === 1) {
        state[key] = item.value.bytes;
      } else {
        state[key] = item.value.uint;
      }
    });
    
    return state;
  } catch (error) {
    console.error('Error getting global state:', error);
    return {};
  }
};

/**
 * Get local state for an account
 * @param {string} address - Account address
 */
export const getLocalState = async (address) => {
  try {
    const info = await algodClient.accountApplicationInformation(address, APP_ID).do();
    const local = info['app-local-state']?.['key-value'] || [];
    
    const state = {};
    local.forEach(item => {
      const key = Buffer.from(item.key, 'base64').toString();
      if (item.value.type === 1) {
        state[key] = Buffer.from(item.value.bytes, 'base64').toString();
      } else {
        state[key] = item.value.uint;
      }
    });
    
    return state;
  } catch (error) {
    console.error('Error getting local state:', error);
    return {};
  }
};

/**
 * Get account balance
 * @param {string} address - Account address
 */
export const getAccountBalance = async (address) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    return accountInfo.amount;
  } catch (error) {
    console.error('Error getting account balance:', error);
    return 0;
  }
};

/**
 * Check if user has opted into the app
 * @param {string} address - Account address
 */
export const hasOptedIn = async (address) => {
  try {
    const accountInfo = await algodClient.accountInformation(address).do();
    const apps = accountInfo['apps-local-state'] || [];
    return apps.some(app => app.id === APP_ID);
  } catch (error) {
    return false;
  }
};

/**
 * Get all transactions for the app (via indexer)
 */
export const getAppTransactions = async (limit = 100) => {
  if (!APP_ID || APP_ID === 0) {
    console.warn('App ID not configured');
    return [];
  }
  
  try {
    const response = await indexerClient
      .searchForTransactions()
      .applicationID(APP_ID)
      .limit(limit)
      .do();
    return response.transactions || [];
  } catch (error) {
    console.error('Error getting app transactions:', error);
    return [];
  }
};

export { algodClient, indexerClient };

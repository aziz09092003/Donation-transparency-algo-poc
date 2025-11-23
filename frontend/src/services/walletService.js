import { PeraWalletConnect } from '@perawallet/connect';

// Initialize Pera Wallet
export const peraWallet = new PeraWalletConnect({
  chainId: 416002, // TestNet chain ID
});

/**
 * Connect to Pera Wallet
 * @returns {Promise<string[]>} Array of connected wallet addresses
 */
export const connectWallet = async () => {
  try {
    const accounts = await peraWallet.connect();
    return accounts;
  } catch (error) {
    console.error('Error connecting to Pera Wallet:', error);
    throw error;
  }
};

/**
 * Disconnect from Pera Wallet
 */
export const disconnectWallet = () => {
  peraWallet.disconnect();
};

/**
 * Check if wallet is connected
 * @returns {boolean}
 */
export const isWalletConnected = () => {
  return peraWallet.isConnected;
};

/**
 * Reconnect to previously connected wallet
 * @returns {Promise<string[]>}
 */
export const reconnectWallet = async () => {
  try {
    const accounts = await peraWallet.reconnectSession();
    return accounts;
  } catch (error) {
    console.error('Error reconnecting wallet:', error);
    return [];
  }
};

/**
 * Sign transactions with Pera Wallet
 * @param {Array} txnGroups - Array of transaction groups
 * @returns {Promise<Uint8Array[]>} Signed transactions
 */
export const signTransactions = async (txnGroups) => {
  try {
    const signedTxns = await peraWallet.signTransaction([txnGroups]);
    return signedTxns;
  } catch (error) {
    console.error('Error signing transactions:', error);
    throw error;
  }
};

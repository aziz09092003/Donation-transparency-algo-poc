/**
 * Format ALGO amount from microALGO to ALGO
 * @param {number} microAlgo - Amount in microALGO
 * @returns {string} Formatted ALGO amount
 */
export const formatAlgoAmount = (microAlgo) => {
  if (!microAlgo || microAlgo === 0) return '0.00';
  // Convert BigInt to Number if needed
  const amount = typeof microAlgo === 'bigint' ? Number(microAlgo) : microAlgo;
  return (amount / 1_000_000).toFixed(2);
};

/**
 * Convert ALGO to microALGO
 * @param {number} algo - Amount in ALGO
 * @returns {number} Amount in microALGO
 */
export const algoToMicroAlgo = (algo) => {
  return Math.floor(algo * 1_000_000);
};

/**
 * Truncate wallet address for display
 * @param {string} address - Full wallet address
 * @param {number} startChars - Number of characters to show at start
 * @param {number} endChars - Number of characters to show at end
 * @returns {string} Truncated address
 */
export const truncateAddress = (address, startChars = 6, endChars = 4) => {
  if (!address) return '';
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Format timestamp to readable date
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date
 */
export const formatDate = (timestamp) => {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    return false;
  }
};

/**
 * Validate ALGO amount
 * @param {string} amount - Amount to validate
 * @returns {boolean} Is valid
 */
export const isValidAlgoAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

/**
 * Get explorer URL for transaction
 * @param {string} txId - Transaction ID
 * @returns {string} Explorer URL
 */
export const getExplorerUrl = (txId, type = 'tx') => {
  const baseUrl = 'https://testnet.algoexplorer.io';
  return `${baseUrl}/${type}/${txId}`;
};

/**
 * Parse error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const parseErrorMessage = (error) => {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

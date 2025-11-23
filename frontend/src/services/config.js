// Algorand configuration
export const ALGOD_TOKEN = import.meta.env.VITE_ALGOD_TOKEN || '';
export const ALGOD_SERVER = import.meta.env.VITE_ALGOD_SERVER || 'https://testnet-api.algonode.cloud';
export const ALGOD_PORT = import.meta.env.VITE_ALGOD_PORT || 443;

export const INDEXER_SERVER = import.meta.env.VITE_INDEXER_SERVER || 'https://testnet-idx.algonode.cloud';
export const INDEXER_PORT = import.meta.env.VITE_INDEXER_PORT || 443;

// Smart contract App ID (update after deployment)
export const APP_ID = parseInt(import.meta.env.VITE_APP_ID || '0');

// Admin wallet address
export const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS || '';

// Network
export const NETWORK = 'TestNet';

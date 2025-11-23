import React, { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, disconnectWallet, reconnectWallet, peraWallet } from '../services/walletService';
import { hasOptedIn, optInToApp, getLocalState } from '../services/algorandService';
import { ADMIN_ADDRESS, APP_ID } from '../services/config';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [connectedAddress, setConnectedAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isNGO, setIsNGO] = useState(false);
  const [ngoApproved, setNgoApproved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user has opted into the app
  const checkOptInStatus = async (address) => {
    try {
      // Skip if app not deployed yet
      if (!APP_ID || APP_ID === 0 || APP_ID === 123456789) {
        console.log('Smart contract not deployed yet - skipping opt-in check');
        return false;
      }
      
      const optedIn = await hasOptedIn(address);
      setIsOptedIn(optedIn);
      
      if (optedIn) {
        // Get local state to check if NGO
        const localState = await getLocalState(address);
        const isNGORegistered = localState.ngo_registered === 1;
        const ngoApprovedStatus = localState.ngo_approved === 1;
        
        setIsNGO(isNGORegistered);
        setNgoApproved(ngoApprovedStatus);
      }
      
      return optedIn;
    } catch (error) {
      console.error('Error checking opt-in status:', error);
      return false;
    }
  };

  // Connect wallet
  const connect = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const accounts = await connectWallet();
      
      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        setConnectedAddress(address);
        setIsConnected(true);
        
        // Check if admin
        if (address === ADMIN_ADDRESS) {
          setIsAdmin(true);
        }
        
        // Check opt-in status
        await checkOptInStatus(address);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError(err.message || 'Failed to connect wallet');
    } finally {
      setLoading(false);
    }
  };

  // Disconnect wallet
  const disconnect = () => {
    disconnectWallet();
    setConnectedAddress(null);
    setIsConnected(false);
    setIsOptedIn(false);
    setIsAdmin(false);
    setIsNGO(false);
    setNgoApproved(false);
    setError(null);
  };

  // Opt-in to app
  const optIn = async () => {
    if (!connectedAddress) {
      setError('Please connect wallet first');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      await optInToApp(connectedAddress);
      await checkOptInStatus(connectedAddress);
      
      return true;
    } catch (err) {
      console.error('Opt-in error:', err);
      setError(err.message || 'Failed to opt-in to app');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Refresh user state
  const refreshState = async () => {
    if (connectedAddress) {
      await checkOptInStatus(connectedAddress);
    }
  };

  // Try to reconnect on mount
  useEffect(() => {
    const tryReconnect = async () => {
      try {
        const accounts = await reconnectWallet();
        if (accounts && accounts.length > 0) {
          const address = accounts[0];
          setConnectedAddress(address);
          setIsConnected(true);
          
          if (address === ADMIN_ADDRESS) {
            setIsAdmin(true);
          }
          
          await checkOptInStatus(address);
        }
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    };

    tryReconnect();

    // Listen for disconnect event
    peraWallet.connector?.on('disconnect', () => {
      disconnect();
    });
  }, []);

  const value = {
    connectedAddress,
    isConnected,
    isOptedIn,
    isAdmin,
    isNGO,
    ngoApproved,
    loading,
    error,
    connect,
    disconnect,
    optIn,
    refreshState,
    setError
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

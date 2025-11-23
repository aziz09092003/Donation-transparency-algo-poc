import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getGlobalState, getLocalState, getAppTransactions } from '../services/algorandService';
import { formatAlgoAmount } from '../utils/helpers';
import { Search, TrendingUp, Users, DollarSign, Heart, ChevronRight } from 'lucide-react';
import Alert from '../components/Alert';
import Loader from '../components/Loader';
import { APP_ID } from '../services/config';

const HomePage = () => {
  const { connectedAddress, isConnected, isOptedIn, optIn, loading: walletLoading } = useWallet();
  const [globalStats, setGlobalStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [optingIn, setOptingIn] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check if APP_ID is configured
      if (!APP_ID || APP_ID === 0) {
        setMessage({ 
          type: 'warning', 
          text: 'Smart contract not deployed yet. Please deploy the contract and update VITE_APP_ID in .env file.' 
        });
        setLoading(false);
        return;
      }
      
      // Get global state
      const state = await getGlobalState();
      setGlobalStats(state);
      
      // Get all transactions to find NGOs
      const transactions = await getAppTransactions(200);
      await loadNGOs(transactions);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const loadNGOs = async (transactions) => {
    // Parse transactions to find NGO registrations
    const ngoAddresses = new Set();
    
    transactions.forEach(tx => {
      if (tx['application-transaction']?.['application-args']) {
        const args = tx['application-transaction']['application-args'];
        if (args.length > 0) {
          const operation = Buffer.from(args[0], 'base64').toString();
          if (operation === 'register_ngo') {
            ngoAddresses.add(tx.sender);
          }
        }
      }
    });

    // Get local state for each NGO
    const ngoList = [];
    for (const address of ngoAddresses) {
      try {
        const localState = await getLocalState(address);
        if (localState.ngo_registered === 1) {
          ngoList.push({
            address,
            name: localState.ngo_name || 'Unknown NGO',
            description: localState.ngo_description || '',
            approved: localState.ngo_approved === 1,
            campaignCount: localState.campaign_count || 0
          });
        }
      } catch (error) {
        console.error(`Error loading NGO ${address}:`, error);
      }
    }

    setNgos(ngoList.filter(ngo => ngo.approved));
  };

  const handleOptIn = async () => {
    setOptingIn(true);
    const success = await optIn();
    if (success) {
      setMessage({ type: 'success', text: 'Successfully opted into the app!' });
    }
    setOptingIn(false);
  };

  const filteredNgos = ngos.filter(ngo =>
    ngo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ngo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Transparent Donations on Algorand</h1>
            <p className="text-xl mb-8 text-primary-100">
              Support NGOs with complete transparency. Every donation tracked on the blockchain.
            </p>
            
            {!isConnected && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <p className="text-lg mb-4">Connect your Pera Wallet to get started</p>
              </div>
            )}

            {isConnected && !isOptedIn && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <p className="text-lg mb-4">Opt-in to start donating and tracking your contributions</p>
                <button
                  onClick={handleOptIn}
                  disabled={optingIn}
                  className="btn btn-primary bg-white text-primary-600 hover:bg-primary-50"
                >
                  {optingIn ? 'Opting in...' : 'Opt-In to App'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Donations</p>
                <p className="text-3xl font-bold">
                  {globalStats?.total_donations ? formatAlgoAmount(globalStats.total_donations) : '0'} ALGO
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Active NGOs</p>
                <p className="text-3xl font-bold">{ngos.length}</p>
              </div>
              <Heart className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Donations</p>
                <p className="text-3xl font-bold">{globalStats?.donation_count || 0}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6">
            <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search NGOs by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
          </div>
        </div>

        {/* NGO List */}
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Active NGOs</h2>
          
          {filteredNgos.length === 0 ? (
            <div className="card text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No NGOs found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNgos.map((ngo, index) => (
                <Link key={index} to={`/ngo/${ngo.address}`}>
                  <div className="card hover:shadow-xl transition-all duration-300 cursor-pointer group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="bg-primary-100 p-3 rounded-lg">
                        <Heart className="w-6 h-6 text-primary-600" />
                      </div>
                      <span className="badge badge-success">Active</span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600 transition-colors">
                      {ngo.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {ngo.description || 'No description provided'}
                    </p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-500">
                        {ngo.campaignCount} Campaign{ngo.campaignCount !== 1 ? 's' : ''}
                      </span>
                      <ChevronRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Register NGO CTA */}
        {isConnected && isOptedIn && (
          <div className="mt-12 card bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Are you an NGO?</h3>
              <p className="text-gray-600 mb-4">Register your organization and start receiving transparent donations</p>
              <Link to="/ngo-dashboard" className="btn btn-primary inline-flex items-center space-x-2">
                <span>Register Your NGO</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;

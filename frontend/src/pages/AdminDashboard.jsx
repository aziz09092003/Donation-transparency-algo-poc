import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { 
  getGlobalState, 
  getLocalState, 
  approveNGO, 
  getAppTransactions 
} from '../services/algorandService';
import { formatAlgoAmount, truncateAddress, formatDate, getExplorerUrl } from '../utils/helpers';
import { Shield, Users, Heart, TrendingUp, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const AdminDashboard = () => {
  const { connectedAddress, isConnected, isAdmin } = useWallet();
  const navigate = useNavigate();
  
  const [globalStats, setGlobalStats] = useState(null);
  const [ngos, setNgos] = useState([]);
  const [donors, setDonors] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!isConnected) {
      setMessage({ type: 'info', text: 'Please connect your wallet to access Admin Dashboard' });
      setLoading(false);
      return;
    }

    if (!isAdmin) {
      setMessage({ type: 'warning', text: 'Admin wallet address required. Connect with admin wallet to approve NGOs.' });
    }

    loadAdminData();
  }, [connectedAddress, isConnected, isAdmin]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Get global state
      const state = await getGlobalState();
      setGlobalStats(state);
      
      // Get all transactions
      const transactions = await getAppTransactions(300);
      
      // Parse NGOs
      await loadNGOs(transactions);
      
      // Parse donors and donations
      await loadDonorsAndDonations(transactions);
      
    } catch (error) {
      console.error('Error loading admin data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  const loadNGOs = async (transactions) => {
    const ngoAddresses = new Set();
    
    // Find all NGO registrations
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

    setNgos(ngoList);
  };

  const loadDonorsAndDonations = async (transactions) => {
    const donorMap = new Map();
    const donations = [];

    // Parse payment transactions to app
    transactions.forEach(tx => {
      if (tx['tx-type'] === 'pay') {
        const sender = tx.sender;
        const amount = tx['payment-transaction']?.amount || 0;
        const timestamp = tx['round-time'];
        
        // Track donor
        if (!donorMap.has(sender)) {
          donorMap.set(sender, { address: sender, totalDonated: 0, donationCount: 0 });
        }
        const donor = donorMap.get(sender);
        donor.totalDonated += amount;
        donor.donationCount += 1;

        // Track donation
        donations.push({
          txId: tx.id,
          donor: sender,
          amount,
          timestamp
        });
      }
    });

    setDonors(Array.from(donorMap.values()));
    setRecentDonations(donations.slice(0, 10)); // Latest 10
  };

  const handleApproveNGO = async (ngoAddress) => {
    try {
      setApproving(ngoAddress);
      setMessage(null);
      
      const txId = await approveNGO(connectedAddress, ngoAddress);
      
      setMessage({ 
        type: 'success', 
        text: (
          <div>
            NGO approved successfully!
            <a 
              href={getExplorerUrl(txId)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 underline inline-flex items-center"
            >
              View Transaction <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )
      });
      
      // Reload data
      await loadAdminData();
      
    } catch (error) {
      console.error('Approval error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to approve NGO' });
    } finally {
      setApproving(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" />
      </div>
    );
  }

  const pendingNGOs = ngos.filter(ngo => !ngo.approved);
  const approvedNGOs = ngos.filter(ngo => ngo.approved);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="bg-purple-600 p-3 rounded-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-600">Platform management and oversight</p>
          </div>
        </div>

        {message && (
          <div className="mb-6">
            <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Donations</p>
                <p className="text-2xl font-bold">
                  {globalStats?.total_donations ? formatAlgoAmount(globalStats.total_donations) : '0'} ALGO
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total NGOs</p>
                <p className="text-2xl font-bold">{ngos.length}</p>
                <p className="text-green-100 text-xs mt-1">
                  {approvedNGOs.length} approved
                </p>
              </div>
              <Heart className="w-10 h-10 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Donors</p>
                <p className="text-2xl font-bold">{donors.length}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Pending Approvals</p>
                <p className="text-2xl font-bold">{pendingNGOs.length}</p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </div>
        </div>

        {/* Pending NGO Approvals */}
        {pendingNGOs.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Clock className="w-6 h-6 text-orange-600" />
              <span>Pending NGO Approvals</span>
            </h2>
            
            <div className="space-y-4">
              {pendingNGOs.map((ngo, index) => (
                <div key={index} className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800 mb-1">{ngo.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{ngo.description}</p>
                      <p className="text-xs text-gray-500 font-mono">{ngo.address}</p>
                    </div>
                    <button
                      onClick={() => handleApproveNGO(ngo.address)}
                      disabled={approving === ngo.address}
                      className="btn btn-primary ml-4"
                    >
                      {approving === ngo.address ? 'Approving...' : 'Approve'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Approved NGOs */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
            <Heart className="w-6 h-6 text-green-600" />
            <span>Approved NGOs</span>
          </h2>
          
          {approvedNGOs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No approved NGOs yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      NGO Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Campaigns
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {approvedNGOs.map((ngo, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-800">{ngo.name}</p>
                          <p className="text-sm text-gray-600">{ngo.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {truncateAddress(ngo.address)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {ngo.campaignCount}
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge badge-success flex items-center space-x-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          <span>Approved</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Donors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <Users className="w-6 h-6 text-purple-600" />
              <span>Top Donors</span>
            </h2>
            
            {donors.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donors yet</p>
            ) : (
              <div className="space-y-3">
                {donors.slice(0, 5).map((donor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm text-gray-700">
                        {truncateAddress(donor.address)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {donor.donationCount} donation{donor.donationCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="font-bold text-primary-600">
                      {formatAlgoAmount(donor.totalDonated)} ALGO
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Donations */}
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              <span>Recent Donations</span>
            </h2>
            
            {recentDonations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No donations yet</p>
            ) : (
              <div className="space-y-3">
                {recentDonations.map((donation, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-mono text-sm text-gray-700">
                        {truncateAddress(donation.donor)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(donation.timestamp)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatAlgoAmount(donation.amount)} ALGO
                      </p>
                      <a
                        href={getExplorerUrl(donation.txId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary-600 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

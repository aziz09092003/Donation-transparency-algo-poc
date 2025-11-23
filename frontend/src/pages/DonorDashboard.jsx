import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getLocalState, getAppTransactions, getAccountBalance } from '../services/algorandService';
import { formatAlgoAmount, formatDate, truncateAddress, getExplorerUrl } from '../utils/helpers';
import { TrendingUp, Heart, DollarSign, History, ExternalLink } from 'lucide-react';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const DonorDashboard = () => {
  const { connectedAddress, isConnected, isOptedIn } = useWallet();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalDonated: 0,
    donationCount: 0,
    balance: 0
  });
  const [donationHistory, setDonationHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isConnected) {
      setLoading(false);
      return;
    }

    loadDonorData();
  }, [connectedAddress, isConnected, isOptedIn]);

  const loadDonorData = async () => {
    try {
      setLoading(true);
      
      if (!connectedAddress) {
        setLoading(false);
        return;
      }

      // Get donor's local state
      const localState = await getLocalState(connectedAddress);
      const totalDonated = localState.donor_total || 0;
      
      // Get account balance
      const balance = await getAccountBalance(connectedAddress);
      
      // Get donation transactions
      const transactions = await getAppTransactions(200);
      const donorTxs = transactions.filter(tx => 
        tx.sender === connectedAddress && 
        tx['tx-type'] === 'pay'
      );

      setStats({
        totalDonated,
        donationCount: donorTxs.length,
        balance
      });

      // Format donation history
      const history = donorTxs.map(tx => ({
        txId: tx.id,
        amount: tx['payment-transaction']?.amount || 0,
        timestamp: tx['round-time'],
        receiver: tx['payment-transaction']?.receiver || 'Unknown'
      }));

      setDonationHistory(history);
      
    } catch (error) {
      console.error('Error loading donor data:', error);
      // Set empty state if smart contract not deployed
      setStats({
        totalDonated: 0,
        donationCount: 0,
        balance: 0
      });
      setDonationHistory([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Donor Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Donated</p>
                <p className="text-3xl font-bold">
                  {formatAlgoAmount(stats.totalDonated)} ALGO
                </p>
              </div>
              <Heart className="w-12 h-12 text-blue-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Donations Made</p>
                <p className="text-3xl font-bold">{stats.donationCount}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Wallet Balance</p>
                <p className="text-3xl font-bold">
                  {formatAlgoAmount(stats.balance)} ALGO
                </p>
              </div>
              <DollarSign className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>

        {/* Donation History */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <History className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-800">Donation History</h2>
          </div>

          {donationHistory.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No donations yet</p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Make Your First Donation
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Receiver
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Transaction
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {donationHistory.map((donation, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {formatDate(donation.timestamp)}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-primary-600">
                        {formatAlgoAmount(donation.amount)} ALGO
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                        {truncateAddress(donation.receiver)}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <a
                          href={getExplorerUrl(donation.txId)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 inline-flex items-center space-x-1"
                        >
                          <span>View</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Impact Section */}
        {stats.donationCount > 0 && (
          <div className="card mt-8 bg-gradient-to-r from-primary-50 to-purple-50 border-2 border-primary-200">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Your Impact</h3>
              <p className="text-gray-600 mb-4">
                Thank you for supporting {stats.donationCount} campaign{stats.donationCount !== 1 ? 's' : ''}! 
                Your donations make a real difference.
              </p>
              <button
                onClick={() => navigate('/')}
                className="btn btn-primary"
              >
                Continue Supporting NGOs
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DonorDashboard;

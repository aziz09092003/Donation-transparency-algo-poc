import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { getLocalState, makeDonation, getAppTransactions } from '../services/algorandService';
import { formatAlgoAmount, algoToMicroAlgo, getExplorerUrl } from '../utils/helpers';
import { Heart, ArrowLeft, TrendingUp, Users, Target, ExternalLink } from 'lucide-react';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const NGODetailPage = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const { connectedAddress, isConnected, isOptedIn } = useWallet();
  
  const [ngo, setNgo] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadNGOData();
  }, [address]);

  const loadNGOData = async () => {
    try {
      setLoading(true);
      
      // Get NGO local state
      const localState = await getLocalState(address);
      
      if (!localState.ngo_registered) {
        setMessage({ type: 'error', text: 'NGO not found' });
        return;
      }

      setNgo({
        address,
        name: localState.ngo_name || 'Unknown NGO',
        description: localState.ngo_description || '',
        approved: localState.ngo_approved === 1,
        campaignCount: localState.campaign_count || 0
      });

      // Load campaigns from box storage (simulated - in real implementation, you'd query boxes)
      // For this POC, we'll create mock campaigns based on campaign count
      const campaignList = [];
      for (let i = 1; i <= (localState.campaign_count || 0); i++) {
        campaignList.push({
          id: i,
          title: `Campaign ${i}`,
          purpose: 'Supporting community development',
          minDonation: 1,
          totalDonations: 0,
          donorCount: 0
        });
      }
      setCampaigns(campaignList);
      
    } catch (error) {
      console.error('Error loading NGO data:', error);
      setMessage({ type: 'error', text: 'Failed to load NGO data' });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      setMessage({ type: 'error', text: 'Please connect your wallet' });
      return;
    }

    if (!isOptedIn) {
      setMessage({ type: 'error', text: 'Please opt-in to the app first' });
      return;
    }

    if (!selectedCampaign) {
      setMessage({ type: 'error', text: 'Please select a campaign' });
      return;
    }

    const amount = parseFloat(donationAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid amount' });
      return;
    }

    if (amount < selectedCampaign.minDonation) {
      setMessage({ type: 'error', text: `Minimum donation is ${selectedCampaign.minDonation} ALGO` });
      return;
    }

    try {
      setDonating(true);
      setMessage(null);
      
      // Show progress message
      setMessage({ 
        type: 'info', 
        text: '⏳ Processing donation... (Please approve in Pera Wallet)'
      });
      
      const microAlgoAmount = algoToMicroAlgo(amount);
      const txId = await makeDonation(connectedAddress, address, microAlgoAmount, selectedCampaign.id);
      
      setMessage({ 
        type: 'success', 
        text: (
          <div>
            Donation successful! 
            <a 
              href={getExplorerUrl(txId)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 underline inline-flex items-center"
            >
              View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>
        )
      });
      
      setDonationAmount('');
      setSelectedCampaign(null);
      
      // Reload data
      await loadNGOData();
      
    } catch (error) {
      console.error('Donation error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to process donation' });
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" />
      </div>
    );
  }

  if (!ngo) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error" message="NGO not found" />
        <button onClick={() => navigate('/')} className="btn btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    );
  }

  if (!ngo.approved) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="warning" message="This NGO is pending approval" />
        <button onClick={() => navigate('/')} className="btn btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <button onClick={() => navigate('/')} className="btn btn-secondary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to NGOs
        </button>

        {/* NGO Header */}
        <div className="card mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-primary-100 p-4 rounded-xl">
              <Heart className="w-12 h-12 text-primary-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-800">{ngo.name}</h1>
                <span className="badge badge-success">Verified</span>
              </div>
              <p className="text-gray-600 mb-4">{ngo.description}</p>
              <p className="text-sm text-gray-500">Address: {ngo.address}</p>
            </div>
          </div>
        </div>

        {message && (
          <div className="mb-6">
            <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Campaigns List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Campaigns</h2>
            
            {campaigns.length === 0 ? (
              <div className="card text-center py-12">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No campaigns available yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className={`card cursor-pointer transition-all ${
                      selectedCampaign?.id === campaign.id
                        ? 'ring-2 ring-primary-500 bg-primary-50'
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedCampaign(campaign)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800">{campaign.title}</h3>
                      <span className="badge badge-success">Active</span>
                    </div>
                    
                    <p className="text-gray-600 mb-4">{campaign.purpose}</p>
                    
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Min. Donation</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {campaign.minDonation} ALGO
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Total Raised</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {formatAlgoAmount(campaign.totalDonations)} ALGO
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Donors</p>
                        <p className="text-lg font-semibold text-gray-800">
                          {campaign.donorCount}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Donation Form */}
          <div>
            <div className="card sticky top-20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Make a Donation</h3>
              
              {!isConnected ? (
                <Alert type="info" message="Connect your wallet to donate" />
              ) : !isOptedIn ? (
                <Alert type="warning" message="Please opt-in to the app from the home page" />
              ) : !selectedCampaign ? (
                <Alert type="info" message="Select a campaign to donate" />
              ) : (
                <form onSubmit={handleDonate}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selected Campaign
                    </label>
                    <div className="bg-primary-50 rounded-lg p-3">
                      <p className="font-medium text-gray-800">{selectedCampaign.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Min: {selectedCampaign.minDonation} ALGO
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ALGO)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={selectedCampaign.minDonation}
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="input"
                      placeholder={`Min. ${selectedCampaign.minDonation} ALGO`}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={donating}
                    className="btn btn-primary w-full"
                  >
                    {donating ? 'Processing...' : 'Donate Now'}
                  </button>
                </form>
              )}

              {/* Campaign Stats */}
              {selectedCampaign && (
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Campaign ID</span>
                    <span className="font-medium">#{selectedCampaign.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="badge badge-success">Active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGODetailPage;

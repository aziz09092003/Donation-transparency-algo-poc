import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { registerNGO, createCampaign, getLocalState } from '../services/algorandService';
import { formatAlgoAmount, getExplorerUrl } from '../utils/helpers';
import { Heart, Plus, TrendingUp, Users, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import Alert from '../components/Alert';
import Loader from '../components/Loader';

const NGODashboard = () => {
  const { connectedAddress, isConnected, isOptedIn, isNGO, ngoApproved, refreshState } = useWallet();
  const navigate = useNavigate();
  
  console.log('NGO Dashboard - Connected Address:', connectedAddress);
  console.log('NGO Dashboard - Is Connected:', isConnected);
  
  const [ngoData, setNgoData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Registration form
  const [ngoName, setNgoName] = useState('');
  const [ngoDescription, setNgoDescription] = useState('');

  // Campaign form
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignPurpose, setCampaignPurpose] = useState('');
  const [minDonation, setMinDonation] = useState('1');

  useEffect(() => {
    if (!isConnected) {
      setMessage({ type: 'info', text: 'Please connect your wallet to access NGO Dashboard' });
      setLoading(false);
      return;
    }

    loadNGOData();
  }, [connectedAddress, isConnected, isOptedIn, isNGO]);

  const loadNGOData = async () => {
    try {
      setLoading(true);
      
      if (isNGO) {
        const localState = await getLocalState(connectedAddress);
        setNgoData({
          name: localState.ngo_name || '',
          description: localState.ngo_description || '',
          approved: localState.ngo_approved === 1,
          campaignCount: localState.campaign_count || 0
        });

        // Load campaigns (mock for POC)
        const campaignList = [];
        for (let i = 1; i <= (localState.campaign_count || 0); i++) {
          campaignList.push({
            id: i,
            title: `Campaign ${i}`,
            purpose: 'Supporting community development',
            minDonation: 1,
            totalDonations: 0
          });
        }
        setCampaigns(campaignList);
      }
      
    } catch (error) {
      console.error('Error loading NGO data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterNGO = async (e) => {
    e.preventDefault();
    
    if (!connectedAddress) {
      setMessage({ type: 'error', text: 'Please connect your wallet first' });
      return;
    }
    
    if (!ngoName.trim() || !ngoDescription.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      
      // Show initial message
      setMessage({ 
        type: 'info', 
        text: '⏳ Preparing transaction... (Please approve in Pera Wallet)'
      });
      
      const txId = await registerNGO(connectedAddress, ngoName, ngoDescription);
      
      setMessage({ 
        type: 'success', 
        text: (
          <div>
            NGO registered successfully! Awaiting admin approval.
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
      
      setShowRegisterForm(false);
      setNgoName('');
      setNgoDescription('');
      
      // Refresh wallet state
      await refreshState();
      await loadNGOData();
      
    } catch (error) {
      console.error('Registration error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to register NGO' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    
    if (!campaignTitle.trim() || !campaignPurpose.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    const minAmount = parseFloat(minDonation);
    if (isNaN(minAmount) || minAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid minimum donation' });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);
      
      const txId = await createCampaign(
        connectedAddress,
        campaignTitle,
        campaignPurpose,
        Math.floor(minAmount * 1_000_000) // Convert to microALGO
      );
      
      setMessage({ 
        type: 'success', 
        text: (
          <div>
            Campaign created successfully!
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
      
      setShowCampaignForm(false);
      setCampaignTitle('');
      setCampaignPurpose('');
      setMinDonation('1');
      
      await loadNGOData();
      
    } catch (error) {
      console.error('Campaign creation error:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to create campaign' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Loader size="lg" />
      </div>
    );
  }

  // Not registered as NGO
  if (!isNGO) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card">
            <div className="text-center mb-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Register Your NGO</h1>
              <p className="text-gray-600">
                Join our platform to receive transparent donations on the Algorand blockchain
              </p>
            </div>

            {message && (
              <div className="mb-6">
                <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
              </div>
            )}
            
            {/* Debug info */}
            <div className="mb-4 p-3 bg-gray-100 rounded text-sm">
              <strong>Debug Info:</strong><br/>
              Connected: {isConnected ? 'Yes' : 'No'}<br/>
              Address: {connectedAddress || 'Not set'}<br/>
              Opted In: {isOptedIn ? 'Yes' : 'No'}
            </div>

            <form onSubmit={handleRegisterNGO}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NGO Name *
                </label>
                <input
                  type="text"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  className="input"
                  placeholder="Enter your NGO name"
                  required
                  maxLength={50}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={ngoDescription}
                  onChange={(e) => setNgoDescription(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Describe your NGO's mission and activities"
                  required
                  maxLength={200}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {ngoDescription.length}/200 characters
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                {submitting ? 'Registering...' : 'Register NGO'}
              </button>
            </form>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">After Registration:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your NGO will be pending admin approval</li>
                    <li>Once approved, you can create donation campaigns</li>
                    <li>Donors will be able to contribute to your campaigns</li>
                    <li>All transactions are transparent on the blockchain</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // NGO registered but not approved
  if (!ngoApproved) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="card text-center">
            <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Pending Approval</h1>
            <p className="text-gray-600 mb-6">
              Your NGO registration is awaiting admin approval. You'll be able to create campaigns once approved.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h3 className="font-semibold text-gray-800 mb-3">Your NGO Details:</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-500">Name:</span>
                  <p className="font-medium text-gray-800">{ngoData?.name}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Description:</span>
                  <p className="text-gray-700">{ngoData?.description}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Address:</span>
                  <p className="font-mono text-sm text-gray-700">{connectedAddress}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Approved NGO Dashboard
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
              <span>{ngoData?.name}</span>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </h1>
            <p className="text-gray-600 mt-1">{ngoData?.description}</p>
          </div>
          <button
            onClick={() => setShowCampaignForm(true)}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Campaign</span>
          </button>
        </div>

        {message && (
          <div className="mb-6">
            <Alert type={message.type} message={message.text} onClose={() => setMessage(null)} />
          </div>
        )}

        {/* Campaign Form Modal */}
        {showCampaignForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Campaign</h2>
              
              <form onSubmit={handleCreateCampaign}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    value={campaignTitle}
                    onChange={(e) => setCampaignTitle(e.target.value)}
                    className="input"
                    placeholder="e.g., Education for All"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose *
                  </label>
                  <textarea
                    value={campaignPurpose}
                    onChange={(e) => setCampaignPurpose(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder="Describe the campaign purpose"
                    required
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Donation (ALGO) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={minDonation}
                    onChange={(e) => setMinDonation(e.target.value)}
                    className="input"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCampaignForm(false)}
                    className="btn btn-secondary flex-1"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Campaigns List */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Campaigns</h2>
          
          {campaigns.length === 0 ? (
            <div className="card text-center py-12">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-4">No campaigns yet</p>
              <button
                onClick={() => setShowCampaignForm(true)}
                className="btn btn-primary"
              >
                Create Your First Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <span className="badge badge-success">Active</span>
                    <span className="text-sm text-gray-500">ID: {campaign.id}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {campaign.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4">
                    {campaign.purpose}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Min. Donation</p>
                      <p className="font-semibold text-gray-800">{campaign.minDonation} ALGO</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Total Raised</p>
                      <p className="font-semibold text-primary-600">
                        {formatAlgoAmount(campaign.totalDonations)} ALGO
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NGODashboard;

import React from 'react';
import { useWallet } from '../context/WalletContext';
import { Link, useLocation } from 'react-router-dom';
import { Wallet, Home, Heart, LayoutDashboard, Shield, LogOut } from 'lucide-react';
import { truncateAddress } from '../utils/helpers';

const Navbar = () => {
  const { connectedAddress, isConnected, isAdmin, isNGO, connect, disconnect } = useWallet();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <Heart className="w-8 h-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-800">AlgoDonate</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>

            <Link
              to="/donor-dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/donor-dashboard') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Donor</span>
            </Link>

            <Link
              to="/ngo-dashboard"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/ngo-dashboard') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>NGO</span>
            </Link>

            <Link
              to="/admin"
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                isActive('/admin') ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <div className="bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-medium">
                    {truncateAddress(connectedAddress)}
                  </div>
                </div>
                <button
                  onClick={disconnect}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </div>
            ) : (
              <button
                onClick={connect}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Wallet className="w-4 h-4" />
                <span>Connect Wallet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

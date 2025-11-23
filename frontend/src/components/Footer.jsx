import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Heart className="w-6 h-6 text-primary-400" />
            <span className="text-lg font-bold">AlgoDonate</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 text-sm">
              Built on Algorand Blockchain • Transparent • Secure
            </p>
            <p className="text-gray-500 text-xs mt-1">
              © 2025 AlgoDonate. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

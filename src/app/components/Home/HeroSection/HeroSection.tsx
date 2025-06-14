// src/app/components/Home/HeroSection/HeroSection.tsx


import SearchBar from './SearchBar';
import React from 'react';
import { TwoButtons } from './TwoButtons';

const HeroSection = () => {
  return (
    <div className="text-white">
      <main className="bg-gradient-to-b from-gray-900 to-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-10">
            {/* Heading Section */}
            <div className="space-y-8 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight">
                <div className="mb-2">Launch and Trade Coins on</div>
                <div>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-600">Ethereum</span>
                  {" "}with{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-indigo-400 to-purple-600">≈0 Gas</span>
                </div>
              </h1>
              
              {/* Subtitle */}
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Enjoy Base L2&apos;s ultra-low gas fees with MemeKult before deploying on Ethereum.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center">
              <TwoButtons />
            </div>

            {/* Search Section */}
            <div className="flex justify-center w-full">
              <SearchBar />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeroSection;
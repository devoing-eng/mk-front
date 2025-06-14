//src/app/components/Home/HeroSection/TwoButtons.tsx

"use client";

import HowItWorksModal from './HowItWorksModal';
import { ImCoinDollar } from "react-icons/im";
import { FaQuestion } from 'react-icons/fa6';
import { useState } from 'react';
import Link from 'next/link';

const LaunchCoin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative flex space-x-4">
        <button 
          className="flex items-center justify-center px-6 py-3 border border-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-300 hover:text-black transition-all duration-300 ease-in-out group"
          onClick={() => setIsModalOpen(true)}
        >
          <FaQuestion className="mr-2 group-hover:animate-bounce" />
          <span>How it works</span>
        </button>

        <Link href="/launch" passHref>
          <button className="flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-600 hover:scale-105 hover:shadow-xl transition-all duration-300 ease-in-out group">
            <ImCoinDollar className="mr-2 group-hover:animate-spin" />
            <span>Launch your coin</span>
          </button>
        </Link>
      </div>

      <HowItWorksModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
};

export default LaunchCoin;

import React from 'react';
import Image from 'next/image';
import { LuCoins } from "react-icons/lu";
import { GiRocketFlight } from "react-icons/gi";
import { RiCoinsLine } from 'react-icons/ri';

const LaunchDetails = () => {
  return (
    <div className="md:w-1/2 mb-12 md:mb-0 text-white">
      <div className="flex flex-row items-center gap-4 mb-12">
        <h1 className="text-3xl lg:text-4xl font-Montserrat font-bold">Launch Your Coin</h1>
        <p className="text-2xl">🚀</p>
      </div>
      <div className="bg-gray-800/50 rounded-xl p-4 sm:p-8 shadow-lg border border-gray-700">
        <div className="space-y-4 sm:space-y-6">
          {/* First Row */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <LuCoins className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-200">
              Create your own Coin <span className="text-gray-300 font-bold">for free</span> in just a few seconds!
            </p>
          </div>

          {/* Second Row */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <GiRocketFlight className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 flex-shrink-0" />
            <p className="text-base sm:text-lg text-gray-300">
              <span className="font-bold">Be the first to buy tokens</span> and ignite the rocket.
            </p>
          </div>

          {/* Third Row */}
          <div className="flex items-start space-x-2 sm:space-x-3">
            <RiCoinsLine className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mt-1 flex-shrink-0" />
            <div className="text-base sm:text-lg text-gray-300">
              <span>
                Help your coin complete the bonding curve and claim your <span className='font-bold'>reward: </span>
                <span className='font-bold text-gray-300'>0.5%</span> fee from all buys and sells!
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-center mb-6 w-1/2 lg:w-full mx-auto mt-32">
          <Image
            src="/images/shape.svg"
            alt="Coin Launch Illustration"
            width={200}
            height={200}
            className='animate-spin-slow'
          />
        </div>
    </div>
  );
};

export default LaunchDetails;
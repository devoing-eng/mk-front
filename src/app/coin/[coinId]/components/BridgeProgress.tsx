// src/app/components/Coin/BridgeProgress.tsx

import { BridgeStep, STEP_MAPPING } from '@/app/types/coinBridge';
import { useBridgeStatus } from '@/app/hooks/useBridgeStatus';
import CompletionMessage from './CompletionMessage';
import LoadingSkeletonBS from './LoadingSkeletonBS';
import { FiLoader, FiCheck } from 'react-icons/fi';
import SwapInterface from './SwapInterface';
import { FaGasPump } from 'react-icons/fa6';
import { motion } from 'framer-motion';
import { CoinStaticData } from '@/app/types/coin';

export default function BridgeProgress({ coinData } : { coinData: CoinStaticData }) {

  const { bridgeState, gasStatus } = useBridgeStatus(coinData.tokenAddress!);

  if (!bridgeState) return <div>Loading bridge status...</div>;

  const steps = Object.entries(STEP_MAPPING).map(([key, info]) => ({
    key: key as BridgeStep,
    label: info.label,
    estimatedTime: info.estimatedTime,
    status: bridgeState.steps[key as BridgeStep]
  }));

  // Get the last step
  const lastStep = Object.keys(STEP_MAPPING).pop() as BridgeStep;

  // Check if the last step is completed
  const isBridgeCompleted = 
  bridgeState.steps[lastStep] === 'completed' || 
  localStorage.getItem(`bridge-${coinData.tokenAddress}-completed`) === 'true';

  const completedSteps = Object.values(bridgeState.steps).filter(status => status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;
  
  return !coinData ? (
    <LoadingSkeletonBS />
  ) : (
    <>
      <div className="w-full">

        {isBridgeCompleted ? (

          <SwapInterface
            coinData={coinData}
          />

        ) : (
          <div className="w-full max-w-xl mx-auto bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
            {/* Header with Glass Progress Bar */}
            <div className="mb-10 mt-8 px-8">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-slate-200">Deployment on Ethereum</h3>
                  <span className="text-sm font-medium text-slate-400">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
                <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-sm text-slate-400">~22 min</span>
                </div>
            </div>

            {/* Steps Timeline */}
            <div className="space-y-6 px-8">
              {steps.map((step, index) => (
                <div key={step.label} className="relative">
                  
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                        step.status === 'completed' ? 'border-green-500 bg-indigo-500/20' :
                        step.status === 'inProgress' ? 'border-purple-500 bg-purple-500/20' :
                        step.status === 'waitingForGas' ? 'border-yellow-500 bg-yellow-500/20' :
                        'border-slate-600 bg-slate-800'
                      }`}
                    >
                      {step.status === 'completed' && (
                        <FiCheck className="w-4 h-4 text-green-400" />
                      )}
                      {step.status === 'inProgress' && (
                        <FiLoader className="w-4 h-4 text-purple-400 animate-spin" />
                      )}
                      {step.status === 'waitingForGas' && (
                        <FaGasPump className="w-4 h-4 text-yellow-400" />
                      )}
                      {step.status === 'pending' && (
                        <div className="w-2 h-2 bg-slate-600 rounded-full" />
                      )}
                    </motion.div>

                    {/* Step Content */}
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                      className="flex-1"
                    >
                      <div className="flex justify-between items-center">
                        <p className={`font-medium ${
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'inProgress' ? 'text-purple-400' :
                          step.status === 'waitingForGas' ? 'text-yellow-400' :
                          'text-slate-400'
                        }`}>
                          {step.label}
                        </p>
                        {step.status === 'inProgress' && (
                          <span className="text-sm text-purple-400">
                            ~{step.estimatedTime} min
                          </span>
                        )}
                      </div>

                      {/* Gas Status Message */}
                      {gasStatus && gasStatus.step === step.key && step.status === 'waitingForGas' && (
                        <div className="flex flex-col text-sm text-yellow-400/80 mt-1 space-y-1">
                          <p>Waiting for better gas fee on Ethereum</p>
                          <div className="flex flex-col gap-2">
                            <p>• Current: {gasStatus.currentGas.toFixed(1)} Gwei</p>
                            <p>• Target: {gasStatus.threshold} Gwei</p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </div>
                </div>
              ))}
            </div> 

            <div className="mt-10 px-8 mb-8">
              <div className="w-full py-4 px-6 rounded-xl font-semibold text-center 
                bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 
                border border-indigo-500/20
                backdrop-blur-sm
                text-slate-300">
                <div className="flex items-center justify-center space-x-3">
                  <FiLoader className="w-5 h-5 animate-spin text-purple-400" />
                  <span>In Progress...</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!isBridgeCompleted && <CompletionMessage />}
    </>
  )
}
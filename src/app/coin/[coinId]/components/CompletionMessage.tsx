import React from 'react';
import { motion } from 'framer-motion';
import { PartyPopper } from 'lucide-react';

const CompletionMessage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-xl mx-auto bg-slate-800/50 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50 shadow-2xl"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <motion.div 
            initial={{ rotate: -45 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center"
          >
            <PartyPopper className="w-6 h-6 text-white" />
          </motion.div>
        </div>
        
        <div className="space-y-4">
          <motion.h3 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-slate-200"
          >
            The bonding curve is complete, congrats!
          </motion.h3>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 leading-relaxed"
          >
            Trading is paused during deployment, so go grab a well-deserved snack; <span className='font-medium text-slate-300'>the road to Kult status is almost here!</span>
          </motion.p>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-400 leading-relaxed"
          >
            In a few minutes, trading will resume on the Ethereum network.
          </motion.p>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 leading-relaxed"
          >
            You&apos;ll be able to <span className='font-medium text-slate-300'>claim your tokens on Ethereum directly from the Base network</span>.
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default CompletionMessage;
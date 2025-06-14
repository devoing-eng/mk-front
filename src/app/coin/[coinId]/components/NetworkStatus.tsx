import Image from 'next/image';

export const NetworkStatusIndicator = ({ isOnUniswap, coinName } : { isOnUniswap: boolean, coinName: string  }) => (
    <div className={`flex items-center justify-center rounded-lg py-1 ${isOnUniswap ? 'bg-gradient-to-r from-pink-500 to-purple-500' : 'bg-amber-500'}`}>
        {/* Trading Status */}
        <div className="flex items-center justify-center w-full h-full gap-2">
            {isOnUniswap ? (
                <div className="flex items-center justify-center w-full h-full gap-2 rounded-full px-3 py-1.5">
                    <Image
                        src="/images/uniswap-logo.svg"
                        alt="Uniswap"
                        width={30}
                        height={30}
                        className='rounded-full bg-white'
                    />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">Trade on Uniswap</span>
                        <span className="ml-1 text-sm opacity-75">via MemeKult</span>
                    </div>
                </div>
            ) : (
                <div className="flex items-center justify-center w-full h-full gap-2 text-black rounded-full px-3 py-1.5">
                    <svg 
                        className="w-4 h-4" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M13 10V3L4 14h7v7l9-11h-7z" 
                        />
                    </svg>
                    <span className="text-sm">Trade <span className='font-semibold'>{coinName}</span> on the Bonding Curve</span>
                </div>
            )}
        </div>
    </div>
);
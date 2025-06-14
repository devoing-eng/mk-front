// src/app/coin/[coinId]/components/TradingViewChart.tsx

import { ChartingLibraryWidgetOptions, IChartingLibraryWidget } from '@/app/types/tradingview';
import { UNISWAP_CREATOR_ABI, UNISWAP_CREATOR_ADDRESS } from '@/app/constants/contracts';
import { createDatafeed } from '@/app/services/tradingViewDatafeed';
import { NETWORK_CONSTANTS } from '@/app/constants/blockchain';
import { useSocketStore } from '@/app/services/socketService';
import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import PlaceholderChart from './PlaceholderChart';
import { CoinStaticData } from '@/app/types/coin';
import { ethers } from 'ethers';

// Base token price chart component
const BaseTokenChart = ({ coinData }: { coinData: CoinStaticData }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartingLibraryWidget | null>(null);
  const tokenAddress = coinData.tokenAddress;
  const createdAt = coinData.createdAt;
  const containerId = 'trading_view_container';
  const { user } = useAuth(); 

  // Socket connection effect
  useEffect(() => {
    if (!user?.id) return;

    useSocketStore.getState().connect(user.id);
    
    return () => {
      useSocketStore.getState().disconnect(user.id);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;

    const widgetOptions: ChartingLibraryWidgetOptions = {

      symbol: coinData.ticker,
      interval: '1' as string,
      container: containerId,
      library_path: '/tradingview/charting_library/',
      datafeed: createDatafeed(createdAt, tokenAddress),
      locale: 'en',
      disabled_features: [
        'use_localstorage_for_settings',
        'study_templates',
        'save_chart_properties_to_local_storage',
        'create_volume_indicator_by_default',
        'header_compare'
      ],
      enabled_features: [
        'hide_left_toolbar_by_default',
        'seconds_resolution'
      ],
      has_seconds: true,
      seconds_multipliers: ['1'],
      theme: 'dark',
      autosize: true,
      studies_overrides: {},
      supported_resolutions: ['1s', '30s', '1', '3', '5', '15', '30', '45', '60', '120', '180', '240', 'D', 'W'],
      overrides: {
        'mainSeriesProperties.candleStyle.upColor': '#26a69a',
        'mainSeriesProperties.candleStyle.downColor': '#ef5350',
        'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
        'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
        'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
        'timeScale.rightOffset': 12,
        'timeScale.minBarSpacing': 3,
        'timeScale.visible': true
      },
      client_id: 'tradingview_client',
      user_id: 'public_user',
      loading_screen: { backgroundColor: "#1e1e1e" }
    };

    try {
      // Set ID directly in JSX
      container.id = containerId;
      
      // Ensure the container is empty
      container.innerHTML = '';

      // Create widget in next tick
      requestAnimationFrame(() => {
        const widget = new window.TradingView.widget(widgetOptions);
        chartRef.current = widget;
      });

    } catch (error) {
      console.error('Error initializing TradingView widget:', error);
    }

    return () => {
      if (container) {
        container.innerHTML = '';
      }
      chartRef.current = null;
    };
  }, [tokenAddress, coinData.ticker, containerId, coinData.createdAt, createdAt]);

  return (
    <div 
      ref={chartContainerRef}
      id={containerId}
      className='w-full h-[50vh] lg:h-[calc(100vh-200px)]'
    />
  );
};

const EthereumTokenChart = ({ coinData }: { coinData: CoinStaticData }) => {
  const ZeroPoolID = '0x0000000000000000000000000000000000000000000000000000000000000000';
  const [poolId, setPoolId] = useState<string | null>(null);
  const [poolHasData, setPoolHasData] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

    const retryWithDelay = async <T,>(
      fn: () => Promise<T>,
      retries = 3,
      delay = 1000
    ): Promise<T> => {
      try {
        return await fn();
      } catch (error) {
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return retryWithDelay(fn, retries - 1, delay * 1.5);
        }
        throw error;
      }
    };
    
    const checkCacheAndFetchData = async () => {
      if (!coinData.tokenAddressOnL1) {
        setLoading(false);
        return;
      }

      // Check cache first
      const cacheKey = `pool_data_${coinData.tokenAddressOnL1}`;
      const cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        const { hasData, poolId: cachedPoolId } = JSON.parse(cachedData);
        setPoolId(cachedPoolId);
        setPoolHasData(hasData);
        setLoading(false);
        return;
      }

      try {
        setError(null);
        // Reset states when fetching new data
        setPoolId(null);
        setPoolHasData(false);

        const provider = new ethers.JsonRpcProvider(NETWORK_CONSTANTS.ETHEREUM_MAINNET.RPC_URL);
        const contract = new ethers.Contract(
          UNISWAP_CREATOR_ADDRESS,
          UNISWAP_CREATOR_ABI,
          provider
        );

        // Fetch pool ID with retry logic
        const poolInfo = await retryWithDelay(async () => 
          contract.getPoolInfo(coinData.tokenAddressOnL1)
        );
        
        const newPoolId = poolInfo.poolId;
        setPoolId(newPoolId);

        // Check if pool has data with retry logic
        const response = await retryWithDelay(async () =>
          fetch(`https://api.geckoterminal.com/api/v2/networks/eth/pools/${newPoolId}`)
        );

        if (response.ok) {
          const data = await response.json();
          const percentages = ['m5', 'h1', 'h6', 'h24'];
          const hasNonNullPercentage = percentages.some(period => 
            data.data.attributes.price_change_percentage[period] !== null
          );
          setPoolHasData(hasNonNullPercentage);
        }
      } catch (error) {
        console.error('Error fetching pool data:', error);
        setError('Failed to load chart data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    checkCacheAndFetchData();
  }, [coinData.tokenAddressOnL1]);

  // Add caching using localStorage
  useEffect(() => {
    if (poolId && poolHasData) {
      const cacheKey = `pool_data_${coinData.tokenAddressOnL1}`;
      const existingCache = localStorage.getItem(cacheKey);
      
      if (!existingCache) {
        localStorage.setItem(cacheKey, JSON.stringify({
          hasData: true,
          poolId: poolId
        }));
      }
    }
  }, [poolId, poolHasData, coinData.tokenAddressOnL1]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full border rounded-md border-gray-800">
        <div className="animate-spin rounded-full h-24 w-24 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 rounded-md border border-gray-800">
        <p className="mb-4">{error}</p>
        <PlaceholderChart />
      </div>
    );
  }

  if (!poolId) {
    return (
      <>
        <div className="flex items-center justify-center text-gray-400 rounded-md">
          Chart on Ethereum available in a few minutes.
        </div>
        <PlaceholderChart />
      </>
    );
  }

  if (poolId && poolId != ZeroPoolID && !poolHasData) {
    return (
      <>
        <div className="flex items-center justify-center text-gray-400 rounded-md">
          Chart on Ethereum will be displayed as soon as there is a 1st transaction.
        </div>
        <PlaceholderChart />
      </>
    );
  }

  const geckoTerminalUrl = `https://www.geckoterminal.com/eth/pools/${poolId}?embed=1&info=0&swaps=1&grayscale=0&light_chart=0`;
  
  return (
    <div className="relative h-[950px]">
      <iframe
        className="absolute inset-0 w-full h-full"
        id="geckoterminal-embed"
        title="GeckoTerminal Embed"
        src={geckoTerminalUrl}
        allow="clipboard-write"
        allowFullScreen
      />
    </div>
  );
};

const TradingViewChart = ({ 
  coinData, 
  activeChart 
}: { 
  coinData: CoinStaticData;
  activeChart: 'bcurve' | 'current';
}) => {
  // If token is on Ethereum and user wants current chart
  if (coinData.tokenAddressOnL1 && activeChart === 'current') {
    return <EthereumTokenChart coinData={coinData} />;
  }
  
  // Otherwise show Base chart (either no Ethereum address or market chart selected)
  return <BaseTokenChart coinData={coinData} />;
};

export default TradingViewChart;
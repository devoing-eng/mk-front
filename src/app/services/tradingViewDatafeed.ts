// src/services/tradingViewDatafeed.ts

import { ethers } from "ethers";
import { LibrarySymbolInfo, PriceBar, Subscription } from "../types/tradingview";
import { useSocketStore } from "./socketService";

const subscriptions = new Map<string, Subscription>();

export function createDatafeed(createdAt: string, tokenAddress: string | null) {
    // Calculate initial price from bonding curve parameters
    const INITIAL_ETH = ethers.parseEther("2.6027");
    const INITIAL_TOKENS = ethers.parseEther("1060000000");
    const setupPrice = parseFloat(ethers.formatEther(INITIAL_ETH)) / parseFloat(ethers.formatEther(INITIAL_TOKENS));

    return {
        onReady: (callback: (configuration: object) => void) => {
            setTimeout(() => callback({
                supported_resolutions: ['1s', '30s', '1', '3', '5', '15', '30', '45', '60', '120', '180', '240', 'D', 'W'],
                symbols_types: [{ name: 'crypto', value: 'crypto' }]
            }), 0);
        },

        resolveSymbol: (
            symbolName: string,
            onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
            onResolveErrorCallback: (reason: string) => void
        ) => {
            try {

                if (!symbolName) {
                    onResolveErrorCallback('Symbol name cannot be empty');
                    return;
                }

                const symbolInfo: LibrarySymbolInfo = {
                    name: symbolName,
                    ticker: symbolName,
                    description: `${symbolName}/ETH`,
                    type: 'crypto',
                    session: '24x7',
                    timezone: 'Etc/UTC',
                    exchange: 'MemeKult.com',
                    minmov: 1,
                    pricescale: 1000000000000, // decimal precision
                    has_intraday: true,
                    supported_resolutions: ['1s', '30s', '1', '3', '5', '15', '30', '45', '60', '120', '180', '240', 'D', 'W'],
                    has_seconds: true,
                    seconds_multipliers: ['1'],
                    volume_precision: 8,
                    data_status: 'streaming'
                };

                setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);

            } catch (error) {
                onResolveErrorCallback(error instanceof Error ? error.message : 'Failed to resolve symbol');
            }
        },

        getBars: async (
            symbolInfo: LibrarySymbolInfo,
            resolution: string,
            periodParams: { from: number; to: number; countBack: number; firstDataRequest: boolean; },
            onHistoryCallback: (bars: PriceBar[], meta: { noData?: boolean }) => void,
            onErrorCallback: (error: string) => void
        ) => {
            try {

                // Convert ISO date string to Unix timestamp (seconds)
                const tokenCreationTime = Math.floor(Date.parse(createdAt) / 1000);
                const requestFrom = tokenCreationTime
                const requestTo = periodParams.to;

                if (!periodParams.firstDataRequest && requestTo < tokenCreationTime) {
                    onHistoryCallback([], { noData: true });
                    return;
                }

                // If no tokenAddress, return only setup candle
                if (!tokenAddress) {
                    const setupBar = {
                        time: periodParams.from * 1000,
                        open: setupPrice,
                        high: setupPrice,
                        low: setupPrice,
                        close: setupPrice,
                        volume: 0
                    };
                    onHistoryCallback([setupBar], { noData: false });
                    return;
                }

                const timeframeMap: { [key: string]: string } = {
                    '1s': '1s', '1S': '1s', '30s': '30s', '30S': '30s', '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m', '45': '45m',
                    '60': '1h', '120': '2h', '180': '3h', '240': '4h', '1D': '1d', 'W': '1w'
                };

                const url = `/api/prices/${tokenAddress}/price-bars?` + new URLSearchParams({
                    from: requestFrom.toString(),
                    to: requestTo.toString(),
                    timeframe: timeframeMap[resolution] || '1m'
                });
                
                const response = await fetch(url);

                if (!response.ok) throw new Error('Failed to fetch price data');

                const data = await response.json();
                const bars: PriceBar[] = data.bars.map((bar: PriceBar) => ({
                    time: bar.time * 1000,
                    open: bar.open,
                    high: bar.high,
                    low: bar.low,
                    close: bar.close,
                    volume: bar.volume
                }));

                if (bars.length === 0) {
                    onHistoryCallback([], { noData: true });
                    return;
                }

                onHistoryCallback(bars, { noData: data.bars.length === 0 });
                
            } catch (error) {
                console.error('Error in getBars:', error);
                onErrorCallback(error instanceof Error ? error.message : 'Unknown error');
            }
        },

        // Real-time subscription methods
        subscribeBars: (
            symbolInfo: LibrarySymbolInfo,
            resolution: string,
            onRealtimeCallback: (bar: PriceBar) => void,
            subscriberUID: string
        ) => {
            // Get timeframe from resolution
            const timeframeMap: { [key: string]: string } = {
                '1s': '1s', '30s': '30s', '1': '1m', '3': '3m', '5': '5m', '15': '15m', '30': '30m', '45': '45m',
                '60': '1h', '120': '2h', '180': '3h', '240': '4h', 'D': '1d', 'W': '1w'
            };
            const timeframe = timeframeMap[resolution] || '1m';  

            subscriptions.set(subscriberUID, {
                symbolInfo,
                resolution,
                callback: onRealtimeCallback,
                currentBar: null,
                lastBar: undefined,
                timeframe
            });

            // Subscribe to WebSocket updates
            const socket = useSocketStore.getState().socket;
            if (!socket) {
                console.error("No socket connection available!");
                return;
            }

            socket.emit('subscribeToTokenUpdates', tokenAddress);

            // Real-time price updates
            socket.on(`pricebar:${tokenAddress}:${timeframe}`, (data) => {
                if (!data || !data.bar) return;
                
                // Complete, properly formatted bar from the server
                const updatedBar = {
                    ...data.bar,
                    time: data.bar.time * 1000 // Convert to milliseconds
                };

                const sub = subscriptions.get(subscriberUID);
                if (sub) {
                    sub.lastBar = updatedBar;
                }
                
                onRealtimeCallback(updatedBar);
            });
        },

        unsubscribeBars: (subscriberUID: string) => {
            const sub = subscriptions.get(subscriberUID);
            if (sub && sub.timeframe) {
                // Unsubscribe from WebSocket updates
                const socket = useSocketStore.getState().socket;
                if (socket) {
                    socket.off(`pricebar:${tokenAddress}:${sub.timeframe}`);
                }
            }
            subscriptions.delete(subscriberUID);
        }
    };
}
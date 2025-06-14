// src/app/types/tradingview.ts

type ResolutionString = string;

export interface PriceBar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface LibrarySymbolInfo {
    name: string;
    ticker: string;
    description: string;
    type: string;
    session: string;
    timezone: string;
    exchange: string;
    minmov: number;
    pricescale: number;
    has_intraday: boolean;
    has_seconds?: boolean;
    seconds_multipliers?: string[];
    supported_resolutions: string[];
    volume_precision: number;
    data_status: string;
}

export interface Subscription {
    symbolInfo: LibrarySymbolInfo;
    resolution: string;
    callback: (bar: PriceBar) => void;
    currentBar: PriceBar | null;
    lastBar?: PriceBar;
    timeframe: string;
}

export interface ChartingLibraryWidgetOptions {
    symbol: string;
    interval: ResolutionString;
    container: string;
    library_path: string;
    datafeed: {
        onReady: (callback: (configuration: object) => void) => void;
        resolveSymbol: (
            symbolName: string,
            onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
            onResolveErrorCallback: (reason: string) => void
        ) => void;
        getBars: (
            symbolInfo: LibrarySymbolInfo,
            resolution: string,
            periodParams: { from: number; to: number; countBack: number; firstDataRequest: boolean; },
            onHistoryCallback: (bars: PriceBar[], meta: { noData?: boolean }) => void,
            onErrorCallback: (error: string) => void
        ) => void;
        subscribeBars?: (
            symbolInfo: LibrarySymbolInfo,
            resolution: string,
            onRealtimeCallback: (bar: PriceBar) => void,
            subscriberUID: string
        ) => void;
        unsubscribeBars?: (subscriberUID: string) => void;
    };
    locale: string;
    disabled_features?: string[];
    enabled_features?: string[];
    theme?: 'light' | 'dark';
    custom_css_url?: string;
    width?: number;
    height?: number;
    autosize?: boolean;
    overrides?:  Record<string, string | number | boolean>;
    studies_overrides?: Record<string, string | number | boolean>;
    timezone?: string;
    client_id?: string;
    user_id?: string;
    loading_screen?: { backgroundColor: string; };
    supported_resolutions?: string[];
    has_seconds?: boolean;
    seconds_multipliers?: string[];
}

export interface IChartingLibraryWidget {
    remove(): void;
    save(): Promise<object>;
    load(state: object): Promise<void>;
    onChartReady(callback: () => void): void;
    setSeries(series: {
        data: PriceBar[];
        options?: Record<string, unknown>;
    }): void;
    setLanguage(lang: string): void;
    setTheme(theme: 'light' | 'dark'): void;
}

declare global {
    interface Window {
        TradingView: {
            widget: new(options: ChartingLibraryWidgetOptions) => IChartingLibraryWidget;
        };
    }
}
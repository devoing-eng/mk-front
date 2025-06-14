import type { NextConfig } from "next";

type CspRules = {
  [key: string]: string[];
};

const nextConfig : NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'memekult-images.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Asset versioning
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.memekult.com/api/:path*',
      },
    ];
  },
  async headers() {
    const isProd = process.env.NODE_ENV === 'production';

    // Base CSP rules as an object to prevent duplicates
    const baseCSPRules = {
      'default-src': [
        "'self'",
        'data:',
        'blob:',
        'https://s.tradingview.com/',
        'https://*.tradingview.com',
        'https://memekult.com/tradingview/',
        'https://platform.twitter.com',
        'https://s3.tradingview.com',
        'https://data.tradingview.com',
      ],
      'script-src': [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        'https://va.vercel-scripts.com/v1/script.debug.js',
        'https://vercel.live/_next-live/feedback/feedback.js',
        'https://*.google-analytics.com',
        'http://www.google-analytics.com/analytics.js',
        'https://*.googletagmanager.com',
        'https://www.googletagmanager.com/gtag/js',
        'https://s3.tradingview.com/tv.js',
        'https://s.tradingview.com/',
        'https://platform.twitter.com/widgets.js',
        'https://platform.twitter.com/js/tweet.*',
        'https://*.twitter.com',
        'https://cdn.syndication.twimg.com',
        'https://d33t3vvu2t2yu5.cloudfront.net',
        'https://s3.tradingview.com',
        'https://data.tradingview.com',
      ],
      'style-src': [
        "'self'",
        "'unsafe-inline'",
        'https://fonts.googleapis.com'
      ],
      'img-src': [
        "'self'",
        'data:',
        'blob:',
        'https://imagedelivery.net',
        'https://warpcast.com/avatar.png',
        'https://*.googletagmanager.com/',
        'https://*.google-analytics.com',
        'https://memekult-images.s3.us-east-1.amazonaws.com',
        'https://*.s3.us-east-1.amazonaws.com',
        'https://*.tradingview.com',
        'https://*.twitter.com',
        'https://*.twimg.com',
      ],
      'font-src': [
        "'self'",
        'https://fonts.gstatic.com'
      ],
      'connect-src': [
        "'self'",
        'blob:',
        'https://api.memekult.com',
        'wss://api.memekult.com',
        'https://mainnet.base.org',
        'https://mainnet.optimism.io',
        'https://platform.twitter.com',
        'wss://www.walletlink.org',
        'https://www.walletlink.org',
        'https://api.geckoterminal.com/api/v2/',
        `https://mainnet.infura.io`,
        `https://eth-mainnet.g.alchemy.com`,
        `https://base-mainnet.g.alchemy.com`,
        'wss://*.g.alchemy.com',
        'https://*.infura.io/*',
        'wss://*.infura.io/ws/v3/*',
        'https://*.layerzero-scan.com/',
        'https://*.google-analytics.com',
        'https://*.googletagmanager.com',
        'https://analytics.google.com',
        `https://eth-sepolia.g.alchemy.com`,
        'https://optimism-sepolia.infura.io',
        'wss://*.tradingview.com',
        'https://data.tradingview.com',
        'https://s3.tradingview.com',
        ...(isProd ? [] : ['ws:', 'wss:', 'http://localhost:*', 'https://localhost:*'])
      ],
      'frame-src': [
        "'self'",
        'https://www.geckoterminal.com/',
        'https://platform.twitter.com/',
        'https://syndication.twitter.com',
        'https://*.tradingview.com',
        'https://s3.tradingview.com',
        'https://data.tradingview.com',
        'blob:',
        'data:'
      ],
      'child-src': ["'self'", 'blob:', 'data:'],
      'worker-src': ["'self'", 'blob:'],
      'manifest-src': ["'self'"],
      'media-src': [
        "'self'",
        'blob:',
        'https://memekult-images.s3.us-east-1.amazonaws.com/coins/audio/',
      ],
      'form-action': ["'self'"],
      'frame-ancestors': ["'self'"]
    };

    // Function to combine CSP rules into a string
    const getCspString = (rules: CspRules) => {
      return Object.entries(rules)
        .map(([key, values]) => `${key} ${values.join(' ')}`)
        .join('; ');
    };

    // Common security headers for both environments
    const securityHeaders = [
      {
        key: 'Content-Security-Policy',
        value: getCspString(baseCSPRules)
      },
      {
        key: 'X-Frame-Options',
        value: isProd ? 'DENY' : 'SAMEORIGIN'
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff'
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin'
      },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(self), geolocation=(), payment=()'
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block'
      },
      {
        key: 'Cache-Control',
        value: 'no-cache, must-revalidate, max-age=0'
      }
    ];

    // Production-only headers
    const prodOnlyHeaders = isProd ? [
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload'
      }
    ] : [];
    
    return [
      {
        source: '/:path*',
        headers: [...securityHeaders, ...prodOnlyHeaders],
      },
    ];
  },
};

export default nextConfig;

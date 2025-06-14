
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      keyframes: {
        'border-gradient': {
          '0%': { backgroundPosition: '0% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'audio-bar': {
          '0%': { height: '20%' },
          '100%': { height: '100%' },
        },
      },
      animation: {
        'spin-slow': 'spin 7s linear infinite',
        'border-gradient': 'border-gradient 2s linear infinite',
        'audio-bar1': 'audio-bar 0.8s ease-in-out infinite alternate',
        'audio-bar2': 'audio-bar 1.1s ease-in-out infinite alternate',
        'audio-bar3': 'audio-bar 0.7s ease-in-out infinite alternate',
        'audio-bar4': 'audio-bar 0.9s ease-in-out infinite alternate',
        'audio-bar5': 'audio-bar 1.2s ease-in-out infinite alternate',
        'audio-bar6': 'audio-bar 0.6s ease-in-out infinite alternate',
        'audio-bar7': 'audio-bar 1.0s ease-in-out infinite alternate',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '100': '100',
      },
    },
  },
};

export default config;
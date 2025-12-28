import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],  darkMode: 'class',  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Swiss flag colors
        'swiss-red': '#FF0000',
        'swiss-white': '#FFFFFF',
        // Custom brand colors
        'habicht': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Canton-based colors
        'canton': {
          'zh-primary': '#0F05A0',
          'be-primary': '#FF0000',
          'lu-primary': '#0066CC',
          'ag-primary': '#000000',
          'sg-primary': '#009B77',
          'ti-primary': '#FF0000',
          'vd-primary': '#009B77',
          'ge-primary': '#FFD700',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'swiss-gradient': 'linear-gradient(135deg, #FF0000 0%, #FFFFFF 100%)',
      },
    },
  },
  plugins: [],
}
export default config

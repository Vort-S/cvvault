import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1C302C',
        ocean: '#195D4E',
        mint: '#B5D0BF',
        cloud: '#F7F7F2',
        paper: '#FFFFFF',
        sand: '#E9E9DF',
        pine: '#123B32',
        copper: '#A4784D',
      },
      fontFamily: {
        display: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Arial', 'Helvetica Neue', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 14px 40px rgba(20, 49, 41, .045)',
        paper: '0 30px 80px rgba(20, 49, 41, .12)',
      },
    },
  },
  plugins: [],
};
export default config;
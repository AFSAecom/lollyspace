import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';
import { fontFamily } from 'tailwindcss/defaultTheme';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1e3a8a',
        secondary: '#9333ea',
      },
      fontFamily: {
        heading: ['"Playfair Display"', ...fontFamily.serif],
        sans: ['Montserrat', ...fontFamily.sans],
      },
    },
  },
  plugins: [animate],
};

export default config;

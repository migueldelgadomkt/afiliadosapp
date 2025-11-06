import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif']
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem'
      },
      colors: {
        brand: {
          50: '#f2f6ff',
          100: '#e2eaff',
          200: '#c0d2ff',
          300: '#93afff',
          400: '#5880ff',
          500: '#2251ff',
          600: '#1335db',
          700: '#142ca9',
          800: '#17287d',
          900: '#141f54'
        }
      }
    }
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(({ addVariant }) => {
      addVariant('sidebar-expanded', '&.sidebar-expanded *');
    })
  ]
};

export default config;

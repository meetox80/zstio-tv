/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'radial-dark-red': 'radial-gradient(circle at top, #611010 0%, #2e0e0e 100%)',
      },
      keyframes: {
        glow: {
          '0%, 100%': { opacity: 0, transform: 'translateY(0)' },
          '50%': { opacity: 1, transform: 'translateY(100vh)' }
        }
      },
    },
  },
  plugins: [],
} 
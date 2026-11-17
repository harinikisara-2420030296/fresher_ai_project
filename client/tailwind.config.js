/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        card: {
          DEFAULT: '#0F0F12',
          dark: '#0B0B0F',
          light: '#18181B',
          border: 'rgba(255, 255, 255, 0.08)'
        },
        brand: {
          black: '#121216',
          grey: {
            50: '#F9FAFB',
            100: '#F3F4F6',
            200: '#E5E7EB',
            300: '#D1D5DB',
            400: '#9CA3AF',
            500: '#6B7280',
            600: '#4B5563',
            700: '#374151',
            800: '#1F2937',
            900: '#111827'
          },
          green: '#22C55E',
          red: '#EF4444',
          amber: '#F59E0B',
          purple: '#8B5CF6'
        }
      },
      borderRadius: {
        '2xl': '20px',
        '3xl': '24px',
        '4xl': '32px'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        'card-light': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'glow-purple': '0 0 30px rgba(139, 92, 246, 0.25)',
        'glow-green': '0 0 30px rgba(34, 197, 94, 0.25)',
      }
    },
  },
  plugins: [],
};


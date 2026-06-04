/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      colors: {
        // MENYA brand palette — warm Rwandan-inspired greens & golds with a modern indigo accent
        brand: {
          50: '#eefdf3',
          100: '#d6f9e2',
          200: '#b0f1c9',
          300: '#7be3a8',
          400: '#3fcd80',
          500: '#1ab262',
          600: '#0f8f4e',
          700: '#0e7141',
          800: '#105a37',
          900: '#0e4a2f',
          950: '#03291a',
        },
        accent: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d4d8e1',
          300: '#aeb6c6',
          400: '#828da6',
          500: '#637088',
          600: '#4e596f',
          700: '#40495b',
          800: '#373e4d',
          900: '#1c2030',
          950: '#11131c',
        },
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(16, 24, 40, 0.08), 0 4px 24px -4px rgba(16, 24, 40, 0.06)',
        card: '0 1px 2px rgba(16,24,40,0.04), 0 6px 20px -8px rgba(16,24,40,0.12)',
        glow: '0 0 0 1px rgba(26,178,98,0.12), 0 8px 40px -8px rgba(26,178,98,0.35)',
      },
      borderRadius: {
        '2xl': '1.125rem',
        '3xl': '1.5rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.5s ease both',
        'float': 'float 6s ease-in-out infinite',
        'scale-in': 'scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [],
}

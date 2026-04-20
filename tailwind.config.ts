import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f6f7f0',
          100: '#e8ead8',
          200: '#d4d9b8',
          300: '#b8c18e',
          400: '#9daa68',
          500: '#84a06e',
          600: '#6a8557',
          700: '#526843',
          800: '#425436',
          900: '#37462e',
        },
        sage: {
          50: '#f4f6f1',
          100: '#e4ead9',
          200: '#c9d4b5',
          300: '#a5b888',
          400: '#849f64',
          500: '#6a8549',
          600: '#536939',
        },
        cream: {
          50: '#fffdf7',
          100: '#fef9eb',
          200: '#fdf3d0',
          300: '#fbe9a8',
          400: '#f7d970',
        },
        sand: {
          50: '#faf8f3',
          100: '#f3ede0',
          200: '#e6dbc2',
          300: '#d4c39c',
          400: '#c2a876',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Noto Sans Thai', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: '0 2px 8px rgba(0,0,0,0.06)',
        'card-md': '0 4px 16px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}

export default config

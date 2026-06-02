import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Brand primary (Relaxing Blue)
        primary: {
          DEFAULT: '#0058BE',
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#3B82F6',
          600: '#0058BE',
          700: '#1D4ED8',
        },
        // Semantic status colors
        success: {
          DEFAULT: '#10B981',
          bg:      '#ECFDF5',
          text:    '#065F46',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg:      '#FFFBEB',
          text:    '#92400E',
        },
        danger: {
          DEFAULT: '#EF4444',
          bg:      '#FEF2F2',
          text:    '#991B1B',
        },
        // Surfaces (from design system)
        surface: {
          DEFAULT: '#F9F9FF',
          card:    '#FFFFFF',
          low:     '#F2F3FD',
          high:    '#E6E7F2',
        },
      },
      borderRadius: {
        'xl':  '1rem',
        '2xl': '1.5rem',
      },
      // Safe area insets for mobile bottom nav
      spacing: {
        'safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}

export default config

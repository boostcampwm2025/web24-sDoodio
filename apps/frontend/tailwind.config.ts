import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'bounce-in': {
          '0%': {
            transform: 'scale(0.3)',
            opacity: '0',
          },
          '50%': {
            transform: 'scale(1.05)',
          },
          '70%': {
            transform: 'scale(0.9)',
          },
          '100%': {
            transform: 'scale(1)',
            opacity: '1',
          },
        },
        wiggle: {
          '0%, 100%': {
            transform: 'rotate(-15deg)',
          },
          '50%': {
            transform: 'rotate(15deg)',
          },
        },
        twinkle: {
          '0%, 100%': {
            opacity: '0.3',
            transform: 'scale(0.8)',
          },
          '50%': {
            opacity: '1',
            transform: 'scale(1.2)',
          },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        wiggle: 'wiggle 0.5s ease-in-out infinite',
        twinkle: 'twinkle 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;

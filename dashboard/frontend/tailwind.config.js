/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#05070f',
          dark: '#080c1b',
          surface: '#0d1326',
          card: 'rgba(15, 23, 42, 0.75)',
          panel: 'rgba(10, 16, 32, 0.85)',
          border: 'rgba(56, 189, 248, 0.18)',
          borderGlow: 'rgba(0, 245, 255, 0.35)',
        },
        cyber: {
          cyan: '#00f5ff',
          neon: '#00ff88',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
          blue: '#3b82f6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -5px rgba(0, 245, 255, 0.35)',
        'glow-neon': '0 0 25px -5px rgba(0, 255, 136, 0.35)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'cyber-grid': 'linear-gradient(to right, rgba(0, 245, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 245, 255, 0.05) 1px, transparent 1px)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}


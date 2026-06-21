/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#020205",
          card: "#080c14",
          cardlight: "#0e1524",
          border: "#182030",
          borderglow: "#24334a",
          green: "#00ff66",
          greenlight: "#22c55e",
          blue: "#00e5ff",
          bluelight: "#3b82f6",
          darkgray: "#1e293b",
          lightgray: "#94a3b8",
          neonred: "#ff3366",
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 20s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite alternate',
      },
      keyframes: {
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'glow-pulse': {
          '0%': { boxShadow: '0 0 5px rgba(0, 255, 102, 0.2), inset 0 0 5px rgba(0, 255, 102, 0.1)' },
          '100%': { boxShadow: '0 0 15px rgba(0, 255, 102, 0.5), inset 0 0 8px rgba(0, 255, 102, 0.2)' },
        }
      }
    },
  },
  plugins: [],
}

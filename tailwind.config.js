/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700", // Yellow
        secondary: "#0d0221", // Deep dark purple/black
        accent: "#ff003c", // Cyberpunk red
        "neon-green": "#FFD700",
        "dark-green": "#3d3d0a",
        cyber: {
          black: "#050505",
          dark: "#0a0a0a",
          gray: "#1a1a1a",
          blue: "#ff0000", // Was Cyan/Blue, now Red
          pink: "#ffffff"  // Was Pink, now White
        },
        "background-light": "#e0e0e0",
        "background-dark": "#050505",
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        mono: ['Share Tech Mono', 'monospace'],
        body: ['Rajdhani', 'sans-serif'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, #1a1a1a 1px, transparent 1px), linear-gradient(to bottom, #1a1a1a 1px, transparent 1px)",
        'scanline': "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon-green': '0 0 5px #00ff41, 0 0 20px rgba(0, 255, 65, 0.3)',
        'neon-blue': '0 0 5px #ff0000, 0 0 20px rgba(255, 0, 0, 0.3)', // Now Red
        'neon-red': '0 0 5px #ff003c, 0 0 20px rgba(255, 0, 60, 0.3)',
        'neon-strong': '0 0 10px #00ff00, 0 0 40px rgba(0, 255, 0, 0.5)',
      },
      animation: {
        'blob': 'blob 7s infinite',
        'fade-in': 'fadeIn 0.5s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}


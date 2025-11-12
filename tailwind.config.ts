import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'primary-black': '#0a0a0a',
        'secondary-black': '#1a1a1a',
        'accent-yellow': '#ffd700',
        'custom-gray': '#888888',
        'light-gray': '#f5f5f5',
      },
      animation: {
        'slide-down': 'slideDown 0.8s ease',
        'fade-in-up': 'fadeInUp 1s ease',
        'scroll': 'scroll 20s linear infinite',
        'loading': 'loading 1.5s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        slideDown: {
          '0%': { transform: 'translateY(-100px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scroll: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            opacity: '1',
            boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
          },
          '50%': { 
            opacity: '0.8',
            boxShadow: '0 0 30px rgba(255, 215, 0, 0.5)'
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;


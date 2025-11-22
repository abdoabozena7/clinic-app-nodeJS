/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      backgroundImage: {
        'clinic-gradient': 'linear-gradient(to right, #39D1B4, #6AA9E8)',
      },

      colors: {
        primary: "#39D1B4",
        secondary: "#6AA9E8",
        dark: "#1a1a1a",
        light: "#f5f5f5",
      },

      boxShadow: {
        "card": "0 4px 12px rgba(0,0,0,0.1)",
        "large": "0 8px 20px rgba(0,0,0,0.15)",
      },
    },
  },

  plugins: [],
};
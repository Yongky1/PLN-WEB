/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./views/**/*.ejs",
    "./public/js/**/*.js"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0A2540", // Very dark blue for text/backgrounds in night mode
          pln: "#00A2E9", // Primary PLN Bright Blue-Cyan
          yellow: "#FFCC00", // PLN Electric Yellow
          light: "#EAF2FA", 
          accent: "#00E5FF", 
          dark: "#05101E"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

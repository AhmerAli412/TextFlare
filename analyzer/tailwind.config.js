/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        // Define your custom color palette here
        primary: '#FF5733',    // Change 'primary' to your preferred color name
        secondary: '#3498DB',  // Change 'secondary' to your preferred color name
        // Add more custom colors as needed
      },
    },
  },
  plugins: [],
}


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Check these extensions!
  ],
  theme: {
    extend: {
      colors: {
        cyber: "#22d3ee",
        electric: "#9333ea",
      },
    },
  },
  plugins: [],
}
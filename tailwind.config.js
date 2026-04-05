/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        maple: {
          green: "#1B4332",
          "green-light": "#2D6A4F",
          gold: "#D4A843",
          "gold-light": "#E5C06B",
          cream: "#FAF8F5",
          "cream-dark": "#1A1A1A",
        },
      },
      fontFamily: {
        inter: ["Inter"],
        "inter-medium": ["Inter_500Medium"],
        "inter-semibold": ["Inter_600SemiBold"],
        "inter-bold": ["Inter_700Bold"],
      },
    },
  },
  plugins: [],
};

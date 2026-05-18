/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        cream:   "#f5ede0",
        blush:   "#e8d5e0",
        lavender:"#d4c5e2",
        sage:    "#b8c9b8",
        ink:     "#2d2d2d",
        muted:   "#8a7f7f",
      },
      fontFamily: {
        hand:  ["Caveat", "cursive"],
        body:  ["Inter", "sans-serif"],
      },
      borderRadius: {
        polaroid: "2px",
      },
      boxShadow: {
        polaroid: "0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.08)",
        soft:     "0 2px 16px rgba(0,0,0,0.07)",
      },
    },
  },
  plugins: [],
};

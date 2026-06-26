/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: "var(--base)",
        cream: "var(--cream)",
        navy: {
          DEFAULT: "var(--navy)",
          dark: "var(--navy-dark)",
          mid: "var(--navy-mid)",
          soft: "var(--navy-soft)",
        },
        green: {
          DEFAULT: "var(--green)",
          dark: "var(--green-dark)",
          mid: "var(--green-mid)",
          soft: "var(--green-soft)",
          glow: "var(--green-glow)",
        },
        gold: {
          DEFAULT: "var(--gold)",
          bright: "var(--gold-bright)",
          soft: "var(--gold-soft)",
          border: "var(--gold-border)",
        },
        text: {
          DEFAULT: "var(--text)",
          sub: "var(--text-sub)",
        },
        muted: "var(--muted)",
        border: {
          DEFAULT: "var(--border)",
          soft: "var(--border-soft)",
        },
        divider: "var(--divider)",
        red: {
          DEFAULT: "var(--red)",
          soft: "var(--red-soft)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
        },
        blue: {
          DEFAULT: "var(--blue)",
          soft: "var(--blue-soft)",
        },
      },
      borderRadius: {
        sm: "var(--r-sm)",
        md: "var(--r-md)",
        lg: "var(--r-lg)",
        xl: "var(--r-xl)",
      },
      boxShadow: {
        xs: "var(--shadow-xs)",
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
}

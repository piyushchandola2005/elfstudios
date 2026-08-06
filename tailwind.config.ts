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
        "elf-orange": "#FF7700",
        "elf-gray": "#1A1A1A",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        bk: 'var(--bk)',
        dk: 'var(--dk)',
        c1: 'var(--c1)',
        c2: 'var(--c2)',
        c3: 'var(--c3)',
        gold: 'var(--gold)',
        gold2: 'var(--gold2)',
        tx: 'var(--tx)',
        mu: 'var(--mu)',
        lt: 'var(--lt)',
        su: 'var(--su)',
        subg: 'var(--subg)',
        er: 'var(--er)',
        erbg: 'var(--erbg)',
        in: 'var(--in)',
        wa: 'var(--wa)',
        wabg: 'var(--wabg)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-afacad)", "Inter", "sans-serif"],
        display: ["var(--font-calsans)", "sans-serif"],
        mono: ["var(--font-cousine)", "monospace"],
      },
      backgroundImage: {
        "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))",
      },
      boxShadow: {
        "glass": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;

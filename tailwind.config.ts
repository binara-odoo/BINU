import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  safelist: [
    {
      pattern: /blur-.*/, // Permite clases como blur-sm, blur-md, blur-lg, etc.
    },
  ],
} satisfies Config;

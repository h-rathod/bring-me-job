/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        muted: 'hsl(var(--muted, 210 40% 96.1%))',
        'muted-foreground': 'hsl(var(--muted-foreground, 215.4 16.3% 46.9%))',
        card: 'hsl(var(--card, var(--background)))',
        'card-foreground': 'hsl(var(--card-foreground, var(--foreground)))',
        popover: 'hsl(var(--popover, var(--background)))',
        'popover-foreground': 'hsl(var(--popover-foreground, var(--foreground)))',
        border: 'hsl(var(--border, 214.3 31.8% 91.4%))',
        input: 'hsl(var(--input, 214.3 31.8% 91.4%))',
        primary: 'hsl(var(--primary, 222.2 47.4% 11.2%))',
        'primary-foreground': 'hsl(var(--primary-foreground, 210 40% 98%))',
        secondary: 'hsl(var(--secondary, 210 40% 96.1%))',
        'secondary-foreground': 'hsl(var(--secondary-foreground, 222.2 47.4% 11.2%))',
        accent: 'hsl(var(--accent, 210 40% 96.1%))',
        'accent-foreground': 'hsl(var(--accent-foreground, 222.2 47.4% 11.2%))',
      }
    }
  },
  plugins: [],
}

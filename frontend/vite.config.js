import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  // Tailwind v4 uses CSS variables for dark mode by default, 
  // but to use the manual toggle class strategy, we rely on the .dark class processing.
  // No explicit 'darkMode' config needed in vite.config.js for v4 if using @tailwindcss/vite 
  // as it detects usage. But for v3 compat or specific config, we might need tailwind.config.js.
  // Since we don't have tailwind.config.js, we assume v4 defaults.
  // v4 supports `dark:` variant out of the box.
  // The crucial part is adding 'dark' class to html element, which ThemeContext does.
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/did': 'http://localhost:8001',
      '/oac': 'http://localhost:8001',
      '/vc': 'http://localhost:8001',
      '/health': 'http://localhost:8001'
    }
  }
})

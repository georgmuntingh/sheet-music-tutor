import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Check if the build is for Netlify
  const isNetlify = process.env.NETLIFY === 'true';

  return {
    plugins: [react()],

    // Set 'base' conditionally
    // For Netlify: use '/' (the default)
    // For GitHub Pages: use '/sheet-music-tutor/'
    base: isNetlify ? '/' : '/sheet-music-tutor/',
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Check if the build is for Netlify
  const isNetlify = process.env.NETLIFY === 'true';

  // Check if a custom base path is set (for PR previews)
  const customBasePath = process.env.VITE_BASE_PATH;

  return {
    plugins: [react()],

    // Set 'base' conditionally
    // For PR previews: use the custom base path (e.g., '/sheet-music-tutor/pr-123/')
    // For Netlify: use '/' (the default)
    // For GitHub Pages: use '/sheet-music-tutor/'
    base: customBasePath || (isNetlify ? '/' : '/sheet-music-tutor/'),
  };
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    // Relative base sayesinde depo adı değişse bile GitHub Pages altında çalışır.
    base: './',
});

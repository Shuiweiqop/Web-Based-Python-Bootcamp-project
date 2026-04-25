import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
      '@/Components': path.resolve(__dirname, './resources/js/Components'),
      '@/Contexts': path.resolve(__dirname, './resources/js/Contexts'),
      '@/Hooks': path.resolve(__dirname, './resources/js/Hooks'),
      '@/Lib': path.resolve(__dirname, './resources/js/Lib'),
      '@/Config': path.resolve(__dirname, './resources/js/Config'),
      '@/Pages': path.resolve(__dirname, './resources/js/Pages'),
      '@/Layouts': path.resolve(__dirname, './resources/js/Layouts'),
    },
  },
  test: {
    environment: 'node',
    include: ['resources/js/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    globals: true,
  },
});

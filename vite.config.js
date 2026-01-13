import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx',
            refresh: true,
        }),
        react(),
    ],
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
});
import '../css/app.css';
import '../css/animations.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { router } from '@inertiajs/react';
const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
router.on('error', (event) => {
    if (event.detail?.status === 419) {
        location.reload();
    }
});
createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: async (name) => {
        // ✅ 加载页面组件
        const page = await resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        );
        
        // ✅ 页面组件已经通过 .layout 属性设置了自己的 layout
        // 不需要在这里设置
        
        return page;
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        
        // ✅ 关键：不要在这里包裹 Providers
        // 因为 EquipProvider 需要 usePage()，必须在 App 内部
        root.render(<App {...props} />);
    },
    progress: {
        progress: false, 
    },
});
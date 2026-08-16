/**
 * Service worker registration.
 *
 * Registered only in production builds. In development Vite serves modules over
 * HMR, and a service worker sitting in front of that intercepts requests and
 * serves stale code — the classic "why isn't my change showing up" bug.
 */
export function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;

    if (import.meta.env.DEV) {
        // Clean up after a developer who ran a production build locally: an
        // orphaned worker from that build would keep serving its cached assets
        // over the dev server.
        navigator.serviceWorker.getRegistrations().then((registrations) => {
            registrations.forEach((registration) => registration.unregister());
        });

        return;
    }

    // Wait for load so registration never competes with the initial render for
    // bandwidth on a slow connection.
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
            // A failed registration costs the install prompt and offline
            // fallback, nothing else — the app works fine without it, so this
            // must never surface as an error to the user.
        });
    });
}

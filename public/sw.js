/* eslint-env serviceworker */

/**
 * Service worker for the PWA install experience.
 *
 * Scope is deliberately narrow. This app is server-driven (Inertia renders
 * pages from Laravel, auth is a session cookie), so caching HTML would serve a
 * logged-out shell to a logged-in user, or a stale page after a lesson is
 * updated. Both are worse than no offline support at all.
 *
 * So the rules are:
 *   - Hashed build assets (/build/*)  -> cache-first. Vite fingerprints these,
 *     so a given URL's content never changes; serving from cache is always
 *     correct and makes repeat launches instant.
 *   - Icons and static files          -> cache-first, same reasoning.
 *   - Everything else                 -> straight to the network, untouched.
 *     GET navigations fall back to the offline page only when the network
 *     actually fails.
 *
 * Non-GET requests are never intercepted: replaying a POST from a cache would
 * duplicate a submission, and CSRF tokens are per-session.
 */

const VERSION = 'v1';
const STATIC_CACHE = `static-${VERSION}`;
const OFFLINE_URL = '/offline.html';

/** Precached at install so the offline fallback works on the very first drop-out. */
const PRECACHE = [
    OFFLINE_URL,
    '/icons/icon-192.png',
    '/icons/icon-512.png',
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches
            .open(STATIC_CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            // Take over as soon as installed rather than waiting for every tab
            // to close; combined with the cleanup below this keeps at most one
            // generation of caches around.
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== STATIC_CACHE)
                        .map((key) => caches.delete(key)),
                ),
            )
            .then(() => self.clients.claim()),
    );
});

/** Fingerprinted or otherwise immutable assets: safe to serve from cache forever. */
function isImmutableAsset(url) {
    return (
        url.pathname.startsWith('/build/') ||
        url.pathname.startsWith('/icons/') ||
        url.pathname === '/favicon.ico'
    );
}

self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Never touch writes, and never touch cross-origin requests (CDN fonts,
    // Judge0, Gemini) — those have their own caching and CORS rules.
    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    // Vite's dev-server client must always hit the network or HMR breaks.
    if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/hot')) return;

    if (isImmutableAsset(url)) {
        event.respondWith(
            caches.match(request).then((cached) => {
                if (cached) return cached;

                return fetch(request).then((response) => {
                    // Only cache a genuine success. Caching an opaque or error
                    // response would pin a broken asset until the next version.
                    if (response.ok && response.type === 'basic') {
                        const copy = response.clone();
                        caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
                    }

                    return response;
                });
            }),
        );

        return;
    }

    // Page navigations: always network-first, because the HTML carries session
    // state and a CSRF token. Fall back to the offline page only on failure.
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request).catch(() =>
                caches.match(OFFLINE_URL).then((cached) => cached ?? Response.error()),
            ),
        );
    }

    // Everything else falls through to the default network handling.
});

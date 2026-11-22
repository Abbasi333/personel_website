// ====================================================================
// UBAIDDEV SERVICE WORKER — Fastest of the Fastest
// Offline-first cache strategy for instant repeat visits
// ====================================================================

const CACHE_NAME = 'ubaiddev-v4';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/js/main.js',
    '/js/supabase-config.js',
    '/assets/MINE_PIC.png',
    '/assets/MINE_PIC.webp',
    '/thanks.html'
];

// ── INSTALL: pre-cache all static assets
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(STATIC_ASSETS);
        }).catch(() => {}) // never block install on network failure
    );
});

// ── ACTIVATE: clean up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH: Cache-first for static, network-first for API/Supabase
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Skip non-GET and browser-extension requests
    if (event.request.method !== 'GET') return;
    if (!url.protocol.startsWith('http')) return;

    // Network-first for Supabase API (always fresh data)
    if (url.hostname.includes('supabase.co')) {
        event.respondWith(
            fetch(event.request)
                .then(resp => resp)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for Cloudinary images (always fresh)
    if (url.hostname.includes('cloudinary.com')) {
        event.respondWith(
            fetch(event.request)
                .then(resp => {
                    // Cache Cloudinary images for 7 days
                    if (resp.ok) {
                        const clone = resp.clone();
                        caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    }
                    return resp;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first for all static local assets (CSS, JS, fonts, images)
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) {
                // Stale-While-Revalidate: return cached instantly, update in background
                const fetchPromise = fetch(event.request).then(resp => {
                    if (resp && resp.ok) {
                        caches.open(CACHE_NAME).then(c => c.put(event.request, resp.clone()));
                    }
                    return resp;
                }).catch(() => {});
                return cached;
            }
            // Not cached: fetch from network and cache it
            return fetch(event.request).then(resp => {
                if (resp && resp.ok) {
                    const clone = resp.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                }
                return resp;
            }).catch(() => caches.match('/index.html'));
        })
    );
});

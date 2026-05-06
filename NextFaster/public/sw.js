// Service Worker for SouqFlow Push Notifications
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title || 'طلب جديد! 🛍️';
    const options = {
        body: data.body || 'لديك طلب جديد',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        tag: data.tag || 'new-order',
        renotify: true,
        requireInteraction: true,
        vibrate: [200, 100, 200, 100, 200],
        data: { url: data.url || '/' },
        actions: [
            { action: 'view', title: 'عرض الطلب' },
            { action: 'dismiss', title: 'إغلاق' },
        ],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    if (event.action === 'dismiss') return;

    const url = event.notification.data?.url || '/';
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
            const existing = clients.find((c) => c.url.includes(url) && 'focus' in c);
            if (existing) return existing.focus();
            return self.clients.openWindow(url);
        })
    );
});

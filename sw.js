const CACHE_NAME = 'skillwave-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// שומרת את הקבצים במטמון בעת ההתקנה
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// שליפת קבצים מהמטמון או מהרשת
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // אם הבקשה היא ל־Supabase (או לשרת חיצוני), תביא תמיד מהרשת ואל תשמור במטמון
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // לכל השאר - רגיל (מטמון ואז רשת)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});

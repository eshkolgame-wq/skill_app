// חשוב: קדמו את המספר הזה (v1 -> v2 -> v3...) בכל דיפלוי כדי שהגרסה החדשה תדרוס את הישנה
const CACHE_NAME = 'skillwave-cache-v3';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// שומרת את הקבצים במטמון בעת ההתקנה, ומדלגת מיד על שלב ההמתנה
// (בלי skipWaiting, ה-SW החדש "ממתין" עד שכל הטאבים הפתוחים נסגרים — ואז המשתמשים
// ממשיכים לקבל את הגרסה הישנה למרות שקידמנו את מספר הגרסה)
self.addEventListener('install', event => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // fetch עם cache:'no-cache' כדי לעקוף גם את מטמון ה-HTTP של הדפדפן,
      // לא רק את מטמון ה-Service Worker
      await Promise.all(urlsToCache.map(async (url) => {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (res.ok) await cache.put(url, res);
        } catch (e) { /* offline בזמן ההתקנה - לא קריטי */ }
      }));
      self.skipWaiting();
    })()
  );
});

// בהפעלה: מוחקת מטמונים ישנים (מגרסאות קודמות) ותופסת שליטה מיידית על כל הטאבים הפתוחים
self.addEventListener('activate', event => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)));
      await self.clients.claim();
    })()
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

const CACHE_NAME = 'skillwave-v3'; // בכל פעם שאתה עושה עדכון משמעותי בעתיד, פשוט תשנה ל-v3, v4 וכו'

const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// התקנה של ה-Service Worker וטעינת הקבצים למטמון
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  // גורם לService Worker החדש להתקין את עצמו מיד ולא לחכות שהאפליקציה תיסגר
  self.skipWaiting();
});

// הפעלה וניקוי מטמונים ישנים
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key); // מוחק את ה-Cache הישן (כמו v1)
          }
        })
      );
    })
  );
  // תופס שליטה מיד על כל הטאבים הפתוחים בלי הצורך לרענן ידנית
  self.clients.claim();
});

// טיפול בבקשות רשת - מנסה קודם כל לקחת מהרשת (GitHub), ואם אין אינטרנט נופל למטמון
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

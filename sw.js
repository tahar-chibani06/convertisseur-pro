const CACHE_NAME = 'convertisseur-pro-v2'; // J'ai changé le nom pour forcer la mise à jour
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@babel/standalone/babel.min.js',
  'https://esm.sh/react@18.2.0',
  'https://esm.sh/react-dom@18.2.0/client',
  'https://esm.sh/lucide-react@0.263.1'
];

// 1. Installation : On force le téléchargement immédiat de TOUS les fichiers
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force le Service Worker à s'activer tout de suite
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Mise en cache des fichiers en cours...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Activation : On nettoie les vieux caches pour éviter les conflits
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('Suppression de l\'ancien cache:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim(); // Prend le contrôle de la page immédiatement
});

// 3. Interception : Stratégie "Cache ou Réseau" (Offline first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si le fichier est dans le cache (même sans internet), on le donne
      if (cachedResponse) {
        return cachedResponse;
      }
      // Sinon, on essaie de le télécharger (cas où on est en ligne)
      return fetch(event.request).catch(() => {
        // Si ça échoue (pas d'internet et pas en cache), on ne peut rien faire pour ce fichier spécifique
        // Mais pour l'app principale, le cache aura déjà répondu.
        console.log("Fichier introuvable hors ligne : ", event.request.url);
      });
    })
  );
});

// 塗膜厚測定検査記録 オフライン用キャッシュ
// ファイルを更新したら VERSION を変えてください（例：v2 → v3）
const VERSION = 'makuatsu-v4';
const FILES = ['./makuatsu.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './lib/html2canvas.min.js', './lib/jspdf.umd.min.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// まずキャッシュを表示（電波が弱くてもすぐ開く）。裏で最新版を取得してキャッシュを更新
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return res;
      }).catch(() => cached || caches.match('./makuatsu.html'));
      return cached || net;
    })
  );
});

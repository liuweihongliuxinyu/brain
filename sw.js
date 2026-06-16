const CACHE_NAME = 'brain-cache-v2';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon.png'
];

// 安装时缓存核心资源
self.addEventListener('install', e => {
  self.skipWaiting(); // 立即激活新版本
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

// 激活时清除旧缓存
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // 立即接管所有页面
});

// 网络优先策略：优先请求最新版本，失败才用缓存
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(resp => {
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return resp;
      })
      .catch(() => caches.match(e.request))
  );
});

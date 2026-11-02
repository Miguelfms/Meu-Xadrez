/* Service worker do Meu Xadrez Plus: deixa o app funcionar sem internet. a versão é trocada no build. */
const CACHE = 'meu-xadrez-e1eb46a944';
const ARQUIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './maskable-512.png', './apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k.startsWith('meu-xadrez-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // CDN do Stockfish etc. passam direto
  if (r.mode === 'navigate') {   // páginas: tenta a rede (pega atualização), se estiver offline usa o guardado
    e.respondWith(fetch(r).then((resp) => { const cp = resp.clone(); caches.open(CACHE).then((c) => c.put('./index.html', cp)); return resp; }).catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r).then((hit) => hit || fetch(r).then((resp) => { if (resp.ok) { const cp = resp.clone(); caches.open(CACHE).then((c) => c.put(r, cp)); } return resp; })));
});

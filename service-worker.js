/* Trust Soluções — Service Worker
   Estratégia: Network-First. Sempre busca versão nova; fallback para cache.
*/
var CACHE = 'trust-v2';
var ARQUIVOS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(ARQUIVOS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(nomes){
      return Promise.all(nomes.filter(function(n){ return n!==CACHE; }).map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = e.request.url;
  if(url.includes('monitorsefaz')||url.includes('googletagmanager')||url.includes('googleapis')||url.includes('gstatic')) return;
  e.respondWith(
    fetch(e.request).then(function(r){
      if(r && r.status===200){
        var clone = r.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, clone); });
      }
      return r;
    }).catch(function(){
      return caches.match(e.request).then(function(cached){
        return cached || new Response('Sem conexão.', {status:503, headers:{'Content-Type':'text/plain;charset=UTF-8'}});
      });
    })
  );
});

self.addEventListener('message', function(e){
  if(e.data && e.data.action==='skipWaiting') self.skipWaiting();
});

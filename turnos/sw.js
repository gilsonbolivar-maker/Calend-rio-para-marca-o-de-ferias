/* ————————————————————————————————————————————————————————————
   Service worker: a escala abre sem rede depois da primeira visita.
   ———————————————————————————————————————————————————————————— */
'use strict';

const VERSAO = 'v2';
const CACHE = 'escala-turnos-' + VERSAO;

const ARQUIVOS = [
  '.',
  'index.html',
  'app.css',
  'app.js',
  'manifest.webmanifest',
  'icones/icone-180.png',
  'icones/icone-192.png',
  'icones/icone-512.png',
  'icones/icone-maskable-512.png'
];

self.addEventListener('install', ev => {
  ev.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ARQUIVOS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', ev => {
  ev.waitUntil(
    caches.keys()
      .then(nomes => Promise.all(
        nomes.filter(n => n.startsWith('escala-turnos-') && n !== CACHE)
             .map(n => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

/* Rede primeiro para pegar versão nova; cache quando não há sinal.
   O 'no-cache' obriga o navegador a conferir com o servidor em vez de servir
   o arquivo guardado dele — sem isso, uma atualização demora a aparecer. */
self.addEventListener('fetch', ev => {
  const pedido = ev.request;
  if (pedido.method !== 'GET' || new URL(pedido.url).origin !== location.origin) return;

  const fresco = new Request(pedido.url, {
    cache: 'no-cache',
    credentials: 'same-origin',
    redirect: 'follow'
  });

  ev.respondWith(
    fetch(fresco)
      .then(resposta => {
        if (resposta && resposta.ok) {
          const copia = resposta.clone();
          caches.open(CACHE).then(c => c.put(pedido, copia));
        }
        return resposta;
      })
      .catch(() => caches.match(pedido, { ignoreSearch: true })
        .then(guardado => guardado || caches.match('index.html')))
  );
});

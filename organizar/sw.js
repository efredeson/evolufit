/* EvoluFit TESTE - prévia independente do aplicativo principal.
   Guarda somente arquivos públicos; não armazena nem envia dados pessoais. */
const CACHE="evolufit-organizar-pwa-v1";
const ASSETS=[
 "./","./index.html","./manifest.webmanifest","./app.js","./organize-ui.js","./organize-ui.css",
 "../ef-icons.js","../mission-ui.js","../mission-ui.css","../styles.css","../theme-neon.css",
 "../assets/evolufit-gatinho-hd.webp","../assets/evolufit-marca-hd.webp",
 "../assets/evolufit-symbol-amoled.svg",
 "../assets/exercicios/cadeira-foto.webp","../assets/exercicios/marcha-foto.webp",
 "../assets/exercicios/bracos-foto.webp","../assets/exercicios/lateral-foto.webp",
 "../assets/exercicios/agachamento-foto.webp","../assets/exercicios/parede-foto.webp",
 "../assets/exercicios/prancha-foto.webp","../assets/exercicios/alongamento-foto.webp"
];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(
  keys.filter(k=>k.startsWith("evolufit-organizar-pwa-")&&k!==CACHE).map(k=>caches.delete(k))
 )).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;
 const url=new URL(request.url);if(url.origin!==self.location.origin||!url.pathname.startsWith("/evolufit/"))return;
 const fresh=request.mode==="navigate"||/\.(?:html|js|css|webmanifest)$/.test(url.pathname);
 if(fresh){
  event.respondWith(fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
    return response;
   }).catch(()=>caches.match(request)));
 }else{
  event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
    if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)));}
    return response;
   })));
 }
});

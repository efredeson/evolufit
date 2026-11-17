const CACHE="evolufit-root-v9-amoled-original-icons";
const ASSETS=["./","./index.html","./styles.css","./theme-neon.css","./app.js","./manifest.webmanifest","./assets/evolufit-gatinho-hd.webp","./assets/evolufit-marca-hd.webp","./assets/exercicios/marcha-foto.webp","./assets/exercicios/cadeira-foto.webp","./assets/exercicios/bracos-foto.webp","./assets/exercicios/lateral-foto.webp","./assets/exercicios/agachamento-foto.webp","./assets/exercicios/parede-foto.webp","./assets/exercicios/prancha-foto.webp","./assets/exercicios/alongamento-foto.webp","./ef-icons.js","./assets/evolufit-symbol-amoled.svg"];
self.addEventListener("install",e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(k.startsWith("evolufit-root-")||(k.startsWith("evolufit-static-")&&!k.includes("-beta-")))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin||!u.pathname.includes("/evolufit/"))return;
 const networkFirst=e.request.mode==="navigate"||/\.(?:html|js|css|webmanifest)$/.test(u.pathname);
 if(networkFirst){
  e.respondWith(fetch(e.request).then(response=>{
   if(response.ok){const copy=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}
   return response;
  }).catch(()=>caches.match(e.request)));
 }else{
  e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{
   if(response.ok){const copy=response.clone();e.waitUntil(caches.open(CACHE).then(c=>c.put(e.request,copy)));}
   return response;
  })));
 }
});

const CACHE="evolufit-beta-v7-exercicios-realistas";
const ASSETS=["./","./index.html","./styles.css","./cloud.css","./config.js","./cloud.js","./app.js","./manifest.webmanifest","../assets/evolufit-gatinho-hd.webp","../assets/evolufit-marca-hd.webp","../assets/exercicios/marcha-foto.webp","../assets/exercicios/cadeira-foto.webp","../assets/exercicios/bracos-foto.webp","../assets/exercicios/lateral-foto.webp","../assets/exercicios/agachamento-foto.webp","../assets/exercicios/parede-foto.webp","../assets/exercicios/prancha-foto.webp","../assets/exercicios/alongamento-foto.webp","../assets/exercicios/marcha.svg","../assets/exercicios/cadeira.svg","../assets/exercicios/bracos.svg","../assets/exercicios/lateral.svg","../assets/exercicios/agachamento.svg","../assets/exercicios/parede.svg","../assets/exercicios/panturrilha.svg","../assets/exercicios/prancha.svg","../assets/exercicios/ombros.svg","../assets/exercicios/pescoco.svg","../assets/exercicios/quadril.svg","../assets/exercicios/alongamento.svg","../assets/exercicios/polichinelo.svg","../assets/exercicios/passada.svg","../assets/exercicios/respiracao.svg"];
self.addEventListener("install",e=>{
 e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&(k.startsWith("evolufit-beta-")||k.includes("-beta-"))).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
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

const CACHE="evolufit-static-2026-11-17-v2-auth";
const ASSETS=["./","./index.html","./styles.css","./cloud.css","./config.js","./cloud.js","./app.js","./manifest.webmanifest","./assets/cat.webp"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener("fetch",e=>{
 if(e.request.method!=="GET")return;
 const u=new URL(e.request.url);
 if(u.origin!==location.origin||!u.pathname.includes("/evolufit/"))return;
 e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{
 if(r.ok){let copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}
 return r;
 })));
});
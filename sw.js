const CACHE='jjongkeep-v021';
const SHELL=['./','./index.html','./jjongkeep.css?v=020','./jjongkeep.js?v=020','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
const DB='jjongkeep_simple_v2',STORE='items';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function uid(){return crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
async function saveShared(form){
 const title=(form.get('title')||'').toString().trim();
 const text=(form.get('text')||'').toString().trim();
 const url=(form.get('url')||'').toString().trim();
 const files=form.getAll('files').filter(f=>f instanceof File&&f.size>0&&f.type.startsWith('image/'));
 const parts=[];if(title)parts.push(title);if(text&&!parts.includes(text))parts.push(text);if(url&&!parts.includes(url))parts.push(url);
 const db=await openDb();
 const item={id:uid(),text:parts.join('\n\n'),photos:files,type:'reference',today:false,archived:false,source:'share',createdAt:Date.now(),updatedAt:Date.now()};
 await new Promise((res,rej)=>{const transaction=db.transaction(STORE,'readwrite');transaction.oncomplete=()=>res();transaction.onerror=()=>rej(transaction.error);transaction.onabort=()=>rej(transaction.error||new Error('transaction aborted'));transaction.objectStore(STORE).put(item)});
 db.close();
}
self.addEventListener('fetch',event=>{
 const url=new URL(event.request.url);
 if(event.request.method==='POST'&&url.pathname.endsWith('/share-target')){
  event.respondWith((async()=>{try{const form=await event.request.formData();await saveShared(form);return Response.redirect(new URL('./?shared=1',self.registration.scope).href,303)}catch(e){console.error('share target failed',e);return Response.redirect(new URL('./?shareError=1',self.registration.scope).href,303)}})());return;
 }
 if(event.request.method==='GET')event.respondWith(caches.match(event.request).then(hit=>hit||fetch(event.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));return res}).catch(()=>caches.match('./index.html'))));
});
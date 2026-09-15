const RESULT_CACHE='jjongkeep-diag-results';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function saveResult(data){const c=await caches.open(RESULT_CACHE);await c.put('/last-share-result',new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}))}
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method==='POST'&&u.pathname==='/share-target'){
  event.respondWith((async()=>{
   const d={ok:false,stage:'POST 요청 감지',method:'POST',contentType:event.request.headers.get('content-type')||'(없음)'};
   try{
    const form=await event.request.formData();
    d.stage='formData 해석 성공';d.keys=[...form.keys()].join(', ')||'(없음)';d.title=String(form.get('title')||'');d.text=String(form.get('text')||'');d.url=String(form.get('url')||'');
    const files=[...form.entries()].filter(([,v])=>v instanceof File);d.fileCount=files.length;
    if(files.length){const [field,f]=files[0];d.fileField=field;d.fileName=f.name||'(이름 없음)';d.fileType=f.type||'(MIME 없음)';d.fileSize=f.size+' bytes';try{await f.arrayBuffer();d.fileRead='성공'}catch(e){d.fileRead='실패: '+e.name+' / '+e.message}}
    d.ok=true;d.stage='공유 데이터 읽기 완료';
   }catch(e){d.errorName=e?.name||'Error';d.errorMessage=e?.message||String(e);d.stage='formData 처리 중 실패'}
   try{await saveResult(d)}catch(e){d.cacheError=e?.message||String(e)}
   return Response.redirect(new URL('/',self.registration.scope).href,303);
  })());return;
 }
});
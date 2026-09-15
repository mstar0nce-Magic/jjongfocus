const CACHE='jjongkeep-diag-v022';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
function b64(obj){const s=unescape(encodeURIComponent(JSON.stringify(obj)));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function redirectDiag(d){return Response.redirect(new URL('./?diag='+encodeURIComponent(b64(d)),self.registration.scope).href,303)}
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method==='POST'&&u.pathname.endsWith('/share-target')){
  event.respondWith((async()=>{
   const d={ok:false,stage:'POST 요청 감지',method:event.request.method,contentType:event.request.headers.get('content-type')||'(없음)'};
   try{
    const form=await event.request.formData();d.stage='formData 해석 성공';
    d.keys=[...form.keys()].join(', ')||'(없음)';
    d.title=String(form.get('title')||'');d.text=String(form.get('text')||'');d.url=String(form.get('url')||'');
    const all=[...form.entries()];const files=all.filter(([,v])=>v instanceof File);
    d.fileCount=files.length;
    if(files.length){const [field,f]=files[0];d.fileField=field;d.fileName=f.name||'(이름 없음)';d.fileType=f.type||'(MIME 없음)';d.fileSize=f.size+' bytes';
     try{if(f.size<=3000000){const buf=await f.arrayBuffer();let binary='';const bytes=new Uint8Array(buf);for(let i=0;i<bytes.length;i+=0x8000)binary+=String.fromCharCode(...bytes.subarray(i,i+0x8000));d.preview='data:'+(f.type||'application/octet-stream')+';base64,'+btoa(binary);d.previewStatus='미리보기 데이터 생성 성공'}else d.previewStatus='3MB 초과라 미리보기 생략'}catch(pe){d.previewStatus='미리보기 실패: '+pe.name+' / '+pe.message}
    }
    d.ok=true;d.stage='공유 데이터 읽기 완료';return redirectDiag(d);
   }catch(e){d.errorName=e&&e.name?e.name:'Error';d.errorMessage=e&&e.message?e.message:String(e);d.stage='formData 처리 중 실패';return redirectDiag(d)}
  })());return;
 }
 if(event.request.method==='GET')event.respondWith(fetch(event.request).catch(()=>caches.match(event.request)));
});
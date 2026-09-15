const RESULT_CACHE='jjongkeep-diag-results';
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
async function saveResult(data){const c=await caches.open(RESULT_CACHE);await c.put('/last-share-result',new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}}))}
function parseRawMultipart(buf,contentType){
 const m=/boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType||'');if(!m)throw new Error('boundary 없음');
 const boundary=m[1]||m[2];const bytes=new Uint8Array(buf);const latin=new TextDecoder('latin1').decode(bytes);const chunks=latin.split('--'+boundary);const out=[];
 for(const chunk of chunks){const cut=chunk.indexOf('\r\n\r\n');if(cut<0)continue;const head=chunk.slice(0,cut);let body=chunk.slice(cut+4);if(body.endsWith('\r\n'))body=body.slice(0,-2);const nm=/name="([^"]+)"/i.exec(head);if(!nm)continue;const fm=/filename="([^"]*)"/i.exec(head);const tm=/Content-Type:\s*([^\r\n]+)/i.exec(head);out.push({field:nm[1],filename:fm?fm[1]:'',type:tm?tm[1].trim():'',size:body.length,value:fm?'':new TextDecoder().decode(Uint8Array.from(body,c=>c.charCodeAt(0)))})}
 return out;
}
self.addEventListener('fetch',event=>{
 const u=new URL(event.request.url);
 if(event.request.method==='POST'&&u.pathname==='/share-target'){
  event.respondWith((async()=>{
   const ct=event.request.headers.get('content-type')||'';const d={ok:false,stage:'POST 요청 감지',method:'POST',contentType:ct};
   let clone;try{clone=event.request.clone();d.clone='성공'}catch(e){d.clone='실패: '+e.name+' / '+e.message}
   try{
    const form=await event.request.formData();d.formData='성공';d.keys=[...form.keys()].join(', ')||'(없음)';d.title=String(form.get('title')||'');d.text=String(form.get('text')||'');d.url=String(form.get('url')||'');const files=[...form.entries()].filter(([,v])=>v&&typeof v==='object'&&'size'in v);d.fileCount=files.length;if(files.length){const[field,f]=files[0];d.fileField=field;d.fileName=f.name||'(이름 없음)';d.fileType=f.type||'(MIME 없음)';d.fileSize=f.size+' bytes'}d.ok=true;d.stage='formData 공유 수신 성공';
   }catch(e){
    d.formData='실패: '+(e?.name||'Error')+' / '+(e?.message||String(e));d.stage='formData 실패 → 원본 body 검사';
    if(clone)try{const buf=await clone.arrayBuffer();d.rawBody='읽기 성공 ('+buf.byteLength+' bytes)';const parts=parseRawMultipart(buf,ct);d.rawParts=parts.length;const fs=parts.filter(x=>x.filename);d.fileCount=fs.length;if(fs.length){d.fileField=fs[0].field;d.fileName=fs[0].filename;d.fileType=fs[0].type;d.fileSize=fs[0].size+' bytes'}d.rawFields=parts.filter(x=>!x.filename).map(x=>x.field+'='+x.value.slice(0,100)).join(' | ');d.ok=true;d.stage='원본 multipart body 수신 성공';}catch(re){d.rawBody='실패: '+(re?.name||'Error')+' / '+(re?.message||String(re));d.errorName=re?.name||e?.name||'Error';d.errorMessage=re?.message||e?.message||String(re);d.stage='원본 요청 body 자체를 읽지 못함'}
   }
   try{await saveResult(d)}catch(e){d.cacheError=e?.message||String(e)}
   return Response.redirect(new URL('/',self.registration.scope).href,303);
  })());return;
 }
});
(()=>{
'use strict';
const DB='jjongkeep_simple_v2';
const STORE='items';
let db;
const $=s=>document.querySelector(s);
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);

function openDb(){
  return new Promise((resolve,reject)=>{
    const r=indexedDB.open(DB,1);
    r.onupgradeneeded=()=>{
      if(!r.result.objectStoreNames.contains(STORE)) r.result.createObjectStore(STORE,{keyPath:'id'});
    };
    r.onsuccess=()=>{db=r.result;resolve(db)};
    r.onerror=()=>reject(r.error);
  });
}
function store(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
function allItems(){return new Promise((resolve,reject)=>{const r=store().getAll();r.onsuccess=()=>resolve(r.result||[]);r.onerror=()=>reject(r.error)})}
function putItem(item){return new Promise((resolve,reject)=>{const r=store('readwrite').put(item);r.onsuccess=()=>resolve(item);r.onerror=()=>reject(r.error)})}
function esc(v=''){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function linkify(v=''){
  const text=String(v),re=/(https?:\/\/[^\s<]+|(?<![@\w])(?:[a-z0-9-]+\.)+(?:com|net|org|io|dev|app|ai|co|kr|co\.kr|me|shop|store|cloud|page|pages|xyz|info|biz)(?:\/[^\s<]*)?)/gi;
  let out='',last=0,m;
  while((m=re.exec(text))){
    out+=esc(text.slice(last,m.index));
    let shown=m[0],trail='';
    while(/[.,!?;:)]$/.test(shown)){trail=shown.slice(-1)+trail;shown=shown.slice(0,-1)}
    const href=/^https?:\/\//i.test(shown)?shown:'https://'+shown;
    out+=`<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(shown)}</a>${esc(trail)}`;
    last=m.index+m[0].length;
  }
  return out+esc(text.slice(last));
}
function toast(message){const e=$('#toast');e.textContent=message;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),1800)}
function objectUrl(blob){try{return URL.createObjectURL(blob)}catch{return ''}}

function card(item){
  const el=document.createElement('article');
  el.className='record';
  if(item.photos?.length){
    const photos=document.createElement('div');photos.className='photos';
    item.photos.forEach(p=>{const img=document.createElement('img');img.src=objectUrl(p);img.alt='가져온 사진';photos.appendChild(img)});
    el.appendChild(photos);
  }
  const body=document.createElement('div');body.className='record-body';
  if(item.text) body.innerHTML=`<div class="record-text">${linkify(item.text)}</div>`;
  const meta=document.createElement('div');meta.className='meta';meta.textContent=`Google Keep에서 가져옴 · ${new Date(item.createdAt||Date.now()).toLocaleString('ko-KR')}`;
  body.appendChild(meta);el.appendChild(body);return el;
}
async function render(){
  const all=await allItems();
  const imported=all.filter(x=>x.source==='share').sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  const frag=document.createDocumentFragment();imported.forEach(i=>frag.appendChild(card(i)));
  $('#list').replaceChildren(frag);$('#recordCount').textContent=`${imported.length}개`;$('#empty').hidden=imported.length>0;
}
async function receiveNativeShare(text){
  const value=(text||'').trim();if(!value)return;
  const t=Date.now();
  await putItem({id:uid(),text:value,photos:[],source:'share',createdAt:t,updatedAt:t,schemaVersion:1});
}
async function init(){
  await openDb();
  if('serviceWorker' in navigator){
    try{const reg=await navigator.serviceWorker.register('/sw.js?v=100');await navigator.serviceWorker.ready;reg.update().catch(()=>{})}catch(e){console.warn(e)}
  }
  const p=new URLSearchParams(location.search);
  if(p.get('nativeShare')){
    await receiveNativeShare(p.get('nativeShare'));
    $('#importStatus').textContent='텍스트/링크를 가져왔어요.';toast('Google Keep 자료를 가져왔어요');history.replaceState({},'',location.pathname);
  }else if(p.get('shared')){
    $('#importStatus').textContent='사진 또는 공유 자료를 가져왔어요.';toast('Google Keep 자료를 가져왔어요');history.replaceState({},'',location.pathname);
  }else if(p.get('shareError')){
    $('#importStatus').textContent='가져오기에 실패했어요. 다시 공유해 주세요.';toast('공유 자료를 받지 못했어요');history.replaceState({},'',location.pathname);
  }
  await render();
}
init();
})();

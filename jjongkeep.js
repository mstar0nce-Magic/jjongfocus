(()=>{'use strict';
const DB='jjongkeep_simple_v2',STORE='items';
let db,view='inbox',quickPhotos=[],editing=null,editPhotos=[];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const uid=()=>crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);

function openDb(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE))r.result.createObjectStore(STORE,{keyPath:'id'})};r.onsuccess=()=>{db=r.result;res(db)};r.onerror=()=>rej(r.error)})}
function tx(mode='readonly'){return db.transaction(STORE,mode).objectStore(STORE)}
function allItems(){return new Promise((res,rej)=>{const r=tx().getAll();r.onsuccess=()=>res(r.result||[]);r.onerror=()=>rej(r.error)})}
function putItem(item){return new Promise((res,rej)=>{const r=tx('readwrite').put(item);r.onsuccess=()=>res(item);r.onerror=()=>rej(r.error)})}
function deleteItem(id){return new Promise((res,rej)=>{const r=tx('readwrite').delete(id);r.onsuccess=()=>res();r.onerror=()=>rej(r.error)})}
function esc(s=''){return s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function toast(msg){const el=$('#toast');el.textContent=msg;el.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove('show'),1500)}
function objectUrl(blob){try{return URL.createObjectURL(blob)}catch{return ''}}

function paintPhotos(container,photos,removeFn){container.innerHTML='';photos.forEach((p,i)=>{const w=document.createElement('div');w.className='thumb-wrap';const img=document.createElement('img');img.src=objectUrl(p);w.appendChild(img);if(removeFn){const b=document.createElement('button');b.type='button';b.className='thumb-remove';b.textContent='✕';b.onclick=()=>removeFn(i);w.appendChild(b)}container.appendChild(w)});container.classList.toggle('hidden',!photos.length)}
function repaintQuick(){paintPhotos($('#photoPreview'),quickPhotos,i=>{quickPhotos.splice(i,1);repaintQuick()})}
function repaintEdit(){paintPhotos($('#editPhotos'),editPhotos,i=>{editPhotos.splice(i,1);repaintEdit()})}

async function saveQuick(){const text=$('#quickText').value.trim();if(!text&&!quickPhotos.length){toast('내용이나 사진을 넣어주세요');return}await putItem({id:uid(),text,photos:[...quickPhotos],type:'reference',today:false,archived:false,source:'direct',createdAt:Date.now(),updatedAt:Date.now()});$('#quickText').value='';quickPhotos=[];repaintQuick();toast('저장했어요');render()}
function typeLabel(t){return t==='task'?'✓ 할 일':t==='idea'?'💡 아이디어':'📚 자료'}

function noteCard(item){const el=document.createElement('article');el.className='note';
 if(item.photos?.length){const photos=document.createElement('div');photos.className='note-photos';item.photos.forEach(p=>{const img=document.createElement('img');img.src=objectUrl(p);photos.appendChild(img)});el.appendChild(photos)}
 const body=document.createElement('div');body.className='note-body';body.innerHTML=`<div class="note-text">${esc(item.text||'')}</div><div class="note-source">${item.source==='share'?'공유로 들어옴':'직접 저장'} · ${new Date(item.createdAt).toLocaleString('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>`;
 const actions=document.createElement('div');actions.className='note-actions';
 const type=document.createElement('button');type.className='pill selected';type.textContent=typeLabel(item.type);type.onclick=()=>openEdit(item);actions.appendChild(type);
 const today=document.createElement('button');today.className='pill today'+(item.today?' selected':'');today.textContent=item.today?'📌 오늘':'오늘로';today.onclick=async()=>{item.today=!item.today;item.updatedAt=Date.now();await putItem(item);render()};actions.appendChild(today);
 const more=document.createElement('button');more.className='pill more';more.textContent='수정';more.onclick=()=>openEdit(item);actions.appendChild(more);
 body.appendChild(actions);el.appendChild(body);return el}

async function render(){const q=$('#search').value.trim().toLowerCase();let items=await allItems();items.sort((a,b)=>b.createdAt-a.createdAt);items=items.filter(x=>{if(view==='today')return !!x.today&&!x.archived;if(view==='archive')return !!x.archived;return !x.archived});if(q)items=items.filter(x=>(x.text||'').toLowerCase().includes(q));const list=$('#list');list.innerHTML='';items.forEach(i=>list.appendChild(noteCard(i)));$('#empty').classList.toggle('hidden',items.length>0)}

function openEdit(item){editing={...item};editPhotos=[...(item.photos||[])];$('#editText').value=item.text||'';$('#editToday').checked=!!item.today;$('#editArchive').checked=!!item.archived;$$('#editTypes button').forEach(b=>b.classList.toggle('active',b.dataset.type===item.type));repaintEdit();$('#editDialog').showModal()}
async function saveEdit(){if(!editing)return;const active=$('#editTypes button.active');editing.text=$('#editText').value.trim();editing.photos=[...editPhotos];editing.type=active?active.dataset.type:'reference';editing.today=$('#editToday').checked;editing.archived=$('#editArchive').checked;editing.updatedAt=Date.now();await putItem(editing);$('#editDialog').close();editing=null;toast('수정했어요');render()}

function bind(){
 $('#quickSave').onclick=saveQuick;
 $('#photoInput').onchange=e=>{quickPhotos.push(...[...e.target.files]);e.target.value='';repaintQuick()};
 $$('.tab').forEach(b=>b.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));b.classList.add('active');view=b.dataset.view;render()});
 $('#search').oninput=render;
 $$('#editTypes button').forEach(b=>b.onclick=()=>{$$('#editTypes button').forEach(x=>x.classList.remove('active'));b.classList.add('active')});
 $('#editPhotoInput').onchange=e=>{editPhotos.push(...[...e.target.files]);e.target.value='';repaintEdit()};
 $('#editSave').onclick=saveEdit;
 $('#editDelete').onclick=async()=>{if(!editing)return;if(confirm('이 메모를 삭제할까요?')){await deleteItem(editing.id);$('#editDialog').close();editing=null;render();toast('삭제했어요')}};
}

async function init(){await openDb();bind();if('serviceWorker'in navigator){try{await navigator.serviceWorker.register('./sw.js?v=020')}catch(e){console.warn(e)}}const p=new URLSearchParams(location.search);if(p.get('shared')){toast('공유한 내용을 받았어요');history.replaceState({},'',location.pathname)}if(p.get('shareError')){toast('공유 내용을 받지 못했어요');history.replaceState({},'',location.pathname)}render()}
init();
})();
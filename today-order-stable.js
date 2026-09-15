(()=>{'use strict';
const DB='jjongkeep_simple_v2',STORE='items';
function isToday(){return document.querySelector('.tab.active')?.dataset.view==='today'}
function all(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onsuccess=()=>{const q=r.result.transaction(STORE).objectStore(STORE).getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error)};r.onerror=()=>rej(r.error)})}
async function reorder(){if(!isToday())return;const list=document.querySelector('#list');if(!list)return;const items=await all(),byId=new Map(items.map(i=>[String(i.id),i])),cards=[...list.querySelectorAll('.note')];if(cards.length<2)return;const time=c=>{const i=byId.get(String(c.dataset.itemId||''));return Number(i?.todayOrder||c.dataset.todayOrder||i?.createdAt||c.dataset.createdAt||0)};const sorted=[...cards].sort((a,b)=>time(b)-time(a));if(cards.every((c,i)=>c===sorted[i]))return;sorted.forEach(c=>list.appendChild(c))}
function settle(){[80,220,500].forEach(ms=>setTimeout(()=>reorder().catch(()=>{}),ms))}
document.addEventListener('click',e=>{if(e.target.closest('.tab[data-view="today"]'))settle();if(isToday()&&e.target.closest('.priority-level'))settle()},true);
document.addEventListener('jjongkeep:datachanged',settle);
window.addEventListener('pageshow',settle);
})();
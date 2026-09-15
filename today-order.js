(()=>{'use strict';
const DB='jjongkeep_simple_v2',STORE='items';
let running=false,queued=false;
function isToday(){return document.querySelector('.tab.active')?.dataset.view==='today'}
function all(){return new Promise((res,rej)=>{const r=indexedDB.open(DB,1);r.onsuccess=()=>{const q=r.result.transaction(STORE).objectStore(STORE).getAll();q.onsuccess=()=>res(q.result||[]);q.onerror=()=>rej(q.error)};r.onerror=()=>rej(r.error)})}
function score(i){if(Number.isFinite(Number(i.priorityScore)))return Math.max(10,Math.min(100,Math.round(Number(i.priorityScore)/10)*10));return i.priority==='top'?100:i.priority==='important'?70:50}
async function reorder(){if(!isToday())return;if(running){queued=true;return}running=true;try{const list=document.querySelector('#list');if(!list)return;const items=await all(),byId=new Map(items.map(i=>[i.id,i]));const cards=[...list.querySelectorAll('.note')];if(cards.length<2)return;const sorted=[...cards].sort((a,b)=>{const ai=byId.get(a.dataset.itemId),bi=byId.get(b.dataset.itemId);if(!ai&&!bi)return 0;if(!ai)return 1;if(!bi)return-1;const ap=!!ai.prioritySet,bp=!!bi.prioritySet;
// 중요도를 아직 정하지 않은 기록은 '오늘로 보낸 시각' 최신순으로 맨 위.
if(ap!==bp)return ap?1:-1;
// 중요도를 정한 뒤에는 중요도 순에 편입. 같은 단계는 최근 오늘로 보낸 기록 우선.
if(ap&&bp){const d=score(bi)-score(ai);if(d)return d}
return Number(bi.todayOrder||bi.createdAt||0)-Number(ai.todayOrder||ai.createdAt||0)});
if(cards.every((c,n)=>c===sorted[n]))return;
observer.disconnect();sorted.forEach(c=>list.appendChild(c));observer.observe(list,{childList:true,subtree:true});
}finally{running=false;if(queued){queued=false;requestAnimationFrame(reorder)}}}
function schedule(){requestAnimationFrame(()=>requestAnimationFrame(reorder))}
const observer=new MutationObserver(schedule);
function init(){const list=document.querySelector('#list');if(!list)return;observer.observe(list,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest('.tab,.priority-level,.universal-action,.today-undo'))setTimeout(schedule,60)},true);document.addEventListener('jjongkeep:datachanged',()=>setTimeout(schedule,30));schedule()}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
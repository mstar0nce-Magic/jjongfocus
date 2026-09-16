(()=>{'use strict';
const EVENT='jjongkeep:datachanged';let refreshTimer=0,refreshing=false,pending=false;
function emit(){document.dispatchEvent(new CustomEvent(EVENT,{detail:{source:'indexeddb'}}))}
function patchIndexedDB(){if(window.__damdaIdbPatched||typeof IDBObjectStore==='undefined')return;window.__damdaIdbPatched=true;const mark=Symbol('damdaMutation');['add','put','delete','clear'].forEach(name=>{const original=IDBObjectStore.prototype[name];if(typeof original!=='function')return;IDBObjectStore.prototype[name]=function(...args){const tx=this.transaction;if(tx&&!tx[mark]){tx[mark]=true;tx.addEventListener('complete',emit,{once:true})}return original.apply(this,args)}})}
function activeView(){return document.querySelector('.tab.active')?.dataset.view||'inbox'}
function requestRefresh(){clearTimeout(refreshTimer);refreshTimer=setTimeout(refresh,30)}
async function refresh(){if(refreshing){pending=true;return}refreshing=true;try{const view=activeView();const search=document.querySelector('#search');if(search)search.dispatchEvent(new Event('input',{bubbles:true}));if(view==='calendar')window.JjongCalendar?.render?.();await new Promise(r=>requestAnimationFrame(()=>r()));}finally{refreshing=false;if(pending){pending=false;requestRefresh()}}}
function init(){patchIndexedDB();document.addEventListener(EVENT,requestRefresh);window.DamdaData={changed:emit,refresh:requestRefresh};}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
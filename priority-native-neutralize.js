(()=>{'use strict';
function neutralize(root=document){
  root.querySelectorAll('button.priority-level').forEach(old=>{
    const el=document.createElement('span');
    el.className=old.className;
    el.textContent=old.textContent;
    el.setAttribute('role','button');
    el.setAttribute('tabindex','0');
    el.setAttribute('aria-label',`중요도 ${old.textContent}단계`);
    for(const a of old.attributes){
      if(a.name==='class'||a.name==='type')continue;
      el.setAttribute(a.name,a.value)
    }
    old.replaceWith(el)
  })
}
let raf=0;
function schedule(){if(raf)return;raf=requestAnimationFrame(()=>{raf=0;neutralize()})}
const list=document.querySelector('#list');
if(list)new MutationObserver(schedule).observe(list,{childList:true,subtree:true});
document.addEventListener('keydown',e=>{
  if(!e.target.matches?.('.priority-level'))return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();e.target.click()}
},true);
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',schedule):schedule();
})();
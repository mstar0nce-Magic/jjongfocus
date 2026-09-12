(()=>{'use strict';
const AUTH='jjongfocus_diary_auth_v1',DB='jjongfocus_diary_db_v1';
function addReset(){const locked=document.querySelector('#diaryLocked');if(!locked||document.querySelector('#recordResetBtn'))return false;const p=document.createElement('p');p.className='hint';p.style.marginTop='14px';p.textContent='비밀번호가 열리지 않으면 기록 영역만 초기화하고 새로 시작할 수 있어요.';const b=document.createElement('button');b.id='recordResetBtn';b.type='button';b.className='ghost-btn danger-text';b.style.marginTop='8px';b.textContent='비밀번호 초기화';b.onclick=()=>{
  const ok=confirm('기록 비밀번호를 초기화할까요?\n\n기존 암호화 기록과 사진은 삭제되고 복구할 수 없습니다. Inbox·오늘·NOW·완료 데이터는 그대로 유지됩니다.');
  if(!ok)return;
  localStorage.removeItem(AUTH);
  try{const req=indexedDB.deleteDatabase(DB);req.onsuccess=req.onerror=req.onblocked=()=>setTimeout(()=>location.reload(),120);}catch{location.reload()}
};
locked.appendChild(p);locked.appendChild(b);return true}
if(!addReset()){const mo=new MutationObserver(()=>{if(addReset())mo.disconnect()});mo.observe(document.documentElement,{childList:true,subtree:true});setTimeout(addReset,800)}
})();
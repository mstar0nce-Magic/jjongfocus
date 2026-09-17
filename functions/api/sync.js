const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});

async function googleUser(request){
  const auth=request.headers.get('authorization')||'';
  if(!auth.startsWith('Bearer '))return null;
  const r=await fetch('https://openidconnect.googleapis.com/v1/userinfo',{headers:{authorization:auth}});
  if(!r.ok)return null;
  const u=await r.json();
  return u?.sub?u:null;
}

function scopedId(sub,id){return sub+':'+String(id||'')}
function cleanRowId(sub,id){const p=sub+':';return String(id||'').startsWith(p)?String(id).slice(p.length):String(id||'')}

export async function onRequestGet({request,env}){
  const user=await googleUser(request);
  if(!user)return json({error:'unauthorized'},401);
  const prefix=user.sub+':%';
  const [records,categories]=await Promise.all([
    env.DB.prepare('SELECT id,data,updated_at,deleted,device_id FROM records WHERE id LIKE ?').bind(prefix).all(),
    env.DB.prepare('SELECT id,name,updated_at,deleted,device_id FROM categories WHERE id LIKE ?').bind(prefix).all()
  ]);
  return json({user:{sub:user.sub,email:user.email||''},records:(records.results||[]).map(r=>({...r,id:cleanRowId(user.sub,r.id)})),categories:(categories.results||[]).map(r=>({...r,id:cleanRowId(user.sub,r.id)}))});
}

export async function onRequestPost({request,env}){
  const user=await googleUser(request);
  if(!user)return json({error:'unauthorized'},401);
  let body;try{body=await request.json()}catch{return json({error:'invalid_json'},400)}
  const records=Array.isArray(body.records)?body.records:[],categories=Array.isArray(body.categories)?body.categories:[];
  if(records.length>1000||categories.length>500)return json({error:'too_many_items'},413);
  const statements=[];
  for(const r of records){
    if(!r?.id)continue;
    statements.push(env.DB.prepare('INSERT INTO records (id,data,updated_at,deleted,device_id) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data,updated_at=excluded.updated_at,deleted=excluded.deleted,device_id=excluded.device_id WHERE excluded.updated_at >= records.updated_at').bind(scopedId(user.sub,r.id),String(r.data||''),Number(r.updated_at)||0,r.deleted?1:0,String(r.device_id||'')));
  }
  for(const c of categories){
    if(!c?.id)continue;
    statements.push(env.DB.prepare('INSERT INTO categories (id,name,updated_at,deleted,device_id) VALUES (?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at,deleted=excluded.deleted,device_id=excluded.device_id WHERE excluded.updated_at >= categories.updated_at').bind(scopedId(user.sub,c.id),String(c.name||''),Number(c.updated_at)||0,c.deleted?1:0,String(c.device_id||'')));
  }
  if(statements.length)await env.DB.batch(statements);
  return json({ok:true,written:statements.length});
}

export async function onRequest(context){
  const response=await context.next();
  const type=response.headers.get('content-type')||'';
  if(!type.includes('text/html'))return response;
  const text=await response.text();
  if(text.includes('/damda-sync.js'))return new Response(text,response);
  const injected=text.replace('</body>','<script src="https://accounts.google.com/gsi/client" async defer></script><script src="/damda-sync.js?v=1823"></script></body>');
  return new Response(injected,{status:response.status,statusText:response.statusText,headers:response.headers});
}

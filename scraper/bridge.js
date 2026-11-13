// Legacy injection transport: messages never pass through the portal's page scripts.
(()=>{
 if(globalThis.__betterSolarBridge)return;
 const api=globalThis.browser||globalThis.chrome;
 const allowed=new Set(['probe','navigate','discover','submit','submitted','scan','reminders']);
 const trusted=sender=>{
  if(sender?.id&&sender.id!==api.runtime.id)return false;
  if(sender?.url||sender?.origin){try{const source=new URL(sender.url||sender.origin),own=new URL(api.runtime.getURL(''));return source.protocol===own.protocol&&source.host===own.host&&(sender.url?source.href.startsWith(own.href):!!own.host);}catch{return false;}}
  return !!sender?.id&&sender.id===api.runtime.id;
 };
 api.runtime.onMessage.addListener((message,sender,respond)=>{
  if(message?.type!=='BETTER_SOLAR_CALL'||!allowed.has(message.method))return;
  if(!trusted(sender)){respond({error:'The browser omitted a verifiable extension sender. Cached records were kept.'});return;}
  Promise.resolve().then(()=>message.method==='probe'?{documentToken:(globalThis.__betterSolarDocumentToken??=globalThis.crypto?.randomUUID?.()||String(performance.timeOrigin)),timeOrigin:performance.timeOrigin,readyState:document.readyState,url:location.href,parserReady:!!globalThis.BetterSolarDOM}:globalThis.BetterSolarDOM[message.method](...(message.args||[]))).then(value=>respond({value})).catch(error=>respond({error:error.message}));return true;
 });
 globalThis.__betterSolarBridge=true;
})();

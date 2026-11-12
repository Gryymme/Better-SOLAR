// Legacy injection transport: messages never pass through the portal's page scripts.
(()=>{
 if(globalThis.__betterSolarBridge)return;
 const api=globalThis.browser||globalThis.chrome;
 const allowed=new Set(['discover','submit','submitted','scan','reminders']);
 api.runtime.onMessage.addListener((message,sender,respond)=>{
  if(sender.id!==api.runtime.id||message?.type!=='BETTER_SOLAR_CALL'||!allowed.has(message.method))return;
  Promise.resolve().then(()=>globalThis.BetterSolarDOM[message.method](...(message.args||[]))).then(value=>respond({value})).catch(error=>respond({error:error.message}));return true;
 });
 globalThis.__betterSolarBridge=true;
})();

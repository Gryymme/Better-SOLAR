// Normalize Promise-based browser.* and callback/Promise chrome.* without a remote polyfill.
const syncMethods=new Set(['runtime.getURL','runtime.getManifest','runtime.connect']);
export function createExtensionAPI(resolve=()=>globalThis.browser?.runtime?{api:globalThis.browser,promises:true}:{api:globalThis.chrome,promises:false},{timeout=15000}={}){
 const proxy=path=>new Proxy({}, {get(_target,key){
   const {api}=resolve(),parts=[...path,key];let parent=api;
   for(const part of path)parent=parent?.[part];const value=parent?.[key],name=parts.join('.');
   if(value===undefined||value===null)return value;
   if(typeof value==='object'){if(typeof value.addListener==='function')return value;return proxy(parts);}
   if(typeof value!=='function')return value;
   if(syncMethods.has(name))return value.bind(parent);
   return (...args)=>new Promise((accept,reject)=>{
     let done=false;const category=name==='tabs.sendMessage'?args[1]?.args?.[0]:args[0]?.args?.[1]?.[0];const longCall=(name==='runtime.sendMessage'&&['IMPORT_DATA','DELETE_DATA'].includes(args[0]?.type))||category!=='User Profile'&&(name==='tabs.sendMessage'?['scan','reminders'].includes(args[1]?.method):name==='scripting.executeScript'&&['scan','reminders'].includes(args[0]?.args?.[0]));const limit=name==='tabs.sendMessage'&&args[1]?.method==='probe'?Math.min(timeout,3000):longCall?Math.max(timeout,120000):timeout;
     const timer=setTimeout(()=>finish(Error(`${name} did not respond. Return to Better SOLAR and retry collection. Cached records were kept.`)),limit);
     const finish=(error,result)=>{if(done)return;done=true;clearTimeout(timer);error?reject(error):accept(result);};
     const callback=result=>{const error=api.runtime?.lastError;finish(error?Error(error.message||String(error)):null,result);};
     const invoke=withCallback=>{try{
       const result=value.apply(parent,withCallback?[...args,callback]:args);
       if(result&&typeof result.then==='function')result.then(value=>finish(null,value),error=>{
         if(withCallback&&error?.name==='TypeError'&&/argument|callback|signature|parameter/i.test(error.message))invoke(false);else finish(error);
       });
       else if(result!==undefined||name==='alarms.create')finish(null,result);
     }catch(error){if(withCallback&&error?.name==='TypeError'&&/argument|callback|signature|parameter/i.test(error.message))invoke(false);else finish(error);}};
     // Mixed implementations can expose callbacks even under browser.*. Calling
     // once with a callback also accepts Promise/direct results. Only a rejected
     // argument signature is retried, so successful mutations are never repeated.
     invoke(true);
   });
 }});
 return proxy([]);
}
export function extensionSender(api,sender={}){
 if(sender.id&&sender.id!==api.runtime?.id)return false;
 if(sender.url||sender.origin){try{const actual=new URL(sender.url||sender.origin),own=new URL(api.runtime.getURL(''));return actual.protocol===own.protocol&&actual.host===own.host&&(sender.url?actual.href.startsWith(own.href):!!own.host);}catch{return false;}}
 return !!sender.id&&sender.id===api.runtime?.id;
}
export const extension=createExtensionAPI();
export const mobileBrowser=()=>/Android|iPhone|iPad|iPod|Mobile/i.test(globalThis.navigator?.userAgent||'')||!!(globalThis.navigator?.maxTouchPoints>1&&(/Mac/i.test(globalThis.navigator?.platform||'')||globalThis.KAGI));
export async function launchApplication(){
 const url=extension.runtime.getURL('app.html');
 if(!mobileBrowser()&&extension.windows?.create){try{return await extension.windows.create({url,type:'normal',width:1440,height:950});}catch{}}
 if(extension.tabs?.create)return extension.tabs.create({url,active:true});
 throw Error('This browser cannot open an extension tab. Open Better SOLAR from its extension menu.');
}
// Mobile engines can suspend a collector or omit storage-change events.
// A visible extension view also resumes/polls its already-persisted job.
export function watchProgress(listener){
 const event=extension.storage?.onChanged;let previous='',stopped=false;
 const changed=(changes,area)=>{if(area==='local'&&changes.scrapeProgress){previous=JSON.stringify(changes.scrapeProgress.newValue||{});listener(changes,area);}};
 try{event?.addListener(changed);}catch{}
 const poll=async()=>{if(stopped||globalThis.document?.visibilityState==='hidden')return;try{const response=await extension.runtime.sendMessage({type:'PROGRESS'});if(!response?.ok)return;const value=response.scrapeProgress||{},next=JSON.stringify(value);if(next!==previous){previous=next;changed({scrapeProgress:{newValue:value}},'local');}}catch{}};
 const timer=(mobileBrowser()||!event)?setInterval(()=>void poll(),2000):null;
 const visible=()=>{if(globalThis.document?.visibilityState!=='hidden')void poll();};
 globalThis.document?.addEventListener?.('visibilitychange',visible);void poll();
 const stop=()=>{stopped=true;if(timer)clearInterval(timer);try{event?.removeListener(changed);}catch{}globalThis.document?.removeEventListener?.('visibilitychange',visible);};
 globalThis.addEventListener?.('pagehide',stop,{once:true});return stop;
}

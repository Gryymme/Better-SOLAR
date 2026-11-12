// Normalize Promise-based browser.* and callback/Promise chrome.* without a remote polyfill.
const syncMethods=new Set(['runtime.getURL','runtime.getManifest','runtime.connect']);
export function createExtensionAPI(resolve=()=>globalThis.browser?.runtime?{api:globalThis.browser,promises:true}:{api:globalThis.chrome,promises:false}){
 const proxy=path=>new Proxy({}, {get(_target,key){
   const {api,promises}=resolve(),parts=[...path,key];let parent=api;
   for(const part of path)parent=parent?.[part];const value=parent?.[key];
   if(value===undefined||value===null)return value;
   if(typeof value==='object'){if(typeof value.addListener==='function')return value;return proxy(parts);}
   if(typeof value!=='function')return value;
   if(syncMethods.has(parts.join('.')))return value.bind(parent);
   return (...args)=>new Promise((accept,reject)=>{
     const callback=result=>{const error=api.runtime?.lastError;error?reject(Error(error.message||String(error))):accept(result);};
     try{const result=value.apply(parent,promises?args:[...args,callback]);
       if(result&&typeof result.then==='function')result.then(accept,reject);
       else if(promises||parts.join('.')==='alarms.create')accept(result);
     }catch(error){reject(error);}
   });
 }});
 return proxy([]);
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

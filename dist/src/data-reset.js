import {clearAllData} from './db.js';
const key='betterSolarDataReset';
let channel;
const callbacks=new Set();let latest='';
function notify(value){if(!value||value===latest)return;latest=value;try{sessionStorage.removeItem('creator');}catch{}for(const callback of callbacks)callback(value);}
export function listenForDataReset(callback){
 callbacks.add(callback);
 if(globalThis.chrome?.storage?.onChanged&&!listenForDataReset.installed){
   chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.dataResetAt)notify(changes.dataResetAt.newValue);});
   listenForDataReset.installed=true;
 }
 if(typeof BroadcastChannel==='function'&&!channel){channel=new BroadcastChannel('better-solar-data');channel.onmessage=e=>{if(e.data?.type==='reset')notify(e.data.id);};}
 if(!listenForDataReset.storageListener&&typeof addEventListener==='function'){addEventListener('storage',e=>{if(e.key===key)notify(e.newValue);});listenForDataReset.storageListener=true;}
 return ()=>callbacks.delete(callback);
}
export async function deleteLocalData(){
 let id;
 if(globalThis.chrome?.runtime?.id){const result=await chrome.runtime.sendMessage({type:'DELETE_DATA'});if(!result?.ok)throw Error(result?.error||'Data deletion could not finish. Retry while the extension is enabled.');id=result.resetAt;}
 else{id=await clearAllData();localStorage.setItem(key,id);}
 notify(id);channel?.postMessage({type:'reset',id});return id;
}

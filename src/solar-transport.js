import {extension as chrome} from './webextension.js';
let legacy=false;
const modern=()=>!legacy&&chrome.scripting?.executeScript&&chrome.runtime.getManifest?.().manifest_version!==2;
export async function documentInfo(tabId){if(modern())return null;const result=await chrome.tabs.sendMessage(tabId,{type:'BETTER_SOLAR_CALL',method:'probe',args:[]});if(result?.error)throw Error(result.error);return result?.value;}
export async function injectParser(tabId){
 if(modern()){try{return await chrome.scripting.executeScript({target:{tabId},files:['scraper/dom.js']});}catch(error){if(!chrome.tabs?.executeScript)throw error;legacy=true;}}
 // The mobile manifest loads these files declaratively, avoiding unreliable
 // executeScript callbacks on hosts where automatic content scripts work.
 try{const info=await documentInfo(tabId);if(info?.parserReady&&info.readyState==='complete')return;}catch{}
 if(!chrome.tabs?.executeScript)throw Error('The SOLAR content script is unavailable. Allow Better SOLAR on SOLAR, reload that tab, and retry. This browser does not provide a fallback script-injection API. Cached records are unchanged.');
 await chrome.tabs.executeScript(tabId,{file:'scraper/dom.js',runAt:'document_idle'});
 await chrome.tabs.executeScript(tabId,{file:'scraper/bridge.js',runAt:'document_idle'});
}
export async function pageToken(tabId){
 if(!modern()){const info=await documentInfo(tabId);return info?.documentToken??info?.timeOrigin;}
 const results=await chrome.scripting.executeScript({target:{tabId},func:()=>performance.timeOrigin});
 return results?.[0]?.result??results?.[0];
}
export async function pageCall(tabId,method,args=[]){
 let result;
 if(modern()){const r=await chrome.scripting.executeScript({target:{tabId},func:async(m,a)=>{try{return {value:await globalThis.BetterSolarDOM[m](...a)};}catch(e){return {error:e.message};}},args:[method,args]});result=r?.[0]?.result;}
 else result=await chrome.tabs.sendMessage(tabId,{type:'BETTER_SOLAR_CALL',method,args});
 if(result?.error)throw Error(result.error);
 if(!result||!Object.hasOwn(result,'value'))throw Error('Could not read the SOLAR document. Cached records are unchanged.');
 return result.value;
}

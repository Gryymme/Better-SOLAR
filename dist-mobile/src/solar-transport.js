import {extension as chrome} from './webextension.js';
let legacy=false;
const modern=()=>!legacy&&chrome.scripting?.executeScript&&chrome.runtime.getManifest?.().manifest_version!==2;
export async function injectParser(tabId){
 if(modern()){try{return await chrome.scripting.executeScript({target:{tabId},files:['scraper/dom.js']});}catch(error){if(!chrome.tabs?.executeScript)throw error;legacy=true;}}
 if(!chrome.tabs?.executeScript)throw Error('This browser does not provide the script-injection API needed to collect SOLAR data. Cached records are unchanged.');
 await chrome.tabs.executeScript(tabId,{file:'scraper/dom.js',runAt:'document_idle'});
 await chrome.tabs.executeScript(tabId,{file:'scraper/bridge.js',runAt:'document_idle'});
}
export async function pageToken(tabId){
 const results=modern()?await chrome.scripting.executeScript({target:{tabId},func:()=>performance.timeOrigin}):await chrome.tabs.executeScript(tabId,{code:'performance.timeOrigin',runAt:'document_idle'});
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

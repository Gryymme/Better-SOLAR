import {confirmExternalNavigation,toast} from './ui.js';
const KEY='confirmExternalLinks';let ask=true,initialized=false,pending=false;
const extensionStorage=()=>globalThis.chrome?.storage?.local;
export const shouldConfirmExternalLinks=()=>ask;
function applyPreference(value){ask=value!==false&&value!=='false';if(typeof document!=='undefined')document.querySelectorAll('[data-external-confirm]').forEach(input=>input.checked=ask);}
export async function setExternalLinkConfirmation(value){
 const previous=ask;applyPreference(value);
 try{if(extensionStorage())await chrome.storage.local.set({[KEY]:ask});else localStorage.setItem(KEY,String(ask));}
 catch(error){applyPreference(previous);throw error;}
}
export function externalDestination(href,base){
 try{const url=new URL(href,base),current=new URL(base);return ['https:','http:'].includes(url.protocol)&&url.origin!==current.origin?url:null;}catch{return null;}
}
function openWebsite(url){
 if(globalThis.chrome?.runtime?.id&&chrome.tabs?.create)return chrome.tabs.create({url:url.href,active:true});
 const opened=window.open(url.href,'_blank','noopener,noreferrer');
 // noopener can intentionally return null even when a new tab was opened.
 return opened;
}
export async function visitExternalWebsite(url,{prompt=confirmExternalNavigation,open=openWebsite}={}){
 if(pending)return;pending=true;
 try{
   if(!ask){await open(url);return;}
   await prompt(url,remember=>{
     // Open synchronously from Proceed so preview browsers retain user activation.
     const result=open(url);
     if(remember)void setExternalLinkConfirmation(false).catch(error=>toast(`The website opened, but the preference could not be saved: ${error.message}`));
     return result;
   });
 }finally{pending=false;}
}
export async function initializeExternalLinks(){
 if(initialized)return;initialized=true;
 try{const value=extensionStorage()?(await chrome.storage.local.get(KEY))[KEY]:localStorage.getItem(KEY);applyPreference(value);}catch{applyPreference(true);}
 if(globalThis.chrome?.storage?.onChanged)chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes[KEY])applyPreference(changes[KEY].newValue);});
 else addEventListener('storage',event=>{if(event.key===KEY)applyPreference(event.newValue);});
 const intercept=event=>{
   if(event.defaultPrevented||(event.type==='auxclick'&&event.button!==1))return;
   const anchor=event.target.closest?.('a[href]');if(!anchor)return;
   if(/^(javascript|data|vbscript):/i.test((anchor.getAttribute('href')||'').trim())){event.preventDefault();event.stopImmediatePropagation();toast('This link does not point to a website.');return;}
   const base=location.href,url=externalDestination(anchor.href||anchor.getAttribute('href'),base);if(!url)return;
   event.preventDefault();event.stopImmediatePropagation();void visitExternalWebsite(url).catch(error=>toast(error.message));
 };
 document.addEventListener('click',intercept,true);document.addEventListener('auxclick',intercept,true);
}

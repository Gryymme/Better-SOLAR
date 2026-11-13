import {extension as chrome} from './webextension.js';
import {documentInfo,pageToken,pageCall} from './solar-transport.js';
export const SOLAR_ORIGIN='https://solar.feualabang.edu.ph';
export const SOLAR_PAGES=[['User Profile','/user/profile'],['Curriculum','/program/curriculum'],['Courses Offered','/course/offerings'],['Schedule and Assessment','/student/saf'],['Grades','/student/grades'],['Enrollment Reminders','/enrollment/reminders']];
export function solarDestination(value){
 const url=new URL(value,SOLAR_ORIGIN);
 if(url.origin!==SOLAR_ORIGIN||url.username||url.password||!/^\/(?:user\/profile|program\/curriculum|course\/offerings|student\/(?:saf|grades|balance(?:\/\d+-\d{8})?)|enrollment\/reminders)\/?$/.test(url.pathname))throw Error('Refusing a collector navigation outside the supported SOLAR pages.');
 return url.href;
}
const samePage=(actual,target)=>{try{const url=new URL(actual),expected=new URL(target);return url.origin===expected.origin&&url.pathname.replace(/\/$/,'')===expected.pathname.replace(/\/$/,'')&&url.search===expected.search;}catch{return false;}};
async function readInfo(id){
 const info=await documentInfo(id);if(info)return {...info,token:info.documentToken??info.timeOrigin};
 const tab=await chrome.tabs.get(id);return {url:tab.url,readyState:tab.status==='complete'?'complete':'loading',token:tab.status==='complete'?await pageToken(id):null};
}
export async function navigateSolar(tabId,value,{mobile=false,check=()=>{},onReplace=async()=>{},services={}}={}){
 const target=solarDestination(value),api={read:readInfo,tabURL:(id,url)=>chrome.tabs.update(id,{url,active:mobile}),documentURL:(id,url)=>pageCall(id,'navigate',[url]),create:url=>chrome.tabs.create({url,active:mobile}),close:id=>chrome.tabs.remove(id),pause:ms=>new Promise(resolve=>setTimeout(resolve,ms)),now:()=>Date.now(),...services};
 check();let before;try{before=await api.read(tabId);}catch{}
 let stage=mobile&&before?.readyState==='complete'?'document':'tab',started=api.now(),deadline=started+30000,lastError='',replaced=false;
 const request=kind=>{try{const promise=kind==='document'?api.documentURL(tabId,target):api.tabURL(tabId,target);void Promise.resolve(promise).catch(error=>lastError=error.message);}catch(error){lastError=error.message;}};
 // Observe actual document navigation rather than waiting forever for a host's
 // tabs.update callback or believing that its success means the URL changed.
 request(stage);
 while(api.now()<deadline){
  check();await api.pause(200);check();let info;
  try{info=await api.read(tabId);}catch(error){lastError=error.message;}
  check();
  if(info?.readyState==='complete'){
   if(/\/(?:login|signin)(?:\/|$)/i.test(new URL(info.url,SOLAR_ORIGIN).pathname))throw Error('SOLAR session expired. Sign in to SOLAR in this browser and retry.');
   if(samePage(info.url,target)&&(replaced||!before?.token||info.token!==before.token))return tabId;
  }
  const elapsed=api.now()-started;
  if(stage==='tab'&&elapsed>=2500){stage='document';request(stage);}
  if(elapsed>=5500&&!replaced){
   check();const old=tabId,replacement=await api.create(target);try{check();}catch(error){if(Number.isInteger(replacement?.id))try{await api.close(replacement.id);}catch{}throw error;}if(!Number.isInteger(replacement?.id))throw Error('This browser did not return a collector tab ID. Use desktop export and mobile import in Settings.');
   tabId=replacement.id;await onReplace(tabId);check();replaced=true;before=null;deadline=api.now()+25000;
   try{await api.close(old);}catch{}
  }
 }
 throw Error('SOLAR did not navigate to the requested page. Allow SOLAR site access, or use desktop export and mobile import in Settings.'+(lastError?' '+lastError:''));
}

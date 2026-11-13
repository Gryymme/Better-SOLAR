import {validateTransfer} from './data-transfer.js';
import {importRecordSnapshot} from './db.js';
import {extension as chrome,mobileBrowser,launchApplication,extensionSender} from './webextension.js';
import {navigateSolar} from './solar-navigation.js';
import {injectParser,pageCall,documentInfo} from './solar-transport.js';
import {getMeta,setMeta,saveSuccess,markFailure,clearAllData} from './db.js';
import {termKey} from './core.js';
const ORIGIN='https://solar.feualabang.edu.ph';
const AREAS=[['User Profile','/user/profile'],['Curriculum','/program/curriculum'],['Course Offerings','/course/offerings'],['Assessment','/student/saf'],['Grades','/student/grades'],['Enrollment Reminders','/enrollment/reminders']];
let pumping=false,deleting=false,activePump=null,commandQueue=Promise.resolve();
const checkCollection=()=>{if(deleting)throw Error('Collection stopped for local data deletion.');};
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function unit(category,url,extra={}){return {id:crypto.randomUUID(),category,url:ORIGIN+url,kind:'collect',state:'pending',...extra};}
async function publish(job){job.updatedAt=new Date().toISOString();await setMeta('scrapeJob',job);await chrome.storage.local.set({scrapeProgress:{state:job.state,completed:job.tasks.filter(t=>t.state==='success').length,failed:job.tasks.filter(t=>t.state==='error').length,total:job.tasks.length,current:job.current||'',updatedAt:job.updatedAt,errors:job.tasks.filter(t=>t.state==='error').map(t=>({label:`${t.category} ${t.term||''} ${t.year||''}`.trim(),error:t.error}))}});}
async function start(retry=false){checkCollection();const old=await getMeta('scrapeJob');if(old?.state==='running'){void pump();return {ok:true,running:true};}let tasks;
 if(retry&&old){tasks=old.tasks.filter(t=>t.state==='error').map(t=>({...t,state:'pending',error:undefined}));if(!tasks.length)return {ok:true,message:'No failed work to retry.'};tasks=[unit('User Profile','/user/profile'),...tasks.filter(t=>t.category!=='User Profile')];}
 else tasks=AREAS.map(([c,p])=>unit(c,p,{kind:['User Profile','Curriculum','Enrollment Reminders'].includes(c)?'collect':'discover'}));
 const job={id:crypto.randomUUID(),state:'running',tasks,startedAt:new Date().toISOString(),balanceLinks:retry?old?.balanceLinks||[]:[],balanceFallback:retry?old?.balanceFallback||[]:[],balanceAdded:retry?true:false,tabId:mobileBrowser()?old?.tabId||null:null};await publish(job);try{if(chrome.alarms?.create)await chrome.alarms.create('better-solar-pump',{periodInMinutes:1});}catch{/* Foreground/background-page timers still advance the durable queue. */}void pump();return {ok:true};}
async function tab(job){checkCollection();try{if(job.tabId)return await chrome.tabs.get(job.tabId);}catch{}const t=await chrome.tabs.create({url:ORIGIN+'/user/profile',active:mobileBrowser()});if(deleting){try{await chrome.tabs.remove(t.id);}catch{}checkCollection();}job.tabId=t.id;await publish(job);return t;}
async function navigate(job,id,url){const next=await navigateSolar(id,url,{mobile:mobileBrowser(),check:checkCollection,onReplace:async tabId=>{job.tabId=tabId;await publish(job);}});await injectParser(next);return {id:next};}
const call=pageCall;
async function choose(id,selection,autoTerm=''){const state=await call(id,'submit',[selection,autoTerm]);const deadline=Date.now()+25000;let last='';while(Date.now()<deadline){checkCollection();await pause(250);try{const t=await chrome.tabs.get(id),info=await documentInfo(id).catch(()=>null);if(info?info.readyState!=='complete':t.status!=='complete')continue;await injectParser(id);const check=await call(id,'submitted',[state,selection]);if(check.error)throw Error(check.error);if(check.ready){await pause(350);return;}}catch(e){last=e.message;if(/session expired|outside|Selected term/.test(last))throw e;}}throw Error('No verified response to this term/year submission. Stale results were not saved.'+(last?' '+last:''));}
function append(job,task){if(!job.tasks.some(t=>t.category===task.category&&t.term===task.term&&t.year===task.year&&t.kind===task.kind))job.tasks.push(task);}
function learn(job,d){for(const h of d.links||[]){const u=new URL(h);const m=u.pathname.match(/^\/student\/balance\/(\d+)-(\d{8})\/?$/);if(m&&!job.balanceLinks.some(v=>v.term===m[1]&&v.year===m[2]))job.balanceLinks.push({url:u.origin+u.pathname,term:m[1],year:m[2]});}
 for(const s of d.selectors||[])for(const o of s.options){const p=termKey(o.value);if(p&&!job.balanceFallback.some(v=>v.key===p.key))job.balanceFallback.push(p);}}
function discoverTasks(job,task,d){if(task.category==='Course Offerings'){
 const terms=d.selectors.find(s=>s.id==='term'||s.name==='term'),years=d.selectors.find(s=>s.id==='school_year'||s.name==='school_year');if(!terms?.options.length||!years?.options.length)throw Error('Course Offerings selectors are missing or empty.');
 // Each year is discovered separately so dependent term options come from its live response.
 for(const y of years.options)append(job,{...unit(task.category,'/course/offerings'),kind:'discover-year',year:y.value,selection:{[years.id||years.name]:y.value},termSelector:terms.id||terms.name});
 }else {const s=d.selectors.find(s=>s.id==='school_year'||s.name==='school_year');if(!s)throw Error('Combined term / school-year selector is missing.');const options=s.options.filter(o=>termKey(o.value));if(!options.length)throw Error('No valid term/year choices were returned.');for(const o of options){const p=termKey(o.value);append(job,{...unit(task.category,new URL(task.url).pathname),term:p.term,year:p.year,selection:{[s.id||s.name]:o.value},selectionLabel:o.label});}}
}
async function addBalances(job){job.balanceAdded=true;
 // Visit the live balance route to discover its own links/options, then use SAF/grade
 // history only as explicit probes if the portal exposes no separate balance selector.
 const sample=job.balanceLinks[0]?.url||(job.balanceFallback[0]?`${ORIGIN}/student/balance/${job.balanceFallback[0].key}`:ORIGIN+'/student/balance');append(job,unit('Account Balance Summary',new URL(sample).pathname,{kind:'discover-balance'}));}
async function handle(job,t){checkCollection();if(t.category!=='User Profile'&&!job.owner)throw Error('Profile identity was not verified. Sign in to SOLAR and retry failed work.');t.owner=job.owner||'';const label=`${t.category}${t.year?' · Term '+(t.term||'discovery')+' · '+t.year:''}`;job.current=label+' · Opening SOLAR tab';await publish(job);let browserTab=await tab(job);job.current=label+' · Loading SOLAR page';await publish(job);browserTab=await navigate(job,browserTab.id,t.url);job.current=label+' · Reading SOLAR data';await publish(job);
 if(t.kind==='discover-balance'){
 let d;try{d=await call(browserTab.id,'discover');learn(job,d);}catch(error){if(/session expired/.test(error.message))throw error;}
 const own=[];for(const s of d?.selectors||[])for(const o of s.options){const p=termKey(o.value);if(p)own.push({...p,url:`${ORIGIN}/student/balance/${p.key}`});}const bt=d?.selectors?.find(s=>s.id==='term'||s.name==='term'),by=d?.selectors?.find(s=>s.id==='school_year'||s.name==='school_year');if(bt&&by&&!by.options.some(o=>termKey(o.value)))for(const t of bt.options)for(const y of by.options)own.push({term:t.value,year:y.value,url:`${ORIGIN}/student/balance/${t.value}-${y.value}`});
 const candidates=[...job.balanceLinks,...own];const list=candidates.length?candidates:job.balanceFallback.map(p=>({...p,url:`${ORIGIN}/student/balance/${p.key}`}));
 if(!list.length)throw Error('No balance terms could be discovered. Open SOLAR Balance Summary once so its links are available, then retry.');for(const p of list)append(job,{...unit(t.category,new URL(p.url).pathname),term:p.term,year:p.year,discovery:candidates.length?'balance navigation':'enrollment-history probe'});return;
 }
 if(t.kind==='discover'){const d=await call(browserTab.id,'discover');learn(job,d);discoverTasks(job,t,d);return;}
 if(t.kind==='discover-year'){
 // Use a normal submission to obtain the term options actually supported by this year.
 const d0=await call(browserTab.id,'discover');const ts=d0.selectors.find(s=>s.id===t.termSelector||s.name===t.termSelector);if(!ts?.options.length)throw Error('Term options missing for this school year.');
 await choose(browserTab.id,t.selection,t.termSelector);const d=await call(browserTab.id,'discover');learn(job,d);const terms=d.selectors.find(s=>s.id===t.termSelector||s.name===t.termSelector);if(!terms?.options.length)throw Error('No supported terms for '+t.year);for(const o of terms.options)append(job,{...unit(t.category,'/course/offerings'),term:o.value,year:t.year,selection:{...t.selection,[t.termSelector]:o.value}});return;
 }
 if(t.selection&&Object.keys(t.selection).length)await choose(browserTab.id,t.selection);
 let out,lastError;const deadline=Date.now()+(t.category==='Assessment'?20000:8000);while(Date.now()<deadline){checkCollection();try{out=await call(browserTab.id,t.category==='Enrollment Reminders'?'reminders':'scan',[t.category]);break;}catch(error){lastError=error;if(/session expired/.test(error.message))throw error;await pause(400);}}if(!out)throw lastError||Error('SOLAR data did not become available.');if(out.coverage?.complete!==true)throw Error('The full SOLAR dataset could not be verified. Previous records were kept.');learn(job,out.discovery);if(t.category==='Account Balance Summary'&&!new URL(out.discovery.url).pathname.replace(/\/$/,'').endsWith('/'+t.term+'-'+t.year))throw Error('Balance response URL does not match the requested term/year. No data was replaced.');if(t.category==='User Profile'){job.owner=out.data.values['Student Number'];t.owner=job.owner;await setMeta('activeOwner',job.owner);}
 // Summary term/year must agree with requested context if the portal supplies it.
 if(t.category==='Assessment'&&out.data.summary){const s=out.data.summary,term=s.Term?.match(/\d+/)?.[0],year=s['School Year']?.replace(/\D/g,'');if((term&&term!==t.term)||(year&&year!==t.year))throw Error('SAF response term/year does not match the submitted selection. No data was replaced.');}
 checkCollection();const source=new URL(out.discovery.url);await saveSuccess(t,out.data,source.origin+source.pathname,out.coverage);
}
function pump(){if(activePump||deleting)return activePump;activePump=runPump().finally(()=>{activePump=null;});return activePump;}
async function runPump(){if(pumping||deleting)return;pumping=true;try{let job=await getMeta('scrapeJob');if(!job||job.state!=='running')return;
 // A terminated worker's in-flight task can safely be repeated: stable keys upsert.
 job.tasks.filter(t=>t.state==='working').forEach(t=>t.state='pending');const next=job.tasks.find(t=>t.state==='pending');
 if(!next){if(!job.balanceAdded){await addBalances(job);await publish(job);return;}job.state=job.tasks.some(t=>t.state==='error')?'partial':'complete';job.current='';if(!(mobileBrowser()&&job.state==='partial')){try{if(job.tabId)await chrome.tabs.remove(job.tabId);}catch{}job.tabId=null;}await publish(job);try{if(chrome.alarms?.clear)await chrome.alarms.clear('better-solar-pump');}catch{}return;}
 next.state='working';job.current=`${next.category}${next.year?' · Term '+(next.term||'discovery')+' · '+next.year:''}`;await publish(job);
 try{await handle(job,next);next.state='success';delete next.error;}catch(e){if(deleting)return;next.state='error';next.error=e.message;if(next.kind==='collect')await markFailure(next,e.message);}
 if(!deleting)await publish(job);
 }catch(e){if(!deleting)await chrome.storage.local.set({scrapeProgress:{state:'error',current:e.message,errors:[{label:'Collector',error:e.message}]}});}finally{pumping=false;const j=await getMeta('scrapeJob').catch(()=>null);if(!deleting&&j?.state==='running')setTimeout(()=>void pump(),50);}}
try{chrome.alarms?.onAlarm?.addListener(a=>{if(a.name==='better-solar-pump')void pump();});}catch{}
try{chrome.runtime.onStartup?.addListener(()=>void pump());}catch{}
async function eraseData(){
 deleting=true;
 try{
   try{if(chrome.alarms?.clear)await chrome.alarms.clear('better-solar-pump');}catch{}
   const job=await getMeta('scrapeJob');
   if(job?.tabId)try{await chrome.tabs.remove(job.tabId);}catch{}
   // The active task is stopped and fully drained before clearing storage.
   if(activePump)await activePump;
   const resetAt=await clearAllData();
   const saved=await chrome.storage.local.get(null),keys=Object.keys(saved).filter(key=>!['theme','confirmExternalLinks'].includes(key));
   if(keys.length)await chrome.storage.local.remove(keys);
   await chrome.storage.local.set({dataResetAt:resetAt});
   return {resetAt};
 }finally{deleting=false;}
}
async function importData(input){
 const bundle=validateTransfer(input);deleting=true;
 try{
  try{if(chrome.alarms?.clear)await chrome.alarms.clear('better-solar-pump');}catch{}
  const job=await getMeta('scrapeJob');if(job?.tabId)try{await chrome.tabs.remove(job.tabId);}catch{}
  if(activePump)await activePump;
  if(job){job.state='stopped';job.current='';job.tabId=null;await setMeta('scrapeJob',job);}
  const result=await importRecordSnapshot(bundle);
  await chrome.storage.local.set({scrapeProgress:{state:'imported',importId:result.importId,updatedAt:new Date().toISOString(),completed:0,total:0,errors:[]},dataImportedAt:result.importId});
  return result;
 }finally{deleting=false;}
}
chrome.runtime.onMessage.addListener((msg,sender,respond)=>{
 if(!extensionSender(chrome,sender)){respond({ok:false,error:'The browser did not provide a verifiable extension caller. Reopen Better SOLAR from its extension menu.'});return;}
 const actions={START:()=>start(false),RETRY:()=>start(true),DELETE_DATA:eraseData,IMPORT_DATA:()=>importData(msg.bundle),LAUNCH:launchApplication,PROGRESS:()=>{void pump();return chrome.storage.local.get('scrapeProgress');}};
 if(!actions[msg.type])return;
 // Serialize control commands so a concurrent Start cannot race with deletion.
 const work=['START','RETRY','DELETE_DATA','IMPORT_DATA'].includes(msg.type)?commandQueue.then(actions[msg.type]):actions[msg.type]();
 if(['START','RETRY','DELETE_DATA','IMPORT_DATA'].includes(msg.type))commandQueue=work.catch(()=>{});
 work.then(value=>respond({ok:true,...value})).catch(error=>respond({ok:false,error:error.message}));return true;
});

// Background pages on mobile also resume a persisted queue when reloaded.
void pump();

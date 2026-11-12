import {CATEGORIES} from './core.js';
const NAME='better-solar-local', VERSION=1;
let opened;
function db(){return opened??=new Promise((resolve,reject)=>{const r=indexedDB.open(NAME,VERSION);r.onupgradeneeded=()=>{const d=r.result;const s=d.createObjectStore('records',{keyPath:'id'});s.createIndex('category','category');d.createObjectStore('meta');};r.onsuccess=()=>resolve(r.result);r.onerror=()=>{opened=null;reject(r.error);};});}
async function run(store,mode,fn){const d=await db();return new Promise((resolve,reject)=>{const tx=d.transaction(store,mode),req=fn(tx.objectStore(store));let result;req.onsuccess=()=>result=req.result;tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Local database write aborted'));});}
export const getMeta=key=>run('meta','readonly',s=>s.get(key));
export const setMeta=(key,value)=>run('meta','readwrite',s=>s.put(value,key));
export async function allRecords(){const owner=await getMeta('activeOwner');const list=await run('records','readonly',s=>s.getAll());return list.filter(r=>owner?r.owner===owner:!r.owner);}
export const getRecord=id=>run('records','readonly',s=>s.get(id));
export async function saveRecord(record){if(!CATEGORIES.includes(record.category))throw new Error('Unknown data category');return run('records','readwrite',s=>s.put(record));}
export const recordId=(category,term='',year='',owner='')=>`${owner}|${category}|${term}|${year}`;
export function canonicalData(value){if(Array.isArray(value))return '['+value.map(canonicalData).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(key=>JSON.stringify(key)+':'+canonicalData(value[key])).join(',')+'}';return JSON.stringify(value);}
export async function saveSuccess(task,data,url,coverage){
 if(coverage&&coverage.complete!==true)throw Error('Incomplete collection: previous data was kept.');
 const id=recordId(task.category,task.term,task.year,task.owner),old=await getRecord(id);
 if(coverage&&task.category==='User Profile'&&old?.data?.values&&Object.entries(old.data.values).some(([label,value])=>value&&!data.fieldsPresent?.includes(label)))throw Error('Profile fields are missing from this response. Previous data was kept.');
 const now=new Date().toISOString(),unchanged=!!old?.data&&canonicalData(old.data)===canonicalData(data);
 await saveRecord({id,owner:task.owner||'',category:task.category,term:task.term||'',year:task.year||'',sourceSelection:task.selection||{},sourceUrl:url,scrapedAt:unchanged?old.scrapedAt:now,lastCheckedAt:now,status:data.empty?'empty':'success',data:unchanged?old.data:data,...(coverage?{coverage}:{} )});
 return {changed:!unchanged};
}
export async function markFailure(task,error){const id=recordId(task.category,task.term,task.year,task.owner),old=await getRecord(id);await saveRecord({...old,id,owner:task.owner||'',category:task.category,term:task.term||'',year:task.year||'',sourceUrl:task.url,sourceSelection:task.selection||{},status:'error',lastAttempt:new Date().toISOString(),error:String(error),data:old?.data||null});}

// One transaction removes every student's records and all private metadata.
// A non-personal generation marker prevents old asynchronous feed requests
// from writing their results back after deletion has finished.
export async function clearAllData(){
 const database=await db(),generation=crypto.randomUUID();
 await new Promise((resolve,reject)=>{
   const tx=database.transaction(['records','meta'],'readwrite');
   tx.objectStore('records').clear();const meta=tx.objectStore('meta');meta.clear();meta.put(generation,'dataGeneration');
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Data deletion was interrupted.'));
 });
 return generation;
}
export async function setMetaIfGeneration(key,value,expected){
 const database=await db();let accepted=false;
 await new Promise((resolve,reject)=>{
   const tx=database.transaction('meta','readwrite'),store=tx.objectStore('meta'),request=store.get('dataGeneration');
   request.onsuccess=()=>{if((request.result??null)===(expected??null)){store.put(value,key);accepted=true;}};
   tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('Local write was interrupted.'));
 });
 if(!accepted)throw new Error('Local data was deleted while this request was running. Connect the feed again to save new data.');
}

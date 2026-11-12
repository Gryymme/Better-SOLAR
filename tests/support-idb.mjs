/* In-memory IDB API double. Supports multi-store and chained-request
   transactions used by atomic deletion and generation-guarded writes. */
export function mockIndexedDB(){
 const stores=new Map();
 return {open(){const request={};queueMicrotask(()=>{
   request.result={createObjectStore(name){stores.set(name,new Map());return {createIndex(){}};},transaction(names){
     const tx={};let pending=0,finished=false;
     tx.objectStore=(name=Array.isArray(names)?names[0]:names)=>{
       const operate=fn=>{const req={};pending++;queueMicrotask(()=>{
         try{req.result=structuredClone(fn(stores.get(name)));req.onsuccess?.();pending--;queueMicrotask(()=>{if(!pending&&!finished){finished=true;tx.oncomplete?.();}});}
         catch(error){tx.error=error;finished=true;tx.onerror?.();}
       });return req;};
       return {get:key=>operate(store=>store.get(key)),getAll:()=>operate(store=>[...store.values()]),put:(value,key)=>operate(store=>{const id=key??value.id;store.set(id,structuredClone(value));return id;}),clear:()=>operate(store=>store.clear())};
     };return tx;
   }};request.onupgradeneeded?.();request.onsuccess?.();
 });return request;}};
}

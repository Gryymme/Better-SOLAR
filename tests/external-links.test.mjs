import test from 'node:test';import assert from 'node:assert/strict';
import {externalDestination,initializeExternalLinks,shouldConfirmExternalLinks,setExternalLinkConfirmation,visitExternalWebsite} from '../src/external-links.js';
const stored=new Map(),handlers={},windowEvents={},opened=[],preference={checked:true};
globalThis.localStorage={getItem:key=>stored.get(key)??null,setItem:(key,value)=>stored.set(key,value)};
globalThis.document={querySelector:()=>null,querySelectorAll:()=>[preference],addEventListener:(type,handler)=>handlers[type]=handler};
globalThis.addEventListener=(type,handler)=>windowEvents[type]=handler;
globalThis.location={href:'chrome-extension://fixture/app.html'};globalThis.window={open:(...args)=>opened.push(args)};
await initializeExternalLinks();
test('Only HTTP/HTTPS destinations outside the application origin are classified as external websites',()=>{
 assert.equal(externalDestination('#grades','https://preview.invalid/app.html'),null);
 assert.equal(externalDestination('/app.html','https://preview.invalid/'),null);
 assert.equal(externalDestination('javascript:alert(1)',location.href),null);
 assert.equal(externalDestination('data:text/html,test',location.href),null);
 assert.equal(externalDestination('https://solar.feualabang.edu.ph/course/registration',location.href).hostname,'solar.feualabang.edu.ph');
});
test('Cancel does not open a website or change the confirmation preference',async()=>{
 await setExternalLinkConfirmation(true);let prompts=0,opens=0;
 await visitExternalWebsite(new URL('https://example.invalid'),{prompt:async()=>{prompts++;return false;},open:()=>opens++});
 assert.equal(prompts,1);assert.equal(opens,0);assert.equal(shouldConfirmExternalLinks(),true);
});
test('Proceed opens once, Do not ask again persists, and Settings can restore confirmation',async()=>{
 let prompts=0,opens=0;const url=new URL('https://example.invalid');
 await visitExternalWebsite(url,{prompt:async(_url,proceed)=>{prompts++;await proceed(true);return true;},open:()=>opens++});
 assert.equal(shouldConfirmExternalLinks(),false);assert.equal(stored.get('confirmExternalLinks'),'false');assert.equal(preference.checked,false);
 await visitExternalWebsite(url,{prompt:()=>{throw Error('Must skip');},open:()=>opens++});assert.equal(opens,2);
 await setExternalLinkConfirmation(true);assert.equal(preference.checked,true);
 await visitExternalWebsite(url,{prompt:async(_url,proceed)=>{prompts++;await proceed(false);return true;},open:()=>opens++});assert.equal(prompts,2);assert.equal(opens,3);assert.equal(shouldConfirmExternalLinks(),true);
});
test('Repeated clicks cannot stack confirmation dialogs or open an unconfirmed second website',async()=>{
 let resolvePrompt,prompts=0,opens=0;const first=visitExternalWebsite(new URL('https://one.invalid'),{prompt:()=>{prompts++;return new Promise(resolve=>resolvePrompt=resolve);},open:()=>opens++});
 await visitExternalWebsite(new URL('https://two.invalid'),{prompt:()=>{prompts++;},open:()=>opens++});assert.equal(prompts,1);assert.equal(opens,0);resolvePrompt(false);await first;
});
test('Cross-window preference changes update controls and normal/middle clicks use the same guard',async()=>{
 windowEvents.storage({key:'confirmExternalLinks',newValue:'false'});assert.equal(shouldConfirmExternalLinks(),false);assert.equal(preference.checked,false);
 for(const type of ['click','auxclick']){
   let prevented=false,stopped=false;const anchor={href:'https://feu.instructure.com',getAttribute:()=> 'https://feu.instructure.com'};
   handlers[type]({type,button:type==='auxclick'?1:0,target:{closest:()=>anchor},preventDefault:()=>prevented=true,stopImmediatePropagation:()=>stopped=true});
   assert.equal(prevented,true);assert.equal(stopped,true);await Promise.resolve();await Promise.resolve();
 }
 assert.equal(opened.length,2);assert.equal(opened[0][1],'_blank');assert.equal(opened[0][2],'noopener,noreferrer');
});
test('Script links are rejected and preference storage errors restore the previous setting',async()=>{
 let prevented=false;handlers.click({type:'click',button:0,target:{closest:()=>({href:'javascript:alert(1)',getAttribute:()=> 'javascript:alert(1)'})},preventDefault:()=>prevented=true,stopImmediatePropagation(){}});assert.equal(prevented,true);assert.equal(opened.length,2);
 const write=localStorage.setItem;localStorage.setItem=()=>{throw Error('Storage unavailable');};try{await assert.rejects(()=>setExternalLinkConfirmation(true),/Storage unavailable/);assert.equal(shouldConfirmExternalLinks(),false);}finally{localStorage.setItem=write;}
});

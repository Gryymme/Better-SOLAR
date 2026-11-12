import test from 'node:test';import assert from 'node:assert/strict';import {createExtensionAPI,launchApplication,watchProgress} from '../src/webextension.js';
import {injectParser,pageToken,pageCall} from '../src/solar-transport.js';
import {timeoutSignal} from '../src/network.js';import vm from 'node:vm';import {readFileSync} from 'node:fs';
test('Callback-only Chrome APIs resolve values, preserve events and reject runtime.lastError',async()=>{
 const event={addListener(){}},raw={runtime:{id:'callback',getURL:path=>'extension://callback/'+path,onMessage:event},storage:{local:{get:(key,done)=>queueMicrotask(()=>done({[key]:'saved'}))}}};
 const api=createExtensionAPI(()=>({api:raw,promises:false}));assert.equal(api.runtime.onMessage,event);assert.equal(api.runtime.getURL('app.html'),'extension://callback/app.html');assert.deepEqual(await api.storage.local.get('theme'),{theme:'saved'});
 raw.storage.local.get=(_key,done)=>{raw.runtime.lastError={message:'Storage refused'};done();delete raw.runtime.lastError;};await assert.rejects(()=>api.storage.local.get('x'),/Storage refused/);
});
test('Promise-only browser APIs receive no callback and Chrome Promise APIs also resolve',async()=>{
 const raw={runtime:{},tabs:{create:async(...args)=>{assert.equal(args.length,1);return {id:9,url:args[0].url};}}};const browser=createExtensionAPI(()=>({api:raw,promises:true}));assert.equal((await browser.tabs.create({url:'about:blank'})).id,9);
 const chrome=createExtensionAPI(()=>({api:{runtime:{},storage:{local:{get:async()=>({theme:'dark'})}}},promises:false}));assert.equal((await chrome.storage.local.get('theme')).theme,'dark');
});
test('Legacy script transport uses bundled files and extension messages, including asynchronous responses',async()=>{
 const previous=globalThis.chrome,previousBrowser=globalThis.browser,calls=[];delete globalThis.browser;
 globalThis.chrome={runtime:{id:'legacy'},tabs:{executeScript:async(id,details)=>{calls.push([id,details]);return [42];},sendMessage:async(id,message)=>({value:{id,method:message.method,args:message.args}})}};
 try{await injectParser(7);assert.deepEqual(calls.map(call=>call[1].file),['scraper/dom.js','scraper/bridge.js']);assert.equal(await pageToken(7),42);assert.deepEqual(await pageCall(7,'scan',['Grades']),{id:7,method:'scan',args:['Grades']});}finally{globalThis.chrome=previous;globalThis.browser=previousBrowser;}
});
test('Missing injection support reports a useful error and failed window launch falls back to a tab',async()=>{
 const previous=globalThis.chrome,previousBrowser=globalThis.browser;delete globalThis.browser;
 globalThis.chrome={runtime:{id:'limited',getURL:path=>'extension://limited/'+path},windows:{create:async()=>{throw Error('Windows unsupported');}},tabs:{create:async options=>options}};
 try{await assert.rejects(()=>injectParser(3),/script-injection API/);assert.deepEqual(await launchApplication(),{url:'extension://limited/app.html',active:true});}finally{globalThis.chrome=previous;globalThis.browser=previousBrowser;}
});
test('A host without storage events can resume/poll progress from a visible view and clean up on close',async()=>{
 const originals={chrome:globalThis.chrome,browser:globalThis.browser,document:globalThis.document,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};let tick,cleared=false;const messages=[],updates=[];
 delete globalThis.chrome;globalThis.browser={runtime:{id:'promise-only',sendMessage:async message=>{messages.push(message);return {ok:true,scrapeProgress:{state:'running',completed:1}};}},storage:{local:{}}};
 globalThis.document={visibilityState:'visible',addEventListener(){},removeEventListener(){}};globalThis.setInterval=callback=>{tick=callback;return 1;};globalThis.clearInterval=()=>cleared=true;
 let stop;try{stop=watchProgress(changes=>updates.push(changes.scrapeProgress.newValue));await new Promise(resolve=>setImmediate(resolve));assert.equal(messages[0].type,'PROGRESS');assert.equal(updates.length,1);await tick();await new Promise(resolve=>setImmediate(resolve));assert.equal(updates.length,1);stop();assert.equal(cleared,true);}finally{stop?.();Object.assign(globalThis,originals);}
});
test('The legacy bridge responds asynchronously only to allowed operations from its own extension',async()=>{
 let handler,calls=0,response;
 const context={chrome:{runtime:{id:'own',onMessage:{addListener:listener=>handler=listener}}},BetterSolarDOM:{scan:async category=>{calls++;return {category};}}};vm.createContext(context);vm.runInContext(readFileSync('scraper/bridge.js','utf8'),context);
 assert.equal(handler({type:'BETTER_SOLAR_CALL',method:'scan',args:['Grades']},{id:'other'},()=>{}),undefined);
 assert.equal(handler({type:'BETTER_SOLAR_CALL',method:'DELETE_DATA'},{id:'own'},()=>{}),undefined);
 assert.equal(handler({type:'BETTER_SOLAR_CALL',method:'scan',args:['Grades']},{id:'own'},value=>response=value),true);await new Promise(resolve=>setImmediate(resolve));assert.equal(calls,1);assert.equal(response.value.category,'Grades');
});
test('Request timeouts also work without AbortSignal.timeout',()=>{
 const originals={AbortSignal:globalThis.AbortSignal,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};let callback;
 globalThis.AbortSignal={};globalThis.setTimeout=fn=>{callback=fn;return 1;};globalThis.clearTimeout=()=>{};
 try{const signal=timeoutSignal(1000);assert.equal(signal.aborted,false);callback();assert.equal(signal.aborted,true);assert.match(signal.reason.message,/timed out/);}finally{Object.assign(globalThis,originals);}
});

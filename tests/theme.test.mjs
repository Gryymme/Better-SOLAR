import test from 'node:test';import assert from 'node:assert/strict';
let saved=null;const listeners={};globalThis.document={documentElement:{dataset:{}},querySelectorAll:()=>[]};globalThis.localStorage={getItem:()=>saved,setItem:(_,v)=>saved=v};globalThis.addEventListener=(event,fn)=>listeners[event]=fn;
// A dark OS appearance must never choose the initial extension theme.
globalThis.matchMedia=()=>({matches:true});
const {initTheme,toggleTheme}=await import('../src/theme.js');
test('Light is default even when the OS requests dark appearance',async()=>{saved=null;await initTheme();assert.equal(document.documentElement.dataset.theme,'light');});
test('Explicit dark preference is preserved across initialization and can be toggled back to light',async()=>{saved='dark';await initTheme();assert.equal(document.documentElement.dataset.theme,'dark');await toggleTheme();assert.equal(saved,'light');await initTheme();assert.equal(document.documentElement.dataset.theme,'light');});
test('Clearing a saved theme returns every connected preview window to light',async()=>{saved='dark';await initTheme();listeners.storage({key:'theme',newValue:null});assert.equal(document.documentElement.dataset.theme,'light');});

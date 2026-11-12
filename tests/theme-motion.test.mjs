import test from 'node:test';import assert from 'node:assert/strict';
import {initTheme,setTheme} from '../src/theme.js';
test('Theme changes fade their colors, restart safely on a quick reversal, and skip animation on first load/reduced motion',async()=>{
 const originals={document:globalThis.document,localStorage:globalThis.localStorage,matchMedia:globalThis.matchMedia,addEventListener:globalThis.addEventListener,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};
 const classes=new Set(),tasks=new Map();let sequence=0,saved='light',reduced=false,flushes=0;const events={};
 const root={dataset:{},classList:{add:value=>classes.add(value),remove:value=>classes.delete(value)},get offsetWidth(){flushes++;return 1000;}};
 globalThis.document={documentElement:root,querySelectorAll:()=>[]};globalThis.localStorage={getItem:()=>saved,setItem:(_,value)=>saved=value};globalThis.matchMedia=()=>({matches:reduced});globalThis.addEventListener=(type,handler)=>events[type]=handler;
 globalThis.setTimeout=(callback,delay)=>{const id=++sequence;tasks.set(id,{callback,delay});return id;};globalThis.clearTimeout=id=>tasks.delete(id);
 try{
   await initTheme();assert.equal(root.dataset.theme,'light');assert.equal(classes.has('theme-transition'),false);
   await setTheme('dark');assert.equal(root.dataset.theme,'dark');assert.equal(classes.has('theme-transition'),true);assert.ok(flushes>0);assert.equal(tasks.size,1);
   await setTheme('light');assert.equal(tasks.size,1);assert.equal(saved,'light');const pending=[...tasks.values()][0];assert.ok(pending.delay>=280);pending.callback();assert.equal(classes.has('theme-transition'),false);tasks.clear();
   reduced=true;await setTheme('dark');assert.equal(classes.has('theme-transition'),false);assert.equal(tasks.size,0);
   reduced=false;events.storage({key:'theme',newValue:'light'});assert.equal(root.dataset.theme,'light');assert.equal(classes.has('theme-transition'),true);
 }finally{Object.assign(globalThis,originals);}
});

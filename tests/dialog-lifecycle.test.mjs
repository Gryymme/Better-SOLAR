import test from 'node:test';import assert from 'node:assert/strict';
import {openModal,closeModal} from '../src/ui.js';
function fixture(){
 const classes=new Set(),animations=[];let focusCount=0;
 const invoker={isConnected:true,getBoundingClientRect:()=>({left:1400,top:20,width:94,height:44}),focus:()=>focusCount++};
 const dialog={open:false,style:{setProperty(){},removeProperty(){}},classList:{add:value=>classes.add(value),remove:(...values)=>values.forEach(value=>classes.delete(value))},querySelectorAll:()=>[],querySelector:()=>null,contains:()=>false,offsetWidth:800,getBoundingClientRect:()=>({left:300,top:200,width:800,height:500}),showModal(){this.open=true;},close(){this.open=false;this.onclose?.();},animate(frames){let finish,reject;const animation={frames,finished:new Promise((resolve,fail)=>{finish=resolve;reject=fail;}),finish:()=>finish(),cancel:()=>reject()};animations.push(animation);return animation;}};
 const previousDocument=globalThis.document,previousMedia=globalThis.matchMedia;
 globalThis.document={activeElement:invoker,querySelector:()=>dialog,querySelectorAll:()=>[]};globalThis.matchMedia=()=>({matches:false});
 return {dialog,animations,invoker,focusCount:()=>focusCount,restore(){globalThis.document=previousDocument;globalThis.matchMedia=previousMedia;}};
}
test('Closing keeps the dialog present during its fade, then restores focus after animation completion',async()=>{
 const f=fixture();try{openModal('Event','Details');const closing=closeModal();assert.equal(f.dialog.open,true);assert.equal(f.animations.length,1);assert.equal(f.animations[0].frames.at(-1).opacity,0);f.animations[0].finish();await closing;assert.equal(f.dialog.open,false);assert.equal(f.focusCount(),1);}finally{f.restore();}
});
test('A new dialog cancels an old close animation without closing the replacement',async()=>{
 const f=fixture();try{openModal('First','Details');const old=closeModal();openModal('Second','New details');await old;assert.equal(f.dialog.open,true);assert.ok(f.dialog.innerHTML.includes('Second'));const closing=closeModal();f.animations.at(-1).finish();await closing;}finally{f.restore();}
});
test('Escape uses the close animation, while active data deletion prevents dismissal',async()=>{
 const f=fixture();try{openModal('Settings','Details');let prevented=false;f.dialog.querySelector=()=>({disabled:true});f.dialog.oncancel({preventDefault:()=>prevented=true});assert.equal(prevented,true);assert.equal(f.animations.length,0);assert.equal(f.dialog.open,true);f.dialog.querySelector=()=>null;f.dialog.oncancel({preventDefault(){}});assert.equal(f.animations.length,1);f.animations[0].finish();await closeModal();assert.equal(f.dialog.open,false);}finally{f.restore();}
});

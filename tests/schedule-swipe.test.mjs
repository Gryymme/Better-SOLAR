import test from 'node:test';import assert from 'node:assert/strict';
import {initialWeekHalf,halfScrollPosition,swipeCuePosition,syncScheduleSwipe,forgetScheduleSwipe} from '../src/schedule-swipe.js';
let serial=0;
function fixture({day=1,mobile=true,reduced=false}={}){
 const originals={Date:globalThis.Date,matchMedia:globalThis.matchMedia,IntersectionObserver:globalThis.IntersectionObserver,requestAnimationFrame:globalThis.requestAnimationFrame,cancelAnimationFrame:globalThis.cancelAnimationFrame};
 const NativeDate=Date;globalThis.Date=class extends NativeDate{getDay(){return day;}};
 const listeners=new Map(),frames=new Map(),styles=new Map();let observer,id=0;
 const state={mobile,reduced};globalThis.matchMedia=query=>({matches:query.includes('max-width')?state.mobile:state.reduced});
 globalThis.requestAnimationFrame=callback=>{frames.set(++id,callback);return id;};globalThis.cancelAnimationFrame=key=>frames.delete(key);
 globalThis.IntersectionObserver=class{constructor(callback){this.callback=callback;observer=this;}observe(target){this.target=target;}disconnect(){this.disconnected=true;}};
 const viewport={clientWidth:300,scrollWidth:600,scrollLeft:0,style:{setProperty:(key,value)=>styles.set(key,value),removeProperty:key=>styles.delete(key)},addEventListener:(key,callback)=>listeners.set(key,callback),removeEventListener:key=>listeners.delete(key),scrollTo(options){this.lastScroll=options;this.scrollLeft=options.left;listeners.get('scroll')?.();}};
 const controls=[0,1].map(half=>({dataset:{weekHalf:String(half)},disabled:false,listeners:new Map(),addEventListener(type,callback){this.listeners.set(type,callback);},removeEventListener(type){this.listeners.delete(type);}}));
 const header={},grid={querySelectorAll:()=>controls,dataset:{scheduleSource:'test-'+ ++serial},isConnected:true,querySelector:selector=>selector==='.week-days-viewport'?viewport:header};
 return {grid,viewport,controls,state,listeners,frames,styles,get observer(){return observer;},visible(){observer.callback([{isIntersecting:true,intersectionRatio:1}]);},frame(time){const [key,callback]=frames.entries().next().value;frames.delete(key);callback(time);},restore(){forgetScheduleSwipe(grid);Object.assign(globalThis,originals);}};
}
test('Default half covers Sunday–Wednesday first and Thursday–Saturday second',()=>{
 assert.deepEqual([0,1,2,3,4,5,6].map(initialWeekHalf),[0,0,0,0,1,1,1]);assert.equal(halfScrollPosition(0,600,300),0);assert.equal(halfScrollPosition(1,600,300),300);
});
test('Initial mobile positioning selects the expected three-day half and preserves a user choice across resizing',()=>{
 const f=fixture({day:4});try{syncScheduleSwipe(f.grid);assert.equal(f.viewport.scrollLeft,300);assert.equal(f.grid.dataset.weekHalf,'1');f.viewport.scrollLeft=0;f.listeners.get('scroll')();f.viewport.clientWidth=400;f.viewport.scrollWidth=800;syncScheduleSwipe(f.grid);assert.equal(f.viewport.scrollLeft,0);f.state.mobile=false;syncScheduleSwipe(f.grid);assert.equal(f.viewport.scrollLeft,0);}finally{f.restore();}
});
test('Cue waits for visibility, moves briefly toward the hidden days, then returns and does not repeat',()=>{
 const f=fixture();try{syncScheduleSwipe(f.grid);assert.equal(f.frames.size,0);assert.equal(f.observer.target,f.grid.querySelector('.week-time-rail-header'));f.visible();assert.equal(f.frames.size,1);f.frame(0);f.frame(325);assert.equal(f.viewport.scrollLeft,18);f.frame(650);assert.equal(f.viewport.scrollLeft,0);assert.equal(f.styles.has('scroll-snap-type'),false);f.visible();assert.equal(f.frames.size,0);}finally{f.restore();}
});
test('Second-half cue moves in the opposite direction and reduced motion suppresses the cue',()=>{
 const second=fixture({day:6});try{syncScheduleSwipe(second.grid);second.visible();second.frame(0);second.frame(325);assert.equal(second.viewport.scrollLeft,282);second.frame(650);assert.equal(second.viewport.scrollLeft,300);}finally{second.restore();}
 const reduced=fixture({day:5,reduced:true});try{syncScheduleSwipe(reduced.grid);reduced.visible();assert.equal(reduced.viewport.scrollLeft,300);assert.equal(reduced.frames.size,0);}finally{reduced.restore();}
});
test('User gestures cancel the cue, arrow keys can change halves, and detached tables release observers/listeners',()=>{
 const f=fixture();try{syncScheduleSwipe(f.grid);f.visible();f.frame(0);f.listeners.get('pointerdown')();assert.equal(f.frames.size,0);let prevented=false;f.listeners.get('keydown')({key:'ArrowRight',target:f.viewport,preventDefault:()=>prevented=true});assert.equal(prevented,true);assert.equal(f.viewport.scrollLeft,300);assert.equal(f.viewport.lastScroll.behavior,'smooth');forgetScheduleSwipe(f.grid);assert.equal(f.observer.disconnected,true);assert.equal(f.listeners.size,0);}finally{f.restore();}
});
test('Cue positions stay in range and return exactly to the selected half',()=>{
 for(const start of [0,300]){assert.equal(swipeCuePosition(start,300,0),start);assert.ok(Math.abs(swipeCuePosition(start,300,1)-start)<.00001);for(const progress of [.1,.3,.5,.8]){const value=swipeCuePosition(start,300,progress);assert.ok(value>=0&&value<=300);}}
});

test('Mobile header arrows page to the hidden days, reflect manual swipes and release their handlers',()=>{
 const f=fixture({day:1});try{
  syncScheduleSwipe(f.grid);assert.deepEqual(f.controls.map(button=>button.disabled),[true,false]);
  f.controls[1].listeners.get('click')();assert.equal(f.viewport.scrollLeft,300);assert.equal(f.viewport.lastScroll.behavior,'smooth');assert.deepEqual(f.controls.map(button=>button.disabled),[false,true]);
  f.viewport.scrollLeft=0;f.listeners.get('scroll')();assert.deepEqual(f.controls.map(button=>button.disabled),[true,false]);
  f.visible();assert.equal(f.frames.size,0);forgetScheduleSwipe(f.grid);assert.ok(f.controls.every(button=>button.listeners.size===0));
 }finally{f.restore();}
});

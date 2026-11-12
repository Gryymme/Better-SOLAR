export const initialWeekHalf=day=>day>=4&&day<=6?1:0;
export const halfScrollPosition=(half,scrollWidth,clientWidth)=>Math.max(0,scrollWidth-clientWidth)*(half?1:0);
export function swipeCuePosition(start,maximum,progress,distance=18){const direction=start<maximum/2?1:-1;return start+direction*Math.min(distance,maximum)*Math.sin(Math.PI*Math.max(0,Math.min(1,progress)));}
const mounted=new Map(),views=new Map();
const reduced=()=>globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
function restoreScrolling(state){state.viewport.style.removeProperty('scroll-snap-type');state.viewport.style.removeProperty('scroll-behavior');state.cue=false;}
function cancelCue(state){if(state.frame)cancelAnimationFrame(state.frame);state.frame=0;restoreScrolling(state);}
function syncControls(state){for(const button of state.controls)button.disabled=Number(button.dataset.weekHalf)===state.view.half;}
function cue(state){
 if(state.view.cued||state.interacted||reduced()||!state.mobile)return;
 const maximum=state.viewport.scrollWidth-state.viewport.clientWidth;if(maximum<=0)return;
 state.view.cued=true;state.cue=true;state.viewport.style.setProperty('scroll-snap-type','none');state.viewport.style.setProperty('scroll-behavior','auto');
 const start=halfScrollPosition(state.view.half,state.viewport.scrollWidth,state.viewport.clientWidth);let began;
 const tick=now=>{if(!state.grid.isConnected){cancelCue(state);return;}began??=now;const progress=Math.min(1,(now-began)/650);state.viewport.scrollLeft=swipeCuePosition(start,maximum,progress);if(progress<1)state.frame=requestAnimationFrame(tick);else{state.viewport.scrollLeft=start;state.frame=0;restoreScrolling(state);}};
 state.frame=requestAnimationFrame(tick);
}
export function syncScheduleSwipe(grid){
 const viewport=grid.querySelector('.week-days-viewport');if(!viewport)return;
 const mobile=matchMedia('(max-width:700px)').matches;
 let state=mounted.get(grid);
 if(!state){
   const today=new Date(),key=(grid.dataset.scheduleSource||'schedule')+'|'+today.toDateString();
   if(!views.has(key))views.set(key,{half:initialWeekHalf(today.getDay()),cued:false});
   state={grid,viewport,view:views.get(key),controls:[...(grid.querySelectorAll?.('[data-week-half]')||[])],mobile:false,width:0,frame:0,cue:false,interacted:false,listeners:[]};mounted.set(grid,state);
   const listen=(type,callback,options,target=viewport)=>{target.addEventListener(type,callback,options);state.listeners.push([target,type,callback,options]);};
   const interact=()=>{if(state.mobile){state.interacted=true;state.view.cued=true;}cancelCue(state);};
   const goToHalf=half=>{interact();if(!state.mobile)return;state.view.half=half;grid.dataset.weekHalf=String(half);syncControls(state);viewport.scrollTo({left:halfScrollPosition(half,viewport.scrollWidth,viewport.clientWidth),behavior:reduced()?'instant':'smooth'});};
   for(const button of state.controls)listen('click',()=>goToHalf(Number(button.dataset.weekHalf)),undefined,button);
   listen('pointerdown',interact,{passive:true});listen('touchstart',interact,{passive:true});
   listen('wheel',event=>{if(Math.abs(event.deltaX)>Math.abs(event.deltaY)||event.shiftKey)interact();},{passive:true});
   listen('scroll',()=>{if(!state.mobile||state.cue)return;const maximum=viewport.scrollWidth-viewport.clientWidth;if(maximum>0){state.view.half=viewport.scrollLeft>=maximum/2?1:0;grid.dataset.weekHalf=String(state.view.half);syncControls(state);}},{passive:true});
   listen('keydown',event=>{interact();if(!state.mobile||event.target!==viewport||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();goToHalf(['ArrowRight','End'].includes(event.key)?1:0);});
   if(typeof IntersectionObserver==='function'){
     state.observer=new IntersectionObserver(entries=>{state.visible=entries.some(entry=>entry.isIntersecting&&entry.intersectionRatio>=.95);if(state.visible)cue(state);},{threshold:.95,rootMargin:'-56px 0px -20px 0px'});
     state.observer.observe(grid.querySelector('.week-time-rail-header'));
   }
 }
 if(mobile!==state.mobile||viewport.clientWidth!==state.width){
   cancelCue(state);state.mobile=mobile;state.width=viewport.clientWidth;
   viewport.scrollLeft=mobile?halfScrollPosition(state.view.half,viewport.scrollWidth,viewport.clientWidth):0;
   grid.dataset.weekHalf=String(state.view.half);
   syncControls(state);
   if(mobile&&state.visible)cue(state);
 }
}
export function forgetScheduleSwipe(grid){const state=mounted.get(grid);if(!state)return;cancelCue(state);state.observer?.disconnect();for(const [target,type,listener,options] of state.listeners)target.removeEventListener(type,listener,options);mounted.delete(grid);}

// Keep a shared time scale while fitting readable course content to each lane.
export function hourHeightFor(measurements,baseline=46){
 return Math.ceil(Math.max(baseline,...measurements.filter(m=>m.duration>0).map(m=>(m.contentHeight+18)*60/m.duration)));
}
const mounted=new Map();
const length=text=>Array.from(text).length;
function displayWords(text,maxCharacters){return String(text).trim().split(/\s+/).filter(Boolean).map(word=>length(word)>maxCharacters?Array.from(word).slice(0,maxCharacters-3).join('')+'...':word);}
export function wrapCourseText(text,width,measure,maxCharacters=16){
 const lines=[];let line='';
 for(const word of displayWords(text,maxCharacters)){
   const candidate=line?line+' '+word:word;
   if(line&&(length(candidate)>maxCharacters||measure(candidate)>width+.1)){lines.push(line);line=word;}else line=candidate;
 }
 if(line)lines.push(line);return lines;
}
let measureContext;
export function courseFontSize(lines,width,measure,baseline=9){const widest=Math.max(1,...lines.map(measure));return Math.min(baseline,baseline*Math.max(1,width)/widest);}
export function courseTextLayout(texts,width,measure,baseline=9){
 const fontSize=courseFontSize(texts.flatMap(text=>displayWords(text,16)),width,measure,baseline);
 return {fontSize,lines:texts.map(text=>wrapCourseText(text,width,value=>measure(value)*fontSize/baseline))};
}
export const compactHour=minutes=>`${Math.floor(minutes/60)%12||12} ${minutes>=720?'PM':'AM'}`;
export const compactBlockHeight=(contentHeight,paddingTop,paddingBottom,borders=0)=>Math.ceil(contentHeight+paddingTop+paddingBottom+borders);
function fitText(grid){
 measureContext??=document.createElement('canvas').getContext('2d');
 if(!measureContext)return;
 const mobile=matchMedia('(max-width:700px)').matches;
 for(const label of grid.querySelectorAll('[data-hour-minutes]')){const minutes=Number(label.dataset.hourMinutes);label.textContent=mobile?compactHour(minutes):`${String(Math.floor(minutes/60)%12||12)}:00 ${minutes>=720?'PM':'AM'}`;}
 for(const content of grid.querySelectorAll('.course-content')){
   const width=content.clientWidth;
   const elements=[...content.querySelectorAll('[data-course-text]')];
   content.style.removeProperty('--course-font-size');
   for(const element of elements)element.style.removeProperty('--course-font-size');
   let layout;
   if(mobile&&elements.length){
     const style=getComputedStyle(elements[0]),baseline=parseFloat(style.fontSize);
     measureContext.font=`${style.fontWeight} ${baseline}px ${style.fontFamily}`;
     layout=courseTextLayout(elements.map(element=>element.dataset.courseText),width,value=>measureContext.measureText(value).width,baseline);
     content.style.setProperty('--course-font-size',layout.fontSize+'px');
   }
   for(const [index,element] of elements.entries()){
     const original=element.dataset.courseText;
     if(mobile){
       const lines=layout.lines[index];
       element.replaceChildren(...lines.map(value=>{const line=document.createElement('span');line.className='course-text-line';line.textContent=value;return line;}));
     }else element.textContent=original;
   }
   content.style.removeProperty('--meeting-font-size');
   const time=content.querySelector('.meeting-time');if(!time)continue;
   const style=getComputedStyle(time),size=parseFloat(style.fontSize);
   measureContext.font=`${style.fontWeight} ${size}px ${style.fontFamily}`;
   const required=measureContext.measureText(time.textContent).width;
   content.style.setProperty('--meeting-font-size',`${Math.min(size,size*width/Math.max(required,1))}px`);
 }
}
function fit(grid){
 fitText(grid);
 const mobile=matchMedia('(max-width:700px)').matches;
 const hours=Number(grid.dataset.hours)||14;
 const baseline=Math.max(38,Math.min(48,((globalThis.innerHeight||900)-160)/hours));
 const measurements=[...grid.querySelectorAll('.course-block')].map(block=>({duration:Number(block.dataset.duration),contentHeight:block.querySelector('.course-content')?.getBoundingClientRect().height||0}));
 const height=hourHeightFor(measurements,baseline),value=height+'px';
 if(grid.style.getPropertyValue('--hour-height')!==value)grid.style.setProperty('--hour-height',value);
 for(const block of grid.querySelectorAll('.course-block')){
   if(mobile){const style=getComputedStyle(block),content=block.querySelector('.course-content');block.style.setProperty('--compact-course-height',compactBlockHeight(content?.scrollHeight||0,parseFloat(style.paddingTop)||0,parseFloat(style.paddingBottom)||0,(parseFloat(style.borderTopWidth)||0)+(parseFloat(style.borderBottomWidth)||0))+'px');}
   else block.style.removeProperty('--compact-course-height');
 }
}
export function syncSchedules(scope=document){
 for(const [grid,observer] of mounted)if(!grid.isConnected){observer?.disconnect();mounted.delete(grid);}
 for(const grid of scope.querySelectorAll('.week-grid')){
   if(!mounted.has(grid)){
     const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>fit(grid)):null;
     observer?.observe(grid);mounted.set(grid,observer);
   }
   fit(grid);
 }
}
if(typeof addEventListener==='function')addEventListener('resize',()=>{for(const grid of mounted.keys())fit(grid);});

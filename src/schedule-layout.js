import {fittingTitle} from './calendar-layout.js';
import {syncScheduleSwipe,forgetScheduleSwipe} from './schedule-swipe.js';
export function hourHeightFor(measurements,baseline=46){return Math.ceil(Math.max(baseline,...measurements.filter(m=>m.duration>0).map(m=>(m.contentHeight+18)*60/m.duration)));}
const mounted=new Map();
const words=text=>String(text||'').trim().split(/\s+/).filter(Boolean);
export const fitScheduleLabel=(text,width,measure)=>fittingTitle(String(text||''),value=>measure(value)<=width+.1);
export function wrapCourseText(text,width,measure,maxCharacters=16){
 const lines=[];let line='';
 for(const raw of words(text)){const word=fitScheduleLabel(raw,width,measure),candidate=line?line+' '+word:word;if(line&&(Array.from(candidate).length>maxCharacters||measure(candidate)>width+.1)){lines.push(line);line=word;}else line=candidate;}
 if(line)lines.push(line);return lines;
}
export function courseCodeLines(code,width,measure,{force=false}={}){
 const text=String(code||'');if(!force&&measure(text)<=width+.1)return [text];
 const match=text.match(/^([a-z]+)(\d+)([a-z]*)$/i);if(!match)return [text];
 const digits=match[2].length===4&&match[2].startsWith('0')?match[2].slice(1):match[2];return [match[1]+'-',digits+match[3]];
}
export function courseTextLayout(texts,width,measure,fontSize=12,{mobile=false,shared=false}={}){
 const fitsCode=measure(String(texts[0]||''))<=width+.1;
 const code=courseCodeLines(texts[0],width,measure).map(line=>fitScheduleLabel(line,width,measure));
 const title=shared?(fitsCode&&texts[1]?[fitScheduleLabel(texts[1],width,measure)]:[]):wrapCourseText(texts[1],width,measure,Infinity);return {fontSize,lines:[code,title]};
}
export function timeTextLines(start,end,width,measure){const full=start+'–'+end;if(measure(full)<=width+.1)return [full];return [...wrapCourseText(start+'–',width,measure,Infinity),...wrapCourseText(end,width,measure,Infinity)];}
export const compactHour=minutes=>`${Math.floor(minutes/60)%12||12} ${minutes>=720?'PM':'AM'}`;
export const compactBlockHeight=(contentHeight,paddingTop,paddingBottom,borders=0)=>Math.ceil(contentHeight+paddingTop+paddingBottom+borders);
let measureContext;
function renderLines(element,lines,className){element.replaceChildren(...lines.map(value=>{const line=document.createElement('span');line.className=className;line.textContent=value;return line;}));}
function fitText(grid){
 measureContext??=document.createElement('canvas').getContext('2d');if(!measureContext)return;
 const mobile=matchMedia('(max-width:700px)').matches,gridStyle=getComputedStyle(grid),titleSize=parseFloat(gridStyle.getPropertyValue('--course-font-size'))||12,meetingSize=parseFloat(gridStyle.getPropertyValue('--meeting-font-size'))||10;
 for(const label of grid.querySelectorAll('[data-hour-minutes]')){const minutes=Number(label.dataset.hourMinutes);label.textContent=`${Math.floor(minutes/60)%12||12}:00 ${minutes>=720?'PM':'AM'}`;}
 for(const content of grid.querySelectorAll('.course-content')){
   const width=content.clientWidth,shared=Number(content.closest('.course-block').dataset.columns)>1,code=content.querySelector('.course-code'),title=content.querySelector('.course-title');
   content.style.removeProperty('--course-font-size');content.style.removeProperty('--meeting-font-size');code.style.removeProperty('--course-font-size');title.style.removeProperty('--course-font-size');
   measureContext.font=`700 ${titleSize}px ${gridStyle.fontFamily}`;
   const layout=courseTextLayout([code.dataset.courseText,title.dataset.courseText],width,value=>measureContext.measureText(value).width,titleSize,{mobile,shared});renderLines(code,layout.lines[0],'course-text-line');renderLines(title,layout.lines[1],'course-text-line');
   measureContext.font=`400 ${meetingSize}px ${gridStyle.fontFamily}`;
   const time=content.querySelector('.meeting-time'),room=content.querySelector('.meeting-room');
   renderLines(time,timeTextLines(time.dataset.startTime,time.dataset.endTime,width,value=>measureContext.measureText(value).width),'meeting-time-line');renderLines(room,wrapCourseText(room.dataset.roomText,width,value=>measureContext.measureText(value).width,Infinity),'meeting-room-line');
 }
}
function fit(grid){
 fitText(grid);const hours=Number(grid.dataset.hours)||14,baseline=Math.max(38,Math.min(48,((globalThis.innerHeight||900)-160)/hours));
 const measurements=[...grid.querySelectorAll('.course-block')].map(block=>({duration:Number(block.dataset.duration),contentHeight:block.querySelector('.course-content')?.scrollHeight||0}));
 const value=hourHeightFor(measurements,baseline)+'px';if(grid.style.getPropertyValue('--hour-height')!==value)grid.style.setProperty('--hour-height',value);
 for(const block of grid.querySelectorAll('.course-block'))block.style.removeProperty('--compact-course-height');
 syncScheduleSwipe(grid);
}
export function syncSchedules(scope=document){
 for(const [grid,observer] of mounted)if(!grid.isConnected){observer?.disconnect();forgetScheduleSwipe(grid);mounted.delete(grid);}
 for(const grid of scope.querySelectorAll('.week-grid')){if(!mounted.has(grid)){const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>fit(grid)):null;observer?.observe(grid);mounted.set(grid,observer);}fit(grid);}
}
if(typeof addEventListener==='function')addEventListener('resize',()=>{for(const grid of mounted.keys())fit(grid);});

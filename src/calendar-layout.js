// Measure using the actual Montserrat font and container width, preserving the
// full title in aria-label/data and app state. The visible suffix is three dots.
export function fittingTitle(title,fits){
 if(fits(title))return title;
 const chars=Array.from(title);let lo=0,hi=chars.length;
 while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(fits(chars.slice(0,mid).join('').trimEnd()+'...'))lo=mid;else hi=mid-1;}
 return chars.slice(0,lo).join('').trimEnd()+'...';
}
const observed=new Map();
function fit(grid){for(const span of grid.querySelectorAll('[data-full-title]')){
 const full=span.dataset.fullTitle,lineHeight=parseFloat(getComputedStyle(span).lineHeight)||20;
 span.textContent=fittingTitle(full,text=>{span.textContent=text;return span.scrollHeight<=lineHeight*2+1;});
}}
export function syncCalendarTitles(scope=document){
 for(const [grid,observer] of observed)if(!grid.isConnected){observer?.disconnect();observed.delete(grid);}
 for(const grid of scope.querySelectorAll('.calendar-grid')){
  if(!observed.has(grid)){const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>fit(grid)):null;observer?.observe(grid);observed.set(grid,observer);}
  fit(grid);
 }
}

import {syncReportMotion} from './report-motion.js';
export const progressFraction=(completed,total)=>Math.max(0,Math.min(1,Number(total)>0&&Number.isFinite(Number(completed))?Number(completed)/Number(total):0));
export function displayedProgress(scope=document){
 const fill=scope.querySelector('.collection-fill');
 if(!fill)return 0;
 const track=fill.parentElement.getBoundingClientRect().width;
 return track?Math.max(0,Math.min(1,fill.getBoundingClientRect().width/track)):0;
}
export function syncProgress(previous=0,scope=document){
 syncReportMotion(scope);
 const fill=scope.querySelector('.collection-fill');if(!fill)return;
 fill.style.transition='none';fill.style.transform=`scaleX(${previous})`;
 // Commit the old visual width before transitioning, including after a full render.
 void fill.offsetWidth;
 fill.style.removeProperty('transition');fill.style.transform=`scaleX(${fill.dataset.fraction})`;
}

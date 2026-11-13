// End at half a subsequent row, including when rows wrap to different heights.
export function halfRowHeight(header,rows,limit){
 if(header+rows.reduce((sum,height)=>sum+height,0)<=limit)return null;
 let used=header,best=null;
 for(const height of rows){if(used+height/2<=limit)best=used+height/2;else break;used+=height;}
 return best;
}
const mounted=new Map();
function fit(wrapper){
 if(!wrapper.isConnected)return;
 wrapper.style.removeProperty('height');
 if(wrapper.scrollHeight<=wrapper.clientHeight+1)return;
 const table=wrapper.querySelector('table'),rows=[...table.querySelectorAll('tbody tr')];
 const borders=wrapper.offsetHeight-wrapper.clientHeight;
 const limit=wrapper.clientHeight;
 // Offset sizes ignore a dialog's opening scale animation.
 const height=halfRowHeight(table.querySelector('thead').offsetHeight,rows.map(row=>row.offsetHeight),limit);
 if(height!==null)wrapper.style.height=`${height+borders}px`;
}
export function syncTablePeeks(scope=document){
 for(const [wrapper,observer] of mounted)if(!wrapper.isConnected){observer?.disconnect();mounted.delete(wrapper);}
 for(const wrapper of scope.querySelectorAll('.offering-table-scroll')){
   if(!mounted.has(wrapper)){
     const observer=typeof ResizeObserver==='function'?new ResizeObserver(()=>fit(wrapper)):null;
     observer?.observe(wrapper.querySelector('table'));
     if(wrapper.closest('#modal-offers'))observer?.observe(wrapper.parentElement);
     mounted.set(wrapper,observer);
   }
   fit(wrapper);
 }
}
if(typeof addEventListener==='function')addEventListener('resize',()=>{for(const wrapper of mounted.keys())fit(wrapper);});

const mounted=new Map();
export function reportExpanded(scope,fallback=false){const details=scope?.querySelector('details[data-collection-report]');return details?details.dataset.collectionExpanded===undefined?details.open:details.dataset.collectionExpanded==='true':fallback;}
export function animateReport(details,expanded){
 const previous=mounted.get(details)||{},summary=details.querySelector('summary'),body=details.querySelector('.cache-details');
 const start=details.getBoundingClientRect().height;previous.animation?.cancel();previous.fade?.cancel();
 details.style.removeProperty('height');details.dataset.collectionExpanded=String(expanded);
 const reduced=globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced||typeof details.animate!=='function'){details.open=expanded;details.style.removeProperty('overflow');mounted.set(details,{...previous,target:expanded});return;}
 details.open=true;
 const end=expanded?details.getBoundingClientRect().height:summary.getBoundingClientRect().height;
 details.style.overflow='hidden';
 const animation=details.animate([{height:start+'px'},{height:end+'px'}],{duration:220,easing:'ease-in-out',fill:'forwards'});
 const fade=body?.animate?.([{opacity:expanded?0:1,transform:expanded?'translateY(-4px)':'translateY(0)'},{opacity:expanded?1:0,transform:expanded?'translateY(0)':'translateY(-4px)'}],{duration:180,easing:'ease-out',fill:'forwards'});
 void fade?.finished?.catch(()=>{});
 const state={...previous,target:expanded,animation,fade};mounted.set(details,state);
 void animation.finished.catch(()=>{}).then(()=>{if(mounted.get(details)!==state)return;details.open=expanded;details.style.removeProperty('overflow');animation.cancel();fade?.cancel();state.animation=null;state.fade=null;});
}
export function syncReportMotion(scope=document){
 for(const [details,state] of mounted)if(details.isConnected===false){state.animation?.cancel();state.fade?.cancel();state.summary?.removeEventListener('click',state.click);mounted.delete(details);}
 for(const details of scope.querySelectorAll?.('details[data-collection-report]')||[]){
  if(mounted.has(details))continue;
  const summary=details.querySelector('summary'),click=event=>{event.preventDefault();const state=mounted.get(details);animateReport(details,!(state?.target??details.open));};
  summary.addEventListener('click',click);mounted.set(details,{summary,click,target:details.open});
 }
}

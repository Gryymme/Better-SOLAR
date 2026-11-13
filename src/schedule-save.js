import {extension} from './webextension.js';
import {BUILD_TARGET} from './platform.js';

export async function saveSchedulePNG({blob,url,filename,target=BUILD_TARGET,api=extension,host=globalThis.navigator,doc=globalThis.document}){
 if(target!=='mobile'){
  if(typeof api?.downloads?.download!=='function')throw Error('The PC download API is unavailable. Reload the updated extension and open its application again.');
  // saveAs requests the browser's native destination/name chooser on every save.
  const id=await api.downloads.download({url,filename,saveAs:true});
  if(!Number.isInteger(id)||id<0)throw Error('The PNG download did not start.');
  return {method:'save-as',id};
 }
 // Keep mobile sharing and its download fallback independent of PC behavior.
 const file=typeof File==='function'?new File([blob],filename,{type:'image/png'}):null;
 let canShare=false;try{canShare=!!file&&!!host?.canShare?.({files:[file]})&&typeof host.share==='function';}catch{}
 if(canShare){await host.share({files:[file],title:'Weekly course schedule'});return {method:'share'};}
 const link=doc.createElement('a');link.href=url;link.download=filename;link.target='_blank';link.rel='noopener';doc.body.append(link);link.click();link.remove();
 return {method:'download'};
}

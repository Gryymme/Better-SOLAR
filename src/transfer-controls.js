import {extension as chrome} from './webextension.js';
import {createTransfer,validateTransfer,importTransfer,MAX_TRANSFER_BYTES} from './data-transfer.js';
import {esc,icon,checkboxSetting} from './ui.js';
import {SOLAR_ORIGIN,SOLAR_PAGES} from './solar-navigation.js';
export function transferMarkup(){return `<section class="settings-section"><h3>Transfer academic data</h3><p>Export records from your desktop extension, send the JSON file to your phone, then import it here. The file contains personal academic records; share it privately and keep it out of your repository.</p>${checkboxSetting({id:'transfer-calendar',attribute:'data-transfer-calendar',title:'Include cached Canvas calendar',description:'Includes saved events only. Your private Calendar Feed URL is excluded.'})}<div class="settings-actions transfer-actions"><button data-export-records>Export scraped data</button><button data-choose-import>Choose import file</button><input type="file" accept=".json,application/json" data-import-file hidden></div><div data-transfer-preview hidden><p data-transfer-summary></p><p class="muted">Missing datasets are added and newer matching datasets are merged. Newer local data and datasets absent from the file are kept.</p><div class="settings-actions"><button class="primary" data-confirm-import>Import data</button><button data-cancel-import>Cancel</button></div></div><p data-transfer-result role="status" aria-live="polite"></p></section><hr><section class="settings-section"><h3>Open SOLAR pages directly</h3><p>Use these links if SOLAR’s mobile menu does not open. Sign in to SOLAR in this browser first.</p><div class="solar-shortcuts">${SOLAR_PAGES.map(([name,path])=>`<a class="button-link" href="${SOLAR_ORIGIN+path}" target="_blank" rel="noreferrer">${esc(name)} ${icon('external')}</a>`).join('')}</div></section>`;}
export function bindTransferControls(dialog){
 let disposed=false,pending=null,version=0,busy=false;
 const select=selector=>dialog.querySelector(selector),file=select('[data-import-file]'),result=select('[data-transfer-result]'),preview=select('[data-transfer-preview]');
 const setBusy=value=>{busy=value;for(const button of dialog.querySelectorAll('[data-export-records],[data-choose-import],[data-confirm-import],[data-cancel-import],#request-delete,#confirm-delete'))button.disabled=value;result.setAttribute('aria-busy',String(value));};
 const clear=()=>{version++;pending=null;file.value='';preview.hidden=true;select('[data-transfer-summary]').textContent='';};
 select('[data-export-records]').onclick=async()=>{
  if(busy)return;setBusy(true);result.textContent='Preparing export…';
  try{const bundle=await createTransfer({includeCanvas:select('[data-transfer-calendar]').checked});if(disposed)return;const blob=new Blob([JSON.stringify(bundle,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`Better_SOLAR-data-${new Date().toISOString().slice(0,10)}.json`;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);result.textContent=`Exported ${bundle.records.length} datasets. Transfer the JSON file to your phone, then choose it with Import.`;}
  catch(error){if(!disposed)result.textContent=error.message;}finally{if(!disposed)setBusy(false);}
 };
 select('[data-choose-import]').onclick=()=>{if(!busy)file.click();};
 file.onchange=async()=>{
  const chosen=file.files?.[0];if(!chosen)return;const current=++version;pending=null;preview.hidden=true;setBusy(true);result.textContent='Checking import file…';
  try{if(chosen.size>MAX_TRANSFER_BYTES)throw Error('Transfer file exceeds the 50 MB limit.');const bundle=validateTransfer(await chosen.text());if(disposed||current!==version)return;pending=bundle;select('[data-transfer-summary]').textContent=`Student ${bundle.owner} · ${bundle.records.length} datasets${bundle.canvas?' · Cached Canvas events included':''}. Other students’ cached records will remain saved.`;preview.hidden=false;result.textContent='Review the file, then choose Import data.';}
  catch(error){if(!disposed&&current===version)result.textContent=error.message;}finally{if(!disposed)setBusy(false);}
 };
 select('[data-cancel-import]').onclick=()=>{if(busy)return;clear();result.textContent='Import canceled.';};
 select('[data-confirm-import]').onclick=async()=>{
  if(busy||!pending)return;setBusy(true);result.textContent='Stopping collection and importing data…';
  const blocked=event=>{event.preventDefault();},blockClick=event=>{if(event.target===dialog||event.target.closest?.('[data-close]')){event.preventDefault();event.stopImmediatePropagation();}};
  dialog.addEventListener('cancel',blocked);dialog.addEventListener('click',blockClick,true);
  try{let response;if(chrome.runtime?.id){response=await chrome.runtime.sendMessage({type:'IMPORT_DATA',bundle:pending});if(!response?.ok)throw Error(response?.error||'The import could not finish.');}else response=await importTransfer(pending);
   if(disposed)return;clear();result.textContent=`Import complete: ${response.added} added, ${response.updated} updated, ${response.kept} kept.`;dispatchEvent(new CustomEvent('better-solar-data-imported',{detail:{importId:response.importId}}));
  }catch(error){if(!disposed)result.textContent=error.message;}finally{dialog.removeEventListener('cancel',blocked);dialog.removeEventListener('click',blockClick,true);if(!disposed)setBusy(false);}
 };
 const dispose=()=>{disposed=true;clear();};dialog.addEventListener('close',dispose,{once:true});
 return clear;
}

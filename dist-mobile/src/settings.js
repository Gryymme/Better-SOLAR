import {extension as chrome,watchProgress} from './webextension.js';
import {openModal,toast,checkboxSetting} from './ui.js';
import {setTheme} from './theme.js';
import {deleteLocalData} from './data-reset.js';
import {allRecords} from './db.js';
import {collectionReport} from './cache-report.js';
import {displayedProgress,syncProgress} from './progress-layout.js';
import {listenForDataReset} from './data-reset.js';
import {shouldConfirmExternalLinks,setExternalLinkConfirmation} from './external-links.js';
export function openSettings(){
 const theme=document.documentElement.dataset.theme==='dark'?'dark':'light';
 openModal('Settings',`<section class="settings-section"><h3>Appearance</h3><label>Theme<select data-theme-select aria-label="Theme"><option value="light" ${theme==='light'?'selected':''}>Light</option><option value="dark" ${theme==='dark'?'selected':''}>Dark</option></select></label></section><hr><section class="settings-section"><h3>External websites</h3>${checkboxSetting({id:'external-setting',attribute:'data-external-confirm',checked:shouldConfirmExternalLinks(),title:'Ask before opening external websites',description:'Turn this on to restore confirmation after choosing “Do not ask again.”'})}</section><hr><section class="settings-section"><h3>Cached datasets and collection report</h3><div id="settings-report" aria-live="polite">Loading collection report…</div></section><hr><section class="settings-section"><h3>Local academic data</h3><p>Delete all locally saved records, the private Canvas feed and calendar, collection history, and schedule drafts from this browser profile.</p><p class="muted">Your SOLAR and Canvas accounts are unchanged. You will need to collect your records again to use them here.</p><button class="danger-button" id="request-delete">Delete all scraped data</button><div id="delete-confirm" class="delete-confirm" hidden><p><strong>Delete all saved academic data?</strong> This cannot be undone.</p><div class="settings-actions"><button id="cancel-delete">Cancel</button><button id="confirm-delete" class="danger-button">Delete data</button></div></div><div class="modal-error" role="alert"></div><p id="delete-result" role="status" aria-live="polite"></p></section>`,dialog=>{
   let disposed=false,reportVersion=0;
   const updateReport=async()=>{const version=++reportVersion;try{const records=await allRecords(),progress=chrome?.storage?(await chrome.storage.local.get('scrapeProgress')).scrapeProgress||{}:{};if(disposed||version!==reportVersion)return;const host=dialog.querySelector('#settings-report');const previous=displayedProgress(host),expanded=host.querySelector('details')?.open??false;host.innerHTML=collectionReport(records,progress,{expanded,online:navigator.onLine});syncProgress(previous,host);}catch(error){if(!disposed)dialog.querySelector('#settings-report').textContent=error.message;}};
   const progressChanged=(changes,area)=>{if(area==='local'&&(changes.scrapeProgress||changes.dataResetAt))void updateReport();};
   const stopProgress=chrome?.storage?watchProgress(progressChanged):()=>{};const stopReset=listenForDataReset(()=>void updateReport());void updateReport();
   dialog.addEventListener('close',()=>{disposed=true;reportVersion++;stopProgress();stopReset();},{once:true});
   dialog.querySelector('#settings-report').onclick=async event=>{if(event.target.closest('[data-action=retry]')){try{const response=await chrome.runtime.sendMessage({type:'RETRY'});if(!response?.ok)throw Error(response?.error||'Retry could not start.');await updateReport();}catch(error){toast(error.message);}}};
   const themeSelect=dialog.querySelector('[data-theme-select]'),request=dialog.querySelector('#request-delete'),confirm=dialog.querySelector('#delete-confirm'),result=dialog.querySelector('#delete-result');
   const externalPreference=dialog.querySelector('[data-external-confirm]');externalPreference.onchange=async()=>{try{await setExternalLinkConfirmation(externalPreference.checked);}catch(error){dialog.querySelector('.modal-error').textContent=error.message;}};
   themeSelect.onchange=async()=>{try{await setTheme(themeSelect.value);}catch(error){dialog.querySelector('.modal-error').textContent=error.message;}};
   request.onclick=()=>{confirm.hidden=false;request.hidden=true;dialog.querySelector('#confirm-delete').focus();};
   dialog.querySelector('#cancel-delete').onclick=()=>{confirm.hidden=true;request.hidden=false;request.focus();};
   dialog.querySelector('#confirm-delete').onclick=async()=>{
     const deleteButton=dialog.querySelector('#confirm-delete');deleteButton.innerHTML='<span class=button-spinner aria-hidden=true></span> Deleting…';deleteButton.setAttribute('aria-busy','true');dialog.querySelectorAll('button').forEach(button=>button.disabled=true);themeSelect.disabled=true;result.textContent='Stopping collection and deleting local data…';
     const preventClose=event=>event.preventDefault();dialog.addEventListener('cancel',preventClose);
     try{await Promise.race([new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))),new Promise(resolve=>setTimeout(resolve,80))]);await deleteLocalData();confirm.hidden=true;request.hidden=false;result.textContent='All local academic data was deleted. You can now remove the extension from your browser.';toast('Local academic data deleted.');}
     catch(error){dialog.querySelector('.modal-error').textContent=error.message;result.textContent='';}
     finally{deleteButton.textContent='Delete data';deleteButton.removeAttribute('aria-busy');dialog.removeEventListener('cancel',preventClose);dialog.querySelectorAll('button').forEach(button=>button.disabled=false);themeSelect.disabled=false;}
   };
 });
}

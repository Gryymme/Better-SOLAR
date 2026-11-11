import {initTheme} from './theme.js';
import {displayedProgress,syncProgress} from './progress-layout.js';
import {esc,icon,cacheFeedback} from './ui.js';
import {openSettings} from './settings.js';
import {listenForDataReset} from './data-reset.js';
import {initializeFonts} from './fonts.js';
await initTheme();void initializeFonts();const settings=document.querySelector('#settings');settings.innerHTML=icon('settings');settings.onclick=openSettings;listenForDataReset(()=>display({}));
function display(p={}){
 const running=p.state==='running',el=document.querySelector('#progress'),previous=displayedProgress(el),expanded=el.querySelector('details')?.open||false;
 document.querySelector('#scrape').disabled=running;
 if(!p.state){el.textContent='Ready to collect your signed-in SOLAR records.';return;}
 const summary=p.state==='complete'?'Collection complete':p.state==='partial'?'Collection finished with errors':'Collector needs attention';
 const body=`<p class="collection-detail">${running?`Collecting ${esc(p.current||'SOLAR records')} · `:''}${esc(p.completed||0)}/${esc(p.total||0)} steps${p.failed?` · ${esc(p.failed)} failed`:''}</p>${(p.errors||[]).map(error=>`<p class="error-text"><b>${esc(error.label)}:</b> ${esc(error.error)}</p>`).join('')}`;
 el.innerHTML=cacheFeedback(summary,body,{expanded,failed:!!p.errors?.length,collecting:running?p:null});syncProgress(previous,el);
}
async function action(type){try{const r=await chrome.runtime.sendMessage({type});if(!r?.ok)throw Error(r?.error||'The extension did not respond.');display((await chrome.storage.local.get('scrapeProgress')).scrapeProgress);}catch(e){document.querySelector('#progress').textContent=e.message;document.querySelector('#scrape').disabled=false;}}
document.querySelector('#scrape').onclick=()=>action('START');document.querySelector('#progress').addEventListener('click',event=>{if(event.target.closest('[data-action=retry]'))void action('RETRY');});document.querySelector('#launch').onclick=()=>action('LAUNCH');
if(globalThis.chrome?.storage){display((await chrome.storage.local.get('scrapeProgress')).scrapeProgress);chrome.storage.onChanged.addListener((c,a)=>{if(a==='local'&&c.scrapeProgress)display(c.scrapeProgress.newValue);});}else{document.querySelector('#progress').textContent='Load the dist folder as an unpacked Chrome or Edge extension.';document.querySelector('#scrape').disabled=true;document.querySelector('#launch').onclick=()=>window.open('app.html');}

import {esc,cacheFeedback,icon} from './ui.js';
export function collectionReport(records,progress={}, {expanded=false,demo=false,online=true,dismissible=false}={}){
 const cached=records.filter(record=>record.data),last=records.map(record=>record.scrapedAt).filter(Boolean).sort().at(-1);
 let summary=demo?'Demonstration — synthetic data only':cached.length?`${cached.length} locally cached datasets${last?' · Last collected '+new Date(last).toLocaleString():''}`:'No academic data collected yet';
 if(!online)summary+=' · Offline';
 const collecting=progress.state==='running',errors=progress.errors||[];
 const detail=collecting?`<p class="collection-detail">Collecting ${esc(progress.current||'SOLAR records')} · ${esc(progress.completed||0)}/${esc(progress.total||0)} steps</p>`:'';
 const body=`${detail}<p class="record-status">Academic records stay on this device.</p>${errors.length?`<ul class="cache-errors">${errors.map(error=>`<li class="error-text"><strong>${esc(error.label)}:</strong> ${esc(error.error)}</li>`).join('')}</ul>`:''}`;
 return `<div class="cache-bar">${cacheFeedback(summary,body,{expanded,failed:!!errors.length,collecting:collecting?progress:null})}${dismissible?`<button class="icon-button cache-dismiss" data-action="dismiss-cache" aria-label="Dismiss cached datasets report" title="Report remains available in Settings">${icon('close')}</button>`:''}</div>`;
}

import {meetingLanes,sharedMeetingTitle} from './meeting-layout.js';
import {dialogFrames} from './motion.js';
import {progressFraction} from './progress-layout.js';
import {syncTablePeeks} from './table-layout.js';
import {closeSectionPickersIn} from './section-picker.js';
import {DAYS,DAY_NAMES,clock,occurrences,shortTitle,roomLabel,yearLabel,available,displayTime,slotWarnings,amount} from './core.js';
export const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={external:'<path d="M7 17 17 7M7 7h10v10"/>',settings:'<path d="m9.5 3-.7 2.3-2 .9L4.6 5.7 2.7 9l1.7 1.7v2.6L2.7 15l1.9 3.3 2.2-.5 2 .9.7 2.3h5l.7-2.3 2-.9 2.2.5 1.9-3.3-1.7-1.7v-2.6L21.3 9l-1.9-3.3-2.2.5-2-.9-.7-2.3z"/><circle cx="12" cy="12" r="3"/>',chevron:'<path d="m6 9 6 6 6-6"/>',sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',arrow:'<path d="m9 5 7 7-7 7"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',exit:'<path d="M10 3H4v18h6m4-14 5 5-5 5M8 12h11"/>',calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 11h18"/>',refresh:'<path d="M20 7v5h-5M4 17v-5h5"/><path d="M6 6a8 8 0 0 1 14 6M4 12a8 8 0 0 0 14 6"/>',book:'<path d="M3 4h7l2 2 2-2h7v16h-7l-2 2-2-2H3zM12 6v16"/>',github:'<path d="M9 19c-5 1-5-3-7-3m14 5v-4c0-1-.3-2-1-2 4 0 6-2 6-6 0-1-.4-2-1-3 0-1 0-2-.3-3-2 0-3 1-4 1a14 14 0 0 0-8 0C6 3 5 3 3 3c-.3 1-.3 2 0 3C2 7 2 8 2 9c0 4 2 6 6 6-.7 0-1 1-1 2v4"/>',instagram:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',facebook:'<path d="M14 22v-9h3l1-4h-4V7c0-1 0-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v9"/>',link:'<path d="m10 13 4-4M8 16l-1 1a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m0 2 1-1a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0"/>',check:'<path d="m4 12 5 5L20 6"/>',close:'<path d="m5 5 14 14M5 19 19 5"/>'};
export const icon=(name)=>`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.book}</svg>`;
export const pages={'dashboard':'Dashboard','user-profile':'User Profile','curriculum':'Curriculum','balance-summary':'Balance Summary','saf':'Schedule and Assessment','grades':'Grades','course-list':'Courses Offered','enrollment-reminders':'Enrollment Reminders'};
export const subpages=['user-profile','curriculum','balance-summary','saf','grades'];
const navlink=(route,active)=>`<a href="#${route}" ${route===active?'aria-current="page"':''}>${pages[route]}</a>`;
export function pageHeading(route,{firstName='',collecting=false}={}){
 const title=route==='dashboard'?`Welcome${firstName?' '+firstName:''}`:route==='curriculum'?'Program Curriculum':route==='balance-summary'?'Account Balance Summary':pages[route];
 return `<div class="page-heading"><div><p class="eyebrow">${route==='dashboard'?'YOUR ACADEMIC SPACE':'BETTER SOLAR'}</p><h1>${esc(title)}</h1><p>${route==='dashboard'?'Your semester, thoughtfully organized.':route==='saf'?'Enrollment, courses, and fees for your selected term.':'Your academic records, available on this device.'}</p></div><div class="heading-tools"><button data-action="scrape" ${collecting?'disabled':''}>${icon('refresh')} ${collecting?'Collecting…':'Scrape Data'}</button></div></div>`;
}
export function calendarToolbar(month,{connected=false}={}){
 return `<div class="calendar-header"><h2>${esc(month)}</h2><div class="calendar-links"><button data-action="connect">${icon('link')} ${connected?'Canvas connected':'Connect to Canvas'}</button><a class="button-link" href="https://feu.instructure.com" target="_blank" rel="noreferrer">Open Canvas ${icon('arrow')}</a></div></div><div class="calendar-controls"><span class="muted">Canvas activities</span><div class="nav-buttons"><button class="icon-button calendar-prev" data-action="prev-month" aria-label="Previous month">${icon('arrow')}</button><button class="icon-button today-button" data-action="today">Today</button><button class="icon-button" data-action="next-month" aria-label="Next month">${icon('arrow')}</button></div></div>`;
}
export function navigation(route){
 const enrollmentLinks=`${navlink('course-list',route)}<a href="https://solar.feualabang.edu.ph/course/registration" target="_blank" rel="noreferrer">Course Registration ${icon('external')}</a><a href="https://solar.feualabang.edu.ph/cor/revision" target="_blank" rel="noreferrer">COR Revision ${icon('external')}</a>${navlink('enrollment-reminders',route)}`;
 return `<div class="nav-space" aria-hidden="true"></div><header class="site-header" id="nav"><div class="nav-inner"><button class="nav-leading" data-action="menu" aria-label="Open navigation" aria-controls="side-menu" aria-expanded="false">${icon('menu')}</button><a class="brand" href="#dashboard"><img src="assets/logo.jpg" width="40" height="40" alt="Better SOLAR logo"><span>Better SOLAR</span></a><nav class="desktop-nav" aria-label="Main navigation">${navlink('dashboard',route)}<div class="dropdown"><button data-action="profile-menu" aria-expanded="false" aria-controls="profile-links" class="${subpages.includes(route)?'active':''}">Academics ${icon('chevron')}</button><div id="profile-links" class="dropdown-list">${subpages.map(p=>navlink(p,route)).join('')}</div></div><div class="dropdown"><button data-action="enrollment-menu" aria-expanded="false" aria-controls="enrollment-links" class="${['course-list','enrollment-reminders'].includes(route)?'active':''}">Enrollment ${icon('chevron')}</button><div id="enrollment-links" class="dropdown-list">${enrollmentLinks}</div></div></nav><div class="compact-current dropdown"><button data-action="current-menu" aria-expanded="false" aria-controls="current-links">${pages[route]} ${icon('chevron')}</button><div class="dropdown-list" id="current-links">${(subpages.includes(route)?subpages:Object.keys(pages)).map(p=>navlink(p,route)).join('')}</div></div><div class="nav-end"><button class="settings-button" data-action="settings" aria-label="Settings">${icon('settings')}</button><button class="exit" data-action="exit">Exit ${icon('exit')}</button></div></div></header><div id="menu-shade" hidden></div><aside id="side-menu" class="side-menu" hidden aria-label="Navigation"><div class="side-title"><strong>Better SOLAR</strong><button class="icon-button" data-action="menu-close" aria-label="Close navigation">${icon('close')}</button></div><nav>${navlink('dashboard',route)}<details open><summary>Academics</summary>${subpages.map(p=>navlink(p,route)).join('')}</details><details open><summary>Enrollment</summary>${enrollmentLinks}</details><button data-action="settings">${icon('settings')} Settings</button><button data-action="exit">${icon('exit')} Exit</button></nav></aside>`;
}
export function footer(){return `<footer class="site-footer"><div class="footer-top"><a class="brand" href="#dashboard"><img src="assets/logo.jpg" width="38" height="38" alt=""><span>Better SOLAR</span></a><p class="footer-copy">Copyright 2026 © Gryymme (Elijah Miranda Nonan)</p><div class="social"><a href="https://www.facebook.com/elijajajah.paul" target="_blank" rel="noreferrer" aria-label="Facebook">${icon('facebook')}</a><a href="https://www.instagram.com/elijajajah.paul/" target="_blank" rel="noreferrer" aria-label="Instagram">${icon('instagram')}</a><a href="https://github.com/Gryymme" target="_blank" rel="noreferrer" aria-label="GitHub">${icon('github')}</a></div></div></footer>`;}
export function table(headers,rows,{className='',id='',selectable=false,columns=[],scrollClass='',label='',rowClasses=[],headerLabels=[]}={}){
 const group=columns.length?`<colgroup>${columns.map(width=>`<col style="width:${Number(width)}%">`).join('')}</colgroup>`:'';
 return `<div class="table-scroll ${scrollClass}"${label?` role="region" aria-label="${esc(label)}" tabindex="0"`:''}><table ${id?`id="${esc(id)}"`:''} class="data-table ${className}">${group}<thead><tr>${headers.map((h,i)=>`<th scope="col"${headerLabels[i]?` aria-label="${esc(headerLabels[i])}"`:""}>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map((row,i)=>`<tr${rowClasses[i]?` class="${esc(rowClasses[i])}"`:""} ${selectable?`data-index="${i}"`:''}>${row.map(v=>`<td>${v}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}" class="empty-cell">No records for this selection.</td></tr>`}</tbody></table></div>`;
}
export function sectionPicker(prefix,value='',{placeholder='All sections',allowAll=true,required=false}={}){
 return `<div class="section-filter"><label for="${esc(prefix)}-section-input">Section</label><div class="section-picker" data-section-picker data-allow-all="${allowAll}"><div class="section-control"><input id="${esc(prefix)}-section-input" name="section" value="${esc(value)}" placeholder="${esc(placeholder)}" role="combobox" aria-label="Search section" aria-autocomplete="list" aria-haspopup="listbox" aria-expanded="false" aria-controls="${esc(prefix)}-section-list" autocomplete="off" spellcheck="false" ${required?'required':''}><button class="section-toggle" type="button" aria-label="Show section choices" aria-controls="${esc(prefix)}-section-list" aria-expanded="false">${icon('chevron')}</button></div><div id="${esc(prefix)}-section-list" class="section-options" role="listbox" aria-label="Sections" popover="manual" hidden></div></div></div>`;
}
export function cacheFeedback(summary,body,{expanded=false,failed=false,collecting=null}={}){
 return `<details ${expanded?'open':''}><summary>${collecting?`<span class="collection-title">Collecting SOLAR Data</span><span class="collection-track" role="progressbar" aria-label="Collecting SOLAR Data" aria-valuemin="0" aria-valuemax="${Math.max(1,Number(collecting.total)||1)}" aria-valuenow="${Math.max(0,Math.min(Number(collecting.completed)||0,Number(collecting.total)||1))}"><span class="collection-fill" data-fraction="${progressFraction(collecting.completed,collecting.total)}"></span></span>`:`<span class="connection-dot"></span>${esc(summary)}`}</summary><div class="cache-details">${body}${failed?'<button class="cache-retry" data-action="retry">Retry failed work</button>':''}</div></details>`;
}

export function offeringRows(courses,{select=false,picked=new Set()}={}){

 return table(select?['','Course Code','Section','Class Size','Remaining Slots','Day','Time','Room']:['Course Code','Section','Class Size','Remaining Slots','Day','Time','Room'],courses.map(c=>[
   ...(select?[`<input type="checkbox" name="course" value="${esc(c._id)}" aria-label="Select ${esc(c.code)} ${esc(c.section)}" ${picked.has(c._id)?'checked':''}>`]:[]),
   esc(c.code),esc(c.section),esc(c.size),`${esc(c.remaining)}`,entries(c.days??c.day),entries(c.time,displayTime),entries(c.room)
 ]),{className:`offering-table${select?' selectable':''}`,scrollClass:'offering-table-scroll',columns:select?[5,12,10,7,13,7,28,18]:[14,12,8,14,7,28,17],label:select?'Select courses from the offerings table':'Course offerings',rowClasses:courses.map(c=>available(c)?'':'unavailable'),headerLabels:select?['Course selection']:[]});
}

export const entries=(raw,format=value=>value)=>String(raw??'').split('/').map(value=>`<span class="meeting-entry">${esc(format(value.trim()))}</span>`).join('');
export function curriculumTable(courses){return table(['Course Code','Course Title','Credits','Laboratory (Co-requisite)','Pre-Requisite'],courses.map(c=>[c.code,c.title,c.credits,c.lab,c.prerequisite].map(esc)),{className:'curriculum-table',columns:[14,40,8,19,19]});}
export function assessmentCoursesTable(courses){return table(['Code','Course Title','Section','Credits','Days','Time','Room'],courses.map(c=>[esc(c.code),esc(c.title),esc(c.section),esc(c.credits),entries(c.days??c.day),entries(c.time,displayTime),entries(c.room)]),{className:'meeting-table saf-course-table',scrollClass:'wrap-table',columns:[11,25,9,12,7,24,12]});}
export function gradesResult(record){
 if(!record)return '';
 const courses=record.data?.courses||[];
 const body=courses.length?table(['Course Code','Course Title','Section','Credits','Midterm','Final'],courses.map(c=>[esc(c.code),esc(c.title),esc(c.section),esc(c.credits),esc(c.midterm),c.final?esc(c.final):'<span class="muted" aria-label="Final grade not yet available">Not yet available</span>'])):record.status==='error'||!record.data?empty('This term could not be collected.'):empty('No grades are available for this term.','Refresh after SOLAR publishes grades for the selected term.');
 return `<section class="card" data-grades-result><h2>Term ${esc(record.term)} - SY ${esc(yearLabel(record.year))}</h2>${body}${recordStatus(record)}</section>`;
}
export function isReminderImage(source){try{const url=new URL(source);return url.origin==='https://solar.feualabang.edu.ph'&&/^\/images\/OSES_\d+T\d{4}_ALAB\.png$/i.test(url.pathname);}catch{return false;}}
export function enrollmentReminders(record){
 const images=(record?.data?.images||[]).filter(image=>(/^data:image\/png;base64,[a-z0-9+/]+=*$/i.test(image.dataUrl||'')&&isReminderImage(image.sourceUrl))).slice(0,1);
 return `<section class="card reminders-card"><h2>Enrollment Reminders</h2>${images.length?images.map(image=>`<img class="reminders-image" src="${esc(image.dataUrl)}" alt="${esc(image.alt||'Enrollment reminders')}">`).join(''):empty('Enrollment reminders have not been collected yet.','Sign in to SOLAR, then use Scrape Data to save the reminders image for offline viewing.')}<p><a href="https://solar.feualabang.edu.ph/enrollment/reminders" target="_blank" rel="noreferrer">View enrollment reminders in SOLAR ${icon('arrow')}</a></p>${recordStatus(record)}</section>`;
}
export function slotWarningBody(courses){return `<p>The following courses have no confirmed remaining slots:</p><ul class="slot-warning-list">${slotWarnings(courses).map(course=>`<li><strong>${esc(course.code)} (${esc(course.section)})</strong> — ${esc(course.reason)}</li>`).join('')}</ul><p>You can still add them to your visualizer. Their course blocks will appear red.</p>`;}
export function calendarEventDialog(item){return {
 body:`${pairs([['When',item.allDay?new Date(item.start).toLocaleDateString():new Date(item.start).toLocaleString()],['Location',item.location||'Not specified']])}<div class="event-description">${esc(item.description)}</div>`,
 footer:`${item.url?`<a class="button-link primary" href="${esc(item.url)}" target="_blank" rel="noreferrer">Open in Canvas ${icon('arrow')}</a>`:''}<button data-close>Close</button>`
 };}

export function pairs(entries){return `<dl class="pairs">${entries.map(([k,v,bold])=>`<dt>${esc(k)}</dt><dd${bold?' class="strong"':''}>${esc(v===null||v===undefined||v===''?'Not available':v)}</dd>`).join('')}</dl>`;}
export function empty(title='No cached data yet.',detail='Sign in to SOLAR, then use Scrape Data to collect your records.'){return `<div class="empty-state">${icon('book')}<h3>${esc(title)}</h3><p>${esc(detail)}</p></div>`;}
export function recordStatus(r){if(!r)return '';return `<p class="record-status ${r.status==='error'?'error-text':''}">${r.status==='error'?`Refresh failed: ${esc(r.error)}. ${r.data?'Previous cached data is shown.':''}`:r.status==='empty'?'Source returned no records.':r.sourceUrl==='Synthetic demonstration'?'Synthetic demonstration record.':'Locally cached record.'}${r.scrapedAt?' Updated '+esc(new Date(r.scrapedAt).toLocaleString()):''}.</p>`;}
export function selector(records){const terms=[...new Set(records.map(r=>r.term).filter(Boolean))].sort((a,b)=>+a-+b),years=[...new Set(records.map(r=>r.year).filter(Boolean))].sort().reverse();return `<form id="term-form" class="term-form"><label>Term<select name="term" required><option value="">Select term</option>${terms.map(t=>`<option value="${esc(t)}">Term ${esc(t)}</option>`).join('')}</select></label><label>School Year<select name="year" required><option value="">Select school year</option>${years.map(y=>`<option value="${esc(y)}">SY ${esc(yearLabel(y))}</option>`).join('')}</select></label><button class="primary" type="submit">Submit ${icon('arrow')}</button></form>`;}
export const scheduleClock=minutes=>clock(minutes).replace(/^0(?=\d:)/,'');
export function schedule(courses,{title='Weekly course schedule',removable=false,highlightSlots=false,source=''}={}){
 const parsed=courses.map((course,courseIndex)=>{const parsed=occurrences(course);return {...parsed,items:parsed.items.map((meeting,meetingIndex)=>({...meeting,courseIndex,meetingIndex}))};}),meetings=meetingLanes(parsed.flatMap(x=>x.items)),warnings=[...new Set(parsed.flatMap(x=>x.warnings))];
 const min=Math.min(7*60,...meetings.map(m=>Math.floor(m.start/60)*60));
 const max=Math.max(21*60,...meetings.map(m=>Math.ceil(m.end/60)*60)),hours=(max-min)/60;
 const heads=DAYS.map((day,i)=>`<div class="week-day" aria-label="${DAY_NAMES[i]}"><span class="day-full">${DAY_NAMES[i]}</span><span class="day-short" aria-hidden="true">${DAY_NAMES[i].slice(0,3)}</span></div>`).join('');
 const hourPositions=Array.from({length:hours+1},(_,index)=>({minutes:min+index*60,style:`top:calc(var(--hour-height) * ${index})`}));
 const lines=hourPositions.map(hour=>`<div class="hour-line" style="${hour.style}"></div>`).join('');
 const labels=hourPositions.map(hour=>`<div class="hour-label" style="${hour.style}"><span data-hour-minutes="${hour.minutes}">${scheduleClock(hour.minutes)}</span></div>`).join('');
 const blocks=meetings.map(m=>{
   const day=DAYS.indexOf(m.day),count=m.columns,left=(day+m.lane/count)*100/6,width=100/(6*count),c=m.course,displayTitle=count>1?sharedMeetingTitle(c.title):shortTitle(c.title||'');
   return `<div class="course-block interactive${count>1?' shared-time':''}${removable?' removable':''}${highlightSlots&&!available(c)?' no-slots':''}" tabindex="0" role="button" data-course-info data-course-index="${m.courseIndex}" data-meeting-index="${m.meetingIndex}" title="View ${esc(c.code)} course information" data-duration="${m.end-m.start}" data-lane="${m.lane}" data-columns="${count}" data-day="${m.day}" style="top:calc(var(--hour-height) * ${(m.start-min)/60});left:calc(${left}% + 2px);width:calc(${width}% - 4px);height:calc(var(--hour-height) * ${(m.end-m.start)/60} - 4px)" aria-label="${esc(`${c.code} ${c.title||''}, ${DAY_NAMES[day]}, ${clock(m.start)} to ${clock(m.end)}, ${roomLabel(m.room)}`)}"><div class="course-content"><strong class="course-code" data-course-text="${esc(c.code)}">${esc(c.code)}</strong><b class="course-title" data-course-text="${esc(displayTitle)}">${esc(displayTitle)}</b><span class="meeting-time" data-start-time="${scheduleClock(m.start)}" data-end-time="${scheduleClock(m.end)}">${scheduleClock(m.start)}–${scheduleClock(m.end)}</span><span class="meeting-room" data-room-text="${esc(roomLabel(m.room))}">${esc(roomLabel(m.room))}</span></div></div>`;
 }).join('');
 const bodyHeight=`height:calc(var(--hour-height) * ${hours} + 40px)`;
 return `<div class="schedule-component"><div class="section-head"><h2>${esc(title)}</h2>${icon('calendar')}</div>${!meetings.length?'<p class="muted">No scheduled courses to display.</p>':''}${warnings.length?`<div class="notice warning">${warnings.map(esc).join('<br>')}</div>`:''}<div class="schedule-frame" role="region" aria-label="Weekly schedule, Monday through Saturday"><div class="week-grid" data-hours="${hours}" data-schedule-source="${esc(source)}"><div class="week-time-rail" aria-hidden="true"><div class="week-time-rail-header"></div><div class="week-time-rail-body" style="${bodyHeight}"><div class="week-time-area">${labels}</div></div></div><div class="week-days-viewport" tabindex="0" role="region" aria-label="Schedule days. On mobile, swipe left or right or use the arrow keys to view the other half of the week."><div class="week-days-track"><div class="week-header"><div class="week-head-days">${heads}</div></div><div class="week-body" style="${bodyHeight}"><div class="week-time-area">${lines}<div class="week-meetings">${blocks}</div></div></div></div></div></div></div></div>`;
}

let timer;export function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>el.classList.remove('visible'),5000);}
const dialogStates=new WeakMap();
export function modalMarkup(title,body,footer='',subtitle=''){
 return `<div class="modal-shell"><div class="modal-header"><div class="modal-title-group"><h2 id="modal-title">${esc(title)}</h2>${subtitle?`<p class="modal-subtitle">${esc(subtitle)}</p>`:''}</div><button type="button" class="icon-button" data-close aria-label="Close dialog">${icon('close')}</button></div><div class="modal-body">${body}</div>${footer?`<div class="modal-footer">${footer}</div>`:''}</div>`;
}
function showDialog(dialog,title,body,onReady,{footer='',onClose,subtitle=''}={}){
 const old=dialogStates.get(dialog);old?.animation?.cancel();
 closeSectionPickersIn(dialog);const state={focus:document.activeElement,onClose};dialogStates.set(dialog,state);
 dialog.classList.remove('course-picker','dialog-closing');dialog.innerHTML=modalMarkup(title,body,footer,subtitle);
 dialog.querySelectorAll('[data-close]').forEach(button=>button.onclick=()=>closeDialog(dialog));
 dialog.onclick=event=>{if(event.target===dialog&&!dialog.querySelector('#confirm-delete:disabled')){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)void closeDialog(dialog);}};
 dialog.oncancel=event=>{event.preventDefault();if(!dialog.querySelector('#confirm-delete:disabled'))void closeDialog(dialog);};
 dialog.onclose=()=>{closeSectionPickersIn(dialog);if(dialogStates.get(dialog)!==state)return;dialogStates.delete(dialog);if(state.focus?.isConnected)state.focus.focus();state.onClose?.();syncTablePeeks();};
 dialog.style.animation='none';if(!dialog.open)dialog.showModal();onReady?.(dialog);syncTablePeeks(dialog);
 void dialog.offsetWidth;dialog.style.removeProperty('animation');
}
export function openModal(title,body,onReady,options={}){showDialog(document.querySelector('#modal'),title,body,onReady,options);}
export function closeDialog(dialog,{immediate=false}={}){
 if(!dialog?.open)return Promise.resolve();const state=dialogStates.get(dialog);
 if(state?.closing&&!immediate)return state.closing;
 const finish=()=>{if(state&&dialogStates.get(dialog)!==state)return;dialog.classList.remove('dialog-closing');closeSectionPickersIn(dialog);dialog.close();};
 if(immediate||!state||globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches||typeof dialog.animate!=='function'){state?.animation?.cancel();finish();return Promise.resolve();}
 dialog.classList.add('dialog-closing');
 state.animation=dialog.animate(dialogFrames(false),{duration:140,easing:'ease-in',fill:'forwards'});
 state.closing=state.animation.finished.catch(()=>{}).then(()=>{finish();state.animation.cancel();});return state.closing;
}
export function closeModal(options={}){return closeDialog(document.querySelector('#modal'),options);}
export function closeTransientDialogs(){for(const dialog of document.querySelectorAll('.slot-warning,.course-removal,.external-confirmation'))void closeDialog(dialog,{immediate:true});}
export function confirmUnavailable(courses){
 return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='slot-warning';dialog.setAttribute('role','alertdialog');dialog.setAttribute('aria-labelledby','slot-warning-title');document.body.append(dialog);let accepted=false;
   showDialog(dialog,'No remaining slots',slotWarningBody(courses),element=>{element.querySelector('#modal-title').id='slot-warning-title';element.querySelector('[data-accept-slots]').onclick=async()=>{accepted=true;await closeDialog(element);};},{footer:'<button data-close>Back</button><button class="primary" data-accept-slots>Add to visualizer</button>',onClose:()=>{dialog.remove();resolve(accepted);}});
 });
}

export const COURSE_INFORMATION_SUBTITLE='Displaying details for the selected course.';
export function courseInformation(course,meeting){
 const credits=amount(course.credits),time=meeting?`${DAY_NAMES[DAYS.indexOf(meeting.day)]} · ${scheduleClock(meeting.start)}–${scheduleClock(meeting.end)}`:displayTime(course.time),room=meeting?roomLabel(meeting.room):String(course.room||'Not available');
 const fields=[['Course code',course.code],['Full course title',course.title],['Course section',course.section],['Credits',credits===null?'Not available':`${credits} credits`],['Time',time],['Room assignment',room]];
 return `<dl class="course-info-fields">${fields.map(([label,value])=>`<div><dt>${esc(label)}</dt><dd>${esc(value||'Not available')}</dd></div>`).join('')}</dl>`;
}
export function confirmCourseRemoval(course,{meeting}={}){
 return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='course-removal';dialog.setAttribute('role','dialog');dialog.setAttribute('aria-labelledby','course-removal-title');document.body.append(dialog);let choice=null;
   showDialog(dialog,'Course information',courseInformation(course,meeting),element=>{element.querySelector('#modal-title').id='course-removal-title';element.querySelector('[data-confirm-remove]').onclick=async()=>{choice='course';await closeDialog(element);};element.querySelector('[data-remove-all]').onclick=async()=>{choice='all';await closeDialog(element);};},{subtitle:COURSE_INFORMATION_SUBTITLE,footer:'<button data-close>Cancel</button><button class="danger-button" data-confirm-remove>Remove selected course</button><button class="danger-button" data-remove-all>Remove all courses</button>',onClose:()=>{dialog.remove();resolve(choice);}});
 });
}
export function checkboxSetting({id,attribute,title,description,checked=false}){
 const dataAttribute=/^data-[a-z-]+$/.test(attribute||'')?attribute:'';
 return `<label class="checkbox-setting"><input type="checkbox" ${dataAttribute} ${checked?'checked':''} aria-labelledby="${esc(id)}-label" aria-describedby="${esc(id)}-hint"><span class="checkbox-setting-copy"><span id="${esc(id)}-label" class="checkbox-setting-title">${esc(title)}</span><span id="${esc(id)}-hint" class="checkbox-setting-hint muted">${esc(description)}</span></span></label>`;
}
export function externalConfirmationMarkup(url){return `<p>Do you want to open this website?</p><p class="external-host"><strong>${esc(url.hostname)}</strong></p><p class="external-url">${url.href.split(/([/?&#=])/).map(part=>esc(part)+(/^[/?&#=]$/.test(part)?'<wbr>':'')).join('')}</p><p class="modal-error" role="alert"></p>`;}
export function externalConfirmationFooter(){return `<div class="external-confirm-preference">${checkboxSetting({id:'external-confirm',attribute:'data-remember-external',title:'Do not ask again',description:'You can turn confirmations back on in Settings.'})}</div><div class="external-confirm-actions"><button data-close>Cancel</button><button class="primary" data-proceed-external>Proceed</button></div>`;}

export function confirmExternalNavigation(url,onProceed){
 return new Promise(resolve=>{const dialog=document.createElement('dialog');dialog.className='external-confirmation';dialog.setAttribute('aria-labelledby','external-confirm-title');document.body.append(dialog);let opened=false;
   showDialog(dialog,'Open external website?',externalConfirmationMarkup(url),element=>{element.querySelector('#modal-title').id='external-confirm-title';element.querySelector('[data-proceed-external]').onclick=async()=>{const button=element.querySelector('[data-proceed-external]');button.disabled=true;try{await onProceed(element.querySelector('[data-remember-external]').checked);opened=true;await closeDialog(element);}catch(error){element.querySelector('.modal-error').textContent=error.message;button.disabled=false;}};},{footer:externalConfirmationFooter(),onClose:()=>{dialog.remove();resolve(opened);}});
 });
}

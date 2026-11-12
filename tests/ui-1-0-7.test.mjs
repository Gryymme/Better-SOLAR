import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {confirmCourseRemoval,confirmExternalNavigation,externalConfirmationMarkup,externalConfirmationFooter,isReminderImage,enrollmentReminders,navigation,offeringRows} from '../src/ui.js';
import {fittingTitle} from '../src/calendar-layout.js';import {documentFromHTML} from './support-dom.mjs';
function dialogs(){
 const previousDocument=globalThis.document,previousMedia=globalThis.matchMedia;let last;
 globalThis.matchMedia=()=>({matches:true});
 globalThis.document={activeElement:{isConnected:true,focus(){}},body:{append(){}},querySelectorAll:()=>[],createElement(){
  const controls={'#modal-title':{},'[data-confirm-remove]':{},'[data-remove-all]':{},'[data-proceed-external]':{},'[data-remember-external]':{checked:false},'.modal-error':{}},cancel={};
  last={open:false,controls,cancel,style:{removeProperty(){}},classList:{remove(){}},setAttribute(){},querySelectorAll:selector=>selector==='[data-close]'?[cancel]:[],querySelector:selector=>controls[selector]||null,showModal(){this.open=true;},close(){this.open=false;this.onclose();},remove(){this.removed=true;}};return last;
 }};
 return {get last(){return last;},restore(){globalThis.document=previousDocument;globalThis.matchMedia=previousMedia;}};
}
test('Course actions offer selected course, all courses, or Cancel as distinct decisions',async()=>{
 const f=dialogs(),course={code:'CS0065',section:'AA1'};
 try{
  let decision=confirmCourseRemoval(course,{count:4});assert.ok(f.last.innerHTML.includes('all 4 courses'));assert.ok(f.last.innerHTML.includes('Remove all courses'));await f.last.cancel.onclick();assert.equal(await decision,null);
  decision=confirmCourseRemoval(course,{count:4});await f.last.controls['[data-confirm-remove]'].onclick();assert.equal(await decision,'course');
  decision=confirmCourseRemoval(course,{count:4});await f.last.controls['[data-remove-all]'].onclick();assert.equal(await decision,'all');
 }finally{f.restore();}
});
test('External confirmation shows the destination, preserves Cancel, and only Proceed passes the checkbox decision',async()=>{
 const f=dialogs();let proceeds=0,remembered;
 try{
  const url=new URL('https://solar.feualabang.edu.ph/course/registration?term=1&year=20262027');
  const markup=externalConfirmationMarkup(url);assert.ok(markup.includes('solar.feualabang.edu.ph'));assert.ok(!markup.includes('Do not ask again'));assert.ok(externalConfirmationFooter().includes('Do not ask again'));assert.ok(!markup.includes('<script'));
  let response=confirmExternalNavigation(url,remember=>{proceeds++;remembered=remember;});await f.last.cancel.onclick();assert.equal(await response,false);assert.equal(proceeds,0);
  response=confirmExternalNavigation(url,remember=>{proceeds++;remembered=remember;});f.last.controls['[data-remember-external]'].checked=true;await f.last.controls['[data-proceed-external]'].onclick();assert.equal(await response,true);assert.equal(proceeds,1);assert.equal(remembered,true);
 }finally{f.restore();}
});
test('Only the OSES term-specific Alabang PNG is shown, including future terms, and unrelated legacy images stay hidden',()=>{
 const base='https://solar.feualabang.edu.ph';assert.equal(isReminderImage(base+'/images/OSES_1T2627_ALAB.png'),true);assert.equal(isReminderImage(base+'/images/OSES_3T2829_ALAB.png'),true);
 for(const path of ['/images/logo.png','/images/reminders.png','/images/OSES_1T2627_OTHER.png'])assert.equal(isReminderImage(base+path),false);
 assert.equal(isReminderImage('https://unrelated.invalid/images/OSES_1T2627_ALAB.png'),false);
 const png='data:image/png;base64,iVBORw0KGgo=';const html=enrollmentReminders({data:{images:[{sourceUrl:base+'/images/logo.png',dataUrl:png,alt:'Site logo'},{sourceUrl:base+'/images/OSES_1T2627_ALAB.png',dataUrl:png,alt:'Enrollment reminders'}]}});
 assert.equal(documentFromHTML(html).querySelectorAll('img').length,1);assert.ok(!html.includes('Site logo'));
});
test('Registration and COR links carry a northeast external-link icon',()=>{
 const doc=documentFromHTML(navigation('dashboard'));for(const path of ['/course/registration','/cor/revision']){const anchor=doc.querySelectorAll('#enrollment-links a').find(anchor=>anchor.getAttribute('href').endsWith(path));assert.ok(anchor.querySelector('svg'));assert.ok(anchor.textContent.includes(path.includes('registration')?'Course Registration':'COR Revision'));}
});
test('Remaining Slots has more dedicated width, and project styles never force character wrapping',()=>{
 const normal=documentFromHTML(offeringRows([])),picker=documentFromHTML(offeringRows([],{select:true}));assert.equal(normal.querySelectorAll('col')[3].getAttribute('style'),'width:14%');assert.equal(picker.querySelectorAll('col')[4].getAttribute('style'),'width:13%');
 const css=readFileSync('src/styles.css','utf8');assert.ok(!/overflow-wrap\s*:\s*(anywhere|break-word)|word-break\s*:\s*(break-all|break-word)/.test(css));
 assert.equal(fittingTitle('Alpha Beta Gamma',text=>text.length<=13),'Alpha Beta...');
});

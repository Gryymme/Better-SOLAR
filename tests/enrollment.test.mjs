import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {documentFromHTML} from './support-dom.mjs';
import {slotWarnings,conflicts} from '../src/core.js';
import {offeringRows,schedule,slotWarningBody,navigation,enrollmentReminders} from '../src/ui.js';
import {collectionReport} from '../src/cache-report.js';
import {dialogFrames} from '../src/motion.js';
import {wrapCourseText,courseFontSize} from '../src/schedule-layout.js';
const parserSource=readFileSync('scraper/dom.js','utf8'),origin='https://solar.feualabang.edu.ph';
function remindersDOM(html,fetch){const context={document:documentFromHTML(html),location:{origin,href:origin+'/enrollment/reminders',pathname:'/enrollment/reminders'},URL,crypto,fetch,AbortSignal,Uint8Array,btoa};vm.createContext(context);vm.runInContext(parserSource,context);return context.BetterSolarDOM;}
const course=(code,remaining,time='07:00-08:00')=>({code,remaining,time,section:'AA1',days:'M',room:'703'});
test('No-slot and unknown-slot rows remain selectable; warning identifies each affected course, and only preview blocks turn red',()=>{
 const courses=[course('FULL','0'),course('UNKNOWN',''),course('OPEN','5')],doc=documentFromHTML(offeringRows(courses,{select:true}));
 assert.equal(doc.querySelectorAll('input[disabled]').length,0);assert.equal(doc.querySelectorAll('tr.unavailable').length,2);
 assert.deepEqual(slotWarnings(courses).map(warning=>warning.code),['FULL','UNKNOWN']);
 const body=slotWarningBody(courses);assert.ok(body.includes('FULL (AA1)'));assert.ok(body.includes('UNKNOWN (AA1)'));assert.ok(!body.includes('OPEN (AA1)'));assert.ok(body.includes('No remaining slots.'));
 assert.equal(documentFromHTML(schedule(courses,{highlightSlots:true})).querySelectorAll('.course-block.no-slots').length,2);
 assert.equal(documentFromHTML(schedule(courses)).querySelectorAll('.course-block.no-slots').length,0);
 assert.deepEqual(conflicts([],[course('FULL','0')]),[]);assert.ok(conflicts([course('A','5')],[course('FULL','0')]).length>0);
});
test('Academics and Enrollment menus preserve academic pages, add exact SOLAR destinations, and remove Canvas from navigation',()=>{
 const doc=documentFromHTML(navigation('enrollment-reminders'));
 assert.ok(doc.querySelector('[data-action="profile-menu"]').textContent.includes('Academics'));
 assert.ok(doc.querySelector('[data-action="enrollment-menu"]'));assert.equal(doc.querySelector('#enrollment-links').children.length,4);
 assert.equal(doc.querySelector('#enrollment-links').children[0].getAttribute('href'),'#course-list');
 assert.equal(doc.querySelector('#enrollment-links').children[1].getAttribute('href'),origin+'/course/registration');
 assert.equal(doc.querySelector('#enrollment-links').children[2].getAttribute('href'),origin+'/cor/revision');
 assert.equal(doc.querySelector('#enrollment-links').children[3].getAttribute('href'),'#enrollment-reminders');
 assert.equal(doc.querySelectorAll('a').filter(anchor=>anchor.getAttribute('href').includes('instructure')).length,0);
 assert.ok(!doc.querySelector('.nav-leading').textContent.includes('Menu'));
});
test('Reminder discovery ignores site chrome and external images, deduplicates PNG sources, and prefers reminder content',()=>{
 const parser=remindersDOM('<header><img src="/logo.png"></header><main><img src="/misc.png"><img src="/images/OSES_1T2627_ALAB.png?v=2" alt="Enrollment reminders"><a href="/images/OSES_1T2627_ALAB.png?v=2">Download</a><img src="https://unrelated.invalid/reminder.png"></main>');
 const images=parser.reminderImages();assert.equal(images.length,1);assert.equal(images[0].url,origin+'/images/OSES_1T2627_ALAB.png?v=2');
 assert.throws(()=>remindersDOM('<input type="password"><img src="/images/OSES_1T2627_ALAB.png">').reminderImages(),/session expired/);
 assert.throws(()=>remindersDOM('<main><img src="/logo.png"></main>').reminderImages(),/PNG image is missing/);
});
test('Reminders fetches one visible OSES term image and ignores generic images, hidden history and download links',()=>{
 const parser=remindersDOM('<main><img src="/images/reminders.png"><img src="/images/OSES_1T2627_ALAB.png" style="display:none"><a href="/images/OSES_1T2627_ALAB.png">History</a><img src="/images/OSES_3T2829_ALAB.png" style="width:100%;"><img src="/images/OSES_2T2829_ALAB.png"></main>');
 const images=parser.reminderImages();assert.equal(images.length,1);assert.equal(images[0].url,origin+'/images/OSES_3T2829_ALAB.png');
 assert.throws(()=>remindersDOM('<main><a href="/images/OSES_1T2627_ALAB.png">Download</a><img src="https://unrelated.invalid/images/OSES_1T2627_ALAB.png"></main>').reminderImages(),/OSES.*missing/);
});
test('Authenticated reminders collection validates PNG bytes and returns an offline image rather than a live network dependency',async()=>{
 let request;const bytes=new Uint8Array([137,80,78,71,13,10,26,10,0,1,2]);
 const parser=remindersDOM('<main><img src="/images/OSES_1T2627_ALAB.png" alt="Official reminders"></main>',async(url,options)=>{request={url,options};return {ok:true,headers:{get:()=>String(bytes.length)},arrayBuffer:async()=>bytes.buffer};});
 const result=await parser.reminders();assert.equal(request.options.credentials,'include');assert.equal(request.options.redirect,'error');
 assert.equal(result.discovery.url,origin+'/enrollment/reminders');assert.equal(result.data.images[0].dataUrl,'data:image/png;base64,'+btoa(String.fromCharCode(...bytes)));
 const html=enrollmentReminders({data:result.data});assert.ok(html.includes('src="data:image/png;base64,'));assert.ok(!html.includes('src="https:'));assert.ok(html.includes('Official reminders'));
});
test('Expired image responses and oversized PNGs fail explicitly instead of replacing cached images',async()=>{
 const html='<main><img src="/images/OSES_1T2627_ALAB.png"></main>';
 const invalid=remindersDOM(html,async()=>({ok:true,headers:{get:()=>null},arrayBuffer:async()=>new TextEncoder().encode('<html>Login</html>').buffer}));await assert.rejects(()=>invalid.reminders(),/did not return a PNG/);
 const large=remindersDOM(html,async()=>({ok:true,headers:{get:()=>8000001},arrayBuffer:async()=>{throw Error('Must reject before reading');}}));await assert.rejects(()=>large.reminders(),/too large/);
 const denied=remindersDOM(html,async()=>({ok:false,status:403}));await assert.rejects(()=>denied.reminders(),/HTTP 403/);
 assert.ok(enrollmentReminders(null).includes('have not been collected'));assert.ok(!enrollmentReminders({data:{images:[{dataUrl:'javascript:alert(1)'}]}}).includes('src="javascript'));
});
test('The dismissible app report and non-dismissible Settings report contain the same collection failures',()=>{
 const progress={state:'partial',errors:[{label:'Enrollment Reminders',error:'Session expired'}]};
 const app=documentFromHTML(collectionReport([],progress,{dismissible:true})),settings=documentFromHTML(collectionReport([],progress,{expanded:true}));
 assert.ok(app.querySelector('[data-action="dismiss-cache"]'));assert.equal(settings.querySelector('[data-action="dismiss-cache"]'),null);
 assert.ok(settings.querySelector('details[open]'));assert.ok(settings.querySelector('.cache-errors').textContent.includes('Session expired'));
 assert.equal(app.querySelector('.cache-errors').textContent,settings.querySelector('.cache-errors').textContent);
});
test('Dialog opening and closing share a centered inverse fade and scale',()=>{
 assert.deepEqual(dialogFrames(false),[...dialogFrames(true)].reverse());assert.equal(dialogFrames(true)[0].transform,'scale(.97)');
});
test('Phone title lines keep complete words within sixteen characters and font scaling remains measured',()=>{
 const text='CS ELECTIVE - INTELLIGENT SYSTEMS',lines=wrapCourseText(text,1000,value=>value.length);
 assert.ok(lines.every(line=>Array.from(line).length<=16));assert.equal(lines.join(' '),text);
 assert.deepEqual(wrapCourseText('CS0065',1000,value=>value.length),['CS0065']);
 assert.equal(courseFontSize(['W'.repeat(16)],48,value=>value.length*6,9),4.5);
 assert.equal(courseFontSize(['CS0065'],80,value=>value.length*5,9),9);
});

import test from 'node:test';import assert from 'node:assert/strict';
import {pageHeading,navigation,calendarToolbar,schedule,confirmCourseRemoval} from '../src/ui.js';
import {courseTextLayout,compactHour,compactBlockHeight} from '../src/schedule-layout.js';
import {collectionReport} from '../src/cache-report.js';
import {documentFromHTML} from './support-dom.mjs';
test('Assessment has its own title and the shared Academics eyebrow, while balance retains its title',()=>{
 const saf=documentFromHTML(pageHeading('saf'));assert.equal(saf.querySelector('h1').textContent,'Schedule and Assessment');assert.equal(saf.querySelector('.eyebrow').textContent,'BETTER SOLAR');
 assert.equal(documentFromHTML(pageHeading('balance-summary')).querySelector('h1').textContent,'Account Balance Summary');
});
test('Courses Offered belongs to Enrollment in both desktop and sidebar navigation',()=>{
 const doc=documentFromHTML(navigation('course-list'));
 const desktop=doc.querySelectorAll('.desktop-nav a').find(anchor=>anchor.getAttribute('href')==='#course-list');assert.equal(desktop.parentElement.id,'enrollment-links');
 const sidebar=doc.querySelectorAll('#side-menu a').find(anchor=>anchor.getAttribute('href')==='#course-list');assert.equal(sidebar.parentElement.tagName,'DETAILS');assert.ok(sidebar.parentElement.textContent.includes('Enrollment'));
 assert.ok(doc.querySelector('[data-action="enrollment-menu"]').getAttribute('class').includes('active'));
});
test('Calendar places connection first, then Open Canvas, and month controls use accessible SVG arrows',()=>{
 const doc=documentFromHTML(calendarToolbar('November 2026',{connected:true})),controls=doc.querySelector('.calendar-links').children;
 assert.equal(controls[0].getAttribute('data-action'),'connect');assert.ok(controls[0].textContent.includes('Canvas connected'));assert.ok(controls[1].textContent.includes('Open Canvas'));
 assert.ok(doc.querySelector('[data-action="prev-month"] svg'));assert.equal(doc.querySelector('[data-action="next-month"]').getAttribute('aria-label'),'Next month');
});
test('Editable course blocks are keyboard-accessible removal targets and contain no separate X button',()=>{
 const course={_id:'CS1|A',code:'CS1',section:'A',title:'Intelligent Systems',days:'M / W',time:'07:00-08:50 / 07:00-08:50',room:'703 / ONLINE'};
 const editable=documentFromHTML(schedule([course],{removable:true}));const blocks=editable.querySelectorAll('.course-block');assert.equal(blocks.length,2);
 for(const block of blocks){assert.equal(block.getAttribute('role'),'button');assert.equal(block.getAttribute('tabindex'),'0');assert.equal(block.getAttribute('data-course-remove'),course._id);assert.equal(block.querySelector('button'),null);}
 const readonly=documentFromHTML(schedule([course]));assert.equal(readonly.querySelector('[data-course-remove]'),null);
});
test('A report starts collapsed and an explicitly expanded report can be preserved on refresh',()=>{
 assert.equal(documentFromHTML(collectionReport([],{})).querySelector('details[open]'),null);
 assert.ok(documentFromHTML(collectionReport([],{},{expanded:true})).querySelector('details[open]'));
});
test('Mobile course code and title share one measured font while preserving words and a sixteen-character maximum',()=>{
 const texts=['CS0065','CS ELECTIVE - INTELLIGENT SYSTEMS'];const measure=text=>text.length*5;
 const layout=courseTextLayout(texts,48,measure,9);assert.ok(layout.fontSize<=9&&layout.fontSize>0);assert.equal(layout.lines.length,2);
 for(let index=0;index<texts.length;index++){
   const lines=layout.lines[index];assert.equal(lines.join(' '),texts[index]);
   assert.ok(lines.every(line=>line.length<=16&&measure(line)*layout.fontSize/9<=48.1));
 }
 assert.ok(layout.lines[1].includes('INTELLIGENT'));assert.ok(!layout.lines[1].includes('INTELLIGEN'));
 const extreme=courseTextLayout(['CS123','A'.repeat(30)],48,measure,9);assert.deepEqual(extreme.lines[1],['A'.repeat(30)]);assert.ok(measure(extreme.lines[1][0])*extreme.fontSize/9<=48.1);
});
test('Mobile axis labels omit minutes while content heights use just content, padding and borders',()=>{
 assert.equal(compactHour(420),'7 AM');assert.equal(compactHour(720),'12 PM');assert.equal(compactHour(1260),'9 PM');
 assert.equal(compactBlockHeight(42,4,4),50);assert.equal(compactBlockHeight(42.2,4,4,2),53);
 const doc=documentFromHTML(schedule([{code:'A',days:'M',time:'07:00-08:50',room:'703'}]));assert.equal(doc.querySelector('.meeting-time').textContent,'7:00 AM–8:50 AM');assert.ok(doc.querySelector('[data-hour-minutes="420"]'));
});
test('Course removal confirmation identifies the course, waits for a decision, and resolves Cancel versus Remove',async()=>{
 const previousDocument=globalThis.document,previousMedia=globalThis.matchMedia;let lastDialog,focusCount=0;
 globalThis.matchMedia=()=>({matches:true});
 globalThis.document={activeElement:{isConnected:true,focus:()=>focusCount++},body:{append(){}},querySelectorAll:()=>[],createElement(){
   const title={id:'modal-title'},cancel={},confirm={},all={};
   lastDialog={open:false,style:{removeProperty(){}},classList:{remove(){}},setAttribute(){},querySelectorAll:selector=>selector==='[data-close]'?[cancel]:[],querySelector:selector=>selector==='#modal-title'?title:selector==='[data-confirm-remove]'?confirm:selector==='[data-remove-all]'?all:null,showModal(){this.open=true;},close(){this.open=false;this.onclose();},remove(){this.removed=true;},cancel,confirm,all};return lastDialog;
 }};
 try{
   const canceled=confirmCourseRemoval({code:'CS0065',section:'AA1',title:'Intelligent Systems'});assert.equal(lastDialog.open,true);assert.ok(lastDialog.innerHTML.includes('CS0065 (AA1)'));await lastDialog.cancel.onclick();assert.equal(await canceled,null);
   const accepted=confirmCourseRemoval({code:'CS0065',section:'AA1'});await lastDialog.confirm.onclick();assert.equal(await accepted,'course');assert.equal(lastDialog.removed,true);assert.equal(focusCount,2);
 }finally{globalThis.document=previousDocument;globalThis.matchMedia=previousMedia;}
});

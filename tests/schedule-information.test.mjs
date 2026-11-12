import test from 'node:test';import assert from 'node:assert/strict';
import {courseTextLayout,timeTextLines} from '../src/schedule-layout.js';
import {enrichCourseOfferings,occurrences} from '../src/core.js';
import {schedule,courseInformation,externalConfirmationMarkup,externalConfirmationFooter,modalMarkup,COURSE_INFORMATION_SUBTITLE} from '../src/ui.js';
import {documentFromHTML} from './support-dom.mjs';
const course={code:'CCS0001',title:'The complete original course title must remain available',section:'AN43',credits:'3.00',days:'W / F',time:'07:00-08:50 / 11:00-12:50',room:'703 / ONLINE'};
test('Desktop shared blocks preserve the regular font and display wrapped codes without titles',()=>{
 const measure=text=>text.length*5;for(const width of [40,80,150]){const normal=courseTextLayout([course.code,course.title],width,measure,12),shared=courseTextLayout([course.code,course.title],width,measure,12,{shared:true});assert.equal(normal.fontSize,12);assert.equal(shared.fontSize,12);assert.deepEqual(shared.lines,[['CCS-','001'],[]]);}
});
test('Paged mobile blocks retain both code and wrapped title without per-course font reduction',()=>{
 const measure=text=>text.length*5,layout=courseTextLayout([course.code,'Intelligent Systems'],70,measure,12,{mobile:true,shared:true});assert.equal(layout.fontSize,12);assert.deepEqual(layout.lines,[['CCS-','001'],['Intelligent','Systems']]);
});
test('Time ranges wrap after the dash instead of reducing type',()=>{
 const measure=text=>text.length*5;assert.deepEqual(timeTextLines('7:00 AM','8:50 AM',100,measure),['7:00 AM–8:50 AM']);assert.deepEqual(timeTextLines('7:00 AM','8:50 AM',45,measure),['7:00 AM–','8:50 AM']);
});
test('Every timetable block references its course and meeting and opens information by keyboard',()=>{
 for(const source of ['dashboard','saf','creator']){const doc=documentFromHTML(schedule([course],{source,removable:source==='creator'})),blocks=doc.querySelectorAll('[data-course-info]');assert.equal(blocks.length,2);assert.equal(doc.querySelector('.week-grid').getAttribute('data-schedule-source'),source);assert.deepEqual(blocks.map(block=>block.getAttribute('data-meeting-index')),['0','1']);for(const block of blocks){assert.equal(block.getAttribute('data-course-index'),'0');assert.equal(block.getAttribute('role'),'button');assert.equal(block.getAttribute('tabindex'),'0');assert.ok(block.getAttribute('aria-label').includes(course.title));}}
});
test('Course details preserve six complete fields and the selected meeting room/time',()=>{
 const doc=documentFromHTML(courseInformation(course,occurrences(course).items[1])),rows=doc.querySelector('.course-info-fields').children;assert.equal(rows.length,6);assert.deepEqual(rows.slice(0,4).map(row=>row.querySelector('dd').textContent),[course.code,course.title,'AN43','3 credits']);assert.equal(rows[4].querySelector('dd').textContent,'Friday · 11:00 AM–12:50 PM');assert.equal(rows[5].querySelector('dd').textContent,'ONLINE');assert.ok(!doc.body.textContent.includes('Remove this course'));
 const header=documentFromHTML(modalMarkup('Course information','', '',COURSE_INFORMATION_SUBTITLE));assert.ok(header.querySelector('.modal-subtitle'));
});
test('Offering credits come from collected curriculum data and are never invented',()=>{
 const raw=[{code:'CCS0001',credits:''},{code:'KNOWN',title:'Source title',credits:'4'},{code:'UNKNOWN'}],merged=enrichCourseOfferings(raw,[{courses:[{code:'CCS0001',title:course.title,credits:'3'},{code:'KNOWN',credits:'2'}]}]);assert.equal(merged[0].credits,'3');assert.equal(merged[0].title,course.title);assert.equal(merged[1].credits,'4');assert.equal(merged[2].credits,'');assert.ok(!courseInformation(merged[2]).includes('0 credits'));assert.equal(raw[0].credits,'');
});
test('External Settings hint remains grouped under its checkbox text in the footer',()=>{
 const body=externalConfirmationMarkup(new URL('https://example.invalid'));assert.ok(!body.includes('You can turn confirmations'));const doc=documentFromHTML(externalConfirmationFooter()),copy=doc.querySelector('.checkbox-setting-copy');assert.equal(copy.children[0].textContent,'Do not ask again');assert.equal(copy.children[1].textContent,'You can turn confirmations back on in Settings.');assert.equal(doc.querySelector('input').getAttribute('aria-describedby'),'external-confirm-hint');
});

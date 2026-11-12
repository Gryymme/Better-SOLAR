import test from 'node:test';import assert from 'node:assert/strict';
import {pageHeading,schedule,courseInformation,modalMarkup,checkboxSetting,externalConfirmationFooter,COURSE_INFORMATION_SUBTITLE} from '../src/ui.js';
import {courseTextLayout,timeTextLines} from '../src/schedule-layout.js';
import {enrichCourseOfferings,occurrences} from '../src/core.js';
import {documentFromHTML} from './support-dom.mjs';
const course={code:'CCS0001',title:'The complete selected course title',section:'AN43',credits:'3',days:'W / F',time:'07:00-08:50 / 11:00-12:50',room:'703 / ONLINE'};
test('Schedule puts its hour rail outside the horizontal day viewport and includes all six day columns',()=>{
 const doc=documentFromHTML(schedule([course],{source:'dashboard'})),grid=doc.querySelector('.week-grid'),rail=grid.querySelector('.week-time-rail'),viewport=grid.querySelector('.week-days-viewport');
 assert.equal(rail.parentElement,grid);assert.equal(viewport.parentElement,grid);assert.equal(viewport.querySelector('.week-time-rail'),null);assert.ok(rail.querySelector('[data-hour-minutes="420"]'));assert.equal(viewport.querySelectorAll('.week-day').length,6);assert.deepEqual(viewport.querySelectorAll('.day-short').map(day=>day.textContent),['MON','TUE','WED','THU','FRI','SAT']);assert.equal(grid.querySelectorAll('.week-swipe-controls button').length,2);assert.equal(viewport.querySelector('.week-swipe-controls'),null);assert.equal(viewport.getAttribute('tabindex'),'0');
 assert.equal(viewport.querySelectorAll('[data-course-info]').length,2);assert.equal(grid.getAttribute('data-schedule-source'),'dashboard');
});
test('Three-day mobile presentation retains code, title, time and room at fixed desktop-density typography',()=>{
 const measure=text=>text.length*5,layout=courseTextLayout([course.code,'Intelligent Systems'],90,measure,12,{mobile:true,shared:true});
 assert.equal(layout.fontSize,12);assert.deepEqual(layout.lines[0],['CCS-','001']);assert.deepEqual(layout.lines[1],['Intelligent','Systems']);assert.deepEqual(timeTextLines('7:00 AM','8:50 AM',45,measure),['7:00 AM–','8:50 AM']);
});
test('Course information keeps full values and numeric credits, and its header has the requested subtitle',()=>{
 const doc=documentFromHTML(modalMarkup('Course information',courseInformation(course,occurrences(course).items[1]),'',COURSE_INFORMATION_SUBTITLE));
 assert.equal(doc.querySelector('.modal-subtitle').textContent,'Displaying details for the selected course.');const rows=doc.querySelector('.course-info-fields').children;assert.equal(rows.length,6);assert.equal(rows[0].querySelector('dd').textContent,'CCS0001');assert.equal(rows[1].querySelector('dd').textContent,course.title);assert.equal(rows[3].querySelector('dd').textContent,'3 credits');assert.equal(rows[5].querySelector('dd').textContent,'ONLINE');
 const merged=enrichCourseOfferings([{code:'CCS0001'}],[{courses:[course]}]);assert.equal(merged[0].credits,'3');assert.equal(merged[0].title,course.title);
});
test('Checkbox control groups both text lines beside one centered checkbox and uses explicit accessible names/descriptions',()=>{
 const doc=documentFromHTML(checkboxSetting({id:'preference',attribute:'data-external-confirm',title:'Ask before opening external websites',description:'Restore confirmations',checked:true})),label=doc.querySelector('label.checkbox-setting');
 assert.equal(label.children[0].tagName,'INPUT');assert.equal(label.children[1].getAttribute('class'),'checkbox-setting-copy');assert.equal(label.querySelector('input').getAttribute('aria-labelledby'),'preference-label');assert.equal(label.querySelector('input').getAttribute('aria-describedby'),'preference-hint');assert.equal(label.querySelector('.checkbox-setting-copy').children.length,2);
 const external=documentFromHTML(externalConfirmationFooter());assert.ok(external.querySelector('.external-confirm-preference .checkbox-setting-hint'));assert.ok(external.querySelector('.external-confirm-actions [data-proceed-external]'));
});

test('The shared heading changes the collection label only when cached data exists and shows progress during collection',()=>{
 const button=options=>documentFromHTML(pageHeading('dashboard',options)).querySelector('[data-action="scrape"]');
 assert.ok(button({}).textContent.includes('Scrape Data'));assert.ok(button({hasData:true}).textContent.includes('Update SOLAR Data'));assert.ok(button({hasData:true,collecting:true}).textContent.includes('Collecting…'));assert.equal(button({hasData:true,collecting:true}).disabled,true);
});

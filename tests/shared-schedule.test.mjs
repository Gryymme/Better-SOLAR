import test from 'node:test';import assert from 'node:assert/strict';
import {conflicts} from '../src/core.js';
import {meetingLanes,sharedMeetingTitle} from '../src/meeting-layout.js';
import {courseCodeLines,courseTextLayout} from '../src/schedule-layout.js';
import {schedule,modalMarkup,externalConfirmationMarkup,externalConfirmationFooter} from '../src/ui.js';
import {documentFromHTML} from './support-dom.mjs';
const course=(code,time,days='M')=>({code,section:'A',days,time,room:'703',title:'Introduction to Intelligent Systems'});
test('Visualizer can accept existing and newly selected time overlaps while still rejecting duplicates and invalid meeting pairs',()=>{
 const a=course('A','07:00-09:00'),b=course('B','08:00-10:00'),c=course('C','08:30-09:30');
 assert.deepEqual(conflicts([a],[b,c],{allowOverlap:true}),[]);assert.deepEqual(conflicts([],[a,b,c],{allowOverlap:true}),[]);
 assert.ok(conflicts([a],[a],{allowOverlap:true}).some(error=>error.includes('already selected')));
 assert.ok(conflicts([],[{...b,days:'M / T'}],{allowOverlap:true}).some(error=>error.includes('entry counts differ')));
});
test('Overlaps share different lanes within their own group and later or adjacent meetings regain full day width',()=>{
 const input=[{day:'M',start:420,end:540},{day:'M',start:480,end:600},{day:'M',start:540,end:660},{day:'M',start:660,end:720},{day:'T',start:480,end:600}];
 const result=meetingLanes(input);assert.deepEqual(result.map(meeting=>meeting.columns),[2,2,2,1,1]);assert.deepEqual(result.map(meeting=>meeting.lane),[0,1,0,0,0]);assert.equal(input[0].lane,undefined);
 for(let i=0;i<result.length;i++)for(let j=i+1;j<result.length;j++){const a=result[i],b=result[j];if(a.day===b.day&&a.start<b.end&&b.start<a.end)assert.notEqual(a.lane,b.lane);}
});
test('Three-way and nested overlaps allocate enough side-by-side columns without narrowing independent groups',()=>{
 const meetings=meetingLanes([{day:'W',start:420,end:720},{day:'W',start:480,end:540},{day:'W',start:500,end:550},{day:'W',start:800,end:850},{day:'W',start:830,end:870}]);
 assert.deepEqual(meetings.map(meeting=>meeting.columns),[3,3,3,2,2]);assert.deepEqual(meetings.map(meeting=>meeting.lane),[0,1,2,0,1]);
});
test('Shared timetable uses group columns and limits only overlapping block titles to twenty characters',()=>{
 const courses=[course('CCS0001','07:00-09:00'),course('GED0004A','08:00-10:00'),course('LATER','11:00-12:00')];
 for(const removable of [false,true]){
  const doc=documentFromHTML(schedule(courses,{removable})),blocks=doc.querySelectorAll('.course-block');assert.deepEqual(blocks.map(block=>block.getAttribute('data-columns')),['2','2','1']);
  assert.ok(blocks[0].getAttribute('style').includes('width:calc(8.333333333333334% - 4px)'));assert.ok(blocks[2].getAttribute('style').includes('width:calc(16.666666666666668% - 4px)'));
  assert.ok(blocks.slice(0,2).every(block=>Array.from(block.querySelector('.course-title').textContent).length<=20));assert.equal(blocks[2].querySelector('.course-title').textContent,courses[2].title);
  assert.ok(blocks[0].getAttribute('aria-label').includes(courses[0].title));
 }
});
test('Narrow course codes separate letters and numbers using the requested display format without changing the original code',()=>{
 const measure=text=>text.length*6;
 assert.deepEqual(courseCodeLines('CCS0001',24,measure),['CCS-','001']);assert.deepEqual(courseCodeLines('GED0004A',24,measure),['GED-','004A']);
 assert.deepEqual(courseCodeLines('CCS0001',80,measure),['CCS0001']);assert.deepEqual(courseCodeLines('MATH1234',24,measure),['MATH-','1234']);
 const doc=documentFromHTML(schedule([course('GED0004A','07:00-09:00')]));assert.equal(doc.querySelector('.course-code').getAttribute('data-course-text'),'GED0004A');
});
test('A shared font fits full title words into narrow lanes without splitting or replacing their letters',()=>{
 const title=sharedMeetingTitle('Intelligent Systems');const measure=text=>text.length*6;
 const layout=courseTextLayout(['CCS0001',title],24,measure,12);assert.deepEqual(layout.lines[0],['CCS-','001']);assert.deepEqual(layout.lines[1],['Intelligent','Systems']);
 assert.ok(layout.fontSize<12);for(const line of layout.lines.flat())assert.ok(measure(line)*layout.fontSize/12<=24.1);
 assert.equal(sharedMeetingTitle('Short title'),'Short title');assert.ok(Array.from(sharedMeetingTitle('A very long course title that exceeds the cap')).length<=20);
});
test('External checkbox is below the divider in the same footer as Cancel and Proceed, outside the scrolling body',()=>{
 const doc=documentFromHTML(modalMarkup('Open website?',externalConfirmationMarkup(new URL('https://example.invalid')),externalConfirmationFooter()));
 assert.equal(doc.querySelector('.modal-body [data-remember-external]'),null);assert.ok(doc.querySelector('.modal-footer [data-remember-external]'));assert.ok(doc.querySelector('.modal-footer [data-close]'));assert.ok(doc.querySelector('.modal-footer [data-proceed-external]'));
 const footer=doc.querySelector('.modal-footer');assert.equal(footer.children[0].tagName,'LABEL');assert.equal(footer.children[1].getAttribute('class'),'external-confirm-actions');
});

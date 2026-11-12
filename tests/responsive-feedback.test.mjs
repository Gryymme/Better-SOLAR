import test from 'node:test';import assert from 'node:assert/strict';
import {cacheFeedback,navigation,schedule,scheduleClock,assessmentCoursesTable} from '../src/ui.js';
import {dialogFrames,sidebarFrames} from '../src/motion.js';
import {progressFraction,displayedProgress,syncProgress} from '../src/progress-layout.js';
import {halfRowHeight,syncTablePeeks} from '../src/table-layout.js';
import {wrapCourseText} from '../src/schedule-layout.js';
import {documentFromHTML} from './support-dom.mjs';

test('A collapsed collection card exposes only its generic title and progress, with specific work and retry inside details',()=>{
 const html=cacheFeedback('Private old cache summary','<p class="collection-detail">Collecting Course Offerings · Term 2 · 20232024 · 42/61 steps</p>',{collecting:{completed:42,total:61},failed:true});
 const doc=documentFromHTML(html),summary=doc.querySelector('summary');
 assert.equal(summary.textContent,'Collecting SOLAR Data');
 assert.equal(summary.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),'42');
 assert.equal(doc.querySelector('details').getAttribute('open'),null);
 assert.equal(summary.querySelector('.collection-detail'),null);assert.equal(summary.querySelector('button'),null);
 assert.ok(doc.querySelector('.cache-details').textContent.includes('42/61 steps'));assert.ok(doc.querySelector('.cache-details button'));
 assert.ok(!html.includes('Private old cache summary'));
});
test('Progress transitions resume from the currently displayed width across a complete DOM replacement',()=>{
 const properties=new Map(),fill={dataset:{fraction:'0.8'},style:{removeProperty(key){properties.delete(key);}},offsetWidth:200,getBoundingClientRect:()=>({width:76}),parentElement:{getBoundingClientRect:()=>({width:200})}};
 const scope={querySelector:()=>fill};const previous=displayedProgress(scope);assert.equal(previous,.38);
 let initial;Object.defineProperty(fill.style,'transform',{set(value){if(!initial)initial=value;properties.set('transform',value);}});
 syncProgress(previous,scope);assert.equal(initial,'scaleX(0.38)');assert.equal(properties.get('transform'),'scaleX(0.8)');
 assert.equal(progressFraction(99,61),1);assert.equal(progressFraction(-4,61),0);assert.equal(progressFraction(3,0),0);assert.equal(progressFraction('invalid',61),0);
});
test('Dialog opening stays centered and closing reverses its fade and scale; sidebar still slides',()=>{
 const opening=dialogFrames(true),closing=dialogFrames(false);assert.deepEqual(closing,[...opening].reverse());
 assert.equal(opening[0].opacity,0);assert.equal(opening.at(-1).transform,'scale(1)');assert.ok(opening.every(frame=>!frame.transform.includes('translate')));
 assert.equal(sidebarFrames(true)[0].transform,'translateX(-100%)');assert.equal(sidebarFrames(false).at(-1).transform,'translateX(-100%)');
});
test('Table scroll cue fits half a following row, including variable-height wrapped rows, and leaves complete tables alone',()=>{
 assert.equal(halfRowHeight(40,[60,60,60,60,60],220),190);
 assert.equal(halfRowHeight(40,[50,90,70,120],250),215);
 assert.equal(halfRowHeight(40,[50,90],250),null);
 assert.equal(halfRowHeight(40,[100,100],70),null);
});
test('Table fitting uses unscaled row sizes while a dialog animates, and recalculates after filtering',()=>{
 const properties=new Map(),rows=[60,90,100,80].map(offsetHeight=>({offsetHeight}));
 const table={querySelector:()=>({offsetHeight:40}),querySelectorAll:()=>rows};
 const wrapper={isConnected:true,style:{removeProperty:key=>properties.delete(key),set height(value){properties.set('height',value);}},offsetHeight:264,clientHeight:250,scrollHeight:370,querySelector:()=>table,closest:()=>null};
 const scope={querySelectorAll:()=>[wrapper]};syncTablePeeks(scope);assert.equal(properties.get('height'),'254px');
 wrapper.scrollHeight=180;syncTablePeeks(scope);assert.equal(properties.has('height'),false);wrapper.isConnected=false;syncTablePeeks({querySelectorAll:()=>[]});
});
test('Compact navigation has a single menu control before the brand at every narrow breakpoint',()=>{
 const doc=documentFromHTML(navigation('dashboard')),buttons=doc.querySelectorAll('[data-action="menu"]');
 assert.equal(buttons.length,1);assert.equal(buttons[0].getAttribute('class'),'nav-leading');
 assert.equal(doc.querySelector('.nav-inner').children[0],buttons[0]);assert.ok(doc.querySelector('.nav-inner').children[1].getAttribute('class').includes('brand'));
});
test('Weekly meeting text keeps bold semantic code/title, one metadata class per time/room, and non-padded clock hours',()=>{
 assert.equal(scheduleClock(7*60),'7:00 AM');assert.equal(scheduleClock(13*60+5),'1:05 PM');assert.equal(scheduleClock(12*60),'12:00 PM');
 const doc=documentFromHTML(schedule([{code:'CS0065',title:'CS ELECTIVE - INTELLIGENT SYSTEMS',days:'W',time:'07:00-08:50',room:'703'}]));
 assert.equal(doc.querySelector('.course-code').tagName,'STRONG');assert.equal(doc.querySelector('.course-title').tagName,'B');
 assert.equal(doc.querySelector('.meeting-time').textContent,'7:00 AM–8:50 AM');assert.equal(doc.querySelector('.meeting-room').textContent,'Room 703');
 const columns=documentFromHTML(assessmentCoursesTable([])).querySelectorAll('col');assert.equal(columns[3].getAttribute('style'),'width:12%');
});
test('Mobile course wrapping preserves whole words, fitting at most sixteen characters per line',()=>{
 const text='CS ELECTIVE - INTELLIGENT SYSTEMS';const lines=wrapCourseText(text,1000,value=>value.length*5);
 assert.ok(lines.every(line=>line.length<=16));assert.equal(lines.join(' '),text);assert.deepEqual(lines,['CS ELECTIVE -','INTELLIGENT','SYSTEMS']);
 assert.deepEqual(wrapCourseText('CS0065',50,value=>value.length*5),['CS0065']);
});

import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {documentFromHTML} from './support-dom.mjs';
const source=readFileSync('scraper/dom.js','utf8');
const header='<tr><th>Course</th><th>Section</th><th>Class Size</th><th>Remaining</th><th>Days</th><th>Time</th><th>Room</th></tr>';
const row=code=>`<tr><td>${code}</td><td>A</td><td>30</td><td>3</td><td>M</td><td>07:00-08:50</td><td>703</td></tr>`;
function fixture(pages){
 let index=0,clicks=0;const context={URL,crypto,setTimeout:callback=>queueMicrotask(callback),location:{origin:'https://solar.feualabang.edu.ph',href:'https://solar.feualabang.edu.ph/course/offerings',pathname:'/course/offerings'}};
 const load=()=>{const document=documentFromHTML(pages[index]);document.readyState='complete';for(const node of document.body.all()){
  node.closest=selector=>{for(let parent=node;parent;parent=parent.parentElement)if(parent.matches(selector))return parent;return null;};
  node.classList={contains:name=>(node.attrs.class||'').split(' ').includes(name)};
  node.click=()=>{clicks++;if(index<pages.length-1){index++;load();}};
 }context.document=document;};
 load();vm.createContext(context);vm.runInContext(source,context);return {scan:category=>context.BetterSolarDOM.scan(category),get clicks(){return clicks;}};
}
const table=(body,attrs='')=>`<table ${attrs}>${header}${body}</table>`;
const page=(body,start,end,total,{disabled=false}={})=>`<div class="dataTables_wrapper">${table(body)}<div class="dataTables_info">Showing ${start} to ${end} of ${total} entries</div><div class="dataTables_paginate"><button class="paginate_button next${disabled?' disabled':''}" ${disabled?'disabled':''}>Next</button></div></div>`;
test('Full scan visits every page and proves the declared row count before returning one complete snapshot',async()=>{
 const f=fixture([page(row('CS1'),1,1,2),page(row('CS2'),2,2,2,{disabled:true})]);const result=await f.scan('Course Offerings');
 assert.equal(result.coverage.complete,true);assert.equal(result.coverage.pages,2);assert.equal(result.coverage.rows,2);assert.deepEqual(Array.from(result.data.courses,course=>course.code),['CS1','CS2']);assert.equal(f.clicks,1);
});
test('A static full table retains all source rows and is verified by two stable reads',async()=>{
 const result=await fixture([table(row('CS1')+row('CS2'))]).scan('Course Offerings');assert.equal(result.coverage.rows,2);assert.equal(result.coverage.checks[0].method,'stable-full-document');
});
test('Multiple curriculum tables are scanned rather than silently stopping after the first',async()=>{
 const curriculum=code=>`<table><tr><th>Course Code</th><th>Title</th><th>Units</th><th>Laboratory</th><th>Pre-requisite</th></tr><tr><td>${code}</td><td>Complete title</td><td>3</td><td></td><td></td></tr></table>`;
 const result=await fixture([curriculum('CS1')+curriculum('CS2')]).scan('Curriculum');assert.equal(result.coverage.tables,2);assert.equal(result.coverage.rows,2);assert.deepEqual(Array.from(result.data.groups,group=>group.courses[0].code),['CS1','CS2']);
});
test('Missing tables, unrelated unavailable text, incomplete rows and unconfirmed empty tables cannot clear records',async()=>{
 for(const html of ['<p>No records found</p>','<p>Not available</p>'+table(''),table('<tr><td>CS1</td><td>A</td></tr>'),table('')])await assert.rejects(()=>fixture([html]).scan('Course Offerings'),/missing|incomplete|not confirmed/);
});
test('Explicit table-level zero records can confirm a dissolved final course',async()=>{
 const result=await fixture([table('<tr><td colspan="7">No courses found</td></tr>','data-total-rows="0"')]).scan('Course Offerings');assert.equal(result.data.empty,true);assert.equal(result.coverage.complete,true);assert.equal(result.coverage.rows,0);
});
test('A missing last page, changed total, skipped page or repeated page rejects the whole snapshot',async()=>{
 await assert.rejects(()=>fixture([page(row('CS1'),1,1,2,{disabled:true})]).scan('Course Offerings'),/row count/);
 await assert.rejects(()=>fixture([page(row('CS1'),1,1,2),page(row('CS2'),2,2,3,{disabled:true})]).scan('Course Offerings'),/total changed/);
 await assert.rejects(()=>fixture([page(row('CS1'),1,1,2),page(row('CS2'),3,3,2,{disabled:true})]).scan('Course Offerings'),/skipped/);
 await assert.rejects(()=>fixture([page(row('CS1'),1,1,2)]).scan('Course Offerings'),/did not settle/);
});
test('Filtered and unknown pagination cannot be mistaken for a complete table',async()=>{
 await assert.rejects(()=>fixture([page(row('CS1'),1,1,1,{disabled:true}).replace('entries','entries (filtered from 22 total entries)')]).scan('Course Offerings'),/filtered/);
 await assert.rejects(()=>fixture([`<div class="dataTables_wrapper">${table(row('CS1'))}<div class="pagination"><a class="page-link">1</a><a class="page-link">2</a></div></div>`]).scan('Course Offerings'),/Unsupported/);
});
test('Loading cell placeholders do not replace data; explicit total-credit footers are not course records',async()=>{
 await assert.rejects(()=>fixture([table(row('Loading…'))]).scan('Course Offerings'),/still loading/);
 const result=await fixture([table(row('CS1')+'<tr><td colspan="3">Total credits</td><td>3</td></tr>')]).scan('Course Offerings');assert.equal(result.coverage.rows,1);
});

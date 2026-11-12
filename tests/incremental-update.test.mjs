import test from 'node:test';import assert from 'node:assert/strict';import {mockIndexedDB} from './support-idb.mjs';
globalThis.indexedDB=mockIndexedDB();const db=await import('../src/db.js');const task={category:'Assessment',term:'1',year:'20262027',owner:'synthetic'},url='https://solar.feualabang.edu.ph/student/saf';
const coverage={complete:true,pages:2,rows:2};
test('Unchanged full snapshots retain their payload and original change timestamp but update the verification time',async()=>{
 await db.saveSuccess(task,{courses:[{code:'CS1',room:'703'},{code:'CS2',room:'704'}]},url,coverage);
 const id=db.recordId(task.category,task.term,task.year,task.owner),saved=await db.getRecord(id);saved.scrapedAt='2020-01-01T00:00:00.000Z';await db.saveRecord(saved);
 const result=await db.saveSuccess(task,{courses:[{room:'703',code:'CS1'},{room:'704',code:'CS2'}]},url,coverage),current=await db.getRecord(id);
 assert.equal(result.changed,false);assert.equal(current.scrapedAt,saved.scrapedAt);assert.ok(current.lastCheckedAt>saved.scrapedAt);assert.deepEqual(current.data,saved.data);
});
test('A complete changed snapshot replaces changed rooms and removes dissolved courses only in its own term',async()=>{
 await db.saveSuccess({...task,term:'2'},{courses:[{code:'OTHER'}]},url,coverage);
 const result=await db.saveSuccess(task,{courses:[{code:'CS1',room:'ONLINE'}]},url,{...coverage,rows:1});assert.equal(result.changed,true);
 assert.deepEqual((await db.getRecord(db.recordId(task.category,'1',task.year,task.owner))).data.courses,[{code:'CS1',room:'ONLINE'}]);
 assert.equal((await db.getRecord(db.recordId(task.category,'2',task.year,task.owner))).data.courses[0].code,'OTHER');
});
test('Incomplete attempts cannot delete or modify the cached payload, including an apparent zero-row table',async()=>{
 const id=db.recordId(task.category,task.term,task.year,task.owner),before=await db.getRecord(id);
 await assert.rejects(()=>db.saveSuccess(task,{courses:[],empty:true},url,{complete:false}),/Incomplete/);await db.markFailure(task,'Table not accessible');
 const after=await db.getRecord(id);assert.deepEqual(after.data,before.data);assert.equal(after.scrapedAt,before.scrapedAt);assert.equal(after.status,'error');
});

test('A missing profile field does not erase its old value, while an explicit empty source field can be saved',async()=>{
 const profile={category:'User Profile',owner:'synthetic'};
 await db.saveSuccess(profile,{values:{'Student Number':'SYNTHETIC','First Name':'Example','Last Name':'Fixture'}},url);
 await assert.rejects(()=>db.saveSuccess(profile,{values:{'Student Number':'SYNTHETIC','First Name':'Example','Last Name':''},fieldsPresent:['Student Number','First Name']},url,coverage),/Profile fields are missing/);
 await db.saveSuccess(profile,{values:{'Student Number':'SYNTHETIC','First Name':'Example','Last Name':''},fieldsPresent:['Student Number','First Name','Last Name']},url,coverage);
 assert.equal((await db.getRecord(db.recordId('User Profile','','','synthetic'))).data.values['Last Name'],'');
});

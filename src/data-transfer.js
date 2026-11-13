import {allRecords,getMeta,importRecordSnapshot} from './db.js';
import {CATEGORIES} from './core.js';
import {parseICS} from './ics.js';
export const TRANSFER_FORMAT='better-solar-academic-data',MAX_TRANSFER_BYTES=50*1024*1024;
const fail=message=>{throw Error(message);};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
function scalar(value,label){if(value!==undefined&&value!==null&&typeof value!=='string'&&typeof value!=='number'&&typeof value!=='boolean')fail('Invalid '+label+'.');}
function map(value,label){if(!object(value))fail('Missing '+label+'.');for(const item of Object.values(value))scalar(item,label);}
function rows(value,label,fields){if(!Array.isArray(value)||value.length>100000)fail('Invalid '+label+'.');for(const row of value){if(!object(row))fail('Invalid '+label+' row.');for(const field of fields)scalar(row[field],label+' '+field);}}
function dataShape(category,data){
 if(!object(data))fail('Invalid dataset payload.');
 const fields=['code','title','section','credits','days','day','time','room','size','remaining','midterm','final','lab','prerequisite'];
 if(['Course Offerings','Assessment','Grades'].includes(category))rows(data.courses,'courses',fields);
 if(category==='User Profile'){map(data.values,'profile values');if(typeof data.values['Student Number']!=='string'||!data.values['Student Number'].trim())fail('The profile has no student number.');if(typeof data.enrollmentHeading!=='string')fail('Missing enrollment heading.');}
 if(category==='Curriculum'){if(!Array.isArray(data.groups))fail('Invalid curriculum.');for(const group of data.groups){if(!object(group)||typeof group.heading!=='string')fail('Invalid curriculum group.');rows(group.courses,'curriculum courses',fields);}}
 if(category==='Assessment'){map(data.summary,'assessment summary');rows(data.fees,'assessment fees',['label','value']);}
 if(category==='Account Balance Summary'){map(data.values,'balance values');rows(data.payments,'payments',['paid','or','date','mode']);if(typeof data.rawBalance!=='string')fail('Missing balance amount.');}
 if(category==='Enrollment Reminders'){
  if(!Array.isArray(data.images)||data.images.length>1)fail('Invalid reminders images.');
  for(const image of data.images){if(!object(image)||!/^data:image\/png;base64,iVBORw0KGgo[a-z0-9+/]*={0,2}$/i.test(image.dataUrl||'')||image.dataUrl.length>12000000)fail('Invalid reminders PNG.');let url;try{url=new URL(image.sourceUrl);}catch{fail('Invalid reminders source.');}if(url.origin!=='https://solar.feualabang.edu.ph'||!/^\/images\/OSES_\d+T\d{4}_ALAB\.png$/i.test(url.pathname))fail('Invalid reminders source.');}
 }
}
function safeJSON(_key,value){if(['__proto__','prototype','constructor'].includes(_key))fail('Unsafe property in transfer file.');return value;}
export function validateTransfer(input){
 const text=typeof input==='string'?input:JSON.stringify(input);
 if(new TextEncoder().encode(text).length>MAX_TRANSFER_BYTES)fail('Transfer file exceeds the 50 MB limit.');
 let bundle;try{bundle=JSON.parse(text,safeJSON);}catch(error){if(error.message==='Unsafe property in transfer file.')throw error;fail('This is not a valid Better SOLAR JSON transfer file.');}
 if(bundle?.format!==TRANSFER_FORMAT||bundle.schemaVersion!==1)fail('Unsupported Better SOLAR transfer format/version.');
 if(typeof bundle.owner!=='string'||!bundle.owner.trim()||bundle.owner.length>128||/[|\x00-\x1f]/.test(bundle.owner))fail('Invalid student identity.');
 if(!Array.isArray(bundle.records)||!bundle.records.length||bundle.records.length>10000)fail('The file has no usable academic datasets.');
 const seen=new Set(),records=[];
 for(const item of bundle.records){
  if(!object(item)||!CATEGORIES.includes(item.category))fail('Unknown academic dataset.');
  if(item.owner&&item.owner!==bundle.owner)fail('Transfer file contains mixed student identities.');
  const term=String(item.term||''),year=String(item.year||''),contextual=['Course Offerings','Assessment','Grades','Account Balance Summary'].includes(item.category);
  if(contextual?!/^\d{1,2}$/.test(term)||!/^\d{8}$/.test(year):!!term||!!year)fail('Invalid dataset term or school year.');
  const key=item.category+'|'+term+'|'+year;if(seen.has(key))fail('Duplicate dataset in transfer file.');seen.add(key);
  if(!Number.isFinite(Date.parse(item.scrapedAt)))fail('A dataset has no valid collection date.');
  if(item.lastCheckedAt&&!Number.isFinite(Date.parse(item.lastCheckedAt)))fail('Invalid dataset verification date.');
  dataShape(item.category,item.data);
  if(item.category==='User Profile'&&item.data.values['Student Number']!==bundle.owner)fail('Profile identity does not match the transfer file.');
  let source;try{source=new URL(item.sourceUrl);}catch{fail('Invalid dataset source URL.');}
  if(source.origin!=='https://solar.feualabang.edu.ph'||source.username||source.password)fail('Invalid dataset source URL.');
  records.push({owner:bundle.owner,category:item.category,term,year,sourceUrl:source.origin+source.pathname,scrapedAt:item.scrapedAt,...(item.lastCheckedAt?{lastCheckedAt:item.lastCheckedAt}:{}),status:item.data.empty?'empty':'success',data:item.data});
 }
 if(!Number.isFinite(Date.parse(bundle.exportedAt)))fail('Invalid export date.');
 let canvas;
 if(bundle.canvas){if(!object(bundle.canvas)||typeof bundle.canvas.source!=='string'||bundle.canvas.source.length>10000000||!Number.isFinite(Date.parse(bundle.canvas.fetchedAt)))fail('Invalid cached Canvas calendar.');const events=parseICS(bundle.canvas.source);for(const event of events)if(event.url){let url;try{url=new URL(event.url);}catch{fail('Invalid calendar event URL.');}if(!['https:','http:'].includes(url.protocol))fail('Invalid calendar event URL.');}canvas={source:bundle.canvas.source,fetchedAt:bundle.canvas.fetchedAt,eventCount:events.length,url:''};}
 return {format:TRANSFER_FORMAT,schemaVersion:1,appVersion:'2.3.0',exportedAt:bundle.exportedAt,owner:bundle.owner,records,...(canvas?{canvas}:{})};
}
export async function createTransfer({includeCanvas=false}={}){
 const records=(await allRecords()).filter(record=>record.data);if(!records.length)fail('No scraped academic data is available to export.');
 const owner=(await getMeta('activeOwner'))||records.find(record=>record.category==='User Profile')?.data?.values?.['Student Number']||records[0].owner;
 const canvas=includeCanvas?await getMeta('canvas'):null;
 return validateTransfer({format:TRANSFER_FORMAT,schemaVersion:1,appVersion:'2.3.0',exportedAt:new Date().toISOString(),owner,records,...(canvas?.source?{canvas:{source:canvas.source,fetchedAt:canvas.fetchedAt}}:{})});
}
export async function importTransfer(input){const bundle=validateTransfer(input);return importRecordSnapshot(bundle);}

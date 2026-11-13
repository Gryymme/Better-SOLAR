/* Injected in Chrome's isolated world. No credentials or page scripts are copied. */
(() => {
 const text=e=>String(e?.innerText??e?.textContent??'').replace(/\s+/g,' ').trim();
 const norm=v=>String(v??'').toLowerCase().replace(/[^a-z0-9]/g,'');
 const cells=r=>[...r.children].filter(e=>/^(TD|TH)$/.test(e.tagName));
 const key=v=>{const m=String(v).trim().match(/^(\d+)\s*-\s*(\d{8})$/);return m?{term:m[1],year:m[2]}:null;};
 const options=s=>s?[...s.options].filter(o=>!o.disabled&&o.value.trim()&&!/^(select|choose|all|--)/i.test(text(o))).map(o=>({value:o.value,label:text(o)})):[];
 function guard(){if(document.querySelector('input[type="password"]')||/\/(login|signin)(\/|$)/i.test(location.pathname))throw Error('SOLAR session expired. Sign in to SOLAR, then retry failed work.');}
 function discover(){guard();const selectors=[...document.querySelectorAll('select')].map(s=>({id:s.id,name:s.name,options:options(s),value:s.value}));const links=[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(h=>{try{return new URL(h).origin===location.origin;}catch{return false;}});return {selectors,links,url:location.href,title:document.title,empty:/no (records|results|data|courses)|not available|not enrolled|no assessment/i.test(text(document.body))};}
 const aliases={code:['coursecode','course','courses','code'],title:['coursetitle','title','description'],section:['coursesection','section'],credits:['credits','units','creditunits'],days:['days','day'],time:['time','schedule'],room:['room','rooms'],size:['classsize','size'],remaining:['remainingslots','remaining','slots'],midterm:['midtermgrade','midterm'],final:['finalgrade','final'],lab:['laboratorycorequisite','laboratory','corequisite'],prerequisite:['prerequisite','prerequisites'],paid:['payments','amountpaid','payment'],or:['ornumber','or','officialreceiptnumber'],date:['date','paymentdate'],mode:['mode','paymentmode']};
 function match(label,field){const n=norm(label);return aliases[field].some(a=>n===a);}
 function tableFor(required,preferred){const first=preferred?document.querySelector(preferred):null;if(first)return first;return [...document.querySelectorAll('table')].find(t=>[...t.rows].some(r=>required.every(f=>cells(r).some(c=>match(text(c),f)))));}
 function rows(table,fields,{allowGroups=false}={}){
  if(!table)throw Error('Expected table is missing. The portal structure may have changed.');
  const list=ownTableRows(table),idx=list.findIndex(row=>fields.filter(field=>['code','title','paid','or'].includes(field)).every(field=>cells(row).some(cell=>match(text(cell),field))));
  if(idx<0)throw Error('Expected table headings were not found. No data was replaced.');
  const heads=cells(list[idx]).map(text),map=fields.map(field=>heads.findIndex(heading=>match(heading,field)));
  if(map.some(index=>index<0))throw Error('Required table columns are missing: '+fields.filter((field,index)=>map[index]<0).join(', '));
  const sectionColumn=map[fields.indexOf('section')],knownSections=new Set(list.slice(idx+1).map(cells).filter(cs=>cs.length===heads.length&&!cs.some(cell=>cell.colSpan>1)).map(cs=>norm(text(cs[sectionColumn]))).filter(Boolean));
  const result=[];result.tableNotes=[];let group='';
  for(const row of list.slice(idx+1)){
   const cs=cells(row),values=cs.map(text),label=values.join(' ').trim();if(!cs.length||!label)continue;
   if(cs.some(cell=>/^(?:loading|please wait|fetching)(?:[ .…]*)$/i.test(text(cell))))throw Error('Table rows are still loading. Previous data was kept.');
   if(cs.every(cell=>cell.tagName==='TH')||fields.every(field=>cs.some(cell=>match(text(cell),field))))continue;
   const total=/^(?:grand\s+total|sub\s*total|total|number\s+of\s+(?:units|credits|subjects)|no\.?\s+of\s+(?:units|credits|subjects))\b/i.test(values[0])||/^(?:total(?:noof|numberof)?(?:units|credits|subjects|courses)|totalcreditunits|(?:numberof|noof)(?:units|credits|subjects))/.test(norm(values[0]));
   if(total){
    result.tableNotes.push(label);
    continue;
   }
   if(cs.length===1&&cs[0].colSpan>=heads.length){
    if(/^(?:no (?:records|data|courses|results)|nothing found)/i.test(label))continue;
    if(/\b(?:error|failed|unable|unavailable|loading|please wait|session expired)\b/i.test(label))throw Error('A table result is incomplete or unavailable. Previous data was kept.');
    if(allowGroups){group=label;result.push({groupHeading:group});continue;}
    const annotation=/^(?:note|remarks?|legend|section|block|schedule|copyright|printed|generated|page|enrollment|registration|lecture|laboratory|term|school\s+year|student|year(?:\s+level)?|status|credits?|credit\s+units|units?|remaining|registered|enrolled|earned|courses?\s+(?:list|load|schedule))\b/i.test(label);
    if(!annotation&&!knownSections.has(norm(label))&&/^[a-z]{2,}[- ]?\d+[a-z]?(?:$|\s)/i.test(label))throw Error('A course row is incomplete. Previous data was kept.');
    result.tableNotes.push(label);continue;
   }
   if(cs.length<=Math.max(...map)||cs.some(cell=>cell.colSpan>1))throw Error('A table row is incomplete. Previous data was kept.');
   if(/^(?:no (?:records|data|courses|results)|nothing found)/i.test(label))continue;
   const item=Object.fromEntries(fields.map((field,index)=>[field,values[map[index]]]));
   if(('code' in item&&!item.code)||('paid' in item&&!item.paid))throw Error('A required table row value is missing. Previous data was kept.');
   item.rawValues=values;if(allowGroups)item.group=group||'Unspecified year and term';result.push(item);
  }
  return result;
 }
 function pairs(table){if(!table)return {};const result={};for(const row of table.rows){const c=cells(row);if(c.length>=2){const label=text(c[0]).replace(/:\s*$/,'');if(label&&!/^(particulars|label)$/i.test(label))result[label]=c.slice(1).map(text).join(' ');}}return result;}
 function pick(map,names){for(const name of names){const entry=Object.entries(map).find(([k])=>norm(k)===norm(name));if(entry)return entry[1];}return '';}
 const emptyText=()=>/no (records|results|data|courses)|not available|not enrolled|no assessment/i.test(text(document.body));

 // A matched assessment_form can be a wrapper or an empty/hidden duplicate.
 // Pick populated leaf tables and read their own cells rather than layout tables.
 function ownTableRows(table){return [...(table.rows||table.querySelectorAll('tr'))].filter(row=>{let parent=row.parentElement;while(parent&&parent.tagName!=='TABLE')parent=parent.parentElement;return parent===table;});}
 function feeRows(table){return ownTableRows(table).map(cells).filter(cs=>cs.length>=2&&text(cs[0])&&!cs.some(c=>c.querySelector('table'))&&!cs.every(c=>c.tagName==='TH')).map(cs=>({label:text(cs[0]),value:cs.slice(1).map(text).join(' ')}));}
 function feeTables(){
   const anchors=/tuition|miscellaneous|total\s*assessment|down\s*payment|installment|\bmidterm\b|\bfinal\b|\bfee\b|scholarship|discount|adjustment/i;
   const explicit=new Set();for(const el of document.querySelectorAll('.assessment_form-container,.assessment_form')){if(el.tagName==='TABLE')explicit.add(el);for(const t of el.querySelectorAll('table'))explicit.add(t);}
   const candidates=[...document.querySelectorAll('table')].map(table=>{const rows=feeRows(table),known=rows.filter(r=>anchors.test(r.label)).length;let hidden=false;for(let e=table;e;e=e.parentElement){if(e.hidden||e.getAttribute?.('aria-hidden')==='true'||e.getAttribute?.('style')?.match(/display\s*:\s*none|visibility\s*:\s*hidden/i))hidden=true;}
     const visible=!hidden&&(typeof table.getClientRects!=='function'||table.getClientRects().length>0);
     return {table,rows,known,explicit:explicit.has(table),visible};}).filter(c=>c.rows.length&&(c.explicit||c.known>=2));
   const pool=candidates.filter(c=>c.visible);
   // Multiple non-nested tables inside the assessment container may split fees
   // and payment options. Keep all of them in source order.
   const scoped=pool.filter(c=>c.explicit);if(scoped.length)return scoped;
   return pool.sort((a,b)=>b.known-a.known||b.rows.length-a.rows.length).slice(0,1);
 }
 function assessmentSummary(courseTable,feeCandidates){
   const labels=['Enrollment Status','Student Number','College','Program','Name','Year Level','Term','School Year','Phone','Zip Code','Address','Classification'];
   const names=[...labels,'Student #','Student No.','Student No','Student ID','SY'];
   const escaped=names.sort((a,b)=>b.length-a.length).map(v=>v.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));
   const re=new RegExp('(^|\\s)('+escaped.join('|')+')\\s*:', 'gi');
   const canonical=label=>/^student\s*(?:#|no\.?|id)$/i.test(label)?'Student Number':/^sy$/i.test(label)?'School Year':labels.find(l=>norm(l)===norm(label));
   const summary={},rawSummary=[];
   for(const table of document.querySelectorAll('table')){
     if(table===courseTable||feeCandidates.some(c=>c.table===table))continue;
     for(const row of ownTableRows(table)){const cs=cells(row);if(cs.some(c=>c.querySelector('table')))continue;
       for(let i=0;i<cs.length;i++){
         const value=text(cs[i]);if(!value)continue;const matches=[...value.matchAll(re)];
         for(let j=0;j<matches.length;j++){const m=matches[j],label=canonical(m[2]);if(!label)continue;let v=value.slice(m.index+m[0].length,matches[j+1]?.index??value.length).trim();
           if(!v&&cs[i+1]&&![...text(cs[i+1]).matchAll(re)].length)v=text(cs[i+1]);if(v){summary[label]=v;rawSummary.push({label:m[2],value:v});}}
         if(!matches.length){const label=canonical(value.replace(/:\s*$/,''));if(label&&cs[i+1]){summary[label]=text(cs[i+1]);rawSummary.push({label:value,value:summary[label]});}}
       }
     }
   }
   const rawLevel=summary['Year Level']||'';
   const embeddedTerm=rawLevel.match(/\bTerm\s*:?\s*(\d+)\b|\b(\d+)(?:st|nd|rd|th)\s*Term\b/i);
   const embeddedYear=rawLevel.match(/\b(?:SY|School\s*Year)\s*:?\s*(\d{4})\s*[-–]?\s*(\d{4})/i);
   if(embeddedTerm&&!summary.Term)summary.Term=embeddedTerm[1]||embeddedTerm[2];
   if(embeddedYear&&!summary['School Year'])summary['School Year']=embeddedYear[1]+embeddedYear[2];
   if(embeddedTerm||embeddedYear){const cuts=[embeddedTerm?.index,embeddedYear?.index].filter(n=>n!==undefined);summary['Year Level']=rawLevel.slice(0,Math.min(...cuts)).replace(/[;,\-\s]+$/,'').trim();}
   // The selected live option is verified by the collector after submission.
   // Use it only when the summary does not label the term/year itself.
   const selection=key(document.querySelector('select#school_year')?.value||'');
   if(selection){summary.Term||=selection.term;summary['School Year']||=selection.year;}
   return {summary,rawSummary};
 }
 const baseTableFor=tableFor;
 function extract(category,override){const tableFor=(required,preferred)=>override||baseTableFor(required,preferred);guard();const meta=discover();let data;if(emptyText()&&!document.querySelector('table')&&['Course Offerings','Grades','Assessment'].includes(category)){return {data:{courses:[],summary:{},fees:[],totalCredits:0,empty:true},discovery:meta};}
 if(category==='User Profile'){
 const maps=[...document.querySelectorAll('table.profile-table,.profile-table table,table')].map(pairs);const merged=Object.assign({},...maps);const names=['Student Number','First Name','Middle Name','Last Name','Personal Email Address','School Email Address','Citizenship','Program','Curriculum Code','Year Level','Registration Status','Student Type','Scholarship'];const values=Object.fromEntries(names.map(n=>[n,pick(merged,[n,n==='Personal Email Address'?'Personal Email':n,n==='School Email Address'?'School Email':n])]));
 if(!values['Student Number']||!values['First Name'])throw Error('Student profile fields are missing. Check the authenticated profile page.');
 const heading=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,.card-header,.panel-heading,legend,strong,b')].map(text).filter(t=>/Enrollment Status.*Term/i.test(t)).sort((a,b)=>a.length-b.length)[0]||text(document.body).match(/Enrollment Status\s*:\s*Term\s*\d+\s*(?:SY|School Year)\s*\d{4}[-\s]?\d{4}/i)?.[0]||'';
 if(!heading)throw Error('Enrollment Status heading is missing. Profile was not replaced.');data={values,enrollmentHeading:heading,fieldsPresent:names.filter(name=>Object.keys(merged).some(label=>[name,name==='Personal Email Address'?'Personal Email':name,name==='School Email Address'?'School Email':name].some(alias=>norm(alias)===norm(label))))};
 }else if(category==='Curriculum'){
 const list=rows(tableFor(['code','title','credits']),['code','title','credits','lab','prerequisite'],{allowGroups:true});const groups=[];for(const r of list){if(r.groupHeading){groups.push({heading:r.groupHeading,courses:[]});continue;}let g=groups.at(-1);if(!g){g={heading:r.group,courses:[]};groups.push(g);}g.courses.push(r);}data={groups,empty:!groups.some(g=>g.courses.length)};
 }else if(category==='Course Offerings'){
 data={courses:rows(tableFor(['code','section','remaining']),['code','section','size','remaining','days','time','room'])};data.empty=!data.courses.length;
 }else if(category==='Grades'){
 data={courses:rows(tableFor(['code','title','midterm','final']),['code','title','section','credits','midterm','final'])};data.empty=!data.courses.length;
 }else if(category==='Account Balance Summary'){
 const summary=document.querySelector('#balancesummaryTable');if(!summary)throw Error('Account Balance Summary table missing for this term.');const raw=pairs(summary);const values={};for(const n of ['Student Number','Full Name','Beginning Balance','Total Assessment'])values[n]=pick(raw,[n]);values['Statement of Account']=pick(raw,['Statement of Account','Statement of Acount']);values['Program Code']=pick(raw,['Course Code','Program Code']);
 const paymentTable=document.querySelector('#ORTable');if(!paymentTable)throw Error('Payments table is missing.');const payments=rows(paymentTable,['paid','or','date','mode']);
 const candidates=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,strong,b')].map(text).filter(t=>/Remaining Balance\s*\/\s*\(Overpayment\)/i.test(t)).sort((a,b)=>a.length-b.length);const label=candidates[0]||text(document.body).match(/Remaining Balance\s*\/\s*\(Overpayment\)[\s\S]{0,100}/i)?.[0]||'';let balanceText=label;const heading=[...document.querySelectorAll('h1,h2,h3,h4,h5,h6,p,strong,b')].find(e=>text(e)===label);if(heading&&/\(Overpayment\)\s*:?\s*$/i.test(label))balanceText=label+' '+text(heading.nextElementSibling);const balanceMatch=/(?:Remaining Balance\s*\/\s*\(Overpayment\))\s*:?\s*(\(?\s*(?:PHP|₱)?\s*[+-]?[\d,]+(?:\.\d+)?\s*\)?)/i;const rawBalance=(balanceText.match(balanceMatch)||text(document.body).match(balanceMatch))?.[1]?.trim();if(rawBalance===undefined)throw Error('Remaining Balance / (Overpayment) value missing; no amount was inferred.');
 data={values,rawSummary:raw,payments,rawBalance};
 }else if(category==='Assessment'){
 const table=tableFor(['code','title','credits','days'],'.assessment_schedule-container .assessment_schedule,table.assessment_schedule');const courses=rows(table,['code','title','section','credits','days','time','room']);
 const candidates=feeTables(),fees=candidates.flatMap(c=>c.rows);
 if(!fees.length)throw Error('Assessment fee rows are missing. No populated fee table was found after submission; retry this term once SOLAR finishes loading.');
 if(fees.some(f=>!f.value))throw Error('Assessment fee values are still loading. Retry once SOLAR finishes loading this term.');
 const {summary,rawSummary}=assessmentSummary(table,candidates);
 if(!summary['Student Number'])throw Error('SAF student number could not be mapped (Student # / Student Number).');
 data={summary,rawSummary,courses,fees,tableNotes:courses.tableNotes,totalCredits:courses.reduce((sum,c)=>sum+(Number(c.credits)||0),0),empty:!courses.length&&!fees.length};
 }else throw Error('Unknown category');
 return {data,discovery:meta};
 }

 // A snapshot is committed only after all visible pagination has been traversed,
 // declared totals agree and two consecutive complete reads are stable.
 const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const visible=element=>{for(let node=element;node;node=node.parentElement)if(node.hidden||node.getAttribute?.('aria-hidden')==='true'||/display\s*:\s*none|visibility\s*:\s*hidden/i.test(node.getAttribute?.('style')||''))return false;return typeof element.getClientRects!=='function'||element.getClientRects().length>0;};
 function primaryTables(category){
  const required={'Course Offerings':['code','section','remaining'],Grades:['code','title','midterm','final'],Curriculum:['code','title','credits'],Assessment:['code','title','credits','days']};
  if(category==='Account Balance Summary')return [...document.querySelectorAll('#ORTable')].filter(visible);
  const fields=required[category];return fields?[...document.querySelectorAll('table')].filter(table=>visible(table)&&ownTableRows(table).some(row=>fields.every(field=>cells(row).some(cell=>match(text(cell),field))))):[];
 }
 function scanTable(category,index=0){return primaryTables(category)[index]||null;}
 const rowCount=(category,data)=>category==='Curriculum'?data.groups.reduce((sum,group)=>sum+group.courses.length,0):category==='Account Balance Summary'?data.payments.length:data.courses?.length||0;
 function pageState(table){
  if(!table)return {total:null,start:null,next:null,pager:false};
  const wrapper=table.closest('.dataTables_wrapper,.dt-container')||table.parentElement;
  const scope=wrapper||table;
  const info=text(scope.querySelector('.dataTables_info,.dt-info,[data-table-info]'));
  if(/filtered\s+from/i.test(info))throw Error('The SOLAR table is filtered. Clear its search and retry; cached data was kept.');
  const count=info.replace(/,/g,'').match(/showing\s+(\d+)\s+to\s+(\d+)\s+of\s+(\d+)/i);
  const declared=table.getAttribute('data-total-rows'),total=count?Number(count[3]):declared!==null?Number(declared):null;
  const controls=[...scope.querySelectorAll('.paginate_button.next,.dt-paging-button.next,.pagination .next,[data-page-next],button[aria-label="Next page"],a[aria-label="Next page"]')].filter(visible);
  if(controls.length>1)throw Error('Ambiguous table pagination. Cached data was kept.');
  const control=controls[0],parent=control?.parentElement,disabled=control&&(control.disabled||control.getAttribute('aria-disabled')==='true'||control.classList.contains('disabled')||parent?.classList.contains('disabled'));
  const next=control&&!disabled?(control.matches('a,button')?control:control.querySelector('a,button')):null;
  const pager=!!scope.querySelector('.dataTables_paginate,.dt-paging,.pagination');
  if(pager&&!controls.length&&[...scope.querySelectorAll('.paginate_button,.dt-paging-button,.page-link')].filter(visible).length>1)throw Error('Unsupported table pagination. Cached data was kept.');
  if(control&&!disabled&&!next)throw Error('The next table page cannot be accessed. Cached data was kept.');
  return {total,start:count?Number(count[1]):null,next,pager};
 }
 function assertReady(table){
  guard();if([...document.querySelectorAll('[role="alert"],.alert-danger,.dataTables_error')].some(element=>visible(element)&&/failed|error|unable|unavailable|timed? out|could not/i.test(text(element))))throw Error('SOLAR reported a loading error. Cached data was kept.');if(document.readyState!=='complete')throw Error('The SOLAR page is still loading. Cached data was kept.');
  if([...document.querySelectorAll('[aria-busy="true"],.dataTables_processing,.dt-processing,[data-loading="true"]')].some(visible))throw Error('The SOLAR table is still loading. Cached data was kept.');
  if(table&&!visible(table))throw Error('The SOLAR table is not accessible. Cached data was kept.');
  const wrapper=table?.closest('.dataTables_wrapper,.dt-container');
  if(wrapper&&[...wrapper.querySelectorAll('input[type="search"]')].some(input=>input.value.trim()))throw Error('The SOLAR table is filtered. Cached data was kept.');
 }
 async function stableRead(category,previous,index=0){
  let lastError;
  for(let attempt=0;attempt<12;attempt++){
   try{const table=scanTable(category,index);assertReady(table);
    if(category!=='User Profile'&&!table)throw Error('Expected table is missing. Cached data was kept.');
    const first=extract(category,table),signature=JSON.stringify(first.data);
    if(previous===signature){await delay(200);continue;}
    await delay(400);const secondTable=scanTable(category,index);assertReady(secondTable);const second=extract(category,secondTable);
    if(signature!==JSON.stringify(second.data)){await delay(200);continue;}
    return second;
   }catch(error){lastError=error;if(/session expired|filtered|pagination|incomplete|unexpected table|required table/i.test(error.message))throw error;await delay(200);}
  }
  throw lastError||Error('The complete SOLAR table did not settle. Cached data was kept.');
 }
 async function scanOne(category,index){
  let result=await stableRead(category,undefined,index),page=pageState(scanTable(category,index)),expected=page.total,pages=0,total=0;
  if(page.start!==null&&page.start>1)throw Error('The table was not at its first page. Cached data was kept.');
  const collected=[],seen=new Set();
  for(;;){
   const signature=JSON.stringify(result.data);if(seen.has(signature))throw Error('A table page repeated. Cached data was kept.');seen.add(signature);
   const confirmedPaymentEmpty=category==='Account Balance Summary'&&scanTable(category,index)?.id==='ORTable'&&!page.pager&&page.total===null;
   if(category!=='User Profile'&&rowCount(category,result.data)===0&&page.total!==0&&!confirmedPaymentEmpty&&!/no (records|data|courses|results)|nothing found/i.test(text(scanTable(category,index))))throw Error('An empty table was not confirmed by SOLAR. Cached data was kept.');
   collected.push(result.data);total+=rowCount(category,result.data);pages++;
   if(!page.next)break;
   if(pages>=2000)throw Error('The full table exceeds the scan limit. Cached data was kept.');
   page.next.click();result=await stableRead(category,signature,index);page=pageState(scanTable(category,index));
   if(page.total!==expected)throw Error('The table total changed during collection. Cached data was kept.');
   if(page.start!==null&&page.start!==total+1)throw Error('A table page was skipped. Cached data was kept.');
  }
  if(expected!==null&&expected!==total)throw Error('The complete table row count could not be verified. Cached data was kept.');
  if(['Assessment','Account Balance Summary'].includes(category)){const omit=part=>{const {courses,payments,totalCredits,empty,tableNotes,declaredCredits,...rest}=part;return rest;};if(collected.some(part=>JSON.stringify(omit(part))!==JSON.stringify(omit(collected[0]))))throw Error('Related SOLAR details changed while scanning pages. Cached data was kept.');}
  let data={...collected[0]};
  if(category==='Curriculum')data.groups=collected.flatMap(part=>part.groups);
  else if(category==='Account Balance Summary')data.payments=collected.flatMap(part=>part.payments);
  else if(category!=='User Profile')data.courses=collected.flatMap(part=>part.courses);
  if(category==='Assessment'){data.totalCredits=data.courses.reduce((sum,course)=>sum+(Number(course.credits)||0),0);data.tableNotes=[...new Set(collected.flatMap(part=>part.tableNotes||[]))];}
  if('empty' in data)data.empty=category==='Assessment'?!data.courses.length&&!data.fees.length:total===0;
  return {data,discovery:discover(),coverage:{complete:true,pages,rows:total,declaredRows:expected,checkedAt:new Date().toISOString(),method:page.pager?'all-pages':'stable-full-document'}};
 }
 async function scan(category){
  const count=category==='User Profile'?1:primaryTables(category).length;
  if(!count)throw Error('Expected table is missing. Cached data was kept.');
  const snapshots=[];for(let index=0;index<count;index++)snapshots.push(await scanOne(category,index));
  if(category!=='User Profile'&&primaryTables(category).length!==count)throw Error('The set of SOLAR tables changed during collection. Cached data was kept.');
  const first=snapshots[0],data={...first.data};
  if(category==='Curriculum')data.groups=snapshots.flatMap(part=>part.data.groups);
  else if(category==='Account Balance Summary')data.payments=snapshots.flatMap(part=>part.data.payments);
  else if(category!=='User Profile')data.courses=snapshots.flatMap(part=>part.data.courses);
  if(category==='Assessment'){data.totalCredits=data.courses.reduce((sum,course)=>sum+(Number(course.credits)||0),0);data.tableNotes=[...new Set(snapshots.flatMap(part=>part.data.tableNotes||[]))];}
  const rows=snapshots.reduce((sum,part)=>sum+part.coverage.rows,0);
  if('empty' in data)data.empty=category==='Assessment'?!data.courses.length&&!data.fees.length:rows===0;
  return {data,discovery:discover(),coverage:{complete:true,tables:count,pages:snapshots.reduce((sum,part)=>sum+part.coverage.pages,0),rows,checks:snapshots.map(part=>part.coverage),checkedAt:new Date().toISOString()}};
 }
 function navigate(value){
  const url=new URL(value,location.href);
  if(url.origin!=='https://solar.feualabang.edu.ph'||url.origin!==location.origin||url.username||url.password||!/^\/(?:user\/profile|program\/curriculum|course\/offerings|student\/(?:saf|grades|balance(?:\/\d+-\d{8})?)|enrollment\/reminders)\/?$/.test(url.pathname))throw Error('Unsupported SOLAR navigation destination.');
  setTimeout(()=>location.assign(url.href),50);return {accepted:true,url:url.href};
 }
 async function submit(selection,autoTerm=''){
 guard();const entries=Object.entries(selection);if(!entries.length)throw Error('No term selection to submit.');
 const find=id=>document.getElementById(id)||document.querySelector(`select[name="${CSS.escape(id)}"]`);
 const first=find(entries[0][0]),form=first?.form;if(!form)throw Error('The term selector has no normal submission form.');
 const target=new URL(form.action||location.href,location.href);if(target.origin!==location.origin)throw Error('Refusing to submit a form outside SOLAR.');
 const delay=ms=>new Promise(r=>setTimeout(r,ms));
 // Set school year before term so dependent term options have time to update.
 entries.sort((a,b)=>Number(/year/i.test(b[0]))-Number(/year/i.test(a[0])));
 for(const [id,value] of entries){let el=find(id);const deadline=Date.now()+4000;while(el&&![...el.options].some(o=>o.value===value&&!o.disabled)&&Date.now()<deadline){await delay(150);el=find(id);}
 if(!el||![...el.options].some(o=>o.value===value&&!o.disabled))throw Error('Selected term/year no longer available: '+id);
 el.value=value;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));if(/year/i.test(id))await delay(600);
 }
 if(autoTerm){const el=find(autoTerm);if(!el)throw Error('Term selector missing.');const opts=options(el);if(!opts.some(o=>o.value===el.value)){if(!opts.length)throw Error('No supported term options for this school year.');el.value=opts[0].value;el.dispatchEvent(new Event('change',{bubbles:true}));}}
 const token=crypto.randomUUID();const state={token,changed:false,lastChanged:0,started:false,before:performance.timeOrigin};globalThis.__betterSolarSubmit=state;
 const output=[...document.querySelectorAll('table,.assessment_schedule-container,.assessment_form-container')],emptyBefore=emptyText();
 const observer=new MutationObserver(ms=>{if(!state.started)return;const changed=ms.some(m=>output.some(t=>t===m.target||t.contains(m.target))||[...m.removedNodes,...m.addedNodes].some(n=>n.nodeType===1&&(n.matches?.('table,.assessment_schedule-container,.assessment_form-container')||n.querySelector?.('table,.assessment_schedule-container,.assessment_form-container'))));if(changed||(!emptyBefore&&emptyText())){state.changed=true;state.lastChanged=Date.now();}});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
 const button=form.querySelector('button[type="submit"],input[type="submit"],button:not([type])');setTimeout(()=>{state.started=true;try{form.requestSubmit(button||undefined);}catch(error){state.error=error.message;}},30);
 return {token,before:performance.timeOrigin,documentToken:globalThis.__betterSolarDocumentToken};
 }
 function submitted(state,selection){guard();const selected=Object.entries(selection).every(([id,value])=>(document.getElementById(id)||document.querySelector(`select[name="${CSS.escape(id)}"]`))?.value===value);const marker=globalThis.__betterSolarSubmit;const fresh=performance.timeOrigin!==state.before||!!(state.documentToken&&globalThis.__betterSolarDocumentToken&&state.documentToken!==globalThis.__betterSolarDocumentToken);return {ready:!!(document.readyState==='complete'&&selected&&(fresh||(marker?.token===state.token&&marker?.changed&&Date.now()-marker.lastChanged>=600))),error:marker?.error||'',fresh,selected,url:location.href};}
 function reminderImages(){
   guard();
   for(const element of document.querySelectorAll('img[src]')){
     let excluded=false;for(let parent=element;parent;parent=parent.parentElement){if(['NAV','HEADER','FOOTER'].includes(parent.tagName)||parent.hidden||parent.getAttribute?.('aria-hidden')==='true'||/display\s*:\s*none|visibility\s*:\s*hidden/i.test(parent.getAttribute?.('style')||''))excluded=true;}
     if(excluded)continue;
     let url;try{url=new URL(element.getAttribute('src'),location.href);}catch{continue;}
     if(url.origin!==location.origin||url.protocol!=='https:'||!/^\/images\/OSES_\d+T\d{4}_ALAB\.png$/i.test(url.pathname))continue;
     return [{url:url.href,alt:element.getAttribute('alt')||'Enrollment reminders'}];
   }
   throw Error('The term-specific OSES enrollment reminders PNG image is missing. Sign in to SOLAR and retry collection.');
 }

 const timeoutSignal=ms=>{if(typeof globalThis.AbortSignal?.timeout==='function')return AbortSignal.timeout(ms);const controller=new AbortController();setTimeout(()=>controller.abort(Error('Request timed out.')),ms);return controller.signal;};
 async function reminders(){
   const discovery=discover(),images=[];let total=0;
   // Fetch within the signed-in SOLAR tab, so protected image requests use its session.
   for(const source of reminderImages()){
     const response=await fetch(source.url,{credentials:'include',redirect:'error',cache:'no-cache',signal:timeoutSignal(25000)});
     if(!response.ok)throw Error(`Enrollment reminders image returned HTTP ${response.status}.`);
     if(Number(response.headers.get('content-length'))>8000000)throw Error('Enrollment reminders image is too large (maximum 8 MB).');
     const bytes=new Uint8Array(await response.arrayBuffer());total+=bytes.length;
     if(bytes.length>8000000||total>12000000)throw Error('Enrollment reminders images exceed the local collection size limit.');
     if(![137,80,78,71,13,10,26,10].every((value,index)=>bytes[index]===value))throw Error('Enrollment reminders did not return a PNG image. Your SOLAR session may have expired.');
     let binary='';for(let index=0;index<bytes.length;index+=16384)binary+=String.fromCharCode(...bytes.subarray(index,index+16384));
     images.push({sourceUrl:source.url,alt:source.alt,dataUrl:'data:image/png;base64,'+btoa(binary)});
   }
   return {data:{images},discovery,coverage:{complete:true,pages:1,rows:images.length,method:'verified-png',checkedAt:new Date().toISOString()}};
 }
 globalThis.BetterSolarDOM={discover,extract,scan,navigate,submit,submitted,reminderImages,reminders};
})();

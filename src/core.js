export const CATEGORIES = ['User Profile','Account Balance Summary','Course Offerings','Curriculum','Assessment','Grades','Enrollment Reminders'];
export const DAYS = ['M','T','W','TH','F','S'];
export const DAY_NAMES = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
export const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();
export const ordinal = n => `${n}${n%100>=11&&n%100<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th')}`;
export const yearLabel = y => /^\d{8}$/.test(String(y)) ? `${String(y).slice(0,4)}-${String(y).slice(4)}` : String(y||'');
export function termKey(value) { const m=clean(value).match(/^(\d+)\s*-\s*(\d{8})$/); return m?{term:m[1],year:m[2],key:`${m[1]}-${m[2]}`,sourceValue:value}:null; }
export function amount(raw) { const v=clean(raw).replace(/PHP|₱|,/gi,'').replace(/[()\s]/g,''); return /^[-+]?\d+(\.\d+)?$/.test(v)?Number(v):null; }
export function balance(raw) { const value=amount(raw); const over=/\(\s*(?:₱|PHP)?\s*[\d,.]+\s*\)/i.test(clean(raw)); return {raw:clean(raw),remaining:value!==null&&!over?value:null,overpayment:value!==null&&over?Math.abs(value):null}; }
export function money(raw) { const n=amount(raw); return n===null?(clean(raw)||'Not available'):new Intl.NumberFormat('en-PH',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n); }
export function minute(raw) { const m=clean(raw).match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i); if(!m)return null; let h=+m[1],n=+m[2]; if(n>59||h>23||(m[3]&&(h<1||h>12)))return null; if(m[3])h=h%12+(m[3].toUpperCase()==='PM'?12:0); return h*60+n; }
export function clock(n) { const h=Math.floor(n/60);return `${String(h%12||12).padStart(2,'0')}:${String(n%60).padStart(2,'0')} ${h>=12?'PM':'AM'}`; }
export function interval(raw) { const p=clean(raw).split(/\s*[-–—]\s*/); if(p.length!==2)return null; const start=minute(p[0]),end=minute(p[1]); return start!==null&&end!==null&&end>start?{start,end}:null; }
export function displayTime(raw) { return String(raw||'').split('/').map(v=>{const t=interval(v);return t?`${clock(t.start)} – ${clock(t.end)}`:clean(v)||'Not available';}).join(' / '); }
export function dayTokens(raw) { const v=clean(raw).toUpperCase().replace(/MONDAY|MON/g,'M').replace(/TUESDAY|TUE/g,'T').replace(/WEDNESDAY|WED/g,'W').replace(/THURSDAY|THU/g,'TH').replace(/FRIDAY|FRI/g,'F').replace(/SATURDAY|SAT/g,'S'); const tokens=v.match(/TH|M|T|W|F|S/g)||[]; if(v.replace(/TH|M|T|W|F|S|[\s,;&]/g,''))return []; return [...new Set(tokens)]; }
export function occurrences(course) {
 const ds=String(course.days??course.day??'').split('/').map(clean),ts=String(course.time??'').split('/').map(clean),rs=String(course.room??'').split('/').map(clean),out=[],warnings=[];
 if(ds.length!==ts.length||ds.length!==rs.length) { warnings.push(`${course.code}: Day / Time / Room entry counts differ; unpaired meetings were not placed.`); return {items:[],warnings}; }
 ds.forEach((d,i)=>{const t=interval(ts[i]),days=dayTokens(d); if(!t||!days.length){warnings.push(`${course.code}: Unrecognized meeting ${d} ${ts[i]}; inspect the source schedule.`);return;}days.forEach(day=>out.push({...t,day,room:rs[i],course}));});return {items:out,warnings};
}
export const courseId = c => JSON.stringify([c.code,c.section,c.days??c.day,c.time,c.room]);
export function conflicts(existing,added) {
 const errors=[],seen=new Set(existing.map(courseId)),all=[...existing];
 for(const c of added){if(seen.has(courseId(c))){errors.push(`${c.code} (${c.section}) is already selected.`);continue;}seen.add(courseId(c));
 const parsed=occurrences(c);errors.push(...parsed.warnings);
 for(const m of parsed.items)for(const other of all)for(const o of occurrences(other).items)if(m.day===o.day&&m.start<o.end&&o.start<m.end)errors.push(`${c.code} (${c.section}) conflicts with ${other.code} (${other.section}) on ${DAY_NAMES[DAYS.indexOf(m.day)]}, ${clock(Math.max(m.start,o.start))}.`);
 all.push(c);}return [...new Set(errors)];
}
export function filtered(courses,{q='',section='',days=[]}={}) {
 return courses.filter(c=>{
   const meetingDays=new Set(String(c.days??c.day??'').split('/').flatMap(dayTokens));
   return `${c.code} ${c.title||''}`.toLowerCase().includes(q.toLowerCase())&&(!section||c.section===section)&&days.every(day=>meetingDays.has(day));
 });
}

export const available = c => amount(c.remaining)!==null&&amount(c.remaining)>0;
export function slotWarnings(courses){return courses.filter(course=>!available(course)).map(course=>({code:course.code,section:course.section,reason:amount(course.remaining)===null?'Remaining slots could not be verified.':'No remaining slots.'}));}
export const shortTitle = t => clean(t).length>40?clean(t).slice(0,40)+'...':clean(t);
export const roomLabel = r => /^(ONLINE|ASYNCH)$/i.test(clean(r))?clean(r).toUpperCase():clean(r)?`Room ${clean(r)}`:'Room unavailable';
export function enrollmentPeriod(heading='') {const t=heading.match(/Term\s*(\d+)/i),y=heading.match(/(?:SY|School Year)\s*(\d{4})\s*[-–]?\s*(\d{4})/i);return {term:t?.[1]||'',year:y?y[1]+y[2]:''};}
export const GRADING=[['95.8 - 100','4.0','A','97-100','Excellent'],['91.5 - 95.7','3.5','A-','93-96','Superior'],['87.2 - 91.4','3.0','B+','89-92','Very Good'],['82.9 - 87.1','2.5','B','85-88','Good'],['78.6 - 82.8','2.0','B-','81-84','Satisfactory'],['74.3 - 78.5','1.5','C','78-80','Fair'],['70.0 - 74.2','1.0','D','75-77','Pass'],['Below 70.0','0.5','F','Below 75','Fail']];
export const RATINGS=[['0.0','No Attendance / Excessive Absences'],['6.0','Passed (For Internship / NSTP / Correlation Courses)'],['7.0','Officially Dropped'],['8.0','Credited (For Transferees)'],['9.0','Incomplete']];

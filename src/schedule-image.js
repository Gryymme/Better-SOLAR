// A deterministic, local canvas renderer: the preview and PNG use the same pixels.
import {DAYS,DAY_NAMES,clock,occurrences,roomLabel,amount} from './core.js';
import {meetingLanes,meetingHourBounds} from './meeting-layout.js';
import {courseCodeLines,fitScheduleLabel} from './schedule-layout.js';

export const PNG_MIN_WIDTH=850,PNG_MAX_WIDTH=2200,DEFAULT_BLOCK_COLOR='#2e844c';
export const IMAGE_COURSE_FONT=12,IMAGE_MEETING_FONT=10;
export const exportCourseKey=course=>String(course.code||'').trim();
export function imageOptions(options={}){
 const width=Math.round(Number(options.width)||PNG_MIN_WIDTH);
 return {width:Math.min(PNG_MAX_WIDTH,Math.max(PNG_MIN_WIDTH,width)),dark:options.dark===true,
  color:/^#[\da-f]{6}$/i.test(options.color||'')?options.color:DEFAULT_BLOCK_COLOR,
  fullTitles:options.fullTitles===true,label:String(options.label||'').replace(/\s+/g,' ').trim().slice(0,200),customTitles:{...options.customTitles}};
}
export function imageTitle(course,options){
 const key=exportCourseKey(course),custom=options.customTitles?.[key];
 const text=String(typeof custom==='string'&&custom.trim()?custom:course.title||'').replace(/\s+/g,' ').trim();
 if(options.fullTitles||Array.from(text).length<=40)return text;
 let prefix=Array.from(text).slice(0,37).join('').trimEnd();
 if(!/\s/.test(Array.from(text)[37]||'')&&prefix.includes(' '))prefix=prefix.slice(0,prefix.lastIndexOf(' '));
 return prefix+'...';
}
// Wrap whole words at the normal timetable font size. The image can grow
// wider/taller to fit; a narrow overlap never shrinks the rest of the week.
export function imageLines(text,width,measure){
 const lines=[];let line='';
 for(const word of String(text||'').trim().split(/\s+/).filter(Boolean)){
  const candidate=line?line+' '+word:word;
  if(line&&measure(candidate)>width){lines.push(line);line=word;}else line=candidate;
 }
 if(line)lines.push(line);return lines;
}
export function readableInk(hex){
 const channels=hex.slice(1).match(/../g).map(value=>parseInt(value,16)/255).map(value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4);
 return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722>.179?'#14231b':'#ffffff';
}
const time=minutes=>clock(minutes).replace(/^0(?=\d:)/,'');
export function scheduleImageModel(courses,rawOptions={},measure=(text,size)=>text.length*size*.6,year=new Date().getFullYear()){
 const options=imageOptions(rawOptions),parsed=courses.map(occurrences),meetings=meetingLanes(parsed.flatMap(item=>item.items));
 const {min,max}=meetingHourBounds(meetings);
 const gutter=62,pad=22,size=IMAGE_COURSE_FONT,small=IMAGE_MEETING_FONT;
 let hourHeight=60,requiredWidth=Math.max(PNG_MIN_WIDTH,...options.label.split(/\s+/).filter(Boolean).map(word=>measure(word,18,700)+pad*2));
 const initialDayWidth=(options.width-pad*2-gutter)/6;
 const prepared=meetings.map(meeting=>{
  const course=meeting.course,shared=meeting.columns>1,title=imageTitle(course,options);
  const code=courseCodeLines(course.code,initialDayWidth/meeting.columns-18,text=>measure(text,size,700));
  const credits=amount(course.credits),details=[credits===null?'':`${credits} credits`,[course.section,roomLabel(meeting.room)].filter(Boolean).join(' / ')];
  const titleWords=shared&&!options.fullTitles?[]:title.split(/\s+/).filter(Boolean),detailWords=details.flatMap(text=>text.split(/\s+/));
  const requiredInner=Math.max(1,...[...code,...titleWords].map(text=>measure(text,size,700)),...[time(meeting.start)+'–',time(meeting.end),...detailWords].map(text=>measure(text,small,400)));
  requiredWidth=Math.max(requiredWidth,pad*2+gutter+(requiredInner+18)*6*meeting.columns);
  return {meeting,course,title,details};
 });
 options.width=Math.max(options.width,Math.ceil(requiredWidth));
 if(options.width>PNG_MAX_WIDTH)throw Error('This schedule needs more horizontal space at the normal font size. Shorten an unusually long label/title word, or turn off full titles.');
 const dayWidth=(options.width-pad*2-gutter)/6,labelLines=imageLines(options.label,options.width-pad*2,text=>measure(text,18,700)),labelHeight=labelLines.length?labelLines.length*24+18:0,header=54+labelHeight,top=header+20;
 const blocks=prepared.map(({meeting,course,title,details})=>{
  const innerWidth=dayWidth/meeting.columns-18,code=courseCodeLines(course.code,innerWidth,text=>measure(text,size,700)),fitsCode=measure(course.code,size,700)<=innerWidth+.1;
  const titleLines=meeting.columns>1&&!options.fullTitles?(fitsCode&&title?[fitScheduleLabel(title,innerWidth,text=>measure(text,size,700))]:[]):imageLines(title,innerWidth,text=>measure(text,size,700));
  const lines=[...code.map(text=>({text,size,weight:700})),
   ...titleLines.map(text=>({text,size,weight:700}))];
  const fullTime=`${time(meeting.start)}–${time(meeting.end)}`;
  const timeLines=measure(fullTime,small,400)<=innerWidth?[fullTime]:[time(meeting.start)+'–',time(meeting.end)];
  lines.push(...timeLines.map(text=>({text,size:small,weight:400})));
  for(const detail of details)lines.push(...imageLines(detail,innerWidth,text=>measure(text,small,400)).map(text=>({text,size:small,weight:400})));
  const contentHeight=lines.reduce((sum,line)=>sum+line.size*1.3,0)+18;
  hourHeight=Math.max(hourHeight,(contentHeight+4)*60/(meeting.end-meeting.start));
  return {meeting,lines,contentHeight};
 });
 hourHeight=Math.ceil(hourHeight);
 const height=Math.ceil(top+(max-min)/60*hourHeight+32);
 return {options,width:options.width,height,gutter,pad,header,top,labelLines,labelHeight,dayWidth,hourHeight,min,max,
  warnings:[...new Set(parsed.flatMap(item=>item.warnings))],watermark:`© Gryymme, ${year}`,
  blocks:blocks.map(block=>({...block,x:pad+gutter+(DAYS.indexOf(block.meeting.day)+block.meeting.lane/block.meeting.columns)*dayWidth+2,
   y:top+(block.meeting.start-min)/60*hourHeight,width:dayWidth/block.meeting.columns-4,height:(block.meeting.end-block.meeting.start)/60*hourHeight-4}))};
}
function roundedRect(context,x,y,width,height,radius){
 const r=Math.min(radius,width/2,height/2);context.beginPath();context.moveTo(x+r,y);context.arcTo(x+width,y,x+width,y+height,r);context.arcTo(x+width,y+height,x,y+height,r);context.arcTo(x,y+height,x,y,r);context.arcTo(x,y,x+width,y,r);context.closePath();
}
export function drawScheduleImage(canvas,courses,options={},year){
 const context=canvas.getContext('2d');if(!context)throw Error('This browser cannot create a PNG preview.');
 const family='Montserrat, "Segoe UI", sans-serif',measure=(text,size,weight=400)=>{context.font=`${weight} ${size}px ${family}`;return context.measureText(text).width;};
 const model=scheduleImageModel(courses,options,measure,year),dark=model.options.dark;
 if(model.height>12000)throw Error('This schedule is too tall to export. Increase the image width or shorten custom titles.');
 // Cap backing dimensions and pixel count for mobile canvas memory limits.
 const scale=Math.min(2,8192/model.height,Math.sqrt(12000000/(model.width*model.height)));
 canvas.width=Math.floor(model.width*scale);canvas.height=Math.floor(model.height*scale);context.setTransform(canvas.width/model.width,0,0,canvas.height/model.height,0,0);
 const paper=dark?'#1c1c1e':'#ffffff',ink=dark?'#f2f2f2':'#1c2f27',muted=dark?'#b4b4b8':'#64736b',border=dark?'#414145':'#dfe4df';
 context.fillStyle=paper;context.fillRect(0,0,model.width,model.height);context.textBaseline='top';
 context.fillStyle=ink;context.textAlign='center';context.font=`700 18px ${family}`;model.labelLines.forEach((line,index)=>context.fillText(line,model.width/2,24+index*24));
 context.font=`600 12px ${family}`;
 DAY_NAMES.forEach((day,index)=>context.fillText(day.toUpperCase(),model.pad+model.gutter+(index+.5)*model.dayWidth,26+model.labelHeight));
 for(let minutes=model.min;minutes<=model.max;minutes+=60){
  const y=model.top+(minutes-model.min)/60*model.hourHeight;context.strokeStyle=border;context.lineWidth=1;context.setLineDash([3,3]);context.beginPath();context.moveTo(model.pad+model.gutter,y);context.lineTo(model.width-model.pad,y);context.stroke();context.setLineDash([]);
  context.font=`400 10px ${family}`;context.fillStyle=muted;context.textAlign='right';context.fillText(time(minutes),model.pad+model.gutter-8,y-5);
 }
 for(const block of model.blocks){
  context.fillStyle=model.options.color;roundedRect(context,block.x,block.y,block.width,block.height,6);context.fill();context.fillStyle=readableInk(model.options.color);context.textAlign='left';let y=block.y+8;
  for(const line of block.lines){context.font=`${line.weight} ${line.size}px ${family}`;context.fillText(line.text,block.x+7,y);y+=line.size*1.3;}
 }
 context.globalAlpha=.23;context.fillStyle=muted;context.textAlign='right';context.font=`400 7px ${family}`;context.fillText(model.watermark,model.width-12,model.height-13);context.globalAlpha=1;
 return model;
}

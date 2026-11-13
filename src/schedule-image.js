// A deterministic, local canvas renderer: the preview and PNG use the same pixels.
import {DAYS,DAY_NAMES,clock,occurrences,roomLabel,amount} from './core.js';
import {meetingLanes} from './meeting-layout.js';

export const PNG_MIN_WIDTH=850,PNG_MAX_WIDTH=2200,DEFAULT_BLOCK_COLOR='#2e844c';
export const exportCourseKey=course=>String(course.code||'').trim();
export function imageOptions(options={}){
 const width=Math.round(Number(options.width)||PNG_MIN_WIDTH);
 return {width:Math.min(PNG_MAX_WIDTH,Math.max(PNG_MIN_WIDTH,width)),dark:options.dark===true,
  color:/^#[\da-f]{6}$/i.test(options.color||'')?options.color:DEFAULT_BLOCK_COLOR,
  fullTitles:options.fullTitles===true,customTitles:{...options.customTitles}};
}
export function imageTitle(course,options){
 const key=exportCourseKey(course),custom=options.customTitles?.[key];
 const text=String(typeof custom==='string'&&custom.trim()?custom:course.title||'').replace(/\s+/g,' ').trim();
 if(options.fullTitles||Array.from(text).length<=40)return text;
 let prefix=Array.from(text).slice(0,37).join('').trimEnd();
 if(!/\s/.test(Array.from(text)[37]||'')&&prefix.includes(' '))prefix=prefix.slice(0,prefix.lastIndexOf(' '));
 return prefix+'...';
}
// Wrap whole words. A single long word gets a smaller uniform block font rather
// than being broken into letters or clipped in the full-title export.
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
 const min=Math.min(420,...meetings.map(item=>Math.floor(item.start/60)*60)),max=Math.max(1260,...meetings.map(item=>Math.ceil(item.end/60)*60));
 const gutter=62,pad=22,header=54,top=header+20,dayWidth=(options.width-pad*2-gutter)/6;
 let hourHeight=60;
 const prepared=meetings.map(meeting=>{
  const course=meeting.course,innerWidth=dayWidth/meeting.columns-18,title=imageTitle(course,options);
  const words=[course.code,title].join(' ').split(/\s+/).filter(Boolean);
  const longest=Math.max(1,...words.map(word=>measure(word,12,700)));
  const credits=amount(course.credits),details=[credits===null?'':`${credits} credits`,[course.section,roomLabel(meeting.room)].filter(Boolean).join(' / ')];
  const longestDetail=Math.max(1,...[time(meeting.start)+'–',time(meeting.end),...details.flatMap(text=>text.split(/\s+/))].map(word=>measure(word,10,400)));
  return {meeting,course,innerWidth,title,details,size:12*innerWidth/longest,small:10*innerWidth/longestDetail};
 });
 // One title/code size and one time/room size across the entire exported week.
 const size=Math.min(12,...prepared.map(block=>block.size)),small=Math.min(10,size,...prepared.map(block=>block.small));
 const blocks=prepared.map(({meeting,course,innerWidth,title,details})=>{
  const lines=[...imageLines(course.code,innerWidth,text=>measure(text,size,700)).map(text=>({text,size,weight:700})),
   ...imageLines(title,innerWidth,text=>measure(text,size,700)).map(text=>({text,size,weight:700}))];
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
 return {options,width:options.width,height,gutter,pad,header,top,dayWidth,hourHeight,min,max,
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
 context.font=`600 12px ${family}`;context.fillStyle=ink;context.textAlign='center';
 DAY_NAMES.forEach((day,index)=>context.fillText(day.toUpperCase(),model.pad+model.gutter+(index+.5)*model.dayWidth,26));
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

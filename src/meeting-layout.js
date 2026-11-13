export function meetingHourBounds(meetings){
 if(!meetings.length)return {min:420,max:480};
 return {min:Math.floor(Math.min(...meetings.map(meeting=>meeting.start))/60)*60,max:Math.ceil(Math.max(...meetings.map(meeting=>meeting.end))/60)*60};
}
// Partition each day's overlapping intervals into independent connected groups.
// A later non-conflicting meeting regains the full width of its day column.
export function meetingLanes(meetings){
 const result=meetings.map(meeting=>({...meeting,lane:0,columns:1}));
 for(const day of new Set(result.map(meeting=>meeting.day))){
   const sorted=result.filter(meeting=>meeting.day===day).sort((a,b)=>a.start-b.start||a.end-b.end);let group=[],end=-Infinity;
   const finish=()=>{
     const ends=[];
     for(const meeting of group){let lane=ends.findIndex(end=>end<=meeting.start);if(lane<0)lane=ends.length;ends[lane]=meeting.end;meeting.lane=lane;}
     for(const meeting of group)meeting.columns=Math.max(1,ends.length);
   };
   for(const meeting of sorted){if(group.length&&meeting.start>=end){finish();group=[];end=-Infinity;}group.push(meeting);end=Math.max(end,meeting.end);}
   finish();
 }
 return result;
}
export function sharedMeetingTitle(title,limit=20){
 const text=String(title||'').replace(/\s+/g,' ').trim(),characters=Array.from(text);if(characters.length<=limit)return text;
 let prefix=characters.slice(0,Math.max(0,limit-3)).join('').trimEnd();
 if(!/\s/.test(characters[limit-3]||'')&&!/\s/.test(characters[limit-4]||'')&&prefix.includes(' '))prefix=prefix.slice(0,prefix.lastIndexOf(' '));
 return prefix+'...';
}

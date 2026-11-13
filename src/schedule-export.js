import {esc,icon,showDialog,closeDialog,checkboxSetting} from './ui.js';
import {PNG_MIN_WIDTH,PNG_MAX_WIDTH,DEFAULT_BLOCK_COLOR,exportCourseKey,imageOptions,drawScheduleImage} from './schedule-image.js';

export function scheduleExportMarkup(){return `<div class="png-stage"><div class="png-sheet"><canvas role="img" aria-label="Full weekly schedule PNG preview, Monday through Saturday"></canvas><button type="button" class="png-resize" aria-label="Drag to resize schedule image width" title="Drag to resize">↔<small>DRAG<br>TO<br>RESIZE</small></button></div></div><div class="png-sizing"><label>Image width <input type="range" data-png-width min="${PNG_MIN_WIDTH}" max="${PNG_MAX_WIDTH}" step="10" value="${PNG_MIN_WIDTH}"></label><output data-png-size></output></div><p class="png-status" data-png-status role="status" aria-live="polite"></p>`;}
export function scheduleImageSettings(courses,options,{useCurriculum=false,hasCurriculum=false}={}){
 const unique=[...new Map(courses.map(course=>[exportCourseKey(course),course])).values()];
 return `<form data-png-settings><div class="png-setting-row"><label for="png-block-color">Course block color</label><div class="png-color-control"><button type="button" data-png-default>Use default</button><input id="png-block-color" type="color" value="${esc(options.color)}"></div></div><div class="png-setting-row">${checkboxSetting({id:'png-full-title',attribute:'data-png-full-title',title:'Show the entire course title',description:'Long titles make the schedule taller so all text fits.',checked:options.fullTitles})}</div>${hasCurriculum?`<div class="png-setting-row">${checkboxSetting({id:'png-curriculum',attribute:'data-png-curriculum',title:'Use titles from Program Curriculum',description:'Custom titles below take priority over curriculum titles.',checked:useCurriculum})}</div>`:''}<p class="muted">Enter custom titles for this image. Leave a field blank to use the original title. Saved academic records are unchanged.</p><div class="png-title-editor">${unique.map((course,index)=>`<label><span>${esc(course.code)}</span><input type="text" data-png-title="${index}" maxlength="500" value="${esc(options.customTitles[exportCourseKey(course)]||'')}" placeholder="${esc(course.title||'Custom course title')}" aria-label="Custom title for ${esc(course.code)}"></label>`).join('')}</div></form>`;
}
export function openScheduleExport(courses,{curriculum=[]}={}){
 if(document.querySelector('dialog.schedule-png'))return;
 // Keep a snapshot; export customization must never mutate the academic cache.
 const snapshot=courses.map(course=>({...course})),curriculumTitles=new Map(curriculum.map(course=>[exportCourseKey(course),course.title]));
 let options=imageOptions(),useCurriculum=false,disposed=false,revision=0,blob=null,url=null,settings=null;
 const dialog=document.createElement('dialog');dialog.className='schedule-png';dialog.setAttribute('aria-labelledby','png-preview-title');document.body.append(dialog);
 const redraw=()=>{
  if(disposed)return;const current=++revision;blob=null;
  const status=dialog.querySelector('[data-png-status]'),save=dialog.querySelector('[data-png-save]'),canvas=dialog.querySelector('canvas');save.disabled=true;status.textContent='Preparing preview…';
  try{
   const rendered=snapshot.map(course=>({...course,title:useCurriculum?curriculumTitles.get(exportCourseKey(course))||course.title:course.title}));
   const model=drawScheduleImage(canvas,rendered,options);dialog.dataset.imageTheme=options.dark?'dark':'light';
   dialog.querySelector('.png-sheet').style.width=options.width+'px';dialog.querySelector('[data-png-width]').value=options.width;
   dialog.querySelector('[data-png-size]').textContent=`${options.width} px layout · ${canvas.width} × ${canvas.height} PNG`;
   dialog.querySelector('[data-png-theme]').textContent=`Switch to ${options.dark?'Light':'Dark'} Mode`;
   dialog.querySelector('[data-png-theme]').setAttribute('aria-pressed',String(options.dark));
   canvas.toBlob(value=>{
    if(disposed||current!==revision)return;if(!value){status.textContent='PNG encoding failed. Reduce the image width and try again.';return;}
    if(url)URL.revokeObjectURL(url);blob=value;url=URL.createObjectURL(value);save.disabled=false;
    status.textContent=model.warnings.length?'Some meetings could not be placed: '+model.warnings.join(' '):'Preview ready. Resize or customize before saving. On mobile, the share sheet may offer Save Image or Save to Files.';
   },'image/png');
  }catch(error){if(!disposed)status.textContent=error.message;}
 };
 const editSettings=()=>{
  if(settings?.open)return;settings=document.createElement('dialog');settings.className='png-settings';settings.setAttribute('aria-labelledby','png-settings-title');document.body.append(settings);
  const draft=imageOptions(options);
  showDialog(settings,'Schedule settings',scheduleImageSettings(snapshot,draft,{useCurriculum,hasCurriculum:curriculumTitles.size>0}),element=>{
   element.querySelector('#modal-title').id='png-settings-title';
   element.querySelector('[data-png-default]').onclick=()=>{element.querySelector('#png-block-color').value=DEFAULT_BLOCK_COLOR;};
   element.querySelector('[data-png-settings-save]').onclick=async()=>{
    draft.color=element.querySelector('#png-block-color').value;draft.fullTitles=element.querySelector('[data-png-full-title]').checked;
    const unique=[...new Map(snapshot.map(course=>[exportCourseKey(course),course])).keys()];
    draft.customTitles=Object.fromEntries(unique.map((key,index)=>[key,element.querySelector(`[data-png-title="${index}"]`).value.trim()]).filter(([,value])=>value));
    options=imageOptions(draft);useCurriculum=element.querySelector('[data-png-curriculum]')?.checked||false;
    redraw();await closeDialog(element);
   };
   element.querySelector('form').onsubmit=event=>{event.preventDefault();element.querySelector('[data-png-settings-save]').click();};
  },{subtitle:'Customize the titles and colors used in the PNG preview.',footer:'<button type="button" data-close>Cancel</button><button type="button" class="primary" data-png-settings-save>Save settings</button>',onClose:()=>{settings?.remove();settings=null;}});
 };
 showDialog(dialog,'Save schedule as PNG',scheduleExportMarkup(),element=>{
  element.querySelector('#modal-title').id='png-preview-title';const header=element.querySelector('.modal-header');header.querySelector('[data-close]').remove();
  const controls=document.createElement('div');controls.className='png-toolbar';controls.innerHTML=`<button type="button" data-png-theme aria-pressed="false">Switch to Dark Mode</button><button type="button" data-png-cancel>Cancel</button><button type="button" class="primary" data-png-save disabled>Save PNG</button><button type="button" class="icon-button" data-png-config aria-label="Schedule image settings">${icon('settings')}</button>`;header.append(controls);
  element.querySelector('[data-png-cancel]').onclick=()=>closeDialog(dialog);
  element.querySelector('[data-png-theme]').onclick=()=>{options.dark=!options.dark;redraw();};
  element.querySelector('[data-png-config]').onclick=editSettings;
  element.querySelector('[data-png-theme]').focus({preventScroll:true});
  const setWidth=width=>{options=imageOptions({...options,width});redraw();};
  const range=element.querySelector('[data-png-width]');range.oninput=()=>setWidth(range.value);
  const handle=element.querySelector('.png-resize');let drag=null,frame=0,pendingWidth;
  const move=event=>{if(!drag)return;pendingWidth=drag.width+(event.clientX-drag.x)/drag.scale;if(!frame)frame=requestAnimationFrame(()=>{frame=0;setWidth(pendingWidth);});};
  handle.onpointerdown=event=>{if(event.button!==undefined&&event.button!==0)return;event.preventDefault();const sheet=element.querySelector('.png-sheet');drag={x:event.clientX,width:options.width,scale:sheet.getBoundingClientRect().width/options.width||1};handle.setPointerCapture?.(event.pointerId);};
  handle.onpointermove=move;handle.onpointerup=handle.onpointercancel=()=>{drag=null;if(frame){cancelAnimationFrame(frame);frame=0;setWidth(pendingWidth);}};
  // Range remains keyboard/touch accessible even on hosts lacking pointer capture.
  element.querySelector('[data-png-save]').onclick=async()=>{
   if(!blob)return;const button=element.querySelector('[data-png-save]'),status=element.querySelector('[data-png-status]');button.disabled=true;
   try{
    const name=`Better_SOLAR-schedule-${new Date().getFullYear()}.png`,file=typeof File==='function'?new File([blob],name,{type:'image/png'}):null;
    let canShare=false;try{canShare=!!file&&!!navigator.canShare?.({files:[file]})&&typeof navigator.share==='function';}catch{}
    if(canShare){
     await navigator.share({files:[file],title:'Weekly course schedule'});if(!disposed)status.textContent='PNG shared. Choose Save Image or Save to Files to keep a copy.';
    }else{
     const link=document.createElement('a');link.href=url;link.download=name;link.target='_blank';link.rel='noopener';document.body.append(link);link.click();link.remove();status.textContent='PNG download requested. ';
     const fallback=document.createElement('a');fallback.href=url;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='Open PNG to save manually';status.append(fallback);
    }
   }catch(error){if(!disposed)status.textContent=error.name==='AbortError'?'Save canceled. Your preview is still ready.':`Could not save PNG: ${error.message}`;}
   finally{if(!disposed)button.disabled=false;}
  };
  element.addEventListener('close',()=>{if(frame)cancelAnimationFrame(frame);},{once:true});
  redraw();
 },{subtitle:'Preview and resize your weekly schedule before saving.',onClose:()=>{
  disposed=true;revision++;if(settings)void closeDialog(settings,{immediate:true});
  if(url){const old=url;setTimeout(()=>URL.revokeObjectURL(old),60000);}removeEventListener('better-solar-fonts',redraw);dialog.remove();
 }});
 addEventListener('better-solar-fonts',redraw);
 return dialog;
}

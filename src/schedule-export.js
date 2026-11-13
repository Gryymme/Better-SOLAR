import {esc,icon,showDialog,closeDialog} from './ui.js';
import {BUILD_TARGET} from './platform.js';
import {saveSchedulePNG} from './schedule-save.js';
import {PNG_MIN_WIDTH,PNG_MAX_WIDTH,DEFAULT_BLOCK_COLOR,exportCourseKey,imageOptions,drawScheduleImage} from './schedule-image.js';

export function scheduleExportMarkup({target=BUILD_TARGET}={}){return `<div class="png-stage"><div class="png-sheet"><canvas role="img" aria-label="Full weekly schedule PNG preview, Monday through Saturday"></canvas>${target==='mobile'?'':`<button type="button" class="png-resize" aria-label="Drag to resize schedule image width" title="Drag to resize">↔<small>DRAG<br>TO<br>RESIZE</small></button>`}</div></div><div class="png-sizing"><label>Image width <input type="range" data-png-width min="${PNG_MIN_WIDTH}" max="${PNG_MAX_WIDTH}" step="10" value="${PNG_MIN_WIDTH}"></label><output data-png-size></output></div><p class="png-status" data-png-status role="status" aria-live="polite"></p>`;}
const uniqueImageCourses=courses=>[...new Map(courses.map(course=>[exportCourseKey(course),course])).values()].sort((a,b)=>exportCourseKey(a).localeCompare(exportCourseKey(b),undefined,{numeric:true}));
function imageSwitch(id,title,checked,description=''){
 return `<div class="png-switch-row"><div><span class="png-option-title" id="${id}-label">${esc(title)}</span>${description?`<p id="${id}-hint">${esc(description)}</p>`:''}</div><button type="button" role="switch" class="png-switch" aria-checked="${checked}" aria-labelledby="${id}-label" ${description?`aria-describedby="${id}-hint"`:''} data-${id}><span></span></button></div>`;
}
export function scheduleImageSettings(courses,options,{useCurriculum=true}={}){
 const unique=uniqueImageCourses(courses);
 return `<form data-png-settings><div class="png-setting-row"><label class="png-option-title" for="png-block-color">Course Block Color</label><div class="png-color-control"><button type="button" data-png-default>Use Default</button><label class="png-color-swatch" style="--swatch:${esc(options.color)}"><input id="png-block-color" type="color" value="${esc(options.color)}" aria-label="Course block color"></label></div></div>${imageSwitch('png-full-title','Show the entire course title',options.fullTitles,'Long course titles will cause course blocks to be taller to fit.')}${imageSwitch('png-curriculum','Use course title indicated on the Program Curriculum page',useCurriculum)}<div class="png-title-editor" ${useCurriculum?'hidden':''}><div class="png-title-head"><span>Course Code</span><span>Course Title</span></div>${unique.map((course,index)=>`<label><span>${esc(course.code)}</span><input type="text" data-png-title="${index}" maxlength="500" value="${esc(options.customTitles[exportCourseKey(course)]??course.title??'')}" aria-label="Custom title for ${esc(course.code)}"></label>`).join('')}</div></form>`;
}
export function bindImageSettingsSwitches(form){
 for(const button of form.querySelectorAll('[role="switch"]'))button.onclick=()=>{
  const checked=button.getAttribute('aria-checked')!=='true';button.setAttribute('aria-checked',String(checked));
  if(button.hasAttribute('data-png-curriculum'))form.querySelector('.png-title-editor').hidden=checked;
 };
}
export function imageSourceCourses(courses,curriculum,useCurriculum){
 if(!useCurriculum)return courses;
 const titles=new Map(curriculum.map(course=>[exportCourseKey(course),course.title]));
 return courses.map(course=>({...course,title:titles.get(exportCourseKey(course))||course.title}));
}
export function imageLabelPromptMarkup(label=''){
 return `<p>Add a label above the weekly schedule, or leave this blank to save just the schedule.</p><form data-image-label-form><label>Image label (optional)<input type="text" data-image-label maxlength="200" autocomplete="off" value="${esc(label)}" placeholder="For example: Term 1 · SY 2026–2027"></label></form>`;
}
export function bindImageLabelPrompt(dialog,{onLabel,onSave}){
 const input=dialog.querySelector('[data-image-label]'),button=dialog.querySelector('[data-confirm-png-label]');
 input.oninput=()=>{button.disabled=true;onLabel(input.value);};
 button.onclick=()=>{if(!button.disabled)onSave();};
 dialog.querySelector('form').onsubmit=event=>{event.preventDefault();if(!button.disabled)button.click();};
 return {setReady:ready=>{button.disabled=!ready;},input};
}
export function openScheduleExport(courses,{curriculum=[]}={}){
 if(document.querySelector('dialog.schedule-png'))return;
 // Keep a snapshot; export customization must never mutate the academic cache.
 const snapshot=courses.map(course=>({...course}));
 let options=imageOptions(),useCurriculum=true,disposed=false,revision=0,blob=null,url=null,settings=null,labelDialog=null,labelControls=null,saveBusy=false;
 const heldURLs=new Set(),retiredURLs=new Set();
 const dialog=document.createElement('dialog');dialog.className='schedule-png';dialog.dataset.buildTarget=BUILD_TARGET;dialog.setAttribute('aria-labelledby','png-preview-title');document.body.append(dialog);
 const setSaveReady=ready=>{dialog.querySelector('[data-png-save]').disabled=!ready||saveBusy;labelControls?.setReady(ready&&!saveBusy);};
 const redraw=()=>{
  if(disposed)return;const current=++revision;blob=null;
  const status=dialog.querySelector('[data-png-status]'),canvas=dialog.querySelector('canvas');setSaveReady(false);status.textContent='Preparing preview…';
  try{
   const rendered=imageSourceCourses(snapshot,curriculum,useCurriculum);
   const model=drawScheduleImage(canvas,rendered,useCurriculum?{...options,customTitles:{}}:options);options.width=model.width;dialog.dataset.imageTheme=options.dark?'dark':'light';
   dialog.querySelector('.png-sheet').style.width=options.width+'px';dialog.querySelector('[data-png-width]').value=options.width;
   dialog.querySelector('[data-png-size]').textContent=`${options.width} px layout · ${canvas.width} × ${canvas.height} PNG`;
   dialog.querySelector('[data-png-theme]').textContent=`Switch to ${options.dark?'Light':'Dark'} Mode`;
   dialog.querySelector('[data-png-theme]').setAttribute('aria-pressed',String(options.dark));
   canvas.toBlob(value=>{
    if(disposed||current!==revision)return;if(!value){status.textContent='PNG encoding failed. Reduce the image width and try again.';return;}
    if(url){if(heldURLs.has(url))retiredURLs.add(url);else URL.revokeObjectURL(url);}blob=value;url=URL.createObjectURL(value);setSaveReady(true);
    status.textContent=model.warnings.length?'Some meetings could not be placed: '+model.warnings.join(' '):BUILD_TARGET==='mobile'?'Preview ready. Use the width slider to resize. The share sheet may offer Save Image or Save to Files.':'Preview ready. Resize or customize before saving. Save PNG opens the browser’s Save As dialog.';
   },'image/png');
  }catch(error){if(!disposed)status.textContent=error.message;}
 };
 const editSettings=()=>{
  if(settings?.open)return;settings=document.createElement('dialog');settings.className='png-settings';settings.setAttribute('aria-labelledby','png-settings-title');document.body.append(settings);
  const draft=imageOptions(options);
  showDialog(settings,'Schedule Settings',scheduleImageSettings(snapshot,draft,{useCurriculum}),element=>{
   element.querySelector('#modal-title').id='png-settings-title';element.querySelector('.modal-header [data-close]').remove();
   bindImageSettingsSwitches(element.querySelector('form'));
   element.querySelector('[data-png-default]').onclick=()=>{element.querySelector('#png-block-color').value=DEFAULT_BLOCK_COLOR;element.querySelector('.png-color-swatch').style.setProperty('--swatch',DEFAULT_BLOCK_COLOR);};
   element.querySelector('#png-block-color').oninput=event=>element.querySelector('.png-color-swatch').style.setProperty('--swatch',event.target.value);
   element.querySelector('[data-png-settings-save]').onclick=async()=>{
    draft.color=element.querySelector('#png-block-color').value;draft.fullTitles=element.querySelector('[data-png-full-title]').getAttribute('aria-checked')==='true';
    const unique=uniqueImageCourses(snapshot).map(exportCourseKey);
    draft.customTitles=Object.fromEntries(unique.map((key,index)=>[key,element.querySelector(`[data-png-title="${index}"]`).value.trim()]).filter(([,value])=>value));
    options=imageOptions(draft);useCurriculum=element.querySelector('[data-png-curriculum]').getAttribute('aria-checked')==='true';
    redraw();await closeDialog(element);
   };
   element.querySelector('form').onsubmit=event=>{event.preventDefault();element.querySelector('[data-png-settings-save]').click();};
  },{subtitle:'Customize titles used in the PNG preview.',footer:'<button type="button" data-close>Cancel</button><button type="button" class="primary" data-png-settings-save>Save</button>',onClose:()=>{settings?.remove();settings=null;}});
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
  if(handle){handle.onpointerdown=event=>{if(event.button!==undefined&&event.button!==0)return;event.preventDefault();const sheet=element.querySelector('.png-sheet');drag={x:event.clientX,width:options.width,scale:sheet.getBoundingClientRect().width/options.width||1};handle.setPointerCapture?.(event.pointerId);};
  handle.onpointermove=move;handle.onpointerup=handle.onpointercancel=()=>{drag=null;if(frame){cancelAnimationFrame(frame);frame=0;setWidth(pendingWidth);}};}
  // Range remains keyboard/touch accessible even on hosts lacking pointer capture.
  const performSave=async()=>{
   if(!blob||saveBusy)return;const savedBlob=blob,savedURL=url,status=element.querySelector('[data-png-status]');saveBusy=true;setSaveReady(false);heldURLs.add(savedURL);
   if(labelControls)labelControls.input.disabled=true;
   try{
    const name=`Better_SOLAR-schedule-${new Date().getFullYear()}.png`;
    // This call reaches navigator.share synchronously on mobile. Do not await
    // dialog animation or canvas encoding before invoking the platform saver.
    const saving=saveSchedulePNG({blob:savedBlob,url:savedURL,filename:name});
    if(labelDialog){labelDialog.dataset.accepted='true';void closeDialog(labelDialog);}
    const result=await saving;if(disposed)return;
    if(result.method==='share')status.textContent='PNG shared. Choose Save Image or Save to Files to keep a copy.';
    else if(result.method==='save-as')status.textContent='PNG download started.';
    else{
     status.textContent='PNG download requested. ';
     const fallback=document.createElement('a');fallback.href=savedURL;fallback.target='_blank';fallback.rel='noopener';fallback.textContent='Open PNG to save manually';status.append(fallback);
    }
   }catch(error){if(!disposed)status.textContent=error.name==='AbortError'?'Save canceled. Your preview is still ready.':`Could not save PNG: ${error.message}`;}
   finally{
    heldURLs.delete(savedURL);if(retiredURLs.delete(savedURL))setTimeout(()=>URL.revokeObjectURL(savedURL),60000);
    saveBusy=false;if(!disposed)setSaveReady(!!blob);
   }
  };
  element.querySelector('[data-png-save]').onclick=()=>{
   if(!blob||saveBusy||labelDialog?.open)return;
   const previous=imageOptions(options),prompt=document.createElement('dialog');labelDialog=prompt;prompt.className='png-label';prompt.setAttribute('aria-labelledby','png-label-title');document.body.append(prompt);
   showDialog(prompt,'Add an image label?',imageLabelPromptMarkup(options.label),node=>{
    node.querySelector('#modal-title').id='png-label-title';
    labelControls=bindImageLabelPrompt(node,{onLabel:value=>{options=imageOptions({...options,label:value});redraw();},onSave:()=>void performSave()});
    labelControls.setReady(!!blob);labelControls.input.focus({preventScroll:true});
   },{footer:'<button type="button" data-close>Cancel</button><button type="button" class="primary" data-confirm-png-label>Save PNG</button>',onClose:()=>{
    labelDialog=null;labelControls=null;prompt.remove();
    if(prompt.dataset.accepted!=='true'&&!disposed){options=previous;redraw();}
   }});
  };
  element.addEventListener('close',()=>{if(frame)cancelAnimationFrame(frame);},{once:true});
  redraw();
 },{subtitle:'Preview and resize your weekly schedule before saving.',onClose:()=>{
  disposed=true;revision++;if(labelDialog)void closeDialog(labelDialog,{immediate:true});if(settings)void closeDialog(settings,{immediate:true});
  if(url){if(heldURLs.has(url))retiredURLs.add(url);else{const old=url;setTimeout(()=>URL.revokeObjectURL(old),60000);}}removeEventListener('better-solar-fonts',redraw);dialog.remove();
 }});
 addEventListener('better-solar-fonts',redraw);
 return dialog;
}

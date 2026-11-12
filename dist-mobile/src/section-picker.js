// A bounded combobox replaces the browser-sized datalist. All values remain
// available, while the visible menu is capped at six rows and fits the viewport.
export const MAX_SECTION_ROWS=6,SECTION_ROW_HEIGHT=36;
export function matchingSections(values,query=''){
 const q=query.trim().toLocaleLowerCase();
 return [...new Set(values.filter(value=>typeof value==='string'&&value.trim()))].filter(value=>value.toLocaleLowerCase().includes(q)).sort((a,b)=>{
   const prefixA=a.toLocaleLowerCase().startsWith(q),prefixB=b.toLocaleLowerCase().startsWith(q);
   return Number(prefixB)-Number(prefixA)||a.localeCompare(b,undefined,{numeric:true,sensitivity:'base'});
 });
}
export function sectionMenuGeometry(rect,viewportWidth,viewportHeight,count){
 const margin=8,gap=4,desired=Math.min(Math.max(count,1),MAX_SECTION_ROWS)*SECTION_ROW_HEIGHT+10;
 const below=Math.max(0,viewportHeight-rect.bottom-margin-gap),above=Math.max(0,rect.top-margin-gap);
 const opensAbove=below<desired&&above>below,space=opensAbove?above:below,height=Math.min(desired,space,Math.max(0,viewportHeight-margin*2));
 const width=Math.min(Math.max(rect.width,170),Math.max(0,viewportWidth-margin*2));
 return {height,width,left:Math.max(margin,Math.min(rect.left,viewportWidth-width-margin)),top:Math.max(margin,Math.min(opensAbove?rect.top-gap-height:rect.bottom+gap,viewportHeight-height-margin)),opensAbove};
}
const instances=new Set();let installed=false;
export function cleanupSectionPickers(){for(const instance of instances)if(!instance.root.isConnected){instance.close();instances.delete(instance);}}
export function closeSectionPickersIn(scope){for(const instance of instances)if(scope.contains(instance.root)){instance.close();instances.delete(instance);}}
function installListeners(){if(installed)return;installed=true;
 document.addEventListener('pointerdown',event=>{cleanupSectionPickers();for(const instance of instances)if(!instance.root.contains(event.target)&&!instance.list.contains(event.target))instance.restoreAndClose();});
 addEventListener('resize',()=>{cleanupSectionPickers();for(const instance of instances)instance.reposition();});
 document.addEventListener('scroll',event=>{for(const instance of instances)if(event.target!==instance.list)instance.reposition();},true);
}
export function bindSectionPicker(root,values,value,onChange){
 cleanupSectionPickers();installListeners();
 const input=root.querySelector('input'),toggle=root.querySelector('.section-toggle'),list=root.querySelector('.section-options');
 const allowAll=root.dataset.allowAll!=='false',options=matchingSections(values);let committed=value||'',isOpen=false,items=[],active=0;
 input.value=committed;
 function markActive(){
   [...list.querySelectorAll('[role=option]')].forEach((option,index)=>option.classList.toggle('option-active',index===active));
   const option=list.querySelectorAll('[role=option]')[active];
   if(option){input.setAttribute('aria-activedescendant',option.id);const top=option.offsetTop,bottom=top+option.offsetHeight;
     if(top<list.scrollTop)list.scrollTop=top;else if(bottom>list.scrollTop+list.clientHeight)list.scrollTop=bottom-list.clientHeight;
   }else input.removeAttribute('aria-activedescendant');
 }
 function reposition(){if(!isOpen)return;const rect=root.querySelector('.section-control').getBoundingClientRect();if(rect.bottom<8||rect.top>innerHeight-8){close();return;}
   const geometry=sectionMenuGeometry(rect,document.documentElement.clientWidth||innerWidth,innerHeight,items.length);
   Object.assign(list.style,{left:geometry.left+'px',top:geometry.top+'px',width:geometry.width+'px',maxHeight:geometry.height+'px'});
   list.dataset.placement=geometry.opensAbove?'above':'below';
 }
 function close(){isOpen=false;input.setAttribute('aria-expanded','false');toggle.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');
   try{if(list.matches(':popover-open'))list.hidePopover();}catch{}list.hidden=true;
 }
 function commit(next){const changed=committed!==next;committed=next;input.value=next;close();if(changed)onChange(next);}
 function restoreAndClose(){const typed=input.value.trim(),exact=options.find(value=>value===typed);
   if(exact!==undefined)commit(exact);else if(!typed&&allowAll)commit('');else{input.value=committed;close();}
 }
 function draw(query=''){
   items=matchingSections(options,query).map(value=>({value,label:value}));if(allowAll&&!query.trim())items.unshift({value:'',label:'All sections'});
   list.replaceChildren();
   items.forEach((item,index)=>{const button=document.createElement('button');button.type='button';button.className='section-option';button.id=list.id+'-'+index;button.setAttribute('role','option');button.setAttribute('aria-selected',String(item.value===committed));button.tabIndex=-1;button.textContent=item.label;
     button.onpointerdown=event=>event.preventDefault();button.onclick=()=>{commit(item.value);input.focus();close();};list.append(button);
   });
   if(!items.length){const empty=document.createElement('div');empty.className='section-no-results';empty.setAttribute('role','status');empty.textContent='No matching sections';list.append(empty);}
   active=Math.max(0,items.findIndex(item=>item.value===committed));reposition();markActive();
 }
 function open(query=''){
   isOpen=true;list.hidden=false;input.setAttribute('aria-expanded','true');toggle.setAttribute('aria-expanded','true');draw(query);
   if(typeof list.showPopover==='function')try{if(!list.matches(':popover-open'))list.showPopover();}catch{}
   reposition();markActive();
 }
 input.onfocus=()=>open();input.oninput=()=>{if(!input.value&&allowAll&&committed){committed='';onChange('');}open(input.value);};
 input.onblur=()=>queueMicrotask(()=>{if(!root.isConnected){close();return;}if(!root.contains(document.activeElement)&&!list.contains(document.activeElement))restoreAndClose();});
 input.onkeydown=event=>{
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(!isOpen)open();else{active=Math.max(0,Math.min(items.length-1,active+(event.key==='ArrowDown'?1:-1)));markActive();}}
   else if(event.key==='Home'&&isOpen){event.preventDefault();active=0;markActive();}
   else if(event.key==='End'&&isOpen){event.preventDefault();active=items.length-1;markActive();}
   else if(event.key==='Enter'&&isOpen){event.preventDefault();if(items[active])commit(items[active].value);}
   else if(event.key==='Escape'&&isOpen){event.preventDefault();event.stopPropagation();input.value=committed;close();}
   else if(event.key==='Tab')restoreAndClose();
 };
 toggle.onpointerdown=event=>event.preventDefault();toggle.onclick=()=>{if(isOpen){input.value=committed;close();}else{input.focus();open();}};
 const instance={root,list,close,restoreAndClose,reposition};instances.add(instance);return instance;
}

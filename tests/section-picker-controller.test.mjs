import test from 'node:test';import assert from 'node:assert/strict';
import {bindSectionPicker,closeSectionPickersIn} from '../src/section-picker.js';
function fixture(){
 const attributes=()=>({attrs:{},setAttribute(k,v){this.attrs[k]=v;},removeAttribute(k){delete this.attrs[k];}});
 const input={...attributes(),value:''},toggle={...attributes()},control={getBoundingClientRect:()=>({top:100,bottom:144,left:40,width:180})};
 const list={id:'section-list',hidden:true,opened:false,style:{},dataset:{},children:[],scrollTop:0,replaceChildren(){this.children=[];},append(child){this.children.push(child);Object.defineProperty(child,'offsetTop',{get:()=>4+this.children.indexOf(child)*36});},querySelectorAll(){return this.children.filter(child=>child.attrs.role==='option');},matches(){return this.opened;},showPopover(){this.opened=true;},hidePopover(){this.opened=false;},contains(node){return node===this||this.children.includes(node);}};
 Object.defineProperty(list,'clientHeight',{get:()=>parseFloat(list.style.maxHeight)||0});
 const root={dataset:{allowAll:'true'},isConnected:true,querySelector(selector){return selector==='input'?input:selector==='.section-toggle'?toggle:selector==='.section-control'?control:list;},contains(node){return node===this||node===input||node===toggle||node===control||list.contains(node);}};
 globalThis.document={documentElement:{clientWidth:800},activeElement:input,addEventListener(){},createElement(){return {...attributes(),classList:{toggle(){}},offsetHeight:36};}};
 globalThis.addEventListener=()=>{};globalThis.innerWidth=800;globalThis.innerHeight=600;
 input.focus=()=>{if(document.activeElement!==input){document.activeElement=input;input.onfocus?.();}};
 const commits=[];bindSectionPicker(root,['AA2','AA1','AB1'],'',value=>commits.push(value));
 const key=value=>{const event={key:value,preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;}};input.onkeydown(event);return event;};
 return {root,input,toggle,list,commits,key};
}
test('The section picker searches, commits via Enter, moves by keyboard, and restores on Escape',()=>{const f=fixture();f.input.onfocus();assert.equal(f.input.attrs['aria-expanded'],'true');f.input.value='AA';f.input.oninput();assert.equal(f.list.children.length,2);assert.equal(f.commits.length,0);f.key('Enter');assert.deepEqual(f.commits,['AA1']);assert.equal(f.input.attrs['aria-expanded'],'false');f.key('ArrowDown');f.key('ArrowDown');f.key('Enter');assert.deepEqual(f.commits,['AA1','AA2']);f.input.value='unknown';f.input.oninput();const event=f.key('Escape');assert.equal(f.input.value,'AA2');assert.equal(f.list.hidden,true);assert.equal(event.prevented,true);assert.equal(event.stopped,true);closeSectionPickersIn(f.root);});
test('Clearing a section resets the filter, and a removed picker cannot commit a late blur',async()=>{const f=fixture();f.input.value='AA1';f.input.oninput();f.key('Enter');f.input.value='';f.input.oninput();assert.deepEqual(f.commits,['AA1','']);f.root.isConnected=false;f.input.value='AA2';document.activeElement=null;f.input.onblur();await Promise.resolve();assert.deepEqual(f.commits,['AA1','']);assert.equal(f.list.hidden,true);closeSectionPickersIn(f.root);});

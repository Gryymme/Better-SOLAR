import {BUNDLED_FONTS} from './font-assets.js';
// The build environment cannot download external binary assets. On the first
// online run, load the unmodified pinned Montserrat webfonts directly and keep
// their bytes in this browser's Cache Storage for subsequent offline launches.
export const FONT_VERSION='5.2.6';
export const FONT_WEIGHTS=[400,500,600,700];
export const fontURL=weight=>`https://cdn.jsdelivr.net/npm/@fontsource/montserrat@${FONT_VERSION}/files/montserrat-latin-${weight}-normal.woff2`;
let currentStatus='loading';
export const fontStatus=()=>currentStatus;
export async function initializeFonts(){
 if(typeof FontFace!=='function'||!globalThis.document?.fonts)return false;
 let cache;try{cache=await caches.open('better-solar-fonts-v1');}catch{}
 const results=await Promise.allSettled(FONT_WEIGHTS.map(async weight=>{
   const url=fontURL(weight);let response;
   if(BUNDLED_FONTS){response=await fetch(new URL(`../assets/fonts/Montserrat-${weight}.woff2`,import.meta.url));if(!response.ok)throw Error('Bundled font file is missing.');}
   else response=await cache?.match(url);
   if(!response){if(globalThis.navigator?.onLine===false)throw Error('Font is not cached yet.');response=await fetch(url,{credentials:'omit',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('Font download failed.');const copy=response.clone();const data=await response.arrayBuffer();if(new DataView(data).getUint32(0)!==0x774f4632)throw Error('Invalid Montserrat font file.');await cache?.put(url,copy);response=new Response(data);}
   const face=new FontFace('Montserrat',await response.arrayBuffer(),{style:'normal',weight:String(weight),display:'swap'});await face.load();document.fonts.add(face);
 }));
 const ready=results.every(result=>result.status==='fulfilled');currentStatus=ready?'ready':'pending';document.documentElement.dataset.fontStatus=currentStatus;if(typeof dispatchEvent==='function'&&typeof CustomEvent==='function')dispatchEvent(new CustomEvent('better-solar-fonts',{detail:currentStatus}));return ready;
}

if(typeof addEventListener==='function')addEventListener('online',()=>{if(currentStatus!=='ready')void initializeFonts();});

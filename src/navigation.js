// Separate thresholds prevent tiny scroll movements near the top from toggling
// the header repeatedly. A fixed header and permanent spacer keep scrollY stable.
export function headerMinimized(scrollPosition,previous=false){
 const y=Math.max(0,Number(scrollPosition)||0);
 return previous?y>8:y>=48;
}
// Progress polling must not recreate the header in its expanded green state.
export function mountApplicationShell(root,{navigationHTML,mainHTML,footerHTML,routeChanged=false}){
 const main=root.querySelector('#main');
 if(!routeChanged&&main&&root.querySelector('#nav')){main.outerHTML=mainHTML;return;}
 root.innerHTML=navigationHTML+mainHTML+footerHTML;
}

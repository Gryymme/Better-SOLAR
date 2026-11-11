const ext=()=>globalThis.chrome?.storage?.local;
let transitionTimer;
export async function initTheme(){
 let theme;try{theme=ext()?(await chrome.storage.local.get('theme')).theme:localStorage.getItem('theme');}catch{}
 apply(theme,false);
 if(ext())chrome.storage.onChanged.addListener((changes,area)=>{if(area==='local'&&changes.theme)apply(changes.theme.newValue,true);});
 else addEventListener('storage',event=>{if(event.key==='theme')apply(event.newValue,true);});
}
function apply(theme,animate=true){
 const value=theme==='dark'?'dark':'light',root=document.documentElement,changed=root.dataset.theme!==value;
 if(changed){
   clearTimeout(transitionTimer);
   if(animate&&root.dataset.theme&&!globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches){
     root.classList?.add('theme-transition');void root.offsetWidth;
     transitionTimer=setTimeout(()=>root.classList?.remove('theme-transition'),320);
   }else root.classList?.remove('theme-transition');
   root.dataset.theme=value;
 }
 document.querySelectorAll('[data-theme-toggle],#theme').forEach(button=>{button.setAttribute('aria-label',`Switch to ${value==='dark'?'light':'dark'} mode`);button.setAttribute('aria-pressed',String(value==='dark'));});
 document.querySelectorAll('[data-theme-select]').forEach(select=>select.value=value);
}
export async function setTheme(theme){const value=theme==='dark'?'dark':'light';apply(value,true);if(ext())await chrome.storage.local.set({theme:value});else localStorage.setItem('theme',value);}
export async function toggleTheme(){return setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');}

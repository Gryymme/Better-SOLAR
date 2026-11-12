// AbortSignal.timeout is absent in some extension-capable WebKit versions.
export function timeoutSignal(milliseconds){
 if(typeof globalThis.AbortSignal?.timeout==='function')return AbortSignal.timeout(milliseconds);
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(Error('Request timed out.')),milliseconds);
 controller.signal.addEventListener('abort',()=>clearTimeout(timer),{once:true});return controller.signal;
}

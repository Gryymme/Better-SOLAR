// Dialogs fade and grow from their own center; closing reverses that movement.
export function dialogFrames(open){const frames=[{opacity:0,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}];return open?frames:frames.reverse();}
export function sidebarFrames(open){
 return open?[{transform:'translateX(-100%)'},{transform:'translateX(0)'}]:[{transform:'translateX(0)'},{transform:'translateX(-100%)'}];
}

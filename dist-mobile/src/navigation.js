// Separate thresholds prevent tiny scroll movements near the top from toggling
// the header repeatedly. A fixed header and permanent spacer keep scrollY stable.
export function headerMinimized(scrollPosition,previous=false){
 const y=Math.max(0,Number(scrollPosition)||0);
 return previous?y>8:y>=48;
}

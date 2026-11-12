export const TERM_PAGES=new Set(['balance-summary','saf','grades','course-list']);
export function selectionsAfterNavigation(selections,previous,next){
 if(previous===next||!TERM_PAGES.has(previous))return selections;
 const result={...selections};delete result[previous];return result;
}

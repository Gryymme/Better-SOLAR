export const TERM_PAGES=new Set(['balance-summary','saf','grades','course-list']);
export function selectionsAfterNavigation(selections,previous,next){
 if(previous===next||!TERM_PAGES.has(previous))return selections;
 const result={...selections};delete result[previous];return result;
}
export function captureTermDraft(drafts,route,form){
 if(!TERM_PAGES.has(route)||!form?.elements?.term||!form?.elements?.year)return drafts;
 return {...drafts,[route]:{term:form.elements.term.value,year:form.elements.year.value}};
}
export function recordsRevision(records){return JSON.stringify(records.map(record=>[record.id,record.owner,record.category,record.term,record.year,record.scrapedAt,record.status,record.error,record.importedAt]));}
export function activePageControl(document){const main=document.querySelector('#main'),active=document.activeElement;return !!(main&&active&&main.contains(active)&&active.matches?.('select,input,textarea,[role="combobox"]'));}

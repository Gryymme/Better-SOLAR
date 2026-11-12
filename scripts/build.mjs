import {rm,mkdir,cp,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),dest=new URL('../dist/',import.meta.url);await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
for(const f of ['manifest.json','app.html','popup.html','src','scraper','assets'])await cp(new URL(f,root),new URL(f,dest),{recursive:true});
console.log('Production extension built: dist/ (load this folder unpacked)');

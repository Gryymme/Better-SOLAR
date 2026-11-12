import {rm,mkdir,cp,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url),dest=new URL('../dist/',import.meta.url);await rm(dest,{recursive:true,force:true});await mkdir(dest,{recursive:true});
for(const f of ['manifest.json','app.html','popup.html','src','scraper','assets'])await cp(new URL(f,root),new URL(f,dest),{recursive:true});
console.log('Production extension built: dist/ (load this folder unpacked)');
// WebKit/legacy hosts may offer background pages and tabs.executeScript only.
const mobile=new URL('../dist-mobile/',import.meta.url);await rm(mobile,{recursive:true,force:true});await cp(dest,mobile,{recursive:true});
await cp(new URL('background.html',root),new URL('background.html',mobile));
const manifest=JSON.parse(await readFile(new URL('manifest.json',root),'utf8'));
manifest.manifest_version=2;delete manifest.minimum_chrome_version;
manifest.permissions=[...manifest.permissions.filter(permission=>permission!=='scripting'),...manifest.host_permissions];delete manifest.host_permissions;
manifest.optional_permissions=manifest.optional_host_permissions;delete manifest.optional_host_permissions;
manifest.background={page:'background.html',persistent:true};manifest.browser_action=manifest.action;delete manifest.action;
manifest.content_security_policy="script-src 'self'; object-src 'none'; base-uri 'none'";
await writeFile(new URL('manifest.json',mobile),JSON.stringify(manifest,null,2)+'\n');
console.log('Mobile compatibility extension built: dist-mobile/ (Manifest V2 background page, legacy injection transport)');

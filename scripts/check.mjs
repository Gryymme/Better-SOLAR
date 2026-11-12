import {readdir,readFile} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
async function walk(p){let list=[];for(const f of await readdir(p,{withFileTypes:true})){const q=`${p}/${f.name}`;if(f.isDirectory())list.push(...await walk(q));else if(/\.(mjs|js)$/.test(q))list.push(q);}return list;}
let failures=0;for(const file of [...await walk('src'),...await walk('scraper'),...await walk('scripts'),...await walk('tests')]){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status){console.error(r.stderr);failures++;}}
const m=JSON.parse(await readFile('manifest.json'));if(m.manifest_version!==3||m.host_permissions.includes('<all_urls>'))failures++;
console.log(`${failures?'FAIL':'PASS'}: syntax and manifest checks`);process.exitCode=failures?1:0;

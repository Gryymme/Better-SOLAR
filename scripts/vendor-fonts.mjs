import {mkdir,writeFile} from 'node:fs/promises';
import {FONT_WEIGHTS,fontURL} from '../src/fonts.js';
const destination=new URL('../assets/fonts/',import.meta.url);
await mkdir(destination,{recursive:true});
const files=await Promise.all(FONT_WEIGHTS.map(async weight=>{const response=await fetch(fontURL(weight),{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error(`Montserrat ${weight}: HTTP ${response.status}`);const data=new Uint8Array(await response.arrayBuffer());if(new DataView(data.buffer).getUint32(0)!==0x774f4632)throw Error('Invalid WOFF2 file');return {weight,data};}));
const license=await fetch('https://cdn.jsdelivr.net/npm/@fontsource/montserrat@5.2.6/LICENSE',{signal:AbortSignal.timeout(30000)});if(!license.ok)throw Error('Could not download the matching font license.');const text=await license.text();if(!text.includes('SIL OPEN FONT LICENSE'))throw Error('Unexpected font license.');await writeFile(new URL('OFL.txt',destination),text);
for(const {weight,data} of files)await writeFile(new URL(`Montserrat-${weight}.woff2`,destination),data);
await writeFile(new URL('../src/font-assets.js',import.meta.url),'// All four pinned, unmodified Montserrat files are included.\nexport const BUNDLED_FONTS=true;\n');
console.log('Montserrat 400/500/600/700 saved with the included SIL license. Run npm run build to include them in dist.');

"""Create root-manifest browser installation archives after npm run build."""
from pathlib import Path
import json, zipfile
root=Path(__file__).resolve().parent.parent
destination=root/'packages';destination.mkdir(exist_ok=True)
for folder,name in [('dist','Better_SOLAR-Chromium.zip'),('dist-mobile','Better_SOLAR-Mobile.zip')]:
    source=root/folder
    manifest=json.loads((source/'manifest.json').read_text())
    assert manifest['version']=='2.0.0'
    target=destination/name
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as archive:
        for path in sorted(source.rglob('*')):
            if path.is_file(): archive.write(path,path.relative_to(source))
    with zipfile.ZipFile(target) as archive:
        assert archive.testzip() is None
        assert json.loads(archive.read('manifest.json'))['version']=='2.0.0'
    print(f'{name}: {target.stat().st_size:,} bytes, root manifest verified')

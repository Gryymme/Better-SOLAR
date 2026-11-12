"""Run release checks and retain their exact outputs without runtime dependencies."""
from pathlib import Path
import subprocess, sys
qa=Path('qa');qa.mkdir(exist_ok=True)
checks=[('syntax-results.txt',['node','scripts/check.mjs']),('test-results.txt',['node','--test','--test-reporter=tap',*map(str,sorted(Path('tests').glob('*.test.mjs')))]),('build-results.txt',['node','scripts/build.mjs'])]
for name,cmd in checks:
    r=subprocess.run(cmd,text=True,stdout=subprocess.PIPE,stderr=subprocess.STDOUT)
    (qa/name).write_text(r.stdout)
    print(f'{name}: {"PASS" if r.returncode==0 else "FAIL"}')
    if r.returncode:
        print(r.stdout);sys.exit(r.returncode)

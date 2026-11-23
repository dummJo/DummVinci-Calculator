#!/usr/bin/env python3
"""
Build the self-contained capture HTML.

The engine is bundled from lib/motion/morphEngine.ts — the same module the site
component imports — so the video and the on-site animation can never drift.
Requires esbuild on PATH (npm i -g esbuild).
"""
import pathlib
import shutil
import subprocess
import sys

here = pathlib.Path(__file__).parent
repo = here.parent

if shutil.which('esbuild') is None:
    sys.exit('esbuild not found on PATH — run: npm i -g esbuild')

bundle = subprocess.run(
    ['esbuild', str(here / 'src' / 'standalone.entry.ts'),
     '--bundle', '--format=iife', '--target=es2019', '--platform=browser',
     '--legal-comments=none'],
    capture_output=True, text=True, cwd=repo,
)
if bundle.returncode != 0:
    sys.exit(f'esbuild failed:\n{bundle.stderr}')

tpl = (here / 'src' / 'morph.template.html').read_text()
fonts = (here / 'src' / 'fonts-embedded.css').read_text()

for token in ('/*FONTS*/', '/*ENGINE*/'):
    if token not in tpl:
        sys.exit(f'placeholder {token} missing from template')

out = tpl.replace('/*FONTS*/', fonts).replace('/*ENGINE*/', bundle.stdout)

dest = here / 'ptts-praxis-morph.html'
dest.write_text(out)
print(f'built {dest}  {len(out) / 1024:.0f} KB  (engine {len(bundle.stdout) / 1024:.0f} KB)')
